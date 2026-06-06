# BÁO CÁO

## Sơ đồ luồng giao diện người dùng (UI Flow) của hệ thống cổng thông tin việc làm ITing

---

## 1. Giới thiệu tổng quan hệ thống

### 1.1. Bối cảnh và mục tiêu

ITing là một nền tảng cổng thông tin việc làm dành riêng cho lĩnh vực công nghệ thông tin (Information Technology - IT), được xây dựng nhằm kết nối hai nhóm đối tượng chính: **ứng viên** (candidate) — những người đang tìm kiếm cơ hội nghề nghiệp trong ngành IT — và **nhà tuyển dụng** (employer) — các doanh nghiệp và công ty có nhu cầu tuyển dụng nhân sự công nghệ. Bên cạnh hai nhóm người dùng chính, hệ thống còn vận hành một **tài khoản quản trị viên** (administrator/admin) với vai trò giám sát toàn bộ hoạt động của nền tảng.

Hệ thống được thiết kế theo kiến trúc **Single Page Application** (SPA), sử dụng ReactJS làm frontend framework, kết hợp với React Router để quản lý định tuyến phía client. Backend được xây dựng trên nền tảng Java Spring Boot, hỗ trợ RESTful API và giao thức WebSocket để đảm bảo trải nghiệm thời gian thực, đặc biệt trong tính năng nhắn tin giữa ứng viên và nhà tuyển dụng.

### 1.2. Các vai trò người dùng

Hệ thống phân chia người dùng thành ba nhóm chính, mỗi nhóm được cấp phép truy cập vào một tập hợp giao diện (interface) riêng biệt:

| Vai trò | Mã định danh | Mô tả |
|---|---|---|
| **Ứng viên** | `CANDIDATE` / `USER` | Người dùng tìm việc, ứng tuyển, quản lý hồ sơ và theo dõi công ty |
| **Nhà tuyển dụng** | `EMPLOYER` | Đại diện doanh nghiệp đăng tin tuyển dụng, xem và quản lý hồ sơ ứng viên |
| **Quản trị viên** | `ADMIN` | Người quản lý hệ thống, duyệt nội dung, quản lý người dùng và cấu hình nền tảng |

---

## 2. Phân hệ Người dùng Công khai (Public User)

Phân hệ này bao gồm toàn bộ các trang mà bất kỳ người dùng nào — dù đã đăng nhập hay chưa — đều có thể truy cập mà không cần xác thực quyền. Đây là cửa ngõ đầu tiên mà người dùng tiếp xúc khi truy cập nền tảng ITing.

### 2.1. Trang chủ (HomePage)

**Đường dẫn:** `/` hoặc `/home`

Trang chủ được thiết kế như một **trang đích** (landing page) theo phong cách hiện đại, sử dụng giao diện tối (dark mode) với các điểm nhấn màu xanh dương (`#3AB4E6`). Cấu trúc bố cục của trang bao gồm nhiều phần nội dung xếp liên tiếp theo chiều dọc:

**a) Hero Section (Phần đầu trang):** Đây là khu vực nổi bật nhất, nền tảng sử dụng hình ảnh nền mờ kết hợp gradient bao phủ. Ngay tại đây, hệ thống hiển thị thanh tìm kiếm đa chức năng với ba trường thông tin chính: (1) **Danh mục ngành nghề** — cho phép lọc theo lĩnh vực công nghệ cụ thể (Software Development, Web Development, Mobile Development, Cloud Computing, DevOps, Data Science, AI, Cybersecurity, Blockchain, Game Development, QA/Testing, IT Software); (2) **Từ khóa tìm kiếm** — nhập tên vị trí tuyển dụng hoặc tên công ty; và (3) **Địa điểm** — lựa chọn tỉnh/thành phố. Thanh tìm kiếm được tích hợp thêm một nút **"AI"** đặc biệt — khi người dùng nhấp vào, hệ thống sẽ mở một cửa sổ modal cho phép dán nội dung CV (Curriculum Vitae) để AI phân tích và đề xuất việc làm phù hợp (**AI-powered CV Analysis**). Bên dưới thanh tìm kiếm là các **gợi ý tìm kiếm nhanh** (search suggestions) như "Intern", "Thực tập sinh IT", "Thực tập sinh tiếng Trung" — giúp người dùng chưa quen thuộc với hệ thống có thể bắt đầu tìm kiếm ngay lập tức. Phần thống kê tổng quan (**Stats Banner**) hiển thị ba con số quan trọng: tổng số việc làm đang tuyển, tổng số ứng viên đã đăng ký, và tổng số công ty tham gia nền tảng.

**b) AI Assistant Banner:** Tiếp theo là một banner riêng biệt giới thiệu tính năng **"Cáo Công Nghệ"** — biểu tượng AI mascot của ITing. Banner này mô tả ngắn gọn khả năng phân tích CV tự động bằng trí tuệ nhân tạo và kèm nút hành động gọi trực tiếp modal phân tích CV.

**c) Phần việc làm được đề xuất:** Khu vực này hiển thị danh sách việc làm được cá nhân hóa. Nếu người dùng đã đăng nhập với vai trò ứng viên, hệ thống sẽ gọi API `/recommendations/homepage` để lấy danh sách việc làm phù hợp dựa trên hồ sơ của ứng viên. Nếu chưa đăng nhập, khu vực này hiển thị danh sách **"Việc làm nổi bật"** (Featured Jobs). Mỗi card việc làm hiển thị logo công ty, tiêu đề vị trí, tên công ty, mức lương, địa điểm, thời gian đăng tin, và badge gợi ý từ AI (nếu có). Khi người dùng di chuột (hover) vào một card việc làm, hệ thống kích hoạt tính năng **Job Preview Pane** — một cửa sổ xem trước (popup) xuất hiện bên cạnh card mà không cần rời khỏi trang hiện tại, giúp tiết kiệm thời gian và giữ nguyên ngữ cảnh tìm kiếm.

**d) Phần tìm kiếm theo danh mục:** Người dùng có thể duyệt việc làm theo 12 lĩnh vực ngành nghề IT, mỗi danh mục được biểu diễn bằng một biểu tượng (icon) cùng tên gọi. Việc nhấp vào bất kỳ danh mục nào sẽ chuyển hướng đến trang tìm kiếm `/jobs` với từ khóa được điền sẵn tương ứng.

**e) Thị trường việc làm (Market Dashboard):** Đây là một khu vực đặc biệt hiển thị bảng điều khiển thị trường với biểu đồ đường (line chart) thể hiện xu hướng tăng trưởng cơ hội việc làm theo thời gian, biểu đồ cột ngang (horizontal bar chart) thể hiện nhu cầu tuyển dụng theo từng ngành nghề, và danh sách việc làm mới nhất. Khu vực này sử dụng giao diện nền tối với mã màu chủ đạo xanh dương `#0a192f` — tạo cảm giác chuyên nghiệp và công nghệ cao.

**f) Tin tức và Blog:** Cuối cùng, trang chủ tích hợp một mục **Blog** hiển thị các bài viết mới nhất về công nghệ và thị trường tuyển dụng IT, được lấy từ API `/blogs`.

**Luồng điều hướng chính từ Trang chủ:**

- `Trang chủ` → `Trang tìm kiếm việc làm` (/jobs) thông qua thanh tìm kiếm
- `Trang chủ` → `Trang chi tiết việc làm` (/viec-lam/:slug/:jobKey) khi nhấp vào card việc làm
- `Trang chủ` → `Trang đăng nhập` (/login) hoặc `Trang đăng ký` (/register) qua các nút hành động
- `Trang chủ` → `Trang danh sách công ty` (/companies) qua menu điều hướng hoặc liên kết trong nội dung

### 2.2. Trang đăng nhập (LoginPage) và Trang đăng ký (RegisterPage)

**Đường dẫn:** `/login` và `/register`

Hai trang này sử dụng **bố cục chia đôi** (split layout): nửa trái chứa biểu mẫu (form) đăng nhập/đăng ký, nửa phải trưng bày hình ảnh nền kết hợp các thống kê nổi bật của nền tảng (số lượng việc làm, công ty, ứng viên). Thiết kế này vừa mang tính thẩm mỹ cao vừa truyền tải được quy mô và độ tin cậy của nền tảng ngay từ bước đầu tiên của quá trình đăng nhập.

**Trang đăng nhập** bao gồm các trường: Email và Mật khẩu, kèm tùy chọn "Ghi nhớ tài khoản" và liên kết "Quên mật khẩu?" dẫn đến `/forgot-password`. Hệ thống hỗ trợ ba phương thức đăng nhập: (1) **Đăng nhập bằng email/mật khẩu** truyền thống; (2) **Đăng nhập bằng Google** thông qua Google OAuth 2.0 (`@react-oauth/google`); và (3) **Đăng nhập bằng Facebook** qua Facebook OAuth. Sau khi đăng nhập thành công, hệ thống sẽ chuyển hướng dựa trên vai trò người dùng: ứng viên đến `/candidate/dashboard`, nhà tuyển dụng đến `/employer/dashboard`, quản trị viên đến `/admin/dashboard`.

**Trang đăng ký** sử dụng cơ chế **role selector** — người dùng phải lựa chọn trước vai trò của mình là "Ứng viên" hoặc "Nhà tuyển dụng" trước khi điền vào biểu mẫu tương ứng. Nếu chọn vai trò **Nhà tuyển dụng**, biểu mẫu sẽ yêu cầu thêm các trường bổ sung bao gồm Địa chỉ công ty, Website công ty, và Số điện thoại liên hệ. Sau khi đăng ký, hệ thống hiển thị một **Success Modal** thông báo rằng tài khoản đã được ghi nhận và đang chờ Admin xét duyệt — điều này phản ánh quy trình **approval workflow** mà hệ thống áp dụng cho tài khoản nhà tuyển dụng mới. Ngoài ra, tài khoản nhà tuyển dụng cần trải qua bước **Verification** (xác minh) và **Data Processing Agreement** (đồng ý xử lý dữ liệu) trước khi có thể đăng tin tuyển dụng.

### 2.3. Trang tìm kiếm việc làm (JobPage)

**Đường dẫn:** `/jobs` hoặc `/tim-viec-lam-:keyword`

Trang tìm kiếm việc làm được thiết kế theo mô hình **bố cục hai cột** (two-column layout): cột trái chiếm khoảng 25% chiều rộng chứa **bộ lọc tìm kiếm** (Job Filters), cột phải chiếm 75% hiển thị **danh sách việc làm** (Job Listings).

