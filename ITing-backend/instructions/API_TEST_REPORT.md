# ITing Job Portal Backend - API Documentation & Test Report

## Running the Application

```bash
# Build and start
docker compose up -d --build

# Check health
curl http://localhost:8081/actuator/health
# Response: {"status":"UP"}

# Stop
docker compose down
```

## Access URLs

| Service | URL |
|---------|-----|
| Swagger UI | http://localhost:8081/swagger-ui.html |
| OpenAPI JSON | http://localhost:8081/v3/api-docs |
| Actuator Health | http://localhost:8081/actuator/health |
| API Base | http://localhost:8081 |

---

## Smoke Test Results

**Status: 27/27 PASSED (100%)**

```
=== PUBLIC ENDPOINTS ===
  [200] GET /actuator/health               PASS
  [200] GET /swagger-ui.html               PASS
  [200] GET /v3/api-docs                  PASS
  [200] GET /api/public/categories/locations    PASS
  [200] GET /api/public/categories/industries    PASS
  [200] GET /api/public/categories/skills        PASS
  [200] GET /api/public/faqs                   PASS
  [200] GET /api/public/blogs                  PASS
  [200] GET /api/jobs/search?keyword=java      PASS
  [200] GET /api/jobs/hot                      PASS
  [200] GET /api/jobs/latest                   PASS
  [200] GET /api/jobs/1                        PASS
  [200] GET /api/companies/11                  PASS

=== ADMIN ENDPOINTS ===
  [200] GET /api/admin/status       PASS  (ADMIN only)
  [200] GET /api/admin/companies   PASS  (ADMIN only)
  [200] GET /api/admin/jobs       PASS  (ADMIN only)

=== USER (CANDIDATE) ENDPOINTS ===
  [200] GET /api/user/profile                      PASS
  [200] GET /api/notifications                     PASS
  [200] GET /api/notifications/unread              PASS
  [200] GET /api/notifications/unread/count        PASS
  [200] GET /api/messages/conversations            PASS
  [200] GET /api/messages/unread/count             PASS
  [200] GET /api/applications/my-applications       PASS
  [200] GET /api/companies/follow/my-followed       PASS

=== EMPLOYER (COMPANY) ENDPOINTS ===
  [200] GET /api/jobs/my-jobs         PASS  (EMPLOYER only)
  [200] GET /api/applications/employer PASS  (EMPLOYER only)

=== MESSAGING ===
  [200] POST /api/messages            PASS  (creates conversation + sends message)
```

---

## Authentication

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "nguyenvana@gmail.com",
  "password": "123456"
}
```

**Response 200:**
```json
{
  "userId": 101,
  "email": "nguyenvana@gmail.com",
  "role": "CANDIDATE",
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400
}
```

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "StrongPass123!",
  "role": "USER"
}
```

### Use Token
Include in all authenticated requests:
```
Authorization: Bearer <accessToken>
```

---

## Real Response Examples

### GET /api/user/profile (authenticated)
```json
{
  "userId": 101,
  "fullName": "Nguyen Van A",
  "email": "nguyenvana@gmail.com",
  "phoneNum": "0901111111",
  "locId": 2,
  "avatarUrl": "https://i.pravatar.cc/150?img=1",
  "lastUpdate": "2026-03-19T19:45:58.878719"
}
```

### POST /api/messages (send message)
```http
POST /api/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Hello there!",
  "receiverId": 2,
  "receiverType": "USER",
  "senderType": "USER"
}
```

**Response 200:**
```json
{
  "id": 4,
  "conversationId": 4,
  "senderId": 101,
  "senderType": "USER",
  "senderName": "Nguyen Van A",
  "senderAvatar": "https://i.pravatar.cc/150?img=1",
  "receiverId": 2,
  "receiverType": "USER",
  "receiverName": null,
  "receiverAvatar": null,
  "content": "Hello there!",
  "isRead": false,
  "readAt": null,
  "createdAt": "2026-03-22T03:18:22.047820227"
}
```

### GET /api/messages/conversations
```json
{
  "conversations": [
    {
      "id": 3,
      "type": "USER_USER",
      "participant1Id": 101,
      "participant1Name": "Nguyen Van A",
      "participant2Id": 1,
      "lastMessageContent": "Test message from smoke test",
      "lastMessageTime": "2026-03-22T03:17:50.6905",
      "unreadCount": 0,
      "createdAt": "2026-03-22T03:17:50.686849"
    }
  ],
  "totalCount": 1,
  "currentPage": 0,
  "totalPages": 1
}
```

