-- =====================================================================
-- V91: Expand company descriptions với nội dung giới thiệu đầy đủ.
--
-- Trang chi tiết công ty đã bỏ 2 thẻ "Công nghệ sử dụng" và "Phúc lợi",
-- chỉ giữ phần giới thiệu — nên description cần dài + structure rõ ràng.
-- =====================================================================

UPDATE company SET description = $$FPT Software là công ty công nghệ thông tin lớn nhất Việt Nam, thành viên của Tập đoàn FPT — tập đoàn kinh tế tư nhân hàng đầu cả nước. Được thành lập từ năm 1999, FPT Software đã có hơn 25 năm kinh nghiệm trong lĩnh vực dịch vụ phần mềm, chuyển đổi số và tư vấn công nghệ cho khách hàng tại hơn 30 quốc gia.

Lĩnh vực hoạt động chính:
• Phát triển phần mềm theo yêu cầu (custom software development) cho khách hàng toàn cầu — đặc biệt là Nhật Bản, Hàn Quốc, Mỹ, châu Âu.
• Dịch vụ chuyển đổi số (Digital Transformation): tư vấn chiến lược, kiến trúc đám mây, hiện đại hóa hệ thống legacy.
• Trí tuệ nhân tạo và Khoa học dữ liệu: AI/ML platform, Computer Vision, Generative AI applications.
• Cloud Computing: triển khai và vận hành trên AWS, Azure, GCP với chứng chỉ Premier Partner.
• Automotive Software: hệ thống nhúng, phần mềm xe điện, ADAS cho các hãng xe hàng đầu thế giới.

Quy mô và thành tựu:
• Hơn 30,000+ kỹ sư và chuyên gia trên 50+ văn phòng tại 30+ quốc gia.
• Doanh thu năm 2024 đạt hơn 1 tỷ USD, tăng trưởng kép 20%/năm trong 5 năm liên tiếp.
• Top 1 công ty IT outsourcing tại Việt Nam, lọt Top 50 toàn cầu theo IAOP.
• Đối tác chiến lược của AWS, Microsoft, Google, NVIDIA, SAP, ServiceNow.

Văn hóa & con người:
Tại FPT Software, chúng tôi tin rằng "Con người là tài sản quý giá nhất". Môi trường làm việc đa văn hóa, năng động, khuyến khích sáng tạo và học hỏi liên tục thông qua FPT Software Academy với hàng nghìn khóa đào tạo công nghệ và kỹ năng mềm. Cơ hội luân chuyển dự án quốc tế (onsite Nhật Bản, Mỹ, châu Âu), lộ trình thăng tiến rõ ràng theo chuẩn quốc tế (CMMI Level 5, ISO 27001).$$
WHERE company_id = 11;

UPDATE company SET description = $$VNG Corporation là một trong những công ty công nghệ tiên phong và thành công nhất Việt Nam, được mệnh danh là "Kỳ lân công nghệ" đầu tiên của Việt Nam (Unicorn). Thành lập năm 2004, VNG đã phát triển từ một startup nhỏ thành tập đoàn công nghệ đa lĩnh vực với hệ sinh thái sản phẩm phục vụ hàng chục triệu người dùng.

Hệ sinh thái sản phẩm:
• Zalo: ứng dụng nhắn tin và mạng xã hội lớn nhất Việt Nam với 75+ triệu người dùng hoạt động hàng tháng.
• ZaloPay: ví điện tử top đầu, tích hợp thanh toán QR, chuyển khoản, đầu tư.
• Game Publishing: nhà phát hành game hàng đầu Đông Nam Á với các tựa game đình đám như VLTK Mobile, Liên Minh Huyền Thoại, PUBG Mobile.
• VNGCloud: nền tảng cloud computing "Made in Vietnam" với chứng chỉ ISO 27001.
• Zalo AI: nghiên cứu và ứng dụng AI/NLP cho tiếng Việt, sở hữu mô hình ngôn ngữ Zalo GPT.