**Cột bộ lọc** cung cấp các tiêu chí lọc bao gồm: Từ khóa, Địa điểm (tỉnh/thành phố), Loại công việc (Full-time, Part-time, Remote, Freelance, Internship), Cấp bậc kinh nghiệm (Intern, Fresher, Junior, Middle, Senior, Lead, Manager), Mức lương tối thiểu và tối đa, Thời gian đăng tin (trong 24 giờ, 7 ngày, 30 ngày). Người dùng có thể chọn nhiều giá trị cho mỗi tiêu chí (multi-select). Nút **"Áp dụng bộ lọc"** sẽ gửi yêu cầu tìm kiếm đến backend qua API, trong khi nút **"Đặt lại"** xóa toàn bộ bộ lọc về trạng thái mặc định.

**Cột danh sách việc làm** hiển thị kết quả dưới dạng danh sách các card có thể cuộn (scrollable card list). Mỗi card việc làm bao gồm: logo công ty, tiêu đề vị trí, tên công ty, các tag thể hiện loại hình công việc, mức lương, địa điểm, và thời gian đăng tin. Khi danh sách kết quả trống (không tìm thấy việc làm phù hợp), hệ thống sẽ hiển thị mục **"Gợi ý việc làm tốt nhất cho bạn"** — sử dụng API `/jobs/hot?limit=5` để đề xuất các việc làm "hot" (có lượt xem cao hoặc nhiều đơn ứng tuyển). Tương tự như trang chủ, tính năng **hover preview** cũng được kích hoạt tại đây. Phần điều hướng trang (**Pagination**) được đặt ở cuối danh sách, cho phép người dùng di chuyển qua các trang kết quả với kích thước mỗi trang mặc định là 10 việc làm.

**Đặc biệt:** Nếu người dùng đến trang này thông qua tính năng **AI CV Analysis** từ trang chủ, hệ thống sẽ đánh dấu kết quả tìm kiếm bằng tham số `isAiSearch=true`, cho phép backend trả về danh sách việc làm được xếp hạng cao nhất dựa trên phân tích CV thay vì sử dụng thuật toán tìm kiếm thông thường.

### 2.4. Trang chi tiết việc làm (JobDetailPage)

**Đường dẫn:** `/viec-lam/:slug/:jobKey`

Đây là trang có mật độ thông tin cao nhất trong phân hệ công khai, được thiết kế theo **bố cục hai cột**: cột nội dung chính bên trái (chiếm khoảng 66%) và cột thông tin bổ sung bên phải (chiếm khoảng 33%).

**Cột nội dung chính** bao gồm các phần thông tin được tổ chức tuần tự: (1) **Header** — hiển thị thời gian đăng tin, nút "Gửi tôi việc làm tương tự" (sử dụng modal để cho phép người dùng theo dõi công ty hoặc tìm việc tương tự ngay lập tức); (2) **Thông tin tổng quan** — logo công ty, tiêu đề vị trí, tên công ty; (3) **Thông số nhanh** — một dải các biểu tượng kèm giá trị thể hiện lĩnh vực ngành, loại hình công việc, mức lương, địa điểm, và hạn nộp hồ sơ; (4) **Hành động chính** — hai nút "Ứng tuyển ngay" (mở modal đăng ký ứng tuyển) và "Lưu việc làm" (bookmark); (5) **Mô tả công việc** — danh sách các điểm mô tả công việc; (6) **Trách nhiệm công việc**; (7) **Yêu cầu ứng viên**; (8) **Quyền lợi**; (9) **Địa điểm và thời gian làm việc** — bao gồm bản đồ Google Maps nhúng (embedded Google Maps iframe) giúp ứng viên hình dung được vị trí làm việc; (10) **Tags công nghệ** — các kỹ năng kỹ thuật yêu cầu; (11) **Việc làm liên quan** — danh sách 3 công việc được đề xuất dựa trên cùng từ khóa hoặc cùng công ty.

**Cột bên phải** (Sidebar) chứa: (1) **Thông tin công ty thu gọn** — logo, tên, quy mô, lĩnh vực, địa điểm, và nút "Xem trang công ty"; (2) **Form nhắn tin cho nhà tuyển dụng** — cho phép ứng viên gửi tin nhắn trực tiếp đến công ty mà không cần rời khỏi trang (sử dụng `messageService.sendMessage` API); (3) **Thông tin chung** — cấp bậc, hình thức làm việc, lĩnh vực, kinh nghiệm, học vấn, lương, địa điểm chi tiết kèm thông tin về sáp nhập tỉnh/thành theo Nghị quyết 1685/NQ-UBTVQH15.

**Các tính năng đặc biệt:**

- **Job Apply Modal:** Cửa sổ modal cho phép ứng viên nộp hồ sơ ứng tuyển trực tiếp mà không cần điều hướng đến trang khác. Sau khi nộp thành công, trạng thái nút "Ứng tuyển ngay" sẽ chuyển thành "Đã Ứng Tuyển".
- **Job Report Modal:** Cho phép ứng viên báo cáo tin tuyển dụng không phù hợp với các lý do được định nghĩa sẵn: Thông tin sai lệch, Lừa đảo, Tin đã hết hạn, Phân biệt đối xử, Spam, Nội dung không phù hợp.
- **Follow Company:** Người dùng có thể theo dõi công ty để nhận thông báo khi có tin tuyển dụng mới.

**Cảnh báo đặc biệt:** Nếu công ty đăng tin đang trong trạng thái bị đình chỉ (`companyActive === false`), hệ thống sẽ hiển thị banner cảnh báo màu vàng ngay đầu trang, vô hiệu hóa nút ứng tuyển và form nhắn tin.

### 2.5. Trang danh sách công ty (CompaniesPage)

**Đường dẫn:** `/companies`

Trang này cho phép người dùng khám phá toàn bộ các công ty đang hoạt động trên nền tảng ITing. Giao diện bao gồm một **Hero Section** với hình nền đặc trưng, tiếp theo là thanh tìm kiếm cho phép lọc theo tên công ty, địa điểm, lĩnh vực ngành, và quy mô công ty. Kết quả được hiển thị dưới dạng **lưới các card công ty** (company card grid), mỗi card chứa logo, tên, mô tả ngắn, số việc làm đang tuyển, đánh giá trung bình (star rating), và nút theo dõi/ngừng theo dõi công ty. Người dùng đã đăng nhập với vai trò ứng viên có thể nhấn biểu tượng trái tim (heart icon) để theo dõi công ty.

### 2.6. Trang chi tiết công ty (CompanyDetailPage)

**Đường dẫn:** `/companies/:id`

Trang chi tiết công ty được thiết kế với **cấu trúc phức tạp** gồm nhiều phần hợp nhất: phần banner đầu trang với gradient động được tạo dựa trên màu chủ đạo của logo công ty (sử dụng thuật toán trích xuất màu dominant color extraction qua Canvas API), khu vực thông tin hồ sơ công ty (profile header) với logo kích thước lớn, tên công ty, badge xác minh, trạng thái đang tuyển dụng, website, địa chỉ, quy mô, đánh giá và số người theo dõi, cùng nút hành động "Theo dõi công ty".

Phần nội dung chính bao gồm: (1) **Giới thiệu công ty** (About Section) — văn bản mô tả doanh nghiệp; (2) **Lưới thông tin nổi bật** — danh sách công nghệ sử dụng (Tech Stack) và phúc lợi dành cho nhân viên (Employee Benefits); (3) **Danh sách việc làm đang tuyển** — hiển thị tối đa 5 vị trí gần nhất của công ty; (4) **Phần đánh giá** — cho phép người dùng đã đăng nhập viết đánh giá (review) về công ty kèm xếp hạng 1-5 sao.

Phần sidebar chứa thông tin doanh nghiệp bổ sung: năm thành lập, quy mô nhân sự, lĩnh vực hoạt động, và call-to-action card khuyến khích theo dõi công ty.

---

## 3. Phân hệ Ứng viên (Candidate)

Phân hệ này chỉ accessible cho người dùng đã đăng nhập với vai trò `CANDIDATE` hoặc `USER`, được bảo vệ bởi cơ chế **PrivateRoute** trong React Router. Tất cả các trang trong phân hệ này đều sử dụng **CandidateLayout** — một layout chung bao gồm Header điều hướng và hệ thống menu dành riêng cho ứng viên.

### 3.1. Trang tổng quan ứng viên (CandidateDashboard)

**Đường dẫn:** `/candidate/dashboard`

Đây là trang đầu tiên mà ứng viên nhìn thấy sau khi đăng nhập thành công, đóng vai trò như một **trung tâm thông tin cá nhân** (personal hub). Giao diện bao gồm:

**a) Thống kê nhanh (Stats Cards):** Hai card thể hiện: (1) **"Công việc yêu thích"** — số lượng việc làm đã lưu (saved jobs); (2) **"Thông báo việc làm"** — số thông báo chưa đọc (unread notifications).

**b) Banner nhắc nhở hồ sơ:** Nếu hồ sơ ứng viên chưa hoàn thiện (dựa trên `profileCompletionPercent < 100`), hệ thống hiển thị một banner màu đỏ nổi bật với thông báo "Hồ sơ của bạn chưa hoàn thành (X%)" kèm nút chuyển hướng đến trang chỉnh sửa hồ sơ. Banner này có tác dụng khuyến khích ứng viên hoàn thiện hồ sơ — yếu tố then chốt để hệ thống có thể đề xuất việc làm phù hợp thông qua AI.

**c) Bảng ứng tuyển gần đây:** Hiển thị danh sách các đơn ứng tuyển gần đây nhất của ứng viên với các cột: Công việc (logo + tên công ty + vị trí), Ngày nộp, Trạng thái (status badge), và Hành động (nút "Xem chi tiết"). Dữ liệu được lấy từ API `/candidates/dashboard/stats`.

**Luồng điều hướng từ CandidateDashboard:**

- `CandidateDashboard` → `CandidateProfile` (/candidate/profile) — chỉnh sửa hồ sơ cá nhân
- `CandidateDashboard` → `AppliedJobs` (/candidate/applied-jobs) — xem toàn bộ lịch sử ứng tuyển
- `CandidateDashboard` → `FavoriteJobs` (/candidate/favorite-jobs) — xem danh sách việc làm đã lưu
- `CandidateDashboard` → `Messages` (/messages) — truy cập hộp thư tin nhắn

### 3.2. Trang quản lý hồ sơ ứng viên (CandidateProfile)

**Đường dẫn:** `/candidate/profile`

Trang này được tổ chức theo mô hình **tabbed interface** với bốn tab chính, mỗi tab quản lý một khía cạnh khác nhau của hồ sơ ứng viên:

**a) Tab Thông tin cá nhân (Personal Info):** Các trường thông tin cơ bản như họ và tên, email, số điện thoại, địa chỉ, ngày sinh, giới tính.

