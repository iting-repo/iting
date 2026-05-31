-- Seed demo Offer Letters cho account chuyenkenh113@gmail.com.
-- Mục đích: empty state ở /candidate/offers gây hiểu nhầm "không có offer" —
-- seed 4 offer ở 4 status khác nhau (SENT, ACCEPTED, DECLINED, EXPIRED) để
-- demo full UI flow.
--
-- Idempotent: dùng INSERT WHERE NOT EXISTS để chạy lại không double-seed.
-- Tên bảng/cột folded lowercase (Postgres unquoted convention) — khớp với
-- existing migrations V22, V48.

DO $$
DECLARE
    v_account_id BIGINT;
    v_user_id    BIGINT;
    v_company_a  BIGINT;
    v_company_b  BIGINT;
    v_company_c  BIGINT;
    v_company_d  BIGINT;
    v_job_a      BIGINT;
    v_job_b      BIGINT;
    v_job_c      BIGINT;
    v_job_d      BIGINT;
    v_apply_a    BIGINT;
    v_apply_b    BIGINT;
    v_apply_c    BIGINT;
    v_apply_d    BIGINT;
    v_hr_a       BIGINT;
    v_hr_b       BIGINT;
    v_hr_c       BIGINT;
    v_hr_d       BIGINT;
BEGIN
    -- 1. Lookup target account. Nếu không tồn tại → exit gracefully (env dev
    --    không có user này thì migration không fail).
    SELECT id INTO v_account_id FROM account WHERE LOWER(email) = 'chuyenkenh113@gmail.com' LIMIT 1;
    IF v_account_id IS NULL THEN
        RAISE NOTICE 'Skip V110: account chuyenkenh113@gmail.com không tồn tại';
        RETURN;
    END IF;
    -- User entity 1-1 với Account qua @MapsId → user.id = account.id.
    v_user_id := v_account_id;

    -- 2. Pick 4 công ty đầu tiên + 1 job mỗi công ty + 1 HR mỗi công ty.
    SELECT company_id INTO v_company_a FROM company ORDER BY company_id LIMIT 1;
    SELECT company_id INTO v_company_b FROM company WHERE company_id <> v_company_a ORDER BY company_id LIMIT 1;
    SELECT company_id INTO v_company_c FROM company WHERE company_id NOT IN (v_company_a, v_company_b) ORDER BY company_id LIMIT 1;
    SELECT company_id INTO v_company_d FROM company WHERE company_id NOT IN (v_company_a, v_company_b, v_company_c) ORDER BY company_id LIMIT 1;

    IF v_company_a IS NULL OR v_company_b IS NULL OR v_company_c IS NULL OR v_company_d IS NULL THEN
        RAISE NOTICE 'Skip V110: cần ít nhất 4 công ty để seed offers';
        RETURN;
    END IF;

    SELECT id INTO v_job_a FROM job WHERE company_id = v_company_a ORDER BY id DESC LIMIT 1;
    SELECT id INTO v_job_b FROM job WHERE company_id = v_company_b ORDER BY id DESC LIMIT 1;
    SELECT id INTO v_job_c FROM job WHERE company_id = v_company_c ORDER BY id DESC LIMIT 1;
    SELECT id INTO v_job_d FROM job WHERE company_id = v_company_d ORDER BY id DESC LIMIT 1;

    IF v_job_a IS NULL OR v_job_b IS NULL OR v_job_c IS NULL OR v_job_d IS NULL THEN
        RAISE NOTICE 'Skip V110: 1 trong 4 công ty không có job';
        RETURN;
    END IF;

    -- HR account = APPROVED affiliation của company đó. Fallback: chính
    -- candidate account làm placeholder (offer.created_by_hr_id NOT NULL nhưng
    -- không có FK strict; UI candidate không quan tâm field này).
    SELECT hr_account_id INTO v_hr_a FROM company_hr_affiliations
        WHERE company_id = v_company_a AND status = 'APPROVED' LIMIT 1;
    SELECT hr_account_id INTO v_hr_b FROM company_hr_affiliations
        WHERE company_id = v_company_b AND status = 'APPROVED' LIMIT 1;
    SELECT hr_account_id INTO v_hr_c FROM company_hr_affiliations
        WHERE company_id = v_company_c AND status = 'APPROVED' LIMIT 1;
    SELECT hr_account_id INTO v_hr_d FROM company_hr_affiliations
        WHERE company_id = v_company_d AND status = 'APPROVED' LIMIT 1;

    v_hr_a := COALESCE(v_hr_a, v_account_id);
    v_hr_b := COALESCE(v_hr_b, v_account_id);
    v_hr_c := COALESCE(v_hr_c, v_account_id);
    v_hr_d := COALESCE(v_hr_d, v_account_id);

    -- 3. Tạo ApplyForm cho mỗi job (nếu chưa có) — Offer cần apply_form_id.
    SELECT apply_form_id INTO v_apply_a
        FROM apply_form_user_to_job
        WHERE job_id = v_job_a AND user_id = v_user_id LIMIT 1;
    IF v_apply_a IS NULL THEN
        INSERT INTO apply_form (user_id, applicant_name, introduction)
            VALUES (v_user_id, 'Nghĩa (demo)', 'Demo seed cho offer SENT') RETURNING id INTO v_apply_a;
        INSERT INTO apply_form_user_to_job (job_id, apply_form_id, time_sent, status, user_id)
            VALUES (v_job_a, v_apply_a, NOW() - INTERVAL '5 days', 'ACCEPTED', v_user_id);
    END IF;

    SELECT apply_form_id INTO v_apply_b
        FROM apply_form_user_to_job
        WHERE job_id = v_job_b AND user_id = v_user_id LIMIT 1;
    IF v_apply_b IS NULL THEN
        INSERT INTO apply_form (user_id, applicant_name, introduction)
            VALUES (v_user_id, 'Nghĩa (demo)', 'Demo seed cho offer ACCEPTED') RETURNING id INTO v_apply_b;
        INSERT INTO apply_form_user_to_job (job_id, apply_form_id, time_sent, status, user_id)
            VALUES (v_job_b, v_apply_b, NOW() - INTERVAL '10 days', 'ACCEPTED', v_user_id);
    END IF;

    SELECT apply_form_id INTO v_apply_c
        FROM apply_form_user_to_job
        WHERE job_id = v_job_c AND user_id = v_user_id LIMIT 1;
    IF v_apply_c IS NULL THEN
        INSERT INTO apply_form (user_id, applicant_name, introduction)
            VALUES (v_user_id, 'Nghĩa (demo)', 'Demo seed cho offer DECLINED') RETURNING id INTO v_apply_c;
        INSERT INTO apply_form_user_to_job (job_id, apply_form_id, time_sent, status, user_id)
            VALUES (v_job_c, v_apply_c, NOW() - INTERVAL '15 days', 'REJECTED', v_user_id);
    END IF;

    SELECT apply_form_id INTO v_apply_d
        FROM apply_form_user_to_job
        WHERE job_id = v_job_d AND user_id = v_user_id LIMIT 1;
    IF v_apply_d IS NULL THEN
        INSERT INTO apply_form (user_id, applicant_name, introduction)
            VALUES (v_user_id, 'Nghĩa (demo)', 'Demo seed cho offer EXPIRED') RETURNING id INTO v_apply_d;
        INSERT INTO apply_form_user_to_job (job_id, apply_form_id, time_sent, status, user_id)
            VALUES (v_job_d, v_apply_d, NOW() - INTERVAL '40 days', 'PENDING', v_user_id);
    END IF;

    -- 4. Seed 4 offer letters. WHERE NOT EXISTS để idempotent.

    -- ── Offer SENT (đang chờ candidate response, expires 7 ngày nữa) ──
    INSERT INTO offer_letters (
        apply_form_id, job_id, candidate_account_id, company_id, created_by_hr_id,
        position, salary_amount, salary_currency, salary_type,
        start_date, expires_at, notes, status,
        sent_at, created_at, updated_at)
    SELECT v_apply_a, v_job_a, v_account_id, v_company_a, v_hr_a,
        'Senior Frontend Developer (React)', 28000000, 'VND', 'MONTH',
        (CURRENT_DATE + INTERVAL '14 days')::DATE,
        NOW() + INTERVAL '7 days',
        E'Chào Nghĩa, công ty rất ấn tượng với kinh nghiệm React + TypeScript của bạn.\n'
        || E'Mức lương 28M gross, full benefits, 14 ngày phép, laptop M3 Pro.\n'
        || 'Probation 2 tháng (90% lương), sau probation có thưởng performance review hàng quý.',
        'SENT', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
    WHERE NOT EXISTS (SELECT 1 FROM offer_letters WHERE apply_form_id = v_apply_a);

    -- ── Offer ACCEPTED (10 ngày trước) ──
    INSERT INTO offer_letters (
        apply_form_id, job_id, candidate_account_id, company_id, created_by_hr_id,
        position, salary_amount, salary_currency, salary_type,
        start_date, expires_at, notes, status,
        sent_at, responded_at, candidate_response_note,
        created_at, updated_at)
    SELECT v_apply_b, v_job_b, v_account_id, v_company_b, v_hr_b,
        'Backend Engineer (Java/Spring)', 32000000, 'VND', 'MONTH',
        (CURRENT_DATE - INTERVAL '5 days')::DATE,
        NOW() - INTERVAL '5 days',
        E'Welcome aboard! Vị trí Backend Engineer team Payment.\n'
        || 'Tech stack: Spring Boot 3, PostgreSQL, Kafka, Redis. Office Q1 HCMC, hybrid 2 days WFH/tuần.',
        'ACCEPTED', NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days',
        'Cảm ơn anh chị, em xác nhận join. Em sẽ chuẩn bị hồ sơ onboarding theo email HR gửi.',
        NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days'
    WHERE NOT EXISTS (SELECT 1 FROM offer_letters WHERE apply_form_id = v_apply_b);

    -- ── Offer DECLINED (15 ngày trước) ──
    INSERT INTO offer_letters (
        apply_form_id, job_id, candidate_account_id, company_id, created_by_hr_id,
        position, salary_amount, salary_currency, salary_type,
        start_date, expires_at, notes, status,
        sent_at, responded_at, candidate_response_note,
        created_at, updated_at)
    SELECT v_apply_c, v_job_c, v_account_id, v_company_c, v_hr_c,
        'DevOps Engineer', 25000000, 'VND', 'MONTH',
        (CURRENT_DATE + INTERVAL '7 days')::DATE,
        NOW() - INTERVAL '8 days',
        E'Vị trí DevOps Engineer, làm việc với AWS + Kubernetes + Terraform.\n'
        || 'Probation 2 tháng, sau đó full benefits + cổ phiếu công ty.',
        'DECLINED', NOW() - INTERVAL '15 days', NOW() - INTERVAL '12 days',
        E'Em cảm ơn offer của công ty. Hiện em đã accept offer khác phù hợp hơn về location.\n'
        || 'Hy vọng có cơ hội hợp tác trong tương lai!',
        NOW() - INTERVAL '15 days', NOW() - INTERVAL '12 days'
    WHERE NOT EXISTS (SELECT 1 FROM offer_letters WHERE apply_form_id = v_apply_c);

    -- ── Offer EXPIRED (40 ngày trước, expires đã qua 10 ngày) ──
    INSERT INTO offer_letters (
        apply_form_id, job_id, candidate_account_id, company_id, created_by_hr_id,
        position, salary_amount, salary_currency, salary_type,
        start_date, expires_at, notes, status,
        sent_at, created_at, updated_at)
    SELECT v_apply_d, v_job_d, v_account_id, v_company_d, v_hr_d,
        'Mobile Developer (Flutter)', 22000000, 'VND', 'MONTH',
        (CURRENT_DATE - INTERVAL '20 days')::DATE,
        NOW() - INTERVAL '30 days',
        'Offer cho vị trí Mobile Dev (Flutter). Probation 2 tháng. Office HN Cau Giay.',
        'EXPIRED', NOW() - INTERVAL '40 days',
        NOW() - INTERVAL '40 days', NOW() - INTERVAL '30 days'
    WHERE NOT EXISTS (SELECT 1 FROM offer_letters WHERE apply_form_id = v_apply_d);

    RAISE NOTICE 'V110: Seeded 4 demo offers cho chuyenkenh113@gmail.com (account_id=%)', v_account_id;
END $$;
