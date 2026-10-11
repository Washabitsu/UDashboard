# UDashboard

The dashboard of the platform: a single page app to manage ML models, datasets, algorithms, data types and
API keys in [OrchestrML](https://github.com/Washabitsu/OrchestrML).

It is built to run behind Portio, a Backend for Frontend. The app has no token and no login form:

- Sign-in is a redirect to `/bff/login`. Portio runs the login (Projectio + Google) and comes back with a session cookie.
- The cookie is HttpOnly, so this code can't read it. `GET /bff/user` tells the app who is logged in.
- API calls go to `/api/ml/...` on the app's own origin. Portio adds the access token on the server.
- Requests that change something carry a CSRF token from `/bff/csrf-token` in the `X-XSRF-TOKEN` header.

All of that is in two small files: [`src/api/apiClient.ts`](./src/api/apiClient.ts) and [`src/api/auth.ts`](./src/api/auth.ts).

## Stack

React 19, TypeScript, Vite, Tailwind CSS 4, axios, react-router. Icons are lucide, the two fonts
(Schibsted Grotesk, JetBrains Mono) are bundled, so the browser loads nothing from another website.

## Run

The app needs Portio in front of it, on its own it has nothing to talk to.

**With Docker** (the whole platform): see `README-DOCKER.md` of the platform.

**For development:**

```
npm install
npm run dev
```

Then start Portio and open **https://localhost:7287** (Portio's address, not Vite's). Portio serves this dev
server's files, including hot reload, and answers `/bff` and `/api` itself. That is the same layout as in
production, so the session cookies work the same way.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server on port 5173 |
| `npm run build` | Type check and production build into `dist/` |
| `npm run lint` | ESLint |

## Pages

| Address | Page |
| --- | --- |
| `/login` | Sign in with Google |
| `/machine-learning` | Overview: the five setup steps with counts, the latest models, API key use |
| `/machine-learning/models` | Models: list, create, view, edit, train, assign datasets |
| `/machine-learning/datasets` | Datasets: list, upload with column rules, view, edit, download |
| `/machine-learning/algorithms` | Algorithms: list, create, view, edit |
| `/machine-learning/data-types` | File types a dataset may be (`.csv`, ...) |
| `/machine-learning/api-keys` | API keys: list, create (the key is shown once), view where a key was used from |
| `/identity` | Account: who is signed in, sign out |

Every address except `/login` needs a session. That check is in one place, [`src/App.tsx`](./src/App.tsx).

## Structure

```
src/
  App.tsx                 the routes, and the one check that a user is logged in
  index.css               design tokens: colours, fonts, corner radius
  api/                    calls to Portio and OrchestrML, response types
  common/Components/      the pages: Login, Identity, NotFound, the overview, machine-learning/<resource>/
  components/layout/      AppShell (sidebar + page) and PageHeader
  components/common/      what the pages are built from: Panel, DataTable, Field, Notice, JsonEditor, ...
  components/ui/          Button, Input, Select, Label
  hooks/                  useLoad (the data of a page), useDeleteDialog
  lib/                    small helpers: dates, JSON, class names
Dockerfile, nginx.conf    production image: static files served by nginx (non-root)
```

A page follows one pattern: `useLoad` gets its data, `PageHeader` is the title row, the content sits in
`Panel`s. A list page adds `ListPanel` + `DataTable`, a form page adds `Field`s.
