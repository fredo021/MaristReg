# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server (Vite HMR)
npm run build     # production build to dist/
npm run preview   # serve the production build locally
npm run lint      # ESLint across all .js/.jsx files
```

No test suite is configured.

## Architecture

React 19 + Vite 8 SPA with React Router v7. No backend, no persistence — all state is in-memory and resets on page refresh.

### State ownership

All shared state lives in `App.jsx` and is passed as props:

| State | Owner | Consumers |
|---|---|---|
| `members` array | `App` | `MembersPage` (read), `TeamsPage` (read) |
| `addMember(member)` | `App` | `RegisterPage` (called as `onRegister`) |
| `terms` string | `App` | `RegisterPage` (read), `AdminPage` (read + `setTerms`) |

`TeamsPage` holds its own `assignments` object in local state — team assignments are not lifted and reset on navigation away from the page.

### Member data shape

`RegisterPage` calls `onRegister` once per registrant (the player, and optionally once per parent-player). Each call receives this object (plus an auto-generated `id: Date.now()` added in `App`):

```js
{
  firstName, lastName, gender, dateOfBirth,
  grade,            // calculated string e.g. "Under 16 Girls"
  ageOnJan1,        // integer — age as at 1 Jan of current year
  memberType,       // 'player' | 'parent-player'
  mobile, homePhone, email,
  streetAddress, suburb, city, postcode,
  institution,      // school/tertiary (age < 21), else empty string
  medicalNotes,
  photo,            // base64 data URL or null
  registrationMode, // 'independent' | 'family' (shown for age >= 16 only)
  familyGroupName,  // string, only relevant when registrationMode === 'family'
  // Parent 1 (present when age < 18)
  parentFirstName, parentLastName, parentEmail, parentMobile,
  parentRelationship, parentOccupation,
  parentVolunteer,        // boolean
  parentVolunteerRoles,   // string[] e.g. ['Coach', 'Other']
  parentVolunteerOther,   // string, only relevant when roles includes 'Other'
  parentIsPlayer,         // boolean — true if parent 1 was also registered as a player
  // Parent 2 (present when age < 18 AND user added a second parent)
  parent2FirstName, parent2LastName, parent2Email, parent2Mobile,
  parent2Relationship, parent2Occupation,
  parent2Volunteer, parent2VolunteerRoles, parent2VolunteerOther,
  parent2IsPlayer,        // boolean
  acceptedTerms,    // boolean
  // Present only on memberType === 'parent-player' records
  linkedChildName,  // string — full name of the child they registered with
}
```

### Grade calculation (`src/utils/gradeCalc.js`)

Age is calculated as of **1 January of the current calendar year** (not today's date). Grade boundaries:

- `age < 12` → Under 12s (no gender split)
- `12–13` → Under 14 Girls / Boys
- `14–15` → Under 16 Girls / Boys
- `16–17` → Under 18 Women / Men
- `18–20` → Under 21 Women / Men
- `21+` → Senior Women / Men
- Gender "Other" gets open-grade labels (e.g. "Under 14s")

### NZ postcode lookup (`src/utils/nzSuburbs.js`)

Static dataset of ~240 NZ suburbs. `searchSuburbs(query)` returns up to 8 `{ suburb, city, postcode }` matches. The suburb dropdown in `RegisterPage` uses `onBlur` with a 200 ms delay so `onMouseDown` on a result fires before the list closes — do not change this to `onClick`.

### RegisterPage — conditional sections and flow

Sections are conditionally rendered (not hidden with CSS) based on age derived from `getAgeAsOfJan1(form.dateOfBirth)`:

| Section | Condition | Notes |
|---|---|---|
| Registration Type (family/independent) | `age >= 16` | Shown for U18 grade and above |
| Education | `age < 21` | Institution field is `required` |
| Parent / Guardian | `age < 18` | All P1 fields required; P2 shown via `showP2` state |
| Second parent block | `showP2 === true` | Toggled by "+ Add" / "— Remove" buttons |
| Parent player status | inside parent block | Radio: Non-player / Also a player |
| Parent player fields | `parentIsPlayer === true` | DOB, gender, grade (read-only), optional photo + medical |

Because sections use conditional rendering, `required` attributes are only in the DOM when visible — no hidden-field validation issues.

**Post-submit success screen:** When `done === true`, the form is replaced by a confirmation card. `submittedAlso` (string array of parent-player names) is shown if any parents were also registered as players. For players with `age < 16`, a **"Register Another Family Member"** button appears — it resets the player fields but pre-fills all parent fields (including second parent if present, and their player-status fields) via `savedParent` state captured at submit time. `prefilled === true` shows an informational banner at the top of the re-loaded form.

**`onRegister` is called multiple times on a single submit** when parents are also players — once for the child (`memberType: 'player'`), then once per parent-player (`memberType: 'parent-player'`). Parent-player records use the child's address and the parent's own contact details, DOB, and gender for grade calculation.

**Render helpers (plain functions, not components)** defined inside `RegisterPage`:

| Helper | Purpose |
|---|---|
| `renderVolunteer(num)` | Volunteer checkbox + role grid for parent 1 or 2 |
| `renderParentPlayerFields(num)` | Player sub-form (gender, DOB, auto-grade, optional photo/medical) |
| `renderPlayerStatus(num)` | Non-player / Also a player radio toggle; calls `renderParentPlayerFields` when active |

These must remain plain functions — not extracted to components — to avoid remount issues caused by function recreation on every render.

**`extractParentFields(form, includeP2)`** captures all parent contact, volunteer, and player-status fields into an object for sibling pre-fill. Always update this function when adding new parent fields.

### Branding

Marist Water Polo Club colour palette (mirrored from maristwaterpolo.org.nz):

| Role | Value |
|---|---|
| Primary navy | `#00205b` |
| Backgrounds / cards | `#ffffff` |
| Badges / highlights | `#e8ecf2` |
| Borders | `#dde3ec` |
| Warning (parent section) | `#ffc107` / `#fff8e1` |

The club logo is imported in `NavBar.jsx` as `import logoUrl from '../assets/logo.png'`. To update the logo, replace `src/assets/logo.png`.

### Styling conventions

All styles are inline JS objects defined as constants at the top of each component file. No CSS framework or CSS modules. Style constants are not shared across files.