**b) Tab Hồ sơ chuyên nghiệp (Professional Info):** Đây là phần quan trọng nhất của hồ sơ ứng viên, bao gồm nhiều phân mục nhỏ: (1) **Kinh nghiệm làm việc** (Experience Section) — cho phép thêm, chỉnh sửa, xóa các mục kinh nghiệm; (2) **Học vấn** (Education Section) — thông tin về trình độ học vấn; (3) **Bằng cấp & Chứng chỉ** (Certificate Section) — các chứng chỉ chuyên ngành như AWS, Google Cloud, PMP; (4) **Kỹ năng** (Skills Section) — các công nghệ và kỹ năng kỹ thuật; (5) **Portfolio** — liên kết đến các dự án cá nhân, GitHub, LinkedIn; (6) **CV** (CV Section) — cho phép upload và quản lý file CV với tính năng **Auto-Parse CV** — tự động phân tích nội dung CV bằng AI để điền thông tin vào hồ sơ.

**c) Tab Liên kết mạng xã hội (Social Links):** Nơi ứng viên có thể cung cấp các liên kết đến LinkedIn, GitHub, Portfolio cá nhân, website, và các nền tảng chuyên ngành khác.

**d) Tab Bảo mật & Tài khoản (Account & Security):** Quản lý cài đặt bảo mật tài khoản, đổi mật khẩu, và các tùy chọn quyền riêng tư.

### 3.3. Trang việc đã ứng tuyển (AppliedJobs)

**Đường dẫn:** `/candidate/applied-jobs`

Trang này hiển thị toàn bộ lịch sử ứng tuyển của ứng viên dưới dạng bảng danh sách, bao gồm thông tin về công ty, vị trí ứng tuyển, ngày nộp, và trạng thái của đơn ứng tuyển (Pending, Reviewing, Shortlisted, Rejected, Accepted). Ứng viên có thể theo dõi tình trạng xử lý của từng đơn ứng tuyển mà không cần liên hệ trực tiếp với nhà tuyển dụng.

### 3.4. Trang việc đã lưu (FavoriteJobs)

**Đường dẫn:** `/candidate/favorite-jobs`

Cho phép ứng viên xem và quản lý danh sách các việc làm đã bookmark bằng tính năng "Lưu việc làm" trên trang chi tiết việc làm. Người dùng có thể bỏ lưu (unsave) hoặc chuyển hướng nhanh đến trang chi tiết để ứng tuyển.

---

## 4. Phân hệ Nhà tuyển dụng (Employer)

Phân hệ dành cho tài khoản có vai trò `EMPLOYER`, sử dụng **EmployerLayout** làm layout chung. Một đặc điểm quan trọng của phân hệ này là: tài khoản nhà tuyển dụng mới đăng ký sẽ chưa thể sử dụng đầy đủ chức năng cho đến khi hoàn tất quy trình **Verification** và **Data Processing Agreement**.

### 4.1. Trang tổng quan nhà tuyển dụng (EmployerDashboard)

**Đường dẫn:** `/employer/dashboard`

Tương tự CandidateDashboard, đây là trang đích đầu tiên của nhà tuyển dụng sau khi đăng nhập, cung cấp cái nhìn tổng quan về tình hình tuyển dụng của công ty. Giao diện bao gồm:

**a) Thẻ thống kê:** Hai card lớn hiển thị: (1) **"Việc làm đã đăng"** — tổng số tin tuyển dụng đang hoạt động của công ty; (2) **"Tổng lượt ứng tuyển"** — tổng số đơn ứng tuyển nhận được trên toàn bộ các tin tuyển dụng.

**b) Bảng việc làm gần đây:** Danh sách chi tiết các tin tuyển dụng gần đây nhất, mỗi dòng bao gồm: tên vị trí, trạng thái (Active/Suspended/Expired — với badge màu sắc và icon tương ứng), số lượng ứng viên đã nộp, số ngày còn lại trước khi hết hạn (nếu có deadline), và các nút hành động: "Xem đơn ứng tuyển" (chuyển đến trang quản lý đơn) và menu ba chấm (hiển thị tùy chọn "Xem chi tiết", "Đánh dấu hết hạn").

### 4.2. Trang đăng tin tuyển dụng (PostJob)

**Đường dẫn:** `/employer/post-job`

Đây là một trong những trang phức tạp nhất của hệ thống, được thiết kế dưới dạng **modal toàn màn hình** (full-screen modal) chồng lên layout hiện tại. Form đăng tin tuyển dụng bao gồm nhiều phần thông tin được nhóm theo ngữ nghĩa:

**a) Tiêu đề công việc:** Trường nhập liệu đơn lẻ với giới hạn 150 ký tự, hiển thị số ký tự đã nhập theo thời gian thực.

**b) Thông tin chi tiết:** Nhóm các trường quan trọng bao gồm: Vị trí tuyển dụng (multi-select tag input với khả năng thêm tùy chỉnh), Công nghệ yêu cầu (multi-select tag input), Hình thức làm việc (dropdown: Full-time, Part-time, Remote, Freelance, Internship), Kinh nghiệm yêu cầu (dropdown: Intern, Fresher, Junior, Middle, Senior, Lead, Manager), Ngày làm việc (dropdown: Thứ 2-6, Thứ 2-7, Linh động), Số lượng cần tuyển, và Ngày hết hạn (date picker với ràng buộc không được chọn ngày trong quá khứ).

**c) Địa chỉ làm việc:** Sử dụng cơ chế **cascading dropdown** — chọn Tỉnh/Thành phố trước, sau đó hệ thống sẽ tải danh sách Phường/Xã tương ứng từ API `https://provinces.open-api.vn/api/v2/`. Trường cuối cho phép nhập địa chỉ cụ thể (số nhà, tên đường).

**d) Mức lương:** Cho phép nhập mức lương tối thiểu và tối đa (định dạng số với dấu phân cách hàng nghìn tự động), kèm dropdown hình thức trả lương (Thỏa thuận, Theo tháng, Theo dự án, Theo giờ). Nếu chọn "Thỏa thuận", hai trường lương sẽ bị vô hiệu hóa.

**e) Mô tả công việc:** Rich text editor với thanh công cụ bao gồm các nút định dạng: in đậm (Bold), in nghiêng (Italic), gạch chân (Underline), gạch ngang (Strikethrough), chèn liên kết (Link), danh sách không thứ tự (Bullet list), danh sách có thứ tự (Numbered list). Bốn trường văn bản lớn: Mô tả công việc, Trách nhiệm công việc, Yêu cầu ứng viên, và Quyền lợi.

Sau khi nhấn "Đăng bài", hệ thống gửi yêu cầu đến API `POST /jobs`. Tin tuyển dụng mới tạo sẽ có trạng thái ban đầu là `PENDING` — nghĩa là đang chờ **AI tự động kiểm duyệt** và **Admin xét duyệt** trước khi được công khai trên nền tảng. Trang quản lý tin tuyển dụng cho phép nhà tuyển dụng chỉnh sửa tin đã đăng — sau khi chỉnh sửa, tin sẽ quay lại trạng thái `PENDING` để được xét duyệt lại.

### 4.3. Trang quản lý việc làm (ManageJobs)

**Đường dẫn:** `/employer/manage-jobs`

Trang này cung cấp giao diện quản lý toàn bộ tin tuyển dụng của công ty. Nhà tuyển dụng có thể xem danh sách đầy đủ các tin đã đăng, bao gồm cả các tin đang hoạt động, đang chờ duyệt, đã hết hạn, hoặc đã bị từ chối. Các hành động quản lý bao gồm: chỉnh sửa nội dung tin, xem danh sách ứng viên đã ứng tuyển, và đánh dấu tin là đã đóng (closed).

### 4.4. Trang quản lý đơn ứng tuyển (ManageApplications / JobApplications)

**Đường dẫn:** `/employer/manage-applications` và `/employer/job/:slug/:jobKey/applications`

Trang này cho phép nhà tuyển dụng xem toàn bộ đơn ứng tuyển mà công ty nhận được, hoặc lọc theo từng tin tuyển dụng cụ thể. Với mỗi đơn ứng tuyển, nhà tuyển dụng có thể: xem hồ sơ chi tiết của ứng viên, thay đổi trạng thái đơn (Pending → Reviewing → Shortlisted/Rejected), và liên hệ ứng viên qua tính năng nhắn tin. Ngoài ra, hệ thống còn cung cấp chế độ xem **Pipeline Kanban** (`/employer/pipeline`) — một giao diện dạng cột (columns) thể hiện pipeline tuyển dụng với các cột ứng viên được phân loại theo giai đoạn (ví dụ: New, Screening, Interview, Offer, Hired).

### 4.5. Trang tìm kiếm ứng viên (FindCandidate / FindCV)

**Đường dẫn:** `/employer/find-cv`

Cho phép nhà tuyển dụng tìm kiếm ứng viên dựa trên các tiêu chí như kỹ năng công nghệ, kinh nghiệm, và vị trí địa lý. Kết quả tìm kiếm hiển thị danh sách hồ sơ ứng viên với thông tin tổng quan, cho phép nhà tuyển dụng xem chi tiết hoặc liên hệ trực tiếp.

### 4.6. Trang hồ sơ công ty (CompanyProfile)

**Đường dẫn:** `/employer/company-profile`

Cho phép nhà tuyển dụng quản lý và cập nhật thông tin hồ sơ công ty hiển thị công khai trên nền tảng ITing, bao gồm: logo, mô tả doanh nghiệp, thông tin liên hệ, website, mạng xã hội, quy mô nhân sự, và các thông tin khác. Trang này có cấu trúc tab tương tự như CandidateProfile.

---

## 5. Phân hệ Quản trị viên (Admin)

Phân hệ dành cho người dùng có vai trò `ADMIN`, sử dụng **AdminLayout** với giao diện sidebar navigation đặc trưng của các hệ thống quản trị (admin dashboard). Tất cả các trang trong phân hệ này đều nằm dưới đường dẫn `/admin/*`.

### 5.1. Trang tổng quan quản trị (AdminDashboard)

**Đường dẫn:** `/admin/dashboard`

Đây là trang đầu tiên mà quản trị viên nhìn thấy sau khi đăng nhập, được thiết kế để cung cấp **tầm nhìn toàn diện** về hoạt động của toàn bộ nền tảng. Giao diện bao gồm:

**a) Bốn thẻ thống kê chính:** Hiển thị tổng số người dùng, tổng số tin tuyển dụng, tổng số lượt ứng tuyển, và số đơn ứng tuyển đang chờ duyệt. Mỗi thẻ đi kèm chỉ số phần trăm thay đổi so với kỳ trước (ví dụ: "+12.5%") và icon trực quan.

