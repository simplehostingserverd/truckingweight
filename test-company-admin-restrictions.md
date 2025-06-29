# Company Admin Restrictions Test Plan

## Backend Middleware Tests

### 1. Test Company Admin Middleware

**Test Case 1: Company Admin accessing restricted endpoints**
- Create a test user with `is_admin: true` and `company_id: 1`
- Attempt to access:
  - `GET /api/admin/users` → Should return 403
  - `POST /api/admin/users` → Should return 403
  - `PUT /api/admin/users/:id` → Should return 403
  - `DELETE /api/admin/users/:id` → Should return 403
  - `GET /api/companies` → Should return 403
  - `POST /api/companies` → Should return 403
  - `PUT /api/companies/:id` → Should return 403
  - `DELETE /api/companies/:id` → Should return 403
  - `GET /api/city-dashboard/*` → Should return 403
  - `GET /api/city-users/*` → Should return 403

**Test Case 2: Super Admin accessing all endpoints**
- Create a test user with `is_admin: true` and `company_id: null`
- Attempt to access all above endpoints → Should return 200/success

**Test Case 3: Company Admin accessing allowed endpoints**
- Create a test user with `is_admin: true` and `company_id: 1`
- Attempt to access:
  - `GET /api/admin/lpr-cameras` → Should return 200
  - `GET /api/admin/storage-systems` → Should return 200
  - `GET /api/admin/settings` → Should return 200

### 2. Test Controller Data Filtering

**Test Case 4: Dashboard data filtering**
- Create test data for multiple companies
- Login as company admin for company 1
- Call `GET /api/admin/dashboard` → Should only return data for company 1

**Test Case 5: Recent users filtering**
- Create test users for multiple companies
- Login as company admin for company 1
- Call `GET /api/admin/recent-users` → Should only return users for company 1

## Frontend Restrictions Tests

### 3. Test Navigation Filtering

**Test Case 6: Sidebar navigation**
- Login as company admin
- Check sidebar navigation → Should not show:
  - Users
  - Companies
  - City Dashboard
- Should show:
  - LPR Cameras
  - Storage Systems
  - Settings

**Test Case 7: Mobile navigation**
- Login as company admin on mobile device
- Check mobile navigation → Should have same restrictions as sidebar

### 4. Test Route Protection

**Test Case 8: Admin page access**
- Login as company admin
- Navigate to `/admin/users` → Should redirect to dashboard with error
- Navigate to `/admin/companies` → Should redirect to dashboard with error
- Navigate to `/city-weighing` → Should redirect to dashboard with error

**Test Case 9: Error message display**
- After being redirected from restricted page
- Dashboard should show access denied alert
- Alert should be dismissible

### 5. Test Super Admin Access

**Test Case 10: Super admin navigation**
- Login as super admin (no company_id)
- Check navigation → Should show all admin features
- Should be able to access all admin pages

## Manual Testing Steps

1. **Setup Test Users:**
   ```sql
-- Company Admin
   INSERT INTO users (id, email, is_admin, company_id) 
   VALUES ('test-company-admin', 'company-admin@test.com', true, 1);
   
   -- Super Admin
   INSERT INTO users (id, email, is_admin, company_id) 
   VALUES ('test-super-admin', 'super-admin@test.com', true, null);
```

2. **Test Backend Endpoints:**
   - Use Postman or curl to test API endpoints
   - Verify 403 responses for restricted endpoints
   - Verify data filtering in responses

3. **Test Frontend:**
   - Login with different user types
   - Check navigation menus
   - Attempt to access restricted pages
   - Verify error messages

## Expected Results

- ✅ Company admins cannot access user management
- ✅ Company admins cannot access company management
- ✅ Company admins cannot access city features
- ✅ Company admins only see data for their company
- ✅ Super admins have full access
- ✅ Navigation menus are filtered appropriately
- ✅ Route protection works on frontend
- ✅ Error messages are displayed correctly

## Files Modified

### Backend:
- `backend/middleware/fastify/companyAdmin.js` (new)
- `backend/routes/admin.js`
- `backend/routes/companies.js`
- `backend/controllers/admin.js`

### Frontend:
- `frontend/src/components/Dashboard/DashboardSidebar.tsx`
- `frontend/src/components/Dashboard/DashboardHeader.tsx`
- `frontend/src/components/auth/CompanyAdminGuard.tsx` (new)
- `frontend/src/app/(dashboard)/layout.tsx`
- `frontend/src/app/(dashboard)/admin/layout.tsx` (new)
- `frontend/src/app/(dashboard)/city-weighing/layout.tsx` (new)
- `frontend/src/app/(dashboard)/dashboard/client.tsx`tsx`