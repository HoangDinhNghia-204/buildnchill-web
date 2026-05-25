import { createClient } from '@supabase/supabase-js';

export const handler = async (event) => {
  // Trả về 200 nhanh cho SePay nếu không phải POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 200, body: 'Ready' };
  }

  try {
    const payload = JSON.parse(event.body);
    const authHeader = event.headers['authorization'] || '';
    const sepayToken = process.env.SEPAY_WEBHOOK_TOKEN;

    // Kiểm tra Token bảo mật
    if (sepayToken && !authHeader.includes(sepayToken)) {
      console.error('Invalid SePay Webhook Token');
      return { statusCode: 401, body: 'Unauthorized' };
    }

    // Lấy thông tin từ payload (SePay gửi transferAmount thay vì amount_in ở một số cấu hình)
    const {
      content,
      amount_in,
      transferAmount,
      transaction_content,
      id: transactionId
    } = payload;

    const finalContent = content || transaction_content || '';
    const amount = parseInt(amount_in || transferAmount || 0);

    console.log(`Webhook Received: ${finalContent} - ${amount} VND`);

    // Kiểm tra các biến môi trường quan trọng
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase Config on Netlify');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Gọi RPC xử lý
    const { data, error } = await supabase.rpc('process_sepay_webhook', {
      p_content: finalContent,
      p_amount: amount,
      p_transaction_id: transactionId?.toString() || 'SEPAY_' + Date.now()
    });

    if (error) {
      console.error('Database Error:', error.message);
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    console.log('Success:', data);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'Processed' })
    };
  } catch (err) {
    console.error('System Error:', err.message);
    return { 
      statusCode: 200, // Vẫn trả về 200 để SePay không gửi lại liên tục nếu là lỗi logic
      body: JSON.stringify({ error: err.message }) 
    };
  }
};