**b) Biểu đồ phân tích tuyển dụng (Line Chart):** Sử dụng thư viện **Chart.js** để vẽ biểu đồ đường thể hiện xu hướng tuyển dụng theo thời gian với hai đường: một cho số tin tuyển dụng mới và một cho số người dùng mới đăng ký.

**c) Biểu đồ phân bố trạng thái tin tuyển dụng (Doughnut Chart):** Biểu đồ tròn thể hiện tỷ lệ phân bố các tin tuyển dụng theo trạng thái: Đang hoạt động (Active), Chờ duyệt (Pending), Đã đóng (Closed), và Khác (Rejected/Expired).

**d) Bảng hoạt động gần đây:** Danh sách các hoạt động mới nhất trên nền tảng, bao gồm thông tin về công việc, công ty, thời gian, số lượt ứng tuyển, và trạng thái.

### 5.2. Các trang quản lý chuyên biệt

Hệ thống cung cấp một loạt các trang quản lý dành riêng cho từng chức năng:

| Trang | Đường dẫn | Chức năng |
|---|---|---|
| **UserManagement** | `/admin/users` | Quản lý tài khoản người dùng (kích hoạt, khóa, xóa) |
| **CompanyManagement** | `/admin/companies` | Duyệt và quản lý hồ sơ công ty |
| **AdminJobPage** | `/admin/jobs` | Quản lý toàn bộ tin tuyển dụng |
| **ApprovalManagement** | `/admin/approvals` | Duyệt tin tuyển dụng và công ty mới |
| **CategoryManagement** | `/admin/categories` | Quản lý danh mục ngành nghề |
| **BannerManagement** | `/admin/banner` | Quản lý banner trên trang chủ |
| **BlogManagement** | `/admin/blog` | Quản lý bài viết và nội dung blog |
| **FaqManagement** | `/admin/faq` | Quản lý mục câu hỏi thường gặp |
| **RoleManagement** | `/admin/roles` | Phân quyền người dùng hệ thống |
| **AuditLogPage** | `/admin/audit` | Nhật ký hoạt động (audit log) của hệ thống |
| **SystemConfig** | `/admin/config` | Cấu hình các thông số hệ thống |
| **NotificationManagement** | `/admin/notifications` | Quản lý thông báo toàn nền tảng |
| **ReportManagement** | `/admin/reports` | Xem và xử lý các báo cáo từ người dùng |

---

## 6. Hệ thống nhắn tin (Messages)

**Đường dẫn:** `/messages`

Trang nhắn tin là một tính năng **chia sẻ** giữa hai vai trò Ứng viên và Nhà tuyển dụng, cho phép hai bên trao đổi trực tiếp và thời gian thực trong quá trình tuyển dụng. Trang được thiết kế theo mô hình **chat interface kinh điển** gồm ba khu vực: sidebar danh sách hội thoại (conversation list), khu vực nội dung tin nhắn (message thread), và thanh nhập liệu (input bar).

**Đặc điểm kỹ thuật quan trọng:**

