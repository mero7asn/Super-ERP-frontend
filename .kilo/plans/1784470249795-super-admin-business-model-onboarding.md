# Plan: Super Admin Business-Model Onboarding & ERP Module Visibility

## Goal
On the **first login of a Super CRM Administrator**, ask whether the organization provides a
**Service** (sees Bookings), sells a **Product** (sees an in-CRM Products module + two external
ERP departments: Super Inventory, Super Supply Chain), or does **Both** (sees everything). The
choice is stored, drives sidebar/access visibility, and can be changed later in System Settings.

## Decisions (confirmed with user)
- **External departments** = two new sidebar sections at the **ERP level, outside Super CRM**:
  `Super Inventory` and `Super Supply Chain`. Shown only for `product` / `both`.
- **"Product page inside CRM"** = a new **Products module** under the Super CRM section.
- **Storage** = `SystemSetting` document with key `businessModel`. Sidebar + guards read it.
  Admin can change it from System Settings (requirement: "super admin can change his choice").

## Business-model values
`service` | `product` | `both`  (default to `service` only if never set; but first-login
forces a choice before the admin can use the app).

Visibility matrix:
| Section | service | product | both |
|---|---|---|---|
| Bookings (Super CRM) | ✅ | ❌ | ✅ |
| Products (Super CRM) | ❌ | ✅ | ✅ |
| Super Inventory (ERP) | ❌ | ✅ | ✅ |
| Super Supply Chain (ERP) | ❌ | ✅ | ✅ |

## Current code findings (context)
- `backend/src/models/SystemSetting.js` exists (key/value/updatedBy). No route/controller uses it yet.
- `backend/src/index.js:69,85` references `settingsRoutes` which **does not exist** — must create it.
- `authController.loginUser` returns `{ _id, firstName, lastName, email, role, permissions, token }`
  (no "needsOnboarding"/businessModel). `User` model has no onboarding flag.
- `frontend/src/context/AuthContext.jsx` stores the raw login payload in `localStorage.crmUser`.
- `frontend/src/components/Sidebar.jsx` renders three groups: Global, **Super CRM** (`CRM_NAV_ITEMS`),
  **Super HRM** (`HRM_NAV_ITEMS`), My Workspace. Super Admin currently sees all CRM items.
- `frontend/src/pages/SettingsPage.jsx` has tabs but **no businessModel control** and only persists
  SMTP (and "Save General" is a fake no-op). Needs a real endpoint.

## Implementation tasks (ordered)

### 1. Backend — settings routes/controller (also fixes missing module)
- Create `backend/src/routes/settingsRoutes.js` exporting `GET /settings/business-model`,
  `PUT /settings/business-model`, plus `GET /settings/email` and `PUT /settings/email` (already
  called by `SettingsPage` at `/settings/email` and `/settings/email/test` — currently 404).
- Create `backend/src/controllers/settingsController.js`:
  - `getBusinessModel`: read `SystemSetting` key `businessModel`; return value or default `service`.
  - `updateBusinessModel`: (Super Admin only) upsert `SystemSetting` key `businessModel`, validate
    enum `['service','product','both']`, set `updatedBy`.
  - `getEmailSettings` / `updateEmailSettings` / `testEmailSettings`: back the existing SMTP UI.
- Wire in `index.js` (already imports `settingsRoutes`) — verify it loads.

### 2. Backend — first-login detection
- Add `User` field `onboarded: { type: Boolean, default: false }`.
- In `loginUser`, include `onboarded: user.onboarded` and `businessModel` (from SystemSetting) in
  the response. Add a `PUT /auth/users/:id/onboard` (or reuse `updateBusinessModel`) that, when a
  Super Admin sets their first `businessModel`, also flips `user.onboarded = true`.
- Seed/migration note: existing Super Admins have `onboarded` defaulting `false`, so they get the
  modal once; choosing an option sets `onboarded=true`.

### 3. Frontend — persist businessModel + onboarded from auth
- Extend `AuthContext`: store `businessModel` and `onboarded` from login payload; add
  `updateCurrentUser` already merges, reuse it. Expose `setBusinessModel`.
- `api.js` / login already saves whole payload; ensure `businessModel`,`onboarded` flow through.

### 4. Frontend — first-login onboarding modal (Super Admin only)
- New component `components/OnboardingModal.jsx`: shown automatically when
  `user.role === 'Super CRM Administrator' && !user.onboarded`.
- Three cards: **Service** / **Product** / **Both** with icons + description (Bookings vs
  Products + Super Inventory + Super Supply Chain).
- On select → `PUT /settings/business-model` → update `businessModel`, set `onboarded=true`
  via `updateCurrentUser`, close modal. Block app interaction until chosen (modal is mandatory).

### 5. Frontend — sidebar ERP sections for Inventory & Supply Chain
- In `Sidebar.jsx` add `ERP_NAV_ITEMS` array:
  - `{ label: 'Super Inventory', icon: 'inventory', path: '/inventory', external: true }`
  - `{ label: 'Super Supply Chain', icon: 'supplychain', path: '/supply-chain', external: true }`
- Render a new **Super Inventory** and **Super Supply Chain** group (ERP level, outside Super CRM),
  visible only when `businessModel === 'product' || 'both'`.
- For `external: true` items, navigate via `window.open(path, '_blank')` or render as `<a>` to the
  configured ERP base URL (define `ERP_BASE_URL = import.meta.env.VITE_ERP_URL || '/'`; paths are
  `/inventory`, `/supply-chain`). Use existing icons or add `inventory`/`supplychain` to `Icons.jsx`.
- Apply visibility matrix: Bookings item shown when `service||both`; new Products item shown when
  `product||both`.

### 6. Frontend — Products module (Super CRM)
- New `pages/ProductsPage.jsx` (list/create/edit product catalog: name, SKU, price, description,
  image). Stub-first but functional in-CRM page. Add route `/products` (Super Admin + roles with
  permission). Add `{ label: 'Products', icon: 'box', path: '/products', roles:[...] }` to
  `CRM_NAV_ITEMS`, visible per matrix.

### 7. Frontend — System Settings control to change choice
- Add a "Business Model" tab/section in `SettingsPage.jsx` (Super Admin only): radio
  Service/Product/Both, saved via `PUT /settings/business-model`; on save, update `businessModel`
  in context so sidebar updates live. This satisfies "super admin can change his choice in settings".

## Edge cases / risks
- `settingsRoutes.js` was missing → index.js would crash on boot; creating it fixes a latent bug.
- Existing Super Admins: `onboarded=false` triggers modal once; safe.
- Non-Super-Admin roles: ignore `onboarded`/modal; their visibility stays as today (CRM/HRM by role).
- If `businessModel` unset and somehow past onboarding, default `service` (Bookings visible).
- External dept links need an ERP base URL; fall back to relative `/inventory` if env not set.

## Validation
1. Boot backend: `node src/index.js` loads without "Cannot find module './routes/settingsRoutes'".
2. Fresh Super Admin login → onboarding modal appears, cannot dismiss without choosing.
3. Choose **Service** → Bookings visible; Products, Inventory, Supply Chain hidden.
4. Choose **Product** → Products visible; Inventory + Supply Chain sidebar sections appear (open
   external link); Bookings hidden.
5. Choose **Both** → all four visible.
6. Change choice in System Settings → sidebar updates immediately; `SystemSetting` key persisted.
7. `GET /settings/business-model` returns stored value after restart/re-login.
8. Frontend `npm run lint` and `npm run build` pass with no new errors in `src/`.