---

## New Messaging & Notification Endpoints

### Messaging Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/messages | USER | Send message (auto-creates conversation) |
| GET | /api/messages/conversations | USER | Get paginated conversation list |
| GET | /api/messages/conversations/{id} | USER | Get conversation by ID |
| DELETE | /api/messages/conversations/{id} | USER | Delete conversation |
| GET | /api/messages/conversations/{id}/messages | USER | Get paginated messages |
| GET | /api/messages/conversations/{id}/messages/all | USER | Get all messages |
| PATCH | /api/messages/conversations/{id}/read | USER | Mark all as read |
| PATCH | /api/messages/{id}/read | USER | Mark single message as read |
| GET | /api/messages/unread | USER | Get unread messages |
| GET | /api/messages/unread/count | USER | Get unread count |

### Notification Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/notifications | - | Create notification (internal) |
| GET | /api/notifications | USER | Get paginated notifications |
| GET | /api/notifications/unread | USER | Get unread notifications |
| GET | /api/notifications/unread/count | USER | Get unread count |
| PATCH | /api/notifications/{id}/read | USER | Mark notification as read |
| PATCH | /api/notifications/read-all | USER | Mark all as read |
| DELETE | /api/notifications/{id} | USER | Delete notification |

---

## Existing Endpoints (Verified Working)

### Public
- `GET /api/jobs/search` - Search jobs with filters
- `GET /api/jobs/hot` - Hot jobs
- `GET /api/jobs/latest` - Latest jobs
- `GET /api/jobs/{id}` - Job detail
- `GET /api/companies/{id}` - Company detail
- `GET /api/public/categories/locations` - Locations
- `GET /api/public/categories/industries` - Industries
- `GET /api/public/categories/skills` - Skills
- `GET /api/public/faqs` - FAQs
- `GET /api/public/blogs` - Blogs

### Admin
- `GET /api/admin/status` - Admin dashboard status
- `GET /api/admin/companies` - All companies
- `GET /api/admin/jobs` - All jobs

### User (CANDIDATE)
- `GET /api/user/profile` - User profile
- `GET /api/applications/my-applications` - My job applications
- `GET /api/companies/follow/my-followed` - Followed companies

### Employer (COMPANY)
- `GET /api/jobs/my-jobs` - My posted jobs
- `GET /api/applications/employer` - Applications to my jobs

---

## WebSocket

STOMP WebSocket endpoint: `/ws`

Subscribe to channels:
- `/user/queue/notifications` - Personal notifications
- `/user/queue/messages` - Personal messages
- `/topic/conversations/{id}` - Conversation messages

Example STOMP CONNECT frame:
```
CONNECT
Authorization: Bearer <jwt_token>

SEND
destination:/app/chat
content-type:application/json

{"conversationId": 1, "content": "Hello!"}
```

---

## Known Test Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@iting.com | 123456 | ADMIN |
| superadmin@iting.com | 123456 | ADMIN |
| nguyenvana@gmail.com | 123456 | CANDIDATE |
| tranthib@gmail.com | 123456 | CANDIDATE |
| hr@fpt.com | 123456 | COMPANY/EMPLOYER |

---

## Key Fixes Applied During This Session

1. **SecurityConfig**: Added permitAll for `/api/public/**`, `/actuator/health`, `/ws/**`
2. **Actuator Health**: Disabled mail health indicator (`management.health.mail.enabled=false`)
3. **Account Entity**: Added `@Builder.Default` for `status` field + explicit status in register
4. **Sequence Fix**: Fixed `account_id_seq` and `notification_id_seq` DB sequences
5. **UserFollowCompany Entity**: Fixed entity to match actual DB schema (composite PK on user_id+company_id, column `follow_date` instead of `followed_at`)
6. **DDL Workaround**: Using `ddl-auto=update` for Docker; DDL warnings are non-fatal

---

## Postman/curl Testing Quick Reference

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nguyenvana@gmail.com","password":"123456"}' \
  | python -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")

# Get notifications
curl -s http://localhost:8081/api/notifications \
  -H "Authorization: Bearer $TOKEN"

# Send message
curl -s -X POST http://localhost:8081/api/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello!","receiverId":2,"receiverType":"USER","senderType":"USER"}'

# Get conversations
curl -s http://localhost:8081/api/messages/conversations \
  -H "Authorization: Bearer $TOKEN"

# Health check
curl -s http://localhost:8081/actuator/health
```
