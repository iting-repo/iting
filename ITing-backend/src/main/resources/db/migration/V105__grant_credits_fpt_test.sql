-- V105: Grant 1000 credits cho HR account FPT (one-off seed cho test/dev).
-- Idempotent: chỉ chạy 1 lần do Flyway version. Update account.credits + insert
-- row credit_transaction để có audit (source=ADJUSTMENT).

DO $$
DECLARE
    target_id BIGINT;
    new_balance INTEGER;
BEGIN
    -- Tìm HR account FPT đầu tiên (theo email chứa 'fpt'). LIMIT 1 để tránh
    -- grant nhầm sang account khác nếu có nhiều match.
    SELECT id INTO target_id
    FROM account
    WHERE LOWER(email) LIKE '%fpt%'
      AND role = 'EMPLOYER'
    ORDER BY id ASC
    LIMIT 1;

    IF target_id IS NULL THEN
        RAISE NOTICE 'V105: Không tìm thấy HR account FPT — bỏ qua grant.';
        RETURN;
    END IF;

    UPDATE account
       SET credits = COALESCE(credits, 0) + 1000
     WHERE id = target_id
    RETURNING credits INTO new_balance;

    INSERT INTO credit_transaction (account_id, amount, balance_after, source, reference_id, description, created_at)
    VALUES (target_id, 1000, new_balance, 'ADJUSTMENT', NULL,
            'Grant 1000 credits cho test (FPT HR account)', CURRENT_TIMESTAMP);

    RAISE NOTICE 'V105: Đã grant 1000 credits cho account_id=%, balance=%', target_id, new_balance;
END $$;
