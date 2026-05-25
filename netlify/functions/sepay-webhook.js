import { createClient } from '@supabase/supabase-js';

// Khởi tạo client bên ngoài để tái sử dụng (giảm cold start)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;
const supabase = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : null;

export const handler = async (event) => {
  console.log('--- Webhook Start ---');
  
  if (event.httpMethod !== 'POST') {
    return { statusCode: 200, body: 'Service Online' };
  }

  try {
    if (!supabase) {
      console.error('Supabase client not initialized. Check Env Vars.');
      return { statusCode: 500, body: 'Server Configuration Error' };
    }

    const payload = JSON.parse(event.body);
    const authHeader = event.headers['authorization'] || '';
    const sepayToken = process.env.SEPAY_WEBHOOK_TOKEN;

    if (sepayToken && !authHeader.includes(sepayToken)) {
      console.error('Unauthorized: Invalid Token');
      return { statusCode: 401, body: 'Unauthorized' };
    }

    const {
      content,
      amount_in,
      transferAmount,
      transaction_content,
      id: transactionId
    } = payload;

    const finalContent = content || transaction_content || '';
    const amount = parseInt(amount_in || transferAmount || 0);

    console.log(`Processing: ${finalContent} | ${amount} VND | ID: ${transactionId}`);

    // Sử dụng Promise.race để tránh treo function quá lâu
    const { data, error } = await Promise.race([
      supabase.rpc('process_sepay_webhook', {
        p_content: finalContent,
        p_amount: amount,
        p_transaction_id: transactionId?.toString() || 'SEPAY_' + Date.now()
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Database Timeout')), 10000))
    ]);

    if (error) {
      console.error('Database Error:', error.message);
      // Trả về 200 để SePay dừng gửi lại nếu là lỗi logic
      return { statusCode: 200, body: JSON.stringify({ success: false, error: error.message }) };
    }

    console.log('Processing Success:', data);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, data })
    };
  } catch (err) {
    console.error('Runtime Error:', err.message);
    return { 
      statusCode: 200, 
      body: JSON.stringify({ success: false, error: err.message }) 
    };
  }
};
