import { createClient } from '@supabase/supabase-js';

export const handler = async (event) => {
  const startTime = Date.now();
  console.log('--- SEPAY WEBHOOK START ---');
  
  if (event.httpMethod === 'GET') {
    return { statusCode: 200, body: 'SePay Webhook is Live (ESM)' };
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Env Vars');
      return { statusCode: 500, body: 'Config Error' };
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
    console.log(`Input: Content="${content}", Amount=${amount}, ID=${transactionId}`);

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

    console.log('Database Result:', JSON.stringify(data));
    console.log(`Duration: ${Date.now() - startTime}ms`);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };

  } catch (err) {
    console.error('Webhook Crash:', err);
    return { statusCode: 200, body: JSON.stringify({ success: false, error: err.message }) };
  }
};