Quy mô & thành tựu:
• Hơn 4,000+ nhân viên tại trụ sở TP. HCM, Hà Nội, Singapore, Bangkok, Manila.
• Định giá hơn 2 tỷ USD, từng được World Bank và Goldman Sachs đầu tư.
• 18+ giải thưởng Sao Khuê, Top 10 doanh nghiệp CNTT-TT Việt Nam nhiều năm liền.

Văn hóa làm việc:
VNG xây dựng văn hóa "Build technology that matters" — khuyến khích kỹ sư đặt ra những câu hỏi lớn và giải quyết vấn đề thực sự của hàng triệu người dùng. Môi trường flat-hierarchy, ngân sách R&D rộng rãi, cơ hội tiếp xúc trực tiếp với các technology như Kubernetes, Apache Kafka, Spark, ML Ops ở quy mô lớn.$$
WHERE company_id = 12;

UPDATE company SET description = $$Vingroup là tập đoàn kinh tế tư nhân lớn nhất Việt Nam, thành lập năm 1993 bởi ông Phạm Nhật Vượng. Vingroup hoạt động đa ngành với 3 nhóm trụ cột chính: Công nghệ - Công nghiệp, Thương mại - Dịch vụ, và Thiện nguyện - Xã hội.

Các thương hiệu thành viên:
• VinFast: hãng xe điện đầu tiên của Việt Nam, niêm yết Nasdaq, xuất khẩu sang Mỹ, châu Âu.
• Vinhomes: tập đoàn bất động sản nhà ở lớn nhất Việt Nam.
• Vincom Retail: hệ thống trung tâm thương mại top đầu.
• Vinpearl: tập đoàn nghỉ dưỡng & giải trí.
• Vinmec: hệ thống y tế tiêu chuẩn quốc tế.
• Vinschool & VinUni: hệ thống giáo dục từ mầm non đến đại học.
• VinAI Research: viện nghiên cứu AI hàng đầu Đông Nam Á.
• VinBigData: nghiên cứu & phát triển big data, ngôn ngữ tự nhiên tiếng Việt.

Tầm nhìn:
"Vì một cuộc sống tốt đẹp hơn cho mọi người" — Vingroup không ngừng đổi mới, đầu tư mạnh vào công nghệ cao, đặc biệt là xe điện, trí tuệ nhân tạo, dữ liệu lớn và y sinh học. Mục tiêu đưa Việt Nam vươn tầm thế giới trong lĩnh vực công nghệ và sản xuất hiện đại.

Cơ hội tại Vingroup:
Hơn 50,000+ nhân viên trong toàn hệ thống, môi trường năng động, chế độ phúc lợi cạnh tranh, cơ hội phát triển toàn diện. Đặc biệt VinAI và VinBigData mang đến môi trường nghiên cứu đẳng cấp quốc tế với các giáo sư đầu ngành từ Stanford, MIT, Carnegie Mellon.$$
WHERE company_id = 13;

UPDATE company SET description = $$Tiki là nền tảng thương mại điện tử "Made in Vietnam" được thành lập năm 2010 bởi Trần Ngọc Thái Sơn. Khởi nguồn từ một website bán sách online, Tiki đã phát triển thành sàn TMĐT đa ngành hàng top đầu Việt Nam với hệ sinh thái dịch vụ toàn diện.

Hệ sinh thái sản phẩm:
• Tiki Shopping: sàn TMĐT với hơn 10 triệu sản phẩm thuộc 30+ ngành hàng.
• TikiNOW: dịch vụ giao hàng nhanh trong 2 giờ — pioneer tại thị trường Việt Nam.
• Tiki Trading: model B2C với cam kết hàng chính hãng 100%, kho bãi tự vận hành.
• Ticketbox: nền tảng bán vé sự kiện, concert lớn nhất Việt Nam.
• Astra: ví điện tử & tích điểm tích hợp.

Quy mô:
• Hơn 5,000+ nhân viên tại trụ sở TP. HCM, Hà Nội, Đà Nẵng.
• Định giá hơn 1 tỷ USD, được các quỹ JD.com, Northstar Group, STIC Investments đầu tư.
• Phục vụ hơn 30 triệu khách hàng tích cực.

