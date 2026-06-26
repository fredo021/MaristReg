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
  grade,        // calculated string e.g. "Under 16 Girls"
  ageOnJan1,    // integer
  mobile, homePhone, email,
  streetAddress, suburb, city, postcode,
  institution,  // school/tertiary if age < 21, else empty string
  medicalNotes,
  photo,        // data URL (base64) or null
  parentFirstName, parentLastName, parentEmail, parentMobile, parentRelationship,
  acceptedTerms,
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

Static dataset of ~240 NZ suburbs. `searchSuburbs(query)` returns up to 8 `{ suburb, city, postcode }` matches. The suburb dropdown in `RegisterPage` uses `onBlur` with a 200 ms delay (not `onBlur` directly) so `onMouseDown` on a result fires before the list closes.

### Conditional form sections (`RegisterPage`)

Both derived from `getAgeAsOfJan1(form.dateOfBirth)` on every render:
- **Education section** — rendered when `age < 21`; institution field is `required`
- **Parent / Guardian section** — rendered when `age < 18`; all parent fields are `required`

Because these sections use conditional rendering (not CSS `display:none`), the `required` attributes are only present in the DOM when the sections are visible.

### Styling conventions

All styles are inline JS objects defined as constants at the top of each component file. There is no CSS framework or CSS modules. Shared style constants are not extracted across files — each page/component defines its own.

### Photo upload

Uses `FileReader.readAsDataURL` to store the image as a base64 data URL in React state. Capped at 5 MB client-side. The data URL is stored in the `photo` field of the member object and rendered as an `<img src={...}>` in `MembersPage`.
