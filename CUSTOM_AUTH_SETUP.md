# Custom Authentication Setup

## ✅ Implementation Complete

Replaced Supabase Auth with custom authentication system fully compatible with existing project structure.

## How It Works

1. **Login**: Queries `users` table with email/password
2. **Session**: Stored in localStorage (token + user object)
3. **State**: AuthContext reads from localStorage on mount
4. **Logout**: Clears localStorage and redirects

## Database Setup

### 1. Add password column
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
```

### 2. Create test users
```sql
-- Admin user
INSERT INTO users (email, password_hash, display_name, role_id)
VALUES ('admin@test.com', 'admin123', 'Admin User', 
  (SELECT id FROM roles WHERE name = 'admin'));

-- Department Head
INSERT INTO users (email, password_hash, display_name, role_id, department_id)
VALUES ('dept@test.com', 'dept123', 'Dept Head', 
  (SELECT id FROM roles WHERE name = 'department_head'),
  (SELECT id FROM departments LIMIT 1));

-- Regular User
INSERT INTO users (email, password_hash, display_name, role_id)
VALUES ('user@test.com', 'user123', 'Test User', 
  (SELECT id FROM roles WHERE name = 'user'));
```

## Test Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@test.com | admin123 | Admin |
| dept@test.com | dept123 | Department Head |
| user@test.com | user123 | User |

## Files Modified

- ✅ `src/supabase/customAuth.js` - New custom auth logic
- ✅ `src/supabase/auth.js` - Imports custom auth
- ✅ `src/context/AuthContext.js` - Removed Supabase listeners
- ✅ `src/components/auth/LoginForm.js` - Simplified login
- ✅ `src/components/auth/SignupForm.js` - Department support
- ✅ `src/components/common/Header.js` - User display fix
- ✅ `src/services/authService.js` - Department registration

## Features Working

- ✅ Login with email/password
- ✅ Registration with role selection
- ✅ Department assignment for dept heads
- ✅ Role-based routing (admin/department/user)
- ✅ Protected routes
- ✅ Logout functionality
- ✅ Session persistence
- ✅ User profile display

## Security Notes

⚠️ **Current Implementation:**
- Passwords stored as plain text
- Simple token generation (base64)
- No session expiration
- No rate limiting

🔒 **For Production:**
```bash
npm install bcryptjs
```

Update `customAuth.js`:
```javascript
import bcrypt from 'bcryptjs';

// Registration
const passwordHash = await bcrypt.hash(password, 10);

// Login
const isValid = await bcrypt.compare(password, user.password_hash);
```

## Usage

1. Run database migration
2. Create test users
3. Start app: `npm start`
4. Login with test accounts
5. All existing features work as before

## No Breaking Changes

- All components work unchanged
- Same API as before
- Same user object structure
- Same role checking methods
- Same protected routes
