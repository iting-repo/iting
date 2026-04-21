-- Bảng lưu lịch sử tương tác giữa User và Job
CREATE TABLE user_job_interactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    interaction_type VARCHAR(20) NOT NULL, -- VIEW, CLICK, SAVE, APPLY
    weight INTEGER NOT NULL,               -- VIEW=1, CLICK=2, SAVE=3, APPLY=5
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_interaction_user FOREIGN KEY (user_id) REFERENCES Account(Id) ON DELETE CASCADE,
    CONSTRAINT fk_interaction_job FOREIGN KEY (job_id) REFERENCES Job(Id) ON DELETE CASCADE
);

-- Bảng lưu lịch sử tìm kiếm của User
CREATE TABLE user_search_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    keyword VARCHAR(255),
    location VARCHAR(255),
    salary_min DECIMAL(18,2),
    salary_max DECIMAL(18,2),
    job_type VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_search_user FOREIGN KEY (user_id) REFERENCES Account(Id) ON DELETE CASCADE
);

-- Index để truy vấn nhanh
CREATE INDEX idx_interaction_user ON user_job_interactions(user_id);
CREATE INDEX idx_interaction_type ON user_job_interactions(interaction_type);
CREATE INDEX idx_search_user ON user_search_history(user_id);
CREATE INDEX idx_search_created ON user_search_history(created_at);