Văn hóa kỹ sư:
Tiki Tech Center là một trong những engineering org lớn nhất Việt Nam với hơn 1,000+ kỹ sư. Áp dụng các công nghệ hiện đại: microservices trên Kubernetes, event-driven architecture với Kafka, ML Recommendation system cá nhân hóa, big data với Spark/Flink. Team Search & Discovery, Personalization, Logistics Engineering đều là sandbox tuyệt vời để giải quyết bài toán quy mô lớn.$$
WHERE company_id = 14;

UPDATE company SET description = $$Shopee là sàn thương mại điện tử dẫn đầu Đông Nam Á và Đài Loan, thuộc tập đoàn Sea Limited (niêm yết NYSE). Tại Việt Nam, Shopee là nền tảng TMĐT số 1 về lượng truy cập và đơn hàng kể từ năm 2019.

Sản phẩm & dịch vụ:
• Shopee Mall: gian hàng chính hãng từ các thương hiệu lớn.
• Shopee Live: tính năng livestream bán hàng top đầu thị trường.
• Shopee Pay: ví điện tử tích hợp thanh toán không tiền mặt.
• Shopee Express: dịch vụ logistics riêng với mạng lưới kho bãi và xe giao hàng quy mô lớn.
• Shopee Food: nền tảng giao đồ ăn cạnh tranh với Grab Food, Baemin.

Quy mô khu vực:
• Hơn 67,000+ nhân viên trên toàn cầu, hơn 3,000+ tại Việt Nam.
• Top 1 ứng dụng mua sắm tại 5/6 quốc gia Đông Nam Á.
• Hơn 400 triệu đơn hàng được xử lý mỗi quý.

Công nghệ & văn hóa:
Shopee Engineering áp dụng các công nghệ hàng đầu thế giới: Go, Java, Python, React Native, Kubernetes, gRPC, Cassandra, Elasticsearch, Kafka. Văn hóa "We get it done" — đề cao sự nhanh nhẹn, dữ liệu (data-driven), và ownership. Cơ hội luân chuyển khu vực (Singapore, Đài Loan, Indonesia), lương thưởng & phúc lợi cạnh tranh hàng đầu thị trường.$$
WHERE company_id = 15;

UPDATE company SET description = $$Viettel Digital là thành viên của Tập đoàn Công nghiệp - Viễn thông Quân đội (Viettel), đảm nhận sứ mệnh dẫn dắt chuyển đổi số quốc gia thông qua các giải pháp công nghệ tiên tiến, đặc biệt trong lĩnh vực tài chính số, chính phủ điện tử và Smart City.

Lĩnh vực hoạt động:
• Viettel Money: ví điện tử và mobile money với hơn 25 triệu người dùng — top 3 thị trường thanh toán không tiền mặt Việt Nam.
• Digital Banking-as-a-Service: cung cấp hạ tầng ngân hàng số cho các ngân hàng truyền thống.
• MyViettel: super-app phục vụ 70 triệu khách hàng viễn thông Viettel.
• Smart City Solutions: triển khai cho hơn 30 tỉnh thành tại Việt Nam.
• AI/ML Platform: nền tảng OpenAI Vietnamese, voice biometrics, fraud detection.

Quy mô & thế mạnh:
• Hơn 3,000+ kỹ sư công nghệ, trong đó có nhiều chuyên gia từ Silicon Valley.
• Đầu tư hơn 500 triệu USD vào R&D mỗi năm.
• Hạ tầng data center Tier III/IV tại Việt Nam, Lào, Campuchia, Myanmar.
• Đạt 30+ bằng sáng chế quốc tế trong lĩnh vực 5G, AI, blockchain.

Văn hóa Viettel:
Văn hóa "Người Viettel" đặc trưng: kỷ luật của quân đội + tốc độ của startup + tầm nhìn doanh nghiệp toàn cầu. Cơ hội tham gia các dự án quốc gia có tác động xã hội lớn (chuyển đổi số quốc gia, eKYC, định danh điện tử). Lộ trình thăng tiến rõ ràng, chế độ đãi ngộ cạnh tranh.$$
WHERE company_id = 21;

