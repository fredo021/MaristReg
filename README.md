# Marist Water Polo — Registration App

A club registration web app for Marist Water Polo (Auckland). Manages player sign-ups, displays registered members, and assigns players to teams.

Built with React 19 + Vite. All state is in-memory — there is no backend or database. Data resets on page refresh.

---

## What the app does

- **Register players** via a multi-section form that collects personal details, home address (with NZ suburb/postcode lookup), a player photo, and medical notes
- **Auto-calculates grade** from date of birth and gender, based on age as at 1 January of the current year (Under 12s through to Senior)
- **Enforces age rules** — players under 21 must provide a school or tertiary institution; players under 18 must have a parent or guardian register alongside them
- **Lists all registered members** in a table with photo, grade, contact details, and parent information
- **Assigns players to squads** on the Teams page using a dropdown per player
- **Admin page** for editing the terms and conditions shown on the registration form

---

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | Home | Landing page with links to Register, Members, and Teams |
| `/register` | Register | Player registration form |
| `/members` | Members | Table of all registered players (admin view) |
| `/teams` | Teams | Assign players to squads; live team summary |
| `/admin` | Admin | Edit terms and conditions text |

---

## Running locally

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The app runs at `http://localhost:5173` by default.

```bash
# Other commands
npm run build     # Production build → dist/
npm run preview   # Serve the production build locally
npm run lint      # Run ESLint
```

---

## Project structure

```
src/
  App.jsx               # Root component — router, shared state (members, terms)
  main.jsx              # React entry point
  components/
    NavBar.jsx          # Top navigation bar
  pages/
    HomePage.jsx        # Landing page
    RegisterPage.jsx    # Player registration form
    MembersPage.jsx     # Registered members table
    TeamsPage.jsx       # Squad assignment
    AdminPage.jsx       # Terms & conditions editor
  utils/
    gradeCalc.js        # Age-as-of-Jan-1 and grade calculation logic
    nzSuburbs.js        # Static NZ suburb/postcode dataset (~240 entries)
```

---

## Grade system

Grades are determined by the player's age on 1 January of the current calendar year:

| Age on 1 Jan | Male | Female | Other |
|---|---|---|---|
| Under 12 | Under 12s | Under 12s | Under 12s |
| 12–13 | Under 14 Boys | Under 14 Girls | Under 14s |
| 14–15 | Under 16 Boys | Under 16 Girls | Under 16s |
| 16–17 | Under 18 Men | Under 18 Women | Under 18s |
| 18–20 | Under 21 Men | Under 21 Women | Under 21s |
| 21+ | Senior Men | Senior Women | Senior |

---

## Contributing

1. Fork the repository and create a branch from `main`
2. Run `npm run lint` before submitting — the CI check will fail on lint errors
3. All styles are inline JS objects defined at the top of each component file — follow this pattern rather than adding CSS files
4. Shared app state (members list, terms text) lives in `App.jsx` and is passed as props — do not introduce a state management library without discussion
5. The NZ suburb dataset is in `src/utils/nzSuburbs.js` — add entries as `{ suburb, city, postcode }` objects to the `NZ_SUBURBS` array
6. Submit a pull request with a clear description of what changed and why

---

## Known limitations

- **No persistence** — all data (registrations, team assignments, terms edits) is lost on page refresh. Adding a backend or `localStorage` is the most impactful next step.
- **Team assignments** reset when navigating away from the Teams page, as that state is local to the component.
- **No authentication** — the Admin page is publicly accessible.
- **NZ suburb coverage** is ~240 suburbs, weighted toward Auckland. The postcode auto-fill will not match every suburb in NZ.
