-- Prevent authenticated users from updating their own plan column.
-- plan changes must go through service_role (admin/webhook only).
revoke update (plan) on public.profiles from authenticated;
