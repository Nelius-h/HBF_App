# HBF Veiligheid - security/logic fixes

This build preserves the existing UI and changes underlying behavior only.

Fixed in this package:
- Invalid stored user IDs no longer inherit management privileges.
- Disabled accounts are rejected at login.
- Legacy/default PIN users are forced to choose a private PIN after login.
- Changed PINs cannot be overridden with 1234.
- Selecting a member no longer copies that member's stored PIN into the login field.
- Account switching is restricted to the authenticated master administrator.
- New client IDs use UUIDs and duplicate phone/email registration is rejected.
- Offline SOS trigger queues the complete emergency record and only reports successful Firestore sync when the write succeeds.
- WhatsApp no longer fabricates SENT/DELIVERED when no real Meta Cloud API token exists.
- A real Meta API acceptance is recorded as SENT, not DELIVERED; delivery requires provider receipt/webhook data.
- Browser-side Gemini API key loading is disabled to prevent secret exposure.
- Firestore rules no longer allow unauthenticated public access.

Important production limitation:
The project still uses Firebase anonymous authentication. The included Firestore rules now require an authenticated Firebase session, but true server-enforced CLIENT / CONTROL_ROOM / MANAGEMENT / REACTION_FORCE authorization requires migration to real Firebase Authentication identities and trusted role claims (or a protected backend). That cannot be made genuinely secure with client-side PIN checks alone.