- **Real-time messaging:** Hệ thống sử dụng **WebSocket** (thông qua `chatRealtimeService` và Spring Boot's STOMP protocol) để nhận và gửi tin nhắn theo thời gian thực mà không cần tải lại trang.
- **Online presence indicator:** Hiển thị trạng thái "Đang hoạt động" (online) hoặc "Offline" của người dùng đối tác dựa trên sự kiện presence từ WebSocket.
- **Typing indicator:** Khi người dùng đang nhập tin nhắn, hệ thống gửi sự kiện typing đến đối phương qua WebSocket endpoint `/app/chat.typing`.
- **Unread count badge:** Số lượng tin nhắn chưa đọc được hiển thị ngay trên sidebar của từng hội thoại.
- **Applied companies section:** Đối với ứng viên, hệ thống hiển thị thêm một mục "Các công ty đã ứng tuyển" trong sidebar — cho phép ứng viên bắt đầu cuộc trò chuyện mới với công ty ngay từ giao diện nhắn tin mà không cần rời khỏi trang.
- **Optimistic updates:** Tin nhắn được hiển thị ngay lập tức trong giao diện (optimistic rendering) trước khi nhận xác nhận từ server, giúp tăng cảm giác phản hồi nhanh (perceived performance).
- **Suspended account handling:** Nếu tài khoản công ty đối tác bị đình chỉ, form nhập liệu sẽ bị vô hiệu hóa với thông báo rõ ràng.

---

## 7. Sơ đồ luồng tổng hợp

Dưới đây là mô tả bằng văn bản các luồng điều hướng chính trong hệ thống ITing:

### Luồng Khách chưa đăng nhập

```
Truy cập Trang chủ (/)
  ├── Tìm kiếm việc → Trang tìm kiếm (/jobs) → Trang chi tiết việc làm (/viec-lam/:slug/:jobKey)
  ├── Xem danh sách công ty → Trang công ty (/companies) → Trang chi tiết công ty (/companies/:id)
  ├── Đăng nhập → Trang đăng nhập (/login) → (theo vai trò) → Dashboard tương ứng
  └── Đăng ký → Trang đăng ký (/register) → Trang chủ (chờ duyệt nếu là Employer)
```

### Luồng Ứng viên

```
Đăng nhập → CandidateDashboard (/candidate/dashboard)
  ├── Xem và ứng tuyển việc làm
  │     └── Từ Dashboard → Trang tìm kiếm (/jobs) → Trang chi tiết việc làm → Modal Ứng tuyển
  ├── Quản lý hồ sơ
  │     └── CandidateProfile (/candidate/profile) [4 tabs: Cá nhân, Chuyên nghiệp, Mạng xã hội, Bảo mật]
  ├── Xem việc đã ứng tuyển
  │     └── AppliedJobs (/candidate/applied-jobs)
  ├── Xem việc đã lưu
  │     └── FavoriteJobs (/candidate/favorite-jobs)
  └── Nhắn tin với Nhà tuyển dụng
        └── Messages (/messages)
```

### Luồng Nhà tuyển dụng

```
Đăng nhập → EmployerDashboard (/employer/dashboard)
  ├── Đăng tin tuyển dụng mới → PostJob (/employer/post-job) [Modal]
  ├── Quản lý tin tuyển dụng
  │     └── ManageJobs (/employer/manage-jobs) → EditJob (/employer/manage-jobs/:id)
  ├── Xem và xử lý đơn ứng tuyển
  │     └── JobApplications (/employer/job/:slug/:jobKey/applications)
  │     └── ManageApplications (/employer/manage-applications)
  ├── Tìm kiếm ứng viên
  │     └── FindCandidate (/employer/find-cv)
  ├── Quản lý hồ sơ công ty
  │     └── CompanyProfile (/employer/company-profile)
  └── Nhắn tin với Ứng viên
        └── Messages (/messages)
```

### Luồng Quản trị viên

```
Đăng nhập → AdminDashboard (/admin/dashboard)
  ├── Quản lý người dùng → UserManagement (/admin/users)
  ├── Quản lý công ty → CompanyManagement (/admin/companies)
  ├── Duyệt tin tuyển dụng → ApprovalManagement (/admin/approvals)
  ├── Quản lý tin tuyển dụng → AdminJobPage (/admin/jobs)
  ├── Quản lý danh mục → CategoryManagement (/admin/categories)
  ├── Quản lý banner → BannerManagement (/admin/banner)
  ├── Quản lý blog → BlogManagement (/admin/blog)
  ├── Quản lý FAQ → FaqManagement (/admin/faq)
  ├── Quản lý quyền → RoleManagement (/admin/roles)
  ├── Xem audit log → AuditLogPage (/admin/audit)
  ├── Cấu hình hệ thống → SystemConfig (/admin/config)
  └── Quản lý thông báo → NotificationManagement (/admin/notifications)
```

---

## 8. Các thành phần giao diện chung (Shared Components)

Hệ thống xây dựng một tập hợp các **shared UI components** được sử dụng xuyên suốt nhiều trang, đảm bảo tính nhất quán về giao diện và giảm thiểu mã trùng lặp:

- **Button:** Nút bấm đa dạng với các biến thể về kích thước (small, medium, large), màu sắc (primary, secondary, outline, ghost), và trạng thái (enabled, disabled, loading).
- **Input / Textarea:** Các trường nhập liệu với hỗ trợ validation hiển thị thông báo lỗi theo thời gian thực.
- **Modal / Dialog:** Cửa sổ popup đa năng, hỗ trợ đóng bằng nút X, phím Escape (thông qua hook `useModalEscape`), và click outside-to-close.
- **Pagination:** Thanh phân trang có khả năng hiển thị số trang rút gọn (ví dụ: "1 ... 4 5 6 ... 10").
- **Badge:** Nhãn trạng thái với nhiều màu sắc biểu diễn trạng thái khác nhau (success/green, warning/yellow, error/red, info/blue).
- **CompanyLogo:** Component hiển thị logo công ty với fallback (hình mặc định) khi không có logo.
- **JobCard:** Card việc làm chuẩn hóa được sử dụng ở nhiều trang (HomePage, JobPage, RelatedJobs...).
- **JobPreviewModal / JobPreviewPane:** Cửa sổ xem trước nhanh khi hover vào card việc làm.
- **JobApplyModal:** Modal nộp đơn ứng tuyển.
- **Breadcrumb:** Thanh điều hướng phụ hiển thị vị trí hiện tại của người dùng trong cấu trúc phân cấp trang.
- **StatsCard:** Card thống kê có khả năng hiển thị giá trị, nhãn, icon, và chỉ số phần trăm thay đổi.

---

## 10. Sơ đồ luồng dạng XML cho Draw.io

Phần này cung cấp sơ đồ luồng người dùng (User Flow Diagram) dưới dạng XML để có thể dán trực tiếp vào công cụ **draw.io** (diagrams.net) nhằm vẽ và chỉnh sửa trực quan. Sơ đồ được tổ chức thành bốn phần chính tương ứng với bốn nhóm người dùng của hệ thống.

### Hướng dẫn sử dụng

1. Truy cập [https://app.diagrams.net](https://app.diagrams.net) (hoặc mở ứng dụng draw.io desktop)
2. Chọn **File → New** để tạo sơ đồ trắng
3. Chọn **Arrange → Insert → Advanced → XML** (hoặc nhấn `Ctrl+V` để dán nội dung bên dưới vào phần **Edit → SVG → Edit SVG as Text**)
4. Hoặc tạo thủ công các hình (rectangle, diamond, rounded rectangle, parallelogram) và kết nối bằng các mũi tên theo mô tả bên dưới

---

### 10.1. Sơ đồ luồng Người dùng Công khai (Public User Flow)

```
<mxfile>
  <diagram name="Public User Flow" id="public-flow">
    <mxGraphModel dx="1200" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1100" pageHeight="850" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- Entry point -->
        <mxCell id="pub_start" value="Khách truy cập&#xa;(Chưa đăng nhập)" style="shape=ellipse;fillColor=#3AB4E6;fontColor=#ffffff;strokeColor=#2A9DCB;fontSize=12;fontStyle=bold;horizontal=1;align=center;spacingTop=8;spacingBottom=8;spacingLeft=8;spacingRight=8;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="460" y="20" width="180" height="60" as="geometry" />
        </mxCell>

        <!-- HomePage -->
        <mxCell id="pub_home" value="Trang chủ&#xa;(HomePage)&#xa;/" style="shape=rectangle;fillColor=#EAF6FF;strokeColor=#3AB4E6;strokeWidth=2;fontSize=11;fontStyle=bold;align=center;verticalAlign=top;spacingTop=6;spacingBottom=6;spacingLeft=6;spacingRight=6;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="420" y="110" width="260" height="70" as="geometry" />
        </mxCell>

        <!-- JobPage -->
        <mxCell id="pub_jobs" value="Trang tìm kiếm việc&#xa;(JobPage)&#xa;/jobs" style="shape=rectangle;fillColor=#EAF6FF;strokeColor=#3AB4E6;strokeWidth=2;fontSize=11;fontStyle=bold;align=center;verticalAlign=top;spacingTop=6;spacingBottom=6;spacingLeft=6;spacingRight=6;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="60" y="220" width="220" height="70" as="geometry" />
        </mxCell>

        <!-- JobDetailPage -->
        <mxCell id="pub_job_detail" value="Chi tiết việc làm&#xa;(JobDetailPage)&#xa;/viec-lam/:slug/:jobKey" style="shape=rectangle;fillColor=#FFF6E5;strokeColor=#F59E0B;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=top;spacingTop=6;spacingBottom=6;spacingLeft=6;spacingRight=6;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="20" y="360" width="300" height="80" as="geometry" />
        </mxCell>

        <!-- Job Apply Modal (inside JobDetail) -->
        <mxCell id="pub_apply_modal" value="Modal Ứng tuyển&#xa;(JobApplyModal)" style="shape=rectangle;fillColor=#E6FFFE;strokeColor=#10B981;strokeWidth=1.5;fontSize=10;fontStyle=italic;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;dashed=1;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="340" y="360" width="160" height="60" as="geometry" />
        </mxCell>

        <!-- CompaniesPage -->
        <mxCell id="pub_companies" value="Danh sách công ty&#xa;(CompaniesPage)&#xa;/companies" style="shape=rectangle;fillColor=#EAF6FF;strokeColor=#3AB4E6;strokeWidth=2;fontSize=11;fontStyle=bold;align=center;verticalAlign=top;spacingTop=6;spacingBottom=6;spacingLeft=6;spacingRight=6;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="460" y="220" width="220" height="70" as="geometry" />
        </mxCell>

        <!-- CompanyDetailPage -->
        <mxCell id="pub_company_detail" value="Chi tiết công ty&#xa;(CompanyDetailPage)&#xa;/companies/:id" style="shape=rectangle;fillColor=#FFF6E5;strokeColor=#F59E0B;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=top;spacingTop=6;spacingBottom=6;spacingLeft=6;spacingRight=6;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="460" y="360" width="240" height="80" as="geometry" />
        </mxCell>

        <!-- LoginPage -->
        <mxCell id="pub_login" value="Đăng nhập&#xa;(LoginPage)&#xa;/login" style="shape=rectangle;fillColor=#F3F4F6;strokeColor=#6B7280;strokeWidth=2;fontSize=11;fontStyle=bold;align=center;verticalAlign=top;spacingTop=6;spacingBottom=6;spacingLeft=6;spacingRight=6;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="720" y="220" width="200" height="70" as="geometry" />
        </mxCell>

        <!-- RegisterPage -->
        <mxCell id="pub_register" value="Đăng ký&#xa;(RegisterPage)&#xa;/register" style="shape=rectangle;fillColor=#F3F4F6;strokeColor=#6B7280;strokeWidth=2;fontSize=11;fontStyle=bold;align=center;verticalAlign=top;spacingTop=6;spacingBottom=6;spacingLeft=6;spacingRight=6;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="720" y="360" width="200" height="70" as="geometry" />
        </mxCell>

        <!-- Decision: Authenticated? -->
        <mxCell id="pub_auth_check" value="Đã đăng nhập?" style="shape=diamond;fillColor=#FEF3C7;strokeColor=#F59E0B;strokeWidth=2;fontSize=11;fontStyle=bold;align=center;verticalAlign=middle;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="720" y="110" width="120" height="70" as="geometry" />
        </mxCell>

        <!-- Role-based redirect after login -->
        <mxCell id="pub_cand_dash" value="CandidateDashboard&#xa;/candidate/dashboard" style="shape=rectangle;fillColor=#DBEAFE;strokeColor=#3B82F6;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="560" y="490" width="200" height="50" as="geometry" />
        </mxCell>
        <mxCell id="pub_emp_dash" value="EmployerDashboard&#xa;/employer/dashboard" style="shape=rectangle;fillColor=#FEF3C7;strokeColor=#D97706;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="760" y="490" width="200" height="50" as="geometry" />
        </mxCell>
        <mxCell id="pub_admin_dash" value="AdminDashboard&#xa;/admin/dashboard" style="shape=rectangle;fillColor=#FCE7F3;strokeColor=#DB2777;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="760" y="560" width="200" height="50" as="geometry" />
        </mxCell>

        <!-- BlogPage (public) -->
        <mxCell id="pub_blog" value="Blog&#xa;(BlogPage)&#xa;/blogs" style="shape=rectangle;fillColor=#EAF6FF;strokeColor=#3AB4E6;strokeWidth=2;fontSize=11;fontStyle=bold;align=center;verticalAlign=top;spacingTop=6;spacingBottom=6;spacingLeft=6;spacingRight=6;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="920" y="110" width="160" height="70" as="geometry" />
        </mxCell>

        <!-- Edges: HomePage connections -->
        <mxCell id="e1" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#3AB4E6;strokeWidth=1.5;exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="pub_home" target="pub_jobs" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e2" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#3AB4E6;strokeWidth=1.5;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="pub_home" target="pub_companies" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e3" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#3AB4E6;strokeWidth=1.5;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="pub_home" target="pub_auth_check" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e4" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#3AB4E6;strokeWidth=1.5;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="pub_home" target="pub_blog" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Edges: Job search flow -->
        <mxCell id="e5" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#3AB4E6;strokeWidth=1.5;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" parent="1" source="pub_jobs" target="pub_job_detail" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e6" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#10B981;strokeWidth=1.5;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;dashed=1;" parent="1" source="pub_job_detail" target="pub_apply_modal" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Edges: Companies flow -->
        <mxCell id="e7" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#3AB4E6;strokeWidth=1.5;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" parent="1" source="pub_companies" target="pub_company_detail" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Edges: Auth flow -->
        <mxCell id="e8" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#6B7280;strokeWidth=1.5;exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="pub_auth_check" target="pub_login" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e9" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#6B7280;strokeWidth=1.5;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" parent="1" source="pub_login" target="pub_register" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Auth check YES edges -->
        <mxCell id="e10" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#3B82F6;strokeWidth=1.5;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" parent="1" source="pub_auth_check" target="pub_cand_dash" edge="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="780" y="145" as="sourcePoint" />
          </mxGeometry>
        </mxCell>

        <!-- Edge labels -->
        <mxCell id="label1" value="Tìm kiếm" style="text;html=1;align=center;verticalAlign=middle;fontSize=9;fontColor=#3AB4E6;fontStyle=italic;resizable=0;points=[];pruneXml=1;" parent="1" vertex="1" connectable="0">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

---

### 10.2. Sơ đồ luồng Ứng viên (Candidate Flow)

```
<mxfile>
  <diagram name="Candidate Flow" id="candidate-flow">
    <mxGraphModel dx="1200" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1100" pageHeight="850" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- Entry -->
        <mxCell id="c_start" value="Đăng nhập&#xa;(vai trò CANDIDATE)" style="shape=ellipse;fillColor=#3B82F6;fontColor=#ffffff;strokeColor=#2563EB;fontSize=12;fontStyle=bold;horizontal=1;align=center;spacingTop=8;spacingBottom=8;spacingLeft=8;spacingRight=8;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="440" y="20" width="220" height="60" as="geometry" />
        </mxCell>

        <!-- Dashboard -->
        <mxCell id="c_dash" value="CandidateDashboard&#xa;/candidate/dashboard" style="shape=rectangle;fillColor=#DBEAFE;strokeColor=#3B82F6;strokeWidth=2;fontSize=11;fontStyle=bold;align=center;verticalAlign=top;spacingTop=6;spacingBottom=6;spacingLeft=6;spacingRight=6;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="400" y="120" width="300" height="60" as="geometry" />
        </mxCell>

        <!-- Profile check -->
        <mxCell id="c_profile_check" value="Hồ sơ&#xa;hoàn thành?" style="shape=diamond;fillColor=#FEF3C7;strokeColor=#F59E0B;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=middle;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="420" y="220" width="120" height="70" as="geometry" />
        </mxCell>
        <mxCell id="c_profile_banner" value="Banner nhắc nhở&#xa;hoàn thiện hồ sơ" style="shape=rectangle;fillColor=#FEE2E2;strokeColor=#EF4444;strokeWidth=1.5;fontSize=10;fontStyle=italic;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;dashed=1;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="560" y="220" width="180" height="50" as="geometry" />
        </mxCell>

        <!-- Profile -->
        <mxCell id="c_profile" value="CandidateProfile&#xa;/candidate/profile&#xa;(4 tabs)" style="shape=rectangle;fillColor=#DBEAFE;strokeColor=#3B82F6;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="100" y="340" width="220" height="60" as="geometry" />
        </mxCell>

        <!-- Applied Jobs -->
        <mxCell id="c_applied" value="AppliedJobs&#xa;/candidate/applied-jobs" style="shape=rectangle;fillColor=#DBEAFE;strokeColor=#3B82F6;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="340" y="340" width="220" height="60" as="geometry" />
        </mxCell>

        <!-- Favorite Jobs -->
        <mxCell id="c_fav" value="FavoriteJobs&#xa;/candidate/favorite-jobs" style="shape=rectangle;fillColor=#DBEAFE;strokeColor=#3B82F6;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="580" y="340" width="220" height="60" as="geometry" />
        </mxCell>

        <!-- Messages -->
        <mxCell id="c_msg" value="Messages&#xa;/messages" style="shape=rectangle;fillColor=#DBEAFE;strokeColor=#3B82F6;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="820" y="340" width="180" height="60" as="geometry" />
        </mxCell>

        <!-- Job Search -->
        <mxCell id="c_job_search" value="JobPage&#xa;/jobs" style="shape=rectangle;fillColor=#EAF6FF;strokeColor=#3AB4E6;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="100" y="450" width="160" height="55" as="geometry" />
        </mxCell>

        <!-- JobDetail -->
        <mxCell id="c_job_detail" value="JobDetailPage&#xa;/viec-lam/:slug/:jobKey" style="shape=rectangle;fillColor=#FFF6E5;strokeColor=#F59E0B;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="100" y="560" width="220" height="55" as="geometry" />
        </mxCell>

        <!-- Apply Modal -->
        <mxCell id="c_apply" value="Modal Ứng tuyển&#xa;(JobApplyModal)" style="shape=rectangle;fillColor=#E6FFFE;strokeColor=#10B981;strokeWidth=1.5;fontSize=10;fontStyle=italic;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;dashed=1;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="100" y="670" width="180" height="55" as="geometry" />
        </mxCell>

        <!-- Save Job -->
        <mxCell id="c_save" value="Lưu / Bỏ lưu&#xa;việc làm" style="shape=rectangle;fillColor=#F3F4F6;strokeColor=#6B7280;strokeWidth=1.5;fontSize=10;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="340" y="560" width="160" height="55" as="geometry" />
        </mxCell>

        <!-- Follow Company -->
        <mxCell id="c_follow" value="Theo dõi&#xa;Công ty" style="shape=rectangle;fillColor=#F3F4F6;strokeColor=#6B7280;strokeWidth=1.5;fontSize=10;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="340" y="670" width="160" height="55" as="geometry" />
        </mxCell>

        <!-- Edges -->
        <mxCell id="ce1" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#3B82F6;strokeWidth=1.5;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" parent="1" source="c_dash" target="c_profile_check" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="ce2" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#EF4444;strokeWidth=1;dashed=1;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="c_profile_check" target="c_profile_banner" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="ce3" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#3B82F6;strokeWidth=1.5;exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" parent="1" source="c_profile_check" target="c_profile" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="ce4" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#3B82F6;strokeWidth=1.5;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="c_profile_check" target="c_applied" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="ce5" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#3B82F6;strokeWidth=1.5;exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="c_dash" target="c_fav" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="ce6" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#3B82F6;strokeWidth=1.5;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="c_dash" target="c_msg" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="ce7" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#3B82F6;strokeWidth=1.5;exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;dashed=1;" parent="1" source="c_dash" target="c_job_search" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="ce8" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#3AB4E6;strokeWidth=1.5;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" parent="1" source="c_job_search" target="c_job_detail" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="ce9" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#10B981;strokeWidth=1.5;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" parent="1" source="c_job_detail" target="c_apply" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="ce10" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#6B7280;strokeWidth=1.5;exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="c_job_detail" target="c_save" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="ce11" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#6B7280;strokeWidth=1.5;exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="c_job_detail" target="c_follow" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

---

### 10.3. Sơ đồ luồng Nhà tuyển dụng (Employer Flow)

```
<mxfile>
  <diagram name="Employer Flow" id="employer-flow">
    <mxGraphModel dx="1200" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1200" pageHeight="900" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- Entry -->
        <mxCell id="e_start" value="Đăng nhập&#xa;(vai trò EMPLOYER)" style="shape=ellipse;fillColor=#F59E0B;fontColor=#ffffff;strokeColor=#D97706;fontSize=12;fontStyle=bold;horizontal=1;align=center;spacingTop=8;spacingBottom=8;spacingLeft=8;spacingRight=8;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="440" y="20" width="220" height="60" as="geometry" />
        </mxCell>

        <!-- Verification check -->
        <mxCell id="e_verified" value="Đã xác minh và đồng ý DPA?" style="shape=diamond;fillColor=#FEF3C7;strokeColor=#F59E0B;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=middle;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="420" y="110" width="130" height="65" as="geometry" />
        </mxCell>
        <mxCell id="e_verify_page" value="VerificationPage&#xa;/employer/verification" style="shape=rectangle;fillColor=#FEE2E2;strokeColor=#EF4444;strokeWidth=1.5;fontSize=10;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="570" y="110" width="200" height="50" as="geometry" />
        </mxCell>

        <!-- Dashboard -->
        <mxCell id="e_dash" value="EmployerDashboard&#xa;/employer/dashboard" style="shape=rectangle;fillColor=#FEF3C7;strokeColor=#D97706;strokeWidth=2;fontSize=11;fontStyle=bold;align=center;verticalAlign=top;spacingTop=6;spacingBottom=6;spacingLeft=6;spacingRight=6;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="380" y="220" width="280" height="60" as="geometry" />
        </mxCell>

        <!-- PostJob -->
        <mxCell id="e_post" value="PostJob&#xa;/employer/post-job&#xa;(Full-screen Modal)" style="shape=rectangle;fillColor=#FEF3C7;strokeColor=#D97706;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="40" y="330" width="240" height="70" as="geometry" />
        </mxCell>

        <!-- ManageJobs -->
        <mxCell id="e_manage" value="ManageJobs&#xa;/employer/manage-jobs" style="shape=rectangle;fillColor=#FEF3C7;strokeColor=#D97706;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="300" y="330" width="220" height="60" as="geometry" />
        </mxCell>

        <!-- EditJob -->
        <mxCell id="e_edit" value="EditJob&#xa;/employer/manage-jobs/:id" style="shape=rectangle;fillColor=#FEF9C3;strokeColor=#CA8A04;strokeWidth=1.5;fontSize=10;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="540" y="330" width="220" height="55" as="geometry" />
        </mxCell>

        <!-- JobApplications -->
        <mxCell id="e_apps" value="JobApplications&#xa;/employer/job/:slug/:jobKey/applications" style="shape=rectangle;fillColor=#FEF3C7;strokeColor=#D97706;strokeWidth=2;fontSize=9;fontStyle=bold;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="780" y="330" width="280" height="60" as="geometry" />
        </mxCell>

        <!-- Pipeline Kanban -->
        <mxCell id="e_pipeline" value="PipelineKanbanPage&#xa;/employer/pipeline" style="shape=rectangle;fillColor=#FEF9C3;strokeColor=#CA8A04;strokeWidth=1.5;fontSize=10;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="780" y="430" width="240" height="55" as="geometry" />
        </mxCell>

        <!-- FindCandidate -->
        <mxCell id="e_find" value="FindCandidate&#xa;/employer/find-cv" style="shape=rectangle;fillColor=#FEF3C7;strokeColor=#D97706;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="40" y="450" width="220" height="60" as="geometry" />
        </mxCell>

        <!-- CompanyProfile -->
        <mxCell id="e_comp" value="CompanyProfile&#xa;/employer/company-profile" style="shape=rectangle;fillColor=#FEF3C7;strokeColor=#D97706;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="300" y="450" width="240" height="60" as="geometry" />
        </mxCell>

        <!-- Messages -->
        <mxCell id="e_msg" value="Messages&#xa;/messages" style="shape=rectangle;fillColor=#FEF3C7;strokeColor=#D97706;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="580" y="450" width="180" height="60" as="geometry" />
        </mxCell>

        <!-- Edges -->
        <mxCell id="ee1" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#D97706;strokeWidth=1.5;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" parent="1" source="e_start" target="e_verified" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="ee2" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#EF4444;strokeWidth=1;dashed=1;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="e_verified" target="e_verify_page" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="ee3" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#D97706;strokeWidth=1.5;exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" parent="1" source="e_verified" target="e_dash" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="ee4" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#D97706;strokeWidth=1.5;exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="e_dash" target="e_post" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="ee5" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#D97706;strokeWidth=1.5;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="e_dash" target="e_manage" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="ee6" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#D97706;strokeWidth=1.5;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="e_dash" target="e_apps" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="ee7" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#CA8A04;strokeWidth=1.5;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" parent="1" source="e_manage" target="e_edit" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="ee8" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#CA8A04;strokeWidth=1.5;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" parent="1" source="e_apps" target="e_pipeline" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="ee9" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#D97706;strokeWidth=1.5;exitX=0;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;" parent="1" source="e_dash" target="e_find" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="ee10" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#D97706;strokeWidth=1.5;exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="e_dash" target="e_comp" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="ee11" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#D97706;strokeWidth=1.5;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="e_dash" target="e_msg" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

---

### 10.4. Sơ đồ luồng Quản trị viên (Admin Flow)

```
<mxfile>
  <diagram name="Admin Flow" id="admin-flow">
    <mxGraphModel dx="1200" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1200" pageHeight="850" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- Entry -->
        <mxCell id="a_start" value="Đăng nhập&#xa;(vai trò ADMIN)" style="shape=ellipse;fillColor=#DB2777;fontColor=#ffffff;strokeColor=#BE1851;fontSize=12;fontStyle=bold;horizontal=1;align=center;spacingTop=8;spacingBottom=8;spacingLeft=8;spacingRight=8;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="460" y="20" width="200" height="60" as="geometry" />
        </mxCell>

        <!-- AdminDashboard -->
        <mxCell id="a_dash" value="AdminDashboard&#xa;/admin/dashboard" style="shape=rectangle;fillColor=#FCE7F3;strokeColor=#DB2777;strokeWidth=2;fontSize=11;fontStyle=bold;align=center;verticalAlign=top;spacingTop=6;spacingBottom=6;spacingLeft=6;spacingRight=6;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="390" y="120" width="280" height="60" as="geometry" />
        </mxCell>

        <!-- Admin pages (2 rows x 4 cols) -->
        <mxCell id="a_users" value="UserManagement&#xa;/admin/users" style="shape=rectangle;fillColor=#FCE7F3;strokeColor=#DB2777;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="30" y="230" width="180" height="55" as="geometry" />
        </mxCell>
        <mxCell id="a_companies" value="CompanyManagement&#xa;/admin/companies" style="shape=rectangle;fillColor=#FCE7F3;strokeColor=#DB2777;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="230" y="230" width="180" height="55" as="geometry" />
        </mxCell>
        <mxCell id="a_approvals" value="ApprovalManagement&#xa;/admin/approvals" style="shape=rectangle;fillColor=#FCE7F3;strokeColor=#DB2777;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="430" y="230" width="180" height="55" as="geometry" />
        </mxCell>
        <mxCell id="a_jobs" value="AdminJobPage&#xa;/admin/jobs" style="shape=rectangle;fillColor=#FCE7F3;strokeColor=#DB2777;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="630" y="230" width="180" height="55" as="geometry" />
        </mxCell>

        <!-- Row 2 -->
        <mxCell id="a_cat" value="CategoryManagement&#xa;/admin/categories" style="shape=rectangle;fillColor=#FCE7F3;strokeColor=#DB2777;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="30" y="320" width="180" height="55" as="geometry" />
        </mxCell>
        <mxCell id="a_banner" value="BannerManagement&#xa;/admin/banner" style="shape=rectangle;fillColor=#FCE7F3;strokeColor=#DB2777;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="230" y="320" width="180" height="55" as="geometry" />
        </mxCell>
        <mxCell id="a_blog" value="BlogManagement&#xa;/admin/blog" style="shape=rectangle;fillColor=#FCE7F3;strokeColor=#DB2777;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="430" y="320" width="180" height="55" as="geometry" />
        </mxCell>
        <mxCell id="a_faq" value="FaqManagement&#xa;/admin/faq" style="shape=rectangle;fillColor=#FCE7F3;strokeColor=#DB2777;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="630" y="320" width="180" height="55" as="geometry" />
        </mxCell>

        <!-- Row 3 -->
        <mxCell id="a_roles" value="RoleManagement&#xa;/admin/roles" style="shape=rectangle;fillColor=#FCE7F3;strokeColor=#DB2777;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="30" y="410" width="180" height="55" as="geometry" />
        </mxCell>
        <mxCell id="a_audit" value="AuditLogPage&#xa;/admin/audit" style="shape=rectangle;fillColor=#FCE7F3;strokeColor=#DB2777;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="230" y="410" width="180" height="55" as="geometry" />
        </mxCell>
        <mxCell id="a_config" value="SystemConfig&#xa;/admin/config" style="shape=rectangle;fillColor=#FCE7F3;strokeColor=#DB2777;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="430" y="410" width="180" height="55" as="geometry" />
        </mxCell>
        <mxCell id="a_notif" value="NotificationManagement&#xa;/admin/notifications" style="shape=rectangle;fillColor=#FCE7F3;strokeColor=#DB2777;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="630" y="410" width="180" height="55" as="geometry" />
        </mxCell>
        <mxCell id="a_reports" value="ReportManagement&#xa;/admin/reports" style="shape=rectangle;fillColor=#FCE7F3;strokeColor=#DB2777;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;verticalAlign=top;spacingTop=5;spacingBottom=5;spacingLeft=5;spacingRight=5;resizable=1;" parent="1" vertex="1">
          <mxGeometry x="830" y="230" width="180" height="55" as="geometry" />
        </mxCell>

        <!-- Edges from Dashboard to all pages -->
        <mxCell id="ae1" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#DB2777;strokeWidth=1.5;exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" parent="1" source="a_dash" target="a_users" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="ae2" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#DB2777;strokeWidth=1.5;exitX=0.3;exitY=1;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="a_dash" target="a_companies" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="ae3" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#DB2777;strokeWidth=1.5;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="a_dash" target="a_approvals" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="ae4" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#DB2777;strokeWidth=1.5;exitX=0.7;exitY=1;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="a_dash" target="a_jobs" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="ae5" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#DB2777;strokeWidth=1.5;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="a_dash" target="a_reports" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

---

### 10.5. Sơ đồ luồng tổng hợp hệ thống (System Overview Flow)

```
<mxfile>
  <diagram name="System Overview Flow" id="system-overview">
    <mxGraphModel dx="1000" dy="700" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- START -->
        <mxCell id="start" value="Khách truy cập" style="shape=ellipse;fillColor=#3AB4E6;fontColor=#ffffff;strokeColor=#2A9DCB;fontSize=11;fontStyle=bold;horizontal=1;align=center;" parent="1" vertex="1">
          <mxGeometry x="354" y="20" width="120" height="50" as="geometry" />
        </mxCell>

        <!-- PUBLIC ZONE -->
        <mxCell id="pub_zone" value="PHÂN HỆ CÔNG KHAI" style="shape=rectangle;fillColor=#EAF6FF;strokeColor=#3AB4E6;strokeWidth=2;fontSize=11;fontStyle=bold;align=center;verticalAlign=middle;" parent="1" vertex="1">
          <mxGeometry x="40" y="90" width="747" height="220" as="geometry" />
        </mxCell>

        <!-- HomePage -->
        <mxCell id="home" value="Trang chủ&#xa;/" style="shape=rectangle;fillColor=#FFFFFF;strokeColor=#3AB4E6;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;" parent="1" vertex="1">
          <mxGeometry x="70" y="110" width="100" height="50" as="geometry" />
        </mxCell>

        <!-- Search -->
        <mxCell id="search" value="Tìm kiếm&#xa;/jobs" style="shape=rectangle;fillColor=#FFFFFF;strokeColor=#3AB4E6;strokeWidth=1.5;fontSize=9;align=center;" parent="1" vertex="1">
          <mxGeometry x="180" y="110" width="90" height="50" as="geometry" />
        </mxCell>

        <!-- JobDetail -->
        <mxCell id="jobdetail" value="Chi tiết việc&#xa;/viec-lam/:slug" style="shape=rectangle;fillColor=#FFF6E5;strokeColor=#F59E0B;strokeWidth=1.5;fontSize=9;align=center;" parent="1" vertex="1">
          <mxGeometry x="280" y="110" width="100" height="50" as="geometry" />
        </mxCell>

        <!-- Companies -->
        <mxCell id="companies" value="Công ty&#xa;/companies" style="shape=rectangle;fillColor=#FFFFFF;strokeColor=#3AB4E6;strokeWidth=1.5;fontSize=9;align=center;" parent="1" vertex="1">
          <mxGeometry x="390" y="110" width="90" height="50" as="geometry" />
        </mxCell>

        <!-- CompanyDetail -->
        <mxCell id="companydetail" value="Chi tiết công ty&#xa;/companies/:id" style="shape=rectangle;fillColor=#FFF6E5;strokeColor=#F59E0B;strokeWidth=1.5;fontSize=9;align=center;" parent="1" vertex="1">
          <mxGeometry x="490" y="110" width="110" height="50" as="geometry" />
        </mxCell>

        <!-- Login -->
        <mxCell id="login" value="Đăng nhập&#xa;/login" style="shape=rectangle;fillColor=#F3F4F6;strokeColor=#6B7280;strokeWidth=1.5;fontSize=9;align=center;" parent="1" vertex="1">
          <mxGeometry x="610" y="110" width="90" height="50" as="geometry" />
        </mxCell>

        <!-- Register -->
        <mxCell id="register" value="Đăng ký&#xa;/register" style="shape=rectangle;fillColor=#F3F4F6;strokeColor=#6B7280;strokeWidth=1.5;fontSize=9;align=center;" parent="1" vertex="1">
          <mxGeometry x="610" y="170" width="90" height="50" as="geometry" />
        </mxCell>

        <!-- Auth Decision -->
        <mxCell id="auth" value="Xác thực?" style="shape=diamond;fillColor=#FEF3C7;strokeColor=#F59E0B;strokeWidth=1.5;fontSize=9;fontStyle=bold;align=center;" parent="1" vertex="1">
          <mxGeometry x="70" y="190" width="80" height="50" as="geometry" />
        </mxCell>

        <!-- Auth NO path to login/register -->
        <mxCell id="auth_no" value="Chưa đăng nhập" style="shape=rectangle;fillColor=#FEE2E2;strokeColor=#EF4444;strokeWidth=1;fontSize=8;align=center;dashed=1;" parent="1" vertex="1">
          <mxGeometry x="70" y="250" width="80" height="35" as="geometry" />
        </mxCell>

        <!-- CANDIDATE ZONE -->
        <mxCell id="cand_zone" value="PHÂN HỆ ỨNG VIÊN" style="shape=rectangle;fillColor=#DBEAFE;strokeColor=#3B82F6;strokeWidth=2;fontSize=11;fontStyle=bold;align=center;verticalAlign=middle;" parent="1" vertex="1">
          <mxGeometry x="40" y="300" width="360" height="200" as="geometry" />
        </mxCell>

        <!-- Candidate Dashboard -->
        <mxCell id="cand_dash" value="Dashboard&#xa;/candidate/dashboard" style="shape=rectangle;fillColor=#FFFFFF;strokeColor=#3B82F6;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;" parent="1" vertex="1">
          <mxGeometry x="60" y="320" width="130" height="50" as="geometry" />
        </mxCell>

        <!-- Profile -->
        <mxCell id="cand_profile" value="Hồ sơ&#xa;/candidate/profile" style="shape=rectangle;fillColor=#FFFFFF;strokeColor=#3B82F6;strokeWidth=1.5;fontSize=9;align=center;" parent="1" vertex="1">
          <mxGeometry x="60" y="385" width="100" height="45" as="geometry" />
        </mxCell>

        <!-- Applied Jobs -->
        <mxCell id="cand_applied" value="Đã ứng tuyển&#xa;/candidate/applied-jobs" style="shape=rectangle;fillColor=#FFFFFF;strokeColor=#3B82F6;strokeWidth=1.5;fontSize=9;align=center;" parent="1" vertex="1">
          <mxGeometry x="170" y="385" width="110" height="45" as="geometry" />
        </mxCell>

        <!-- Favorite -->
        <mxCell id="cand_fav" value="Đã lưu&#xa;/candidate/favorite-jobs" style="shape=rectangle;fillColor=#FFFFFF;strokeColor=#3B82F6;strokeWidth=1.5;fontSize=9;align=center;" parent="1" vertex="1">
          <mxGeometry x="60" y="445" width="100" height="45" as="geometry" />
        </mxCell>

        <!-- Messages -->
        <mxCell id="cand_msg" value="Nhắn tin&#xa;/messages" style="shape=rectangle;fillColor=#DBEAFE;strokeColor=#3B82F6;strokeWidth=1.5;fontSize=9;align=center;" parent="1" vertex="1">
          <mxGeometry x="170" y="445" width="110" height="45" as="geometry" />
        </mxCell>

        <!-- EMPLOYER ZONE -->
        <mxCell id="emp_zone" value="PHÂN HỆ NHÀ TUYỂN DỤNG" style="shape=rectangle;fillColor=#FEF3C7;strokeColor=#D97706;strokeWidth=2;fontSize=11;fontStyle=bold;align=center;verticalAlign=middle;" parent="1" vertex="1">
          <mxGeometry x="420" y="300" width="367" height="200" as="geometry" />
        </mxCell>

        <!-- Employer Dashboard -->
        <mxCell id="emp_dash" value="Dashboard&#xa;/employer/dashboard" style="shape=rectangle;fillColor=#FFFFFF;strokeColor=#D97706;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;" parent="1" vertex="1">
          <mxGeometry x="440" y="320" width="130" height="50" as="geometry" />
        </mxCell>

        <!-- Post Job -->
        <mxCell id="emp_post" value="Đăng tin&#xa;/employer/post-job" style="shape=rectangle;fillColor=#FFFFFF;strokeColor=#D97706;strokeWidth=1.5;fontSize=9;align=center;" parent="1" vertex="1">
          <mxGeometry x="440" y="385" width="100" height="45" as="geometry" />
        </mxCell>

        <!-- Manage Jobs -->
        <mxCell id="emp_manage" value="Quản lý tin&#xa;/employer/manage-jobs" style="shape=rectangle;fillColor=#FFFFFF;strokeColor=#D97706;strokeWidth=1.5;fontSize=9;align=center;" parent="1" vertex="1">
          <mxGeometry x="550" y="385" width="120" height="45" as="geometry" />
        </mxCell>

        <!-- Applications -->
        <mxCell id="emp_apps" value="Đơn ứng tuyển&#xa;/employer/manage-applications" style="shape=rectangle;fillColor=#FFFFFF;strokeColor=#D97706;strokeWidth=1.5;fontSize=9;align=center;" parent="1" vertex="1">
          <mxGeometry x="440" y="445" width="110" height="45" as="geometry" />
        </mxCell>

        <!-- Find CV -->
        <mxCell id="emp_find" value="Tìm ứng viên&#xa;/employer/find-cv" style="shape=rectangle;fillColor=#FFFFFF;strokeColor=#D97706;strokeWidth=1.5;fontSize=9;align=center;" parent="1" vertex="1">
          <mxGeometry x="560" y="445" width="110" height="45" as="geometry" />
        </mxCell>

        <!-- ADMIN ZONE -->
        <mxCell id="admin_zone" value="PHÂN HỆ QUẢN TRỊ" style="shape=rectangle;fillColor=#FCE7F3;strokeColor=#DB2777;strokeWidth=2;fontSize=11;fontStyle=bold;align=center;verticalAlign=middle;" parent="1" vertex="1">
          <mxGeometry x="40" y="520" width="747" height="140" as="geometry" />
        </mxCell>

        <!-- Admin Dashboard -->
        <mxCell id="admin_dash" value="Dashboard&#xa;/admin/dashboard" style="shape=rectangle;fillColor=#FFFFFF;strokeColor=#DB2777;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;" parent="1" vertex="1">
          <mxGeometry x="60" y="540" width="120" height="50" as="geometry" />
        </mxCell>

        <!-- Admin pages row -->
        <mxCell id="admin_users" value="Người dùng" style="shape=rectangle;fillColor=#FFFFFF;strokeColor=#DB2777;strokeWidth=1.5;fontSize=9;align=center;" parent="1" vertex="1">
          <mxGeometry x="60" y="600" width="80" height="40" as="geometry" />
        </mxCell>
        <mxCell id="admin_companies" value="Công ty" style="shape=rectangle;fillColor=#FFFFFF;strokeColor=#DB2777;strokeWidth=1.5;fontSize=9;align=center;" parent="1" vertex="1">
          <mxGeometry x="150" y="600" width="80" height="40" as="geometry" />
        </mxCell>
        <mxCell id="admin_jobs" value="Tin tuyển dụng" style="shape=rectangle;fillColor=#FFFFFF;strokeColor=#DB2777;strokeWidth=1.5;fontSize=9;align=center;" parent="1" vertex="1">
          <mxGeometry x="240" y="600" width="90" height="40" as="geometry" />
        </mxCell>
        <mxCell id="admin_approvals" value="Phê duyệt" style="shape=rectangle;fillColor=#FFFFFF;strokeColor=#DB2777;strokeWidth=1.5;fontSize=9;align=center;" parent="1" vertex="1">
          <mxGeometry x="340" y="600" width="80" height="40" as="geometry" />
        </mxCell>
        <mxCell id="admin_categories" value="Danh mục" style="shape=rectangle;fillColor=#FFFFFF;strokeColor=#DB2777;strokeWidth=1.5;fontSize=9;align=center;" parent="1" vertex="1">
          <mxGeometry x="430" y="600" width="80" height="40" as="geometry" />
        </mxCell>
        <mxCell id="admin_blog" value="Blog" style="shape=rectangle;fillColor=#FFFFFF;strokeColor=#DB2777;strokeWidth=1.5;fontSize=9;align=center;" parent="1" vertex="1">
          <mxGeometry x="520" y="600" width="70" height="40" as="geometry" />
        </mxCell>
        <mxCell id="admin_reports" value="Báo cáo" style="shape=rectangle;fillColor=#FFFFFF;strokeColor=#DB2777;strokeWidth=1.5;fontSize=9;align=center;" parent="1" vertex="1">
          <mxGeometry x="600" y="600" width="80" height="40" as="geometry" />
        </mxCell>
        <mxCell id="admin_config" value="Cấu hình" style="shape=rectangle;fillColor=#FFFFFF;strokeColor=#DB2777;strokeWidth=1.5;fontSize=9;align=center;" parent="1" vertex="1">
          <mxGeometry x="690" y="600" width="80" height="40" as="geometry" />
        </mxCell>

        <!-- Messages Cross-Connect (Candidate <-> Employer) -->
        <mxCell id="msg_center" value="HỆ THỐNG NHẮN TIN&#xa;(Messages)" style="shape=rectangle;fillColor=#E6FFFE;strokeColor=#10B981;strokeWidth=2;fontSize=10;fontStyle=bold;align=center;" parent="1" vertex="1">
          <mxGeometry x="310" y="380" width="120" height="60" as="geometry" />
        </mxCell>

        <!-- Edges -->
        <mxCell id="e1" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#3AB4E6;strokeWidth=1.5;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="start" target="home" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e2" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#3AB4E6;strokeWidth=1.5;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="home" target="search" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e3" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#F59E0B;strokeWidth=1.5;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="search" target="jobdetail" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e4" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#3AB4E6;strokeWidth=1.5;exitX=1;exitY=0;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="home" target="companies" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e5" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#F59E0B;strokeWidth=1.5;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="companies" target="companydetail" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e6" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#6B7280;strokeWidth=1.5;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0;entryY=0;entryDx=0;entryDy=0;" parent="1" source="home" target="auth" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e7" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#6B7280;strokeWidth=1.5;exitX=0;exitY=0;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="auth" target="login" edge="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="30" y="270" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="e8" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#6B7280;strokeWidth=1.5;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" parent="1" source="auth" target="auth_no" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e9" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#6B7280;strokeWidth=1.5;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="login" target="register" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Auth YES to roles -->
        <mxCell id="e10" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#3B82F6;strokeWidth=1.5;exitX=0;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;dashed=1;" parent="1" source="auth" target="cand_zone" edge="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="110" y="250" as="sourcePoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="e11" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#D97706;strokeWidth=1.5;exitX=1;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;dashed=1;" parent="1" source="auth" target="emp_zone" edge="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="750" y="250" as="sourcePoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="e12" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#DB2777;strokeWidth=1.5;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;dashed=1;" parent="1" source="auth" target="admin_zone" edge="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="413" y="250" as="sourcePoint" />
          </mxGeometry>
        </mxCell>

        <!-- Candidate internal edges -->
        <mxCell id="e13" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#3B82F6;strokeWidth=1.5;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" parent="1" source="cand_dash" target="cand_profile" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e14" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#3B82F6;strokeWidth=1.5;exitX=1;exitY=0;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="cand_dash" target="cand_applied" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e15" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#3B82F6;strokeWidth=1.5;exitX=0;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" parent="1" source="cand_dash" target="cand_fav" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e16" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#3B82F6;strokeWidth=1.5;exitX=1;exitY=1;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="cand_dash" target="cand_msg" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Employer internal edges -->
        <mxCell id="e17" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#D97706;strokeWidth=1.5;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="emp_dash" target="emp_post" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e18" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#D97706;strokeWidth=1.5;exitX=1;exitY=0;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="emp_dash" target="emp_manage" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e19" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#D97706;strokeWidth=1.5;exitX=0;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" parent="1" source="emp_dash" target="emp_apps" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e20" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#D97706;strokeWidth=1.5;exitX=1;exitY=1;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" parent="1" source="emp_dash" target="emp_find" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Admin edges -->
        <mxCell id="e21" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#DB2777;strokeWidth=1.5;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0;entryY=0;entryDx=0;entryDy=0;" parent="1" source="admin_dash" target="admin_users" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e22" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#DB2777;strokeWidth=1.5;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0;entryY=0;entryDx=0;entryDy=0;" parent="1" source="admin_dash" target="admin_companies" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e23" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#DB2777;strokeWidth=1.5;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0;entryY=0;entryDx=0;entryDy=0;" parent="1" source="admin_dash" target="admin_jobs" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e24" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#DB2777;strokeWidth=1.5;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0;entryY=0;entryDx=0;entryDy=0;" parent="1" source="admin_dash" target="admin_approvals" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Message connection -->
        <mxCell id="e25" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#10B981;strokeWidth=1.5;exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" parent="1" source="cand_msg" target="msg_center" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e26" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#10B981;strokeWidth=1.5;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" parent="1" source="msg_center" target="emp_apps" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Apply Job flow (Candidate applies through JobDetail) -->
        <mxCell id="e27" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#10B981;strokeWidth=1.5;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;dashed=1;" parent="1" source="jobdetail" target="cand_applied" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Job posted by Employer appears in search -->
        <mxCell id="e28" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#D97706;strokeWidth=1.5;exitX=0;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;dashed=1;" parent="1" source="emp_post" target="search" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

---

### Hướng dẫn tạo sơ đồ thủ công trên draw.io (nếu XML không hỗ trợ)

Nếu bạn gặp vấn đề khi dán XML trực tiếp, hãy tạo sơ đồ thủ công với các quy ước sau:

| Ký hiệu | Ý nghĩa |
|---|---|
| **Hình Oval** | Điểm bắt đầu / Kết thúc luồng (Entry point) |
| **Hình Chữ nhật** | Trang giao diện (Page/Screen) |
| **Hình Kim cương** | Điểm rẽ quyết định (Decision point) |
| **Hình Nút chai (Rounded rect)** | Modal / Dialog |
| **Nét liền màu xanh** | Luồng điều hướng thông thường |
| **Nét đứt** | Luồng phụ / Rẽ nhánh |
| **Mũi tên** | Hướng di chuyển (Transition) |

**Màu sắc theo phân hệ:**

| Màu nền | Phân hệ |
|---|---|
| `#EAF6FF` (xanh nhạt) | Public User |
| `#DBEAFE` (xanh dương nhạt) | Candidate |
| `#FEF3C7` (vàng nhạt) | Employer |
| `#FCE7F3` (hồng nhạt) | Admin |

---

*Tài liệu này được biên soạn phục vụ cho mục đích báo cáo luận văn tốt nghiệp. Các thông tin về cấu trúc giao diện được trích xuất trực tiếp từ mã nguồn hệ thống ITing phiên bản hiện hành.*
