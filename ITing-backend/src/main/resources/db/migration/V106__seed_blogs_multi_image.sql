-- V106: Seed 3 blog mẫu có nhiều ảnh trong nội dung (minh hoạ rich editor).
-- Idempotent qua ON CONFLICT (slug) DO NOTHING — chạy lại không trùng.

INSERT INTO blogs (title, slug, category, status, summary, content, thumbnail_url, author, is_featured, seo_meta_title, seo_meta_description, display_order)
VALUES
-- ── Blog 1: Setup môi trường dev ──
('5 bước setup môi trường dev cho Junior IT 2026',
 '5-buoc-setup-moi-truong-dev-cho-junior-it-2026',
 'CAREER',
 'PUBLISHED',
 'Hướng dẫn từng bước thiết lập máy lập trình từ con số 0 — IDE, terminal, Git, Docker và những extension không thể thiếu.',
 '<h2>1. Chọn IDE phù hợp với ngôn ngữ bạn theo</h2>'
 || '<p>VS Code vẫn là lựa chọn phổ biến nhất 2026 nhờ ecosystem extension cực mạnh. Nếu làm Java/Kotlin, IntelliJ IDEA Community vẫn là chân lý. Còn JS/TS thuần thì WebStorm cho hiệu năng ấn tượng với codebase lớn.</p>'
 || '<p><img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&q=80" alt="VS Code dark theme"/></p>'
 || '<h2>2. Terminal &amp; shell</h2>'
 || '<p>Windows thì WSL2 + Windows Terminal, Mac/Linux thì zsh + Oh My Zsh. Cài thêm <code>fzf</code>, <code>ripgrep</code>, <code>bat</code>, <code>eza</code> để productivity tăng gấp đôi.</p>'
 || '<p><img src="https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1200&auto=format&q=80" alt="Modern terminal setup"/></p>'
 || '<h2>3. Git &amp; GitHub workflow</h2>'
 || '<p>Học conventional commits từ ngày đầu. Setup SSH key, GPG sign commit, alias <code>git lg</code> cho graph dễ nhìn.</p>'
 || '<p><img src="https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=1200&auto=format&q=80" alt="Git workflow"/></p>'
 || '<h2>4. Docker Desktop</h2>'
 || '<p>Đừng cài Postgres/Redis/MongoDB local nữa — kéo image Docker, viết docker-compose. Reset DB sạch trong 5 giây.</p>'
 || '<p><img src="https://images.unsplash.com/photo-1605379399642-870262d3d051?w=1200&auto=format&q=80" alt="Docker containers"/></p>'
 || '<h2>5. Extensions phải có</h2>'
 || '<ul><li>GitLens — xem blame inline</li><li>Prettier + ESLint — auto format</li><li>Error Lens — error hiện inline</li><li>Thunder Client — Postman trong VS Code</li><li>Live Share — pair programming online</li></ul>'
 || '<p><strong>Tip cuối:</strong> backup config bằng VS Code Settings Sync — đổi máy chỉ mất 5 phút.</p>',
 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&q=80',
 'ITing Team',
 TRUE,
 'Setup máy lập trình cho Junior IT 2026: IDE, Terminal, Git, Docker',
 'Hướng dẫn chi tiết 5 bước setup môi trường lập trình hiệu quả cho Junior IT năm 2026.',
 1
),

-- ── Blog 2: Behind the scenes building product ──
('Behind the scenes: ITing đã build engine match CV bằng AI như thế nào',
 'behind-the-scenes-iting-build-engine-match-cv-bang-ai',
 'TECH',
 'PUBLISHED',
 'Pipeline embed CV → cosine similarity với job → KG bonus skill expansion. Bài này kể chi tiết cách team team mình build từ ngày đầu.',
 '<h2>Vấn đề: Keyword search không hiểu ngữ nghĩa</h2>'
 || '<p>Khi HR gõ "React Developer" hệ thống cũ chỉ tìm CV có chữ "React" — bỏ sót ứng viên ghi "ReactJS" hoặc "React.js". Đây là lúc team quyết định chuyển sang vector embedding.</p>'
 || '<p><img src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&auto=format&q=80" alt="Code analysis dashboard"/></p>'
 || '<h2>Kiến trúc tổng thể</h2>'
 || '<p>3 layer chính:</p>'
 || '<ol><li><strong>Embedding layer</strong> — biến CV/Job thành vector 1536 chiều bằng OpenAI text-embedding-3-small</li><li><strong>Similarity engine</strong> — in-memory cosine với top-K filter</li><li><strong>Knowledge graph</strong> — expand skill liên quan (React → JSX, hooks, Redux...)</li></ol>'
 || '<p><img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&q=80" alt="System architecture"/></p>'
 || '<h2>Thử thách 1: Scale</h2>'
 || '<p>Brute-force cosine 10K candidate mất 200ms. Không scale được lên 100K. Chúng tôi đang chuyển sang HNSW index qua pgvector — bench preliminary giảm xuống &lt; 20ms.</p>'
 || '<p><img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&q=80" alt="Performance graph"/></p>'
 || '<h2>Thử thách 2: Cold start</h2>'
 || '<p>Ứng viên mới chưa có CV → không có embedding. Giải pháp: bắt nhập tối thiểu 3 skill + tự sinh CV draft từ template để có embedding nháp.</p>'
 || '<h2>Kết quả</h2>'
 || '<p>Conversion rate "view → apply" tăng 38% sau khi triển khai vector match. HR feedback tích cực: ứng viên phù hợp xuất hiện sớm hơn ở top kết quả.</p>'
 || '<p><img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&q=80" alt="Analytics result"/></p>'
 || '<h2>Tiếp theo</h2>'
 || '<p>Fine-tune model trên domain IT Việt Nam, multimodal (CV PDF có ảnh sơ đồ tech stack), và explainability ("Tại sao ứng viên này match?").</p>',
 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&auto=format&q=80',
 'ITing Tech Team',
 TRUE,
 'Build AI engine match CV - Bài học từ ITing | Kỹ thuật vector embedding',
 'Pipeline kỹ thuật ITing dùng để match CV ứng viên với job bằng vector embedding + Knowledge Graph.',
 2
),

