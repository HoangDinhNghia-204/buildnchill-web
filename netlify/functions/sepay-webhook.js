import { createClient } from '@supabase/supabase-js';

export const handler = async (event) => {
  // Chỉ chấp nhận phương thức POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const payload = JSON.parse(event.body);
    const authHeader = event.headers['authorization'] || '';
    const sepayToken = process.env.SEPAY_WEBHOOK_TOKEN; // Cần cấu hình trong Netlify Env

    // Kiểm tra Token bảo mật từ SePay (Hỗ trợ cả định dạng Bearer và Apikey của SePay)
    if (sepayToken && !authHeader.includes(sepayToken)) {
      console.error('Invalid SePay Webhook Token');
      return { statusCode: 401, body: 'Unauthorized' };
    }

    // Khởi tạo Supabase Client
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Dùng Service Role Key để có quyền ghi
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      content,
      amount_in,
      transaction_content,
      id: transactionId
    } = payload;

    const finalContent = content || transaction_content || '';
    const amount = parseInt(amount_in || payload.transfer_amount || 0);

    console.log(`Processing SePay Webhook: ${finalContent} - ${amount} VND`);

    // Gọi hàm RPC trong Supabase để xử lý logic
    const { data, error } = await supabase.rpc('process_sepay_webhook', {
      p_content: finalContent,
      p_amount: amount,
      p_transaction_id: transactionId?.toString() || 'SEPAY_' + Date.now()
    });

    if (error) {
      console.error('RPC Error:', error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    console.log('Webhook processed successfully:', data);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, result: data })
    };
  } catch (err) {
    console.error('Webhook processing error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
