# Project Instructions

## Stack chính

Dự án sử dụng:

- Java
- Spring Boot
- Hibernate / JPA
- PostgreSQL

## Kiến trúc Spring Boot

- Tuân thủ kiến trúc phân layer rõ ràng:
  - `@Controller` / `@RestController`: nhận request, validate input cơ bản, gọi service và trả response.
  - `@Service`: chứa business logic chính.
  - `@Repository`: thao tác dữ liệu thông qua Spring Data JPA, JPQL hoặc native query khi cần.
  - DTO / Mapper: chuyển đổi dữ liệu giữa client và domain/entity.
- Không đặt business logic trong `@Controller`.
- Không truy cập trực tiếp repository từ controller trừ khi dự án đã có pattern đặc biệt và được chấp nhận.

## RESTful API

- Luôn tuân thủ chuẩn RESTful API.
- Sử dụng đúng HTTP methods:
  - `GET` để đọc dữ liệu.
  - `POST` để tạo mới.
  - `PUT` hoặc `PATCH` để cập nhật.
  - `DELETE` để xóa.
- Sử dụng HTTP status codes phù hợp:
  - `200 OK` cho request thành công.
  - `201 Created` khi tạo resource thành công.
  - `204 No Content` khi xóa hoặc cập nhật không cần body response.
  - `400 Bad Request` cho input không hợp lệ.
  - `401 Unauthorized` khi chưa xác thực.
  - `403 Forbidden` khi không có quyền.
  - `404 Not Found` khi không tìm thấy resource.
  - `409 Conflict` khi xung đột dữ liệu.
  - `500 Internal Server Error` chỉ cho lỗi không mong muốn.
- Response error nên có cấu trúc nhất quán.

## DTO và Entity

- Luôn sử dụng DTO khi giao tiếp với client.
- Không trả về trực tiếp Hibernate Entity từ controller.
- Không nhận trực tiếp Entity làm request body.
- Entity chỉ nên đại diện cho persistence model, không dùng làm API contract.
- Mapping giữa Entity và DTO nên đặt trong mapper/helper rõ ràng, tránh rải rác trong controller.

## Validation

- Sử dụng Bean Validation như `@NotNull`, `@NotBlank`, `@Size`, `@Email`, `@Valid` cho request DTO.
- Validate nghiệp vụ phức tạp trong service layer.
- Error validation phải rõ ràng và dễ hiểu cho client.

## Service layer

- Business logic phải nằm trong `@Service`.
- Service method nên có trách nhiệm rõ ràng.
- Sử dụng transaction đúng nơi:
  - `@Transactional` cho các operation thay đổi dữ liệu.
  - `@Transactional(readOnly = true)` cho các operation chỉ đọc khi phù hợp.
- Không để controller tự quyết định transaction hoặc xử lý persistence logic.

## Hibernate / JPA

- Thiết kế quan hệ entity rõ ràng, tránh cascade không cần thiết.
- Cẩn thận với `FetchType.EAGER`; ưu tiên `LAZY` nếu không có lý do rõ ràng.
- Kiểm tra các query JPQL/native query có nguy cơ gây N+1 problem.
- Dùng pagination cho API trả danh sách lớn.
- Không load toàn bộ bảng dữ liệu nếu chỉ cần một phần.
- Không dùng native query khi JPQL, Criteria API hoặc Spring Data method query đã đủ rõ ràng.

## PostgreSQL

- Sử dụng kiểu dữ liệu phù hợp với PostgreSQL.
- Với dữ liệu cần unique, foreign key hoặc index, phải khai báo ở database/schema migration nếu dự án có Flyway/Liquibase.
- Tránh query không có index trên các bảng lớn.
- Không thay đổi schema theo cách phá vỡ dữ liệu hiện có nếu chưa có migration rõ ràng.

## Exception handling

- Sử dụng `@ControllerAdvice` hoặc cơ chế global exception handler hiện có.
- Không trả stack trace ra client.
- Exception message không được lộ thông tin nhạy cảm.
- Tạo custom exception khi giúp code rõ nghĩa hơn.

## Testing

- Viết unit test cho các method quan trọng trong service.
- Mock dependency bên ngoài khi test business logic.
- Viết integration test cho repository hoặc API quan trọng nếu thay đổi ảnh hưởng đến database/query.
- Test nên bao gồm happy path, validation errors và edge cases quan trọng.

## Logging

- Log phải có ngữ cảnh đủ để debug.
- Không log password, token, secret, thông tin định danh nhạy cảm hoặc payload nhạy cảm.
- Không dùng `System.out.println`; sử dụng logger chuẩn của dự án.