UPDATE company SET description = $$MoMo (M-Service) là ví điện tử số 1 Việt Nam, được sáng lập năm 2007 và là kỳ lân công nghệ tài chính (FinTech Unicorn) đầu tiên của Việt Nam. MoMo đã phát triển từ dịch vụ chuyển tiền cơ bản thành super-app tài chính phục vụ hơn 31 triệu người dùng.

Hệ sinh thái dịch vụ:
• Thanh toán: QR Pay, chuyển khoản, thanh toán hóa đơn (điện, nước, internet, viễn thông).
• Tài chính cá nhân: vay tiêu dùng, bảo hiểm, đầu tư chứng chỉ quỹ.
• Mua sắm: tích hợp với hơn 100,000 cửa hàng đối tác và các sàn TMĐT lớn.
• Du lịch & giải trí: đặt vé máy bay, khách sạn, vé phim, vé sự kiện.
• MoMo for Business: giải pháp thanh toán cho doanh nghiệp với tỷ lệ thành công 99.99%.

Quy mô & thành tựu:
• Hơn 31 triệu người dùng (tương đương 30% dân số Việt Nam).
• Đối tác với 60+ ngân hàng và 100,000+ điểm chấp nhận thanh toán.
• Định giá hơn 2 tỷ USD, được Warburg Pincus, Affirma Capital, Goodwater Capital đầu tư.
• Top 1 ví điện tử tại Việt Nam theo App Annie, AppsFlyer.

Văn hóa & công nghệ:
MoMo Tech áp dụng các công nghệ FinTech hàng đầu: microservices, event sourcing, distributed transaction, real-time fraud detection bằng ML. Văn hóa "Move fast & build right" — kết hợp tốc độ startup với độ tin cậy ngân hàng. Cơ hội làm việc với 1,500+ engineers ở các domain payment, lending, security, data science cực kỳ thú vị.$$
WHERE company_id = 22;

UPDATE company SET description = $$Grab là super-app số 1 Đông Nam Á, được thành lập năm 2012 tại Malaysia bởi Anthony Tan và Tan Hooi Ling. Hiện niêm yết Nasdaq (GRAB) với vốn hóa hơn 15 tỷ USD. Tại Việt Nam, Grab có mặt từ năm 2014 và là nền tảng dẫn đầu trong các mảng gọi xe, giao đồ ăn, giao hàng, thanh toán.

Hệ sinh thái sản phẩm tại Việt Nam:
• GrabCar / GrabBike: dịch vụ gọi xe với hàng trăm nghìn tài xế đối tác.
• GrabFood: top 1 nền tảng giao đồ ăn với hàng chục nghìn nhà hàng đối tác.
• GrabExpress: giao hàng nhanh trong giờ.
• GrabMart: đi chợ online — siêu thị giao tận nhà.
• Moca by Grab: dịch vụ ví điện tử tích hợp.
• GrabAds: nền tảng quảng cáo dựa trên dữ liệu di chuyển và tiêu dùng.

Quy mô khu vực:
• Hơn 11,000+ nhân viên trên 8 quốc gia Đông Nam Á.
• Phục vụ hơn 180 triệu người dùng và 9 triệu đối tác (tài xế, merchant).
• Doanh thu năm 2024 đạt 2.8 tỷ USD, tăng trưởng 17% YoY.

Văn hóa Grab:
Grab xây dựng văn hóa "Heart, Hunger, Honour, Humility, Hubris" — đề cao tinh thần phục vụ cộng đồng, học hỏi không ngừng, và làm việc dữ liệu. Engineering team áp dụng micro-frontends, service mesh (Istio), Apache Flink cho real-time matching algorithm. Cơ hội luân chuyển khu vực, đào tạo từ các tech lead có background từ Google, Uber, Facebook.$$
WHERE company_id = 23;
