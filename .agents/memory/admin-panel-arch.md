---
name: Admin panel architecture
description: How the admin panel is structured across files
---

Admin panel is a full-page dark-themed layout (slate-900/950) accessed at /admin.

Shell: `client/src/pages/Admin.tsx`
- Desktop: 64px sidebar with ShieldCheck logo
- Mobile: top hamburger + bottom 5-tab nav
- Uses `useState("dashboard")` for active section
- Renders sub-pages as components (not routes)

Sub-pages (client/src/pages/admin/):
1. AdminDashboard.tsx — recharts AreaChart + BarChart, stat cards, fetches /api/admin/stats/full
2. AdminUsers.tsx — searchable table + UserDetail slide-in modal (3 tabs: info/txs/investments), all admin actions
3. AdminDeposits.tsx — filtered deposit list, validate/reject buttons
4. AdminWithdrawals.tsx — filtered withdrawal list, validate/reject/note/block buttons
5. AdminProducts.tsx — product CRUD with inline edit form, toggle active/inactive
6. AdminSettings.tsx — SettingRow components per key, organized in Sections
7. AdminLogs.tsx — admin activity log table, auto-refreshes

**Why:** Split into sub-pages to keep files manageable and sections independently queryable.
