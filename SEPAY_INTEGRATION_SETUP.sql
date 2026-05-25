-- ========================================================
-- SEPAY AUTOMATION SETUP FOR BUILDNCHILL
-- ========================================================

-- 1. Thêm cột ghi chú SePay vào bảng recharges và orders (nếu chưa có)
ALTER TABLE public.recharges ADD COLUMN IF NOT EXISTS sepay_transaction_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS sepay_transaction_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;

-- 2. Hàm xử lý khi đơn hàng được thanh toán (Trigger)
CREATE OR REPLACE FUNCTION public.handle_order_paid_automation()
RETURNS TRIGGER AS $$
BEGIN
    -- Chỉ xử lý khi trạng thái chuyển từ 'pending' sang 'paid'
    IF (NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status = 'pending')) THEN
        
        -- Đánh dấu thời gian thanh toán
        NEW.paid_at := now();
        
        -- 1. Đẩy lệnh chính vào game
        INSERT INTO public.pending_commands (mc_username, command, status)
        VALUES (NEW.mc_username, NEW.command, 'pending');
        
        -- 2. Gửi thông báo tellraw cho người chơi trong game
        INSERT INTO public.pending_commands (mc_username, command, status)
        VALUES (
            NEW.mc_username, 
            'tellraw ' || NEW.mc_username || ' {"text":"","extra":[{"text":"[","color":"dark_gray"},{"text":"\ud83e\udeb8","color":"light_purple","bold":true},{"text":"]","color":"dark_gray"},{"text":" BnC-Shop","color":"light_purple","bold":true},{"text":" \u2192 ","color":"dark_gray"},{"text":"Thanh toán thành công! Đang giao: ","color":"green"},{"text":"' || NEW.product || '","color":"aqua"}]}',
            'pending'
        );

        -- Tự động đánh dấu đã giao (vì đã đẩy vào pending_commands)
        NEW.delivered := true;
        NEW.status := 'delivered';
        
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Tạo Trigger cho bảng orders
DROP TRIGGER IF EXISTS on_order_paid_automation ON public.orders;
CREATE TRIGGER on_order_paid_automation
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_order_paid_automation();

-- 4. Hàm RPC để SePay Webhook gọi (Cộng tiền hoặc Xác nhận đơn)
CREATE OR REPLACE FUNCTION public.process_sepay_webhook(
    p_content TEXT,
    p_amount BIGINT,
    p_transaction_id TEXT
) RETURNS JSONB AS $$
DECLARE
    v_username TEXT;
    v_user_id UUID;
    v_order_id UUID;
BEGIN
    -- TRƯỜNG HỢP 1: Nạp tiền ví (Nội dung: NAP username)
    IF p_content ~* '^NAP\s+\S+' THEN
        v_username := (regexp_matches(p_content, 'NAP\s+(\S+)', 'i'))[1];
        
        -- Tìm ID người chơi dựa trên username
        SELECT id INTO v_user_id FROM public.profiles WHERE username = v_username;
        
        IF v_user_id IS NOT NULL THEN
            -- Tạo yêu cầu nạp đã duyệt
            INSERT INTO public.recharges (user_id, amount, payment_method, status, sepay_transaction_id)
            VALUES (v_user_id, p_amount, 'SePay Auto', 'approved', p_transaction_id);
            
            -- Cộng tiền vào ví
            PERFORM public.admin_adjust_balance(v_user_id, p_amount, 'recharge', 'SePay Auto Recharge: ' || p_transaction_id);
            
            RETURN jsonb_build_object('success', true, 'type', 'recharge', 'username', v_username);
        END IF;
    
    -- TRƯỜNG HỢP 2: Thanh toán đơn hàng trực tiếp (Nội dung: Mã đơn hàng 8 ký tự)
    ELSE
        -- Giả định nội dung chuyển khoản là 8 ký tự đầu của ID đơn hàng
        -- Hoặc tìm đơn hàng khớp với số tiền và trạng thái pending
        SELECT id INTO v_order_id FROM public.orders 
        WHERE (id::text ILIKE p_content || '%' OR p_content ILIKE id::text || '%')
        AND status = 'pending'
        LIMIT 1;
        
        IF v_order_id IS NOT NULL THEN
            UPDATE public.orders 
            SET status = 'paid', sepay_transaction_id = p_transaction_id 
            WHERE id = v_order_id;
            
            RETURN jsonb_build_object('success', true, 'type', 'order', 'order_id', v_order_id);
        END IF;
    END IF;

    RETURN jsonb_build_object('success', false, 'message', 'No matching user or order found');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
