const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  const startTime = Date.now();
  console.log('--- SEPAY WEBHOOK START ---');
  console.log('Method:', event.httpMethod);
  
  // Trả về nhanh nếu là GET để kiểm tra service
  if (event.httpMethod === 'GET') {
    return { statusCode: 200, body: 'SePay Webhook Service is Online (CJS Mode)' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Config Missing:', { url: !!supabaseUrl, key: !!supabaseServiceKey });
      return { statusCode: 500, body: 'Server Configuration Missing' };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const payload = JSON.parse(event.body || '{}');

    console.log('Payload Received:', JSON.stringify(payload));

    const {
      content = '',
      transferAmount = 0,
      amount_in = 0,
      id: transactionId
    } = payload;

    const amount = parseInt(amount_in || transferAmount || 0);
    console.log(`Processing: Content="${content}", Amount=${amount}, ID=${transactionId}`);

    // Gọi RPC xử lý
    const { data, error } = await supabase.rpc('process_sepay_webhook', {
      p_content: content,
      p_amount: amount,
      p_transaction_id: transactionId?.toString() || ('SEPAY_' + Date.now())
    });

    if (error) {
      console.error('Database RPC Error:', error);
      return { statusCode: 200, body: JSON.stringify({ success: false, error: error.message }) };
    }

    console.log('RPC Success Result:', data);
    console.log(`Execution Time: ${Date.now() - startTime}ms`);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, data })
    };

  } catch (err) {
    console.error('Webhook Runtime Error:', err);
    return { statusCode: 200, body: JSON.stringify({ success: false, error: err.message }) };
  }
};