-- ── Blog 3: Top 10 IT skills 2026 ──
('Top 10 kỹ năng IT được trả lương cao nhất Việt Nam 2026',
 'top-10-ky-nang-it-tra-luong-cao-nhat-2026',
 'CAREER',
 'PUBLISHED',
 'Số liệu thực tế từ 12.000+ tin tuyển dụng trên ITing năm qua. Cloud, AI/ML và Security dẫn đầu — Java vẫn "vô địch" về độ phổ biến.',
 '<p>Sau 1 năm thu thập dữ liệu lương từ hơn 12.000 tin tuyển dụng đăng trên ITing, chúng tôi tổng hợp top 10 kỹ năng "đáng đầu tư" cho năm 2026.</p>'
 || '<p><img src="https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=1200&auto=format&q=80" alt="Top skills banner"/></p>'
 || '<h2>🥇 1. AWS / Cloud Architect — TB 75M/tháng</h2>'
 || '<p>Mọi công ty đều migrate lên cloud. AWS Certified Solutions Architect Pro mở cửa các vị trí 80–120M/tháng.</p>'
 || '<p><img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&q=80" alt="Cloud infrastructure"/></p>'
 || '<h2>🥈 2. Machine Learning Engineer — TB 70M/tháng</h2>'
 || '<p>PyTorch, TensorFlow, MLOps với MLflow + Kubeflow. Đặc biệt fine-tune LLM đang khan hiếm nhân lực.</p>'
 || '<p><img src="https://images.unsplash.com/photo-1488229297570-58520851e868?w=1200&auto=format&q=80" alt="ML engineer"/></p>'
 || '<h2>🥉 3. Security Engineer — TB 65M/tháng</h2>'
 || '<p>SIEM, penetration testing, container security. Certs có giá: OSCP, CISSP, CEH.</p>'
 || '<p><img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&q=80" alt="Cybersecurity"/></p>'
 || '<h2>4. Senior Backend (Java/Spring) — 55M</h2>'
 || '<p>Vẫn xương sống của fintech, ngân hàng, e-commerce VN.</p>'
 || '<h2>5. DevOps / SRE — 55M</h2>'
 || '<p>Kubernetes + Terraform + ArgoCD = combo vàng.</p>'
 || '<p><img src="https://images.unsplash.com/photo-1667372393913-c79b1d4e1d3a?w=1200&auto=format&q=80" alt="DevOps pipeline"/></p>'
 || '<h2>6. Mobile (Flutter/React Native) — 45M</h2>'
 || '<p>Native iOS Swift vẫn cao hơn (~50M) nhưng pool nhỏ.</p>'
 || '<h2>7. Data Engineer — 50M</h2>'
 || '<p>Airflow, Spark, dbt, Snowflake/BigQuery.</p>'
 || '<h2>8. Frontend Senior (React/Next.js) — 40M</h2>'
 || '<h2>9. QA Automation — 35M</h2>'
 || '<h2>10. Blockchain Developer — 50M (rủi ro cao)</h2>'
 || '<p>Solidity, Move, Rust + smart contract audit.</p>'
 || '<hr/>'
 || '<p><em>Số liệu trung bình toàn quốc, có thể cao hơn 20–30% tại TP.HCM và Hà Nội. Liên hệ ITing để xem báo cáo lương chi tiết theo vai trò &amp; thâm niên.</em></p>',
 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&auto=format&q=80',
 'ITing Analytics',
 TRUE,
 'Top 10 kỹ năng IT lương cao nhất Việt Nam 2026 - Báo cáo ITing',
 'Phân tích lương 12.000+ tin tuyển dụng IT năm 2025-2026 — top kỹ năng đáng đầu tư.',
 3
)
ON CONFLICT (slug) DO NOTHING;
