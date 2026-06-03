-- Idempotency cho payment activation.
-- Trước đây handleWebhook skip toàn bộ khi order đã PAID → orders cũ với
-- activation bị bug (vd: PREMIUM_SUBSCRIPTION không handle ở deploy cũ) không
-- catch-up được khi retry webhook.
-- Sau khi thêm activated_at: webhook retry sẽ chạy activation nếu activated_at
-- IS NULL, không double-extend.

ALTER TABLE payment_orders
    ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP;

-- Backfill: với orders đã PAID nhưng KHÔNG biết activation status, để NULL —
-- webhook retry tiếp theo sẽ trigger activation. Idempotent guard ở service
-- layer (lastPaymentOrderId cho subscription, future tracking cho boost).
-- Riêng những orders đã PAID + đã có subscription/boost gắn liền: backfill
-- activated_at = paid_at để không double-activate khi retry.

UPDATE payment_orders po
SET activated_at = po.paid_at
WHERE po.status = 'PAID'
  AND po.activated_at IS NULL
  AND po.item_type = 'PREMIUM_SUBSCRIPTION'
  AND EXISTS (
    SELECT 1 FROM hr_subscriptions hs
    WHERE hs.last_payment_order_id = po.id
  );

UPDATE payment_orders po
SET activated_at = po.paid_at
WHERE po.status = 'PAID'
  AND po.activated_at IS NULL
  AND po.item_type = 'BOOST_JOB'
  AND EXISTS (
    SELECT 1 FROM job j
    WHERE j.id = po.item_id
      AND j.featured_until IS NOT NULL
      AND j.featured_until > po.paid_at
  );
