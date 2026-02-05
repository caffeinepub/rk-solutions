# Specification

## Summary
**Goal:** Restore recoverable super-admin access and make Super Admin shop-list authorization failures clearly visible in the UI.

**Planned changes:**
- Add a backend bootstrap-only “super-admin reset” method that promotes the caller to super-admin only when no super-admin is currently configured, otherwise rejecting with a clear English error.
- Ensure admin-only endpoints (e.g., shop list retrieval) work for the bootstrapped principal after a successful reset and remain within the existing single-actor backend structure.
- Update the Super Admin shops page to show an explicit English error state when shop loading fails (e.g., Unauthorized), rather than implying there are no shops.
- Add a deliberate UI control in the Super Admin auth/admin area to trigger the bootstrap/reset flow, show success/failure via existing toast patterns, and refetch the shop list on success (no hard refresh).

**User-visible outcome:** If the Super Admin portal can’t load shops due to missing super-admin recognition, an operator can trigger a bootstrap reset to regain super-admin access, see clear error messages when authorization fails, and view shops immediately after a successful reset.
