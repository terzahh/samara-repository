# Express Backend API Reference

## Base URL
- **Development**: `http://localhost:5000`
- **Production**: Your deployed backend URL

---

## Authentication Endpoints

### POST /api/auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "displayName": "John Doe",
  "role": "user",           // optional, default: "user"
  "departmentId": "uuid"    // optional
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "user",
    "departmentId": null,
    "departmentName": null
  }
}
```

**Rate Limit:** 3 requests per hour per IP

---

### POST /api/auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "user",
    "departmentId": "uuid",
    "departmentName": "Engineering"
  }
}
```

**Cookies Set:**
- `session_id` (HttpOnly, Secure, SameSite=Strict)
- `refresh_token` (HttpOnly, Secure, SameSite=Strict)
- `csrf_token` (Secure, SameSite=Strict) - **readable by client**

**Rate Limit:** 5 requests per 15 minutes per IP+email

---

### GET /api/auth/me
Get current authenticated user.

**Headers:**
- Cookies automatically sent by browser

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "user",
    "departmentId": "uuid",
    "departmentName": "Engineering"
  }
}
```

**Errors:**
- `401 Unauthorized` - No session or session expired

---

### POST /api/auth/refresh
Refresh access token (automatic rotation).

**Headers:**
- Cookies automatically sent by browser

**Response:** `200 OK`
```json
{
  "message": "Token refreshed"
}
```

**Cookies Updated:**
- New `refresh_token` set
- Old `refresh_token` invalidated

**Security:**
- Atomic rotation (race-condition safe)
- Replay detection (using old token revokes session)
- Device fingerprint validation

**Rate Limit:** 10 requests per minute per session

---

### POST /api/auth/logout
Logout and revoke session.

**Headers:**
- `X-CSRF-Token: <csrf_token>` (required)
- Cookies automatically sent

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

**Cookies Cleared:**
- `session_id`
- `refresh_token`
- `csrf_token`

---

### POST /api/auth/ping
Update last activity timestamp.

**Headers:**
- Cookies automatically sent

**Response:** `200 OK`
```json
{
  "message": "Activity updated"
}
```

**Usage:**
- Call periodically to keep session active
- Prevents inactivity timeout
- Use `navigator.sendBeacon()` for reliability

---

## Health Check

### GET /api/health
Check server status.

**Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2024-12-02T22:00:00.000Z",
  "environment": "development"
}
```

---

## Error Responses

All errors return JSON with consistent format:

```json
{
  "error": "Error message",
  "message": "Additional details"  // optional
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created (registration) |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (not logged in or session expired) |
| 403 | Forbidden (CSRF error or insufficient permissions) |
| 404 | Not found |
| 429 | Too many requests (rate limited) |
| 500 | Internal server error |

---

## CSRF Protection

For **state-changing requests** (POST, PUT, DELETE), include CSRF token:

**JavaScript Example:**
```javascript
// Get CSRF token from cookie
const csrfToken = document.cookie
  .split('; ')
  .find(row => row.startsWith('csrf_token='))
  ?.split('=')[1];

// Include in request header
fetch('/api/auth/logout', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken
  },
  credentials: 'include'  // Send cookies
});
```

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/auth/login` | 5 requests | 15 minutes |
| `/api/auth/register` | 3 requests | 1 hour |
| `/api/auth/refresh` | 10 requests | 1 minute |
| `/api/*` (general) | 100 requests | 15 minutes |

**Headers Returned:**
- `RateLimit-Limit` - Max requests allowed
- `RateLimit-Remaining` - Requests remaining
- `RateLimit-Reset` - Time when limit resets

---

## Session Behavior

### Session Duration
- **Maximum**: 24 hours from creation
- **Inactivity timeout**: 30 minutes
- **Refresh token**: 14 days

### Session Validation
Every request validates:
1. Session exists
2. Not revoked
3. Not expired (< 24 hours old)
4. Not inactive (< 30 minutes since last activity)

### Automatic Logout
Session automatically revoked if:
- 24 hours passed since creation
- 30 minutes of inactivity
- Replay attack detected
- Suspicious device change

---

## Security Features

### Cookies
- ✅ HttpOnly (JavaScript cannot access)
- ✅ Secure (HTTPS only in production)
- ✅ SameSite=Strict (CSRF protection)

### Token Security
- ✅ HMAC-SHA256 hashing
- ✅ Atomic refresh rotation
- ✅ Replay detection
- ✅ 90-day retention for forensics

### Device Fingerprinting
- ✅ SHA-256 hash of user-agent
- ✅ 80% similarity tolerance
- ✅ Warnings for minor changes
- ✅ Revocation for major changes

### Audit Logging
- ✅ All security events logged
- ✅ No raw tokens stored
- ✅ Severity levels (info, warning, critical)
- ✅ Admin-only access

---

## Example Usage (JavaScript)

### Login
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',  // Important: send/receive cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123'
  })
});

const { user } = await response.json();
console.log('Logged in:', user);
```

### Get Current User
```javascript
const response = await fetch('/api/auth/me', {
  credentials: 'include'
});

const { user } = await response.json();
console.log('Current user:', user);
```

### Logout
```javascript
// Get CSRF token
const csrfToken = document.cookie
  .split('; ')
  .find(row => row.startsWith('csrf_token='))
  ?.split('=')[1];

await fetch('/api/auth/logout', {
  method: 'POST',
  headers: { 'X-CSRF-Token': csrfToken },
  credentials: 'include'
});
```

### Activity Ping
```javascript
// Using sendBeacon for reliability
navigator.sendBeacon('/api/auth/ping');

// Or with fetch
fetch('/api/auth/ping', {
  method: 'POST',
  credentials: 'include',
  keepalive: true
});
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234","displayName":"Test User"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@example.com","password":"Test1234"}'
```

### Get User
```bash
curl http://localhost:5000/api/auth/me \
  -b cookies.txt
```

### Logout
```bash
# Extract CSRF token from cookies.txt first
CSRF_TOKEN=$(grep csrf_token cookies.txt | awk '{print $7}')

curl -X POST http://localhost:5000/api/auth/logout \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt
```

---

## Troubleshooting

### "CSRF token required"
- Include `X-CSRF-Token` header for POST/PUT/DELETE
- Get token from `csrf_token` cookie

### "Session invalid"
- Session may have expired (24 hours)
- Session may be inactive (30 minutes)
- Login again

### "Too many requests"
- You've hit rate limit
- Wait for window to reset (check `RateLimit-Reset` header)

### Cookies not being sent
- Ensure `credentials: 'include'` in fetch
- Check CORS allows credentials
- Verify same-origin or CORS configured correctly
