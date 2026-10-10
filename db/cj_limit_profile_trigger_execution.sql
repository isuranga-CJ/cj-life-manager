-- Already applied to project hrrflxpcbsywiffseouv on 2026-10-10.
-- Prevent direct API execution; auth trigger behavior is preserved and tested.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
