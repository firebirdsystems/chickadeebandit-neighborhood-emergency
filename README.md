# Neighborhood Ready

Community emergency preparedness for the HOA / neighborhood tier. When the storm hits, the
neighborhood that already knows who has a generator and who's CPR-certified fares a lot better.

- **Skills & equipment registry** — each neighbor lists what they can offer (generator, chainsaw,
  truck, medical training). Everyone can read it; you only edit your own entries.
- **Phone tree** — block captains and coordinators with roles, phone numbers, and the area each covers.
- **Storm mode** — a coordinator broadcasts an "are you OK?" check-in that push-notifies the whole
  neighborhood. Neighbors tap **We're OK / No power / Need help**. Coordinators see the full board of
  who's accounted for; each neighbor sees their own status.

The registry is open to every member; adults maintain the phone tree. **Storm-mode broadcasts are
gated:** a hub admin designates a *coordinator group* (⚙️ in Storm Mode), and only that group's
members — or an admin — can fire the neighborhood-wide "are you OK?" push. This is enforced
server-side via `notification_acls` + an `app_config` settings row (written only through the
admin-gated `/api/admin-config` endpoint), so the client gate can't be bypassed by POSTing to the
notification endpoint directly. Until a group is set, only an admin can broadcast.

Built on `storage: db` with `row_policies`, `admin_config`, `notification_acls`, and the hub's
push-notification audience scoping.

## Quick start

```bash
npm run dev     # http://localhost:3001
npm run build   # produces dist/bundle.json
npm test
```
