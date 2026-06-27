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

`RegisterPage` calls `onRegister` with this object (plus an auto-generated `id: Date.now()` added in `App`):

```js
{
  firstName, lastName, gender, dateOfBirth,
  grade,            // calculated string e.g. "Under 16 Girls"
  ageOnJan1,        // integer — age as at 1 Jan of current year
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
  // Parent 2 (present when age < 18 AND user added a second parent)
  parent2FirstName, parent2LastName, parent2Email, parent2Mobile,
  parent2Relationship, parent2Occupation,
  parent2Volunteer, parent2VolunteerRoles, parent2VolunteerOther,
  acceptedTerms,    // boolean
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

Because sections use conditional rendering, `required` attributes are only in the DOM when visible — no hidden-field validation issues.

**Post-submit success screen:** When `done === true`, the form is replaced by a confirmation card. For players with `age < 16`, a **"Register Another Family Member"** button appears — it resets the player fields but pre-fills all parent fields (including second parent if present) via `savedParent` state captured at submit time. `prefilled === true` shows an informational banner at the top of the re-loaded form.

**`renderVolunteer(num)`** is a render helper function (not a component) defined inside `RegisterPage` and called as `{renderVolunteer(1)}` / `{renderVolunteer(2)}`. It must remain a plain function — not extracted to a component — to avoid remount issues caused by function recreation on every render.

### Styling conventions

All styles are inline JS objects defined as constants at the top of each component file. No CSS framework or CSS modules. Style constants are not shared across files.
