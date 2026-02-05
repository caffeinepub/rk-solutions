# Specification

## Summary
**Goal:** Make the Super Admin portal entry point clearly visible from the Shop Login screen.

**Planned changes:**
- Add a clearly visible navigation control labeled "Super Admin Login" on `/auth/shop/login` (no scrolling required).
- Wire the new control to route to `/auth/admin/login` and display the existing AdminLoginPage.
- Keep existing Shop Login and Create New Shop Account actions unchanged.

**User-visible outcome:** On the Shop Login page, users can immediately see and select "Super Admin Login" to go to the Super Admin login screen, while all shop login/account creation flows continue to work as before.
