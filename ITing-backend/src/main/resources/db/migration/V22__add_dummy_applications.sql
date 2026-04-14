-- Tự động tạo 15 đơn ứng tuyển dummy (kèm 15 User riêng biệt) cho Job ID 1 để test phân trang hợp nghiệp vụ
DO $$ 
DECLARE
    i INT;
    new_apply_form_id BIGINT;
    new_user_id BIGINT;
    new_cv_id BIGINT;
    status_val VARCHAR;
BEGIN
    FOR i IN 1..15 LOOP
        new_user_id := 10000 + i; -- Sinh ID user từ 10001 đến 10015

        -- 1. Khởi tạo Account
        INSERT INTO Account (Id, Email, Password, Role, Status) 
        VALUES (new_user_id, 'dummy_cand' || new_user_id || '@iting.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'USER', 'ACTIVE');
        
        -- 2. Khởi tạo Users
        INSERT INTO Users (Id, Phone_num, Loc_id, full_name, Avatar, Last_update) 
        VALUES (new_user_id, '090000000' || (i % 10), 1, 'Dummy Candidate ' || new_user_id, 'https://i.pravatar.cc/150?img=' || (i % 70), CURRENT_TIMESTAMP);

        -- 3. Khởi tạo Candidate_profiles
        INSERT INTO Candidate_profiles (id, headline, location, total_experience_years, employment_status, is_open_to_work, updated_at)
        VALUES (new_user_id, 'Web Developer ' || new_user_id, 'Hà Nội', (i % 5) + 1, 'ACTIVELY_LOOKING', TRUE, CURRENT_TIMESTAMP);

        -- 4. Khởi tạo Contact_info
        INSERT INTO Contact_info (id, phone, email)
        VALUES (new_user_id, '090000000' || (i % 10), 'dummy_cand' || new_user_id || '@iting.com');

        -- 5. Khởi tạo CV Public cho User này
        INSERT INTO CV (profile_id, Title, File_path, Upload_time, Cv_status, Is_default)
        VALUES (new_user_id, 'CV Dummy ' || new_user_id, 'https://pdfobject.com/pdf/sample-3pp.pdf', CURRENT_TIMESTAMP, 'ACTIVE', TRUE)
        RETURNING Id INTO new_cv_id;

        -- Định nghĩa Status quay vòng ngẫu nhiên
        IF i % 4 = 0 THEN status_val := 'VIEWED';
        ELSIF i % 4 = 1 THEN status_val := 'PENDING';
        ELSIF i % 4 = 2 THEN status_val := 'ACCEPTED';
        ELSE status_val := 'REJECTED';
        END IF;

        -- 6. Insert đơn Apply (Apply_form) dùng đúng user mới và CV mới
        INSERT INTO Apply_form (User_id, Cv_id, Cv_title, Applicant_name, Introduction)
        VALUES (new_user_id, new_cv_id, 'CV Dummy ' || new_user_id, 'Dummy Candidate ' || new_user_id, 'Chào công ty, đây là đơn ứng tuyển test số ' || new_user_id || ' để xem pagination.')
        RETURNING Id INTO new_apply_form_id;

        -- 7. Insert bảng map Apply_form_user_to_job
        INSERT INTO Apply_form_user_to_job (Job_id, Apply_form_id, Time_sent, status)
        VALUES (1, new_apply_form_id, CURRENT_TIMESTAMP - (i || ' days')::INTERVAL, status_val);
    END LOOP;
END $$;
