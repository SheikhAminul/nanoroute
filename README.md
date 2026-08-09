# nanoroute

**A tiny, dependency-free router for React 19+.** Nested routes, typed params, wildcards,
search params, and a memory history for tests — client-side routing with nothing extra
bolted on.

[![npm version](https://img.shields.io/npm/v/nanoroute.svg)](https://www.npmjs.com/package/nanoroute)
[![bundle size](https://img.shields.io/bundlephobia/minzip/nanoroute)](https://bundlephobia.com/package/nanoroute)
[![zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](https://www.npmjs.com/package/nanoroute)
[![types included](https://img.shields.io/badge/types-included-blue)](https://www.npmjs.com/package/nanoroute)
[![license](https://img.shields.io/npm/l/nanoroute)](./LICENSE)

## Contents

- [Why nanoroute](#why-nanoroute)
- [nanoroute vs. react-router](#nanoroute-vs-react-router)
- [Install](#install)
- [Quick start](#quick-start)
- [Guide](#guide)
  - [Routing & matching](#routing--matching)
  - [Nested layouts](#nested-layouts)
  - [Navigation](#navigation)
  - [Location, params & active links](#location-params--active-links)
  - [Search params](#search-params)
  - [History & testing](#history--testing)
  - [Server-side rendering](#server-side-rendering)
- [API reference](#api-reference)
- [TypeScript](#typescript)
- [FAQ](#faq)
- [Deliberately not included](#deliberately-not-included)
- [Notes](#notes)
- [License](#license)

## Why nanoroute

- **~2KB gzipped, zero runtime dependencies.** No transitive packages, no supply-chain
  surface beyond React itself.
- **No provider needed.** Location lives in a `useSyncExternalStore` store, not in
  context — mount `<Routes>` anywhere and it just works against the browser URL.
- **No leaks by construction.** One shared `popstate`/`hashchange` listener exists only
  while components are mounted, and every cache in the library is bounded.
- **React Compiler friendly.** Passes `eslint-plugin-react-hooks` v7 with the compiler
  rules enabled; every manual memo is preserved rather than skipped.
- **ESM, fully typed, tree-shakeable.** Ships its own `.d.ts`, no `any` in the public API.
- **A real memory history, not a mock.** `MemoryRouter` and `createMemoryHistory` make
  route-aware components testable without touching `window`.

## nanoroute vs. react-router

`react-router` is a capable, full-featured framework: data loaders, actions, fetchers,
deferred data, framework mode. If you need those, use it. If you just need to show the
right component for the current URL, nanoroute does that and stops there.

| | nanoroute | react-router |
| --- | --- | --- |
| Gzipped size | **~2.3 KB** | ~57.9 KB (main bundle) |
| Runtime dependencies | **0** | 1 (`cookie-es`) |
| Setup | Mount `<Routes>` — no provider required | Requires `<BrowserRouter>` / `RouterProvider` |
| Scope | Routing primitives: match, navigate, params | Full framework: loaders, actions, data APIs, framework mode |
| Config surface | `path`, `element`, nested `children` | Loaders, actions, error boundaries, handles, and more |
| TypeScript | Fully typed, no `any` | Fully typed |

<sub>Sizes measured August 2026: nanoroute's `dist/index.js` gzips to 2,360 bytes
(built from this repo); react-router@8.3.0's main bundle gzips to 59,247 bytes per
[Bundlephobia](https://bundlephobia.com/package/react-router). Re-check before citing —
both numbers move as each package ships new releases.</sub>

Reach for nanoroute when you want SPA routing without adopting a framework's opinions.
Reach for react-router when you want the data layer that comes with it.

## Install

```sh
npm install nanoroute
```

```sh
pnpm add nanoroute
```

```sh
yarn add nanoroute
```

Requires React ≥ 19 (contexts are rendered directly as providers, and `ref` is a plain
prop). No other peer dependencies.

## Quick start

```tsx
import { Link, Outlet, Route, Routes, useParams } from 'nanoroute'

const Shell = () => (
	<>
		<nav>
			<Link to="/">Home</Link>
			<Link to="/users/7">User</Link>
		</nav>
		<Outlet />
	</>
)

const User = () => <h1>{useParams<{ id: string }>().id}</h1>

export const App = () => (
	<Routes>
		<Route path="/" element={<Shell />}>
			<Route path="" element={<Home />} />              {/* index route */}
			<Route path="users/new" element={<NewUser />} />  {/* wins over :id */}
			<Route path="users/:id" element={<User />} />
			<Route path="files/*" element={<Files />} />      {/* params['*'] */}
			<Route path="*" element={<NotFound />} />
		</Route>
	</Routes>
)
```

No `<BrowserRouter>` wrapper — `<Routes>` reads the browser URL by default. Mount it
anywhere in the tree.

Full export surface, for a quick scan:

```ts
import {
	// components
	Link, MemoryRouter, Navigate, Outlet, Route, Router, Routes,
	// hooks
	useLocation, useMatch, useNavigate, useParams, useRouterHistory, useSearchParams,
	// history & SSR
	browserHistory, createBrowserHistory, createMemoryHistory, navigate, setServerUrl,
	// standalone matcher
	matchPath,
} from 'nanoroute'
```

## Guide

### Routing & matching

Patterns are compiled once to a regex and ranked by **specificity**, so declaration
order never matters: static segments beat `:params`, which beat `*`.

```tsx
<Route path="users/new" element={<NewUser />} /> {/* static: always wins over :id */}
<Route path="users/:id" element={<User />} />    {/* dynamic: params.id */}
<Route path="files/*" element={<Files />} />     {/* wildcard: params['*'] */}
```

A trailing `*` also matches the bare parent path (`files/*` matches `/files`, with
`params['*']` equal to `''`). Use `matchPath(pattern, pathname)` to run the same
matcher outside of rendering, e.g. for route-based analytics or redirects.

### Nested layouts

`<Route>` is configuration only — it never renders. `<Routes>` reads the tree of
`<Route>` elements, matches the deepest one, and folds every ancestor's `element`
around it so each layout's `<Outlet />` renders its matched child.

```tsx
<Routes>
	<Route path="/" element={<Shell />}>
		<Route path="dashboard" element={<DashboardLayout />}>
			<Route path="" element={<DashboardHome />} />
			<Route path="settings" element={<DashboardSettings />} />
		</Route>
	</Route>
</Routes>
```

`<Outlet />` renders `null` where there's nothing nested — it's safe to include in
every layout unconditionally.

### Navigation

```tsx
import { Link, Navigate, useNavigate } from 'nanoroute'

<Link to="/users/7">User 7</Link>
<Link to="/users/7" replace state={{ from: 'list' }}>User 7</Link>
```

`<Link>` accepts every `<a>` prop (including `ref`) plus `to`, `replace`, and `state`.
Modified clicks (`Cmd`/`Ctrl`/`Shift`/`Alt`), a non-`_self` `target`, and cross-origin
URLs all fall through to normal browser navigation instead of being intercepted.

```tsx
const navigate = useNavigate()
navigate('/users/7')
navigate('/users/7', { replace: true, state: { from: 'list' } })
navigate(-1) // back one entry, like history.go(-1)
```

`<Navigate to="/login" />` redirects on mount (`replace` defaults to `true`, unlike
`<Link>`). For navigation outside of React — an error handler, a non-component module —
use the module-level `navigate(to, options)`, which targets the browser history
directly.

### Location, params & active links

```tsx
import { useLocation, useMatch, useParams } from 'nanoroute'

const { pathname, search, hash, state } = useLocation()
const { id } = useParams<{ id: string }>()
const isActive = useMatch('/users/:id') !== null // handy for active-link styling
```

### Search params

```tsx
import { useSearchParams } from 'nanoroute'

const [searchParams, setSearchParams] = useSearchParams()
const tab = searchParams.get('tab')

setSearchParams({ tab: 'settings' })                 // replaces the query string
setSearchParams((current) => {
	current.set('page', '2')
	return current
})
setSearchParams({ tab: 'settings' }, { replace: false }) // push instead of replace
```

The setter replaces the current history entry by default, so filter and pagination
controls don't flood back/forward history.

### History & testing

Swap the browser out for an in-memory history — for tests, embedded panes, previews,
or anywhere without a real address bar:

```tsx
import { MemoryRouter } from 'nanoroute'

render(
	<MemoryRouter initialEntries={['/users/9']}>
		<App />
	</MemoryRouter>,
)
```

Bring your own instance to drive and inspect it directly, e.g. from `node:test` or
Vitest:

```tsx
import { createMemoryHistory, Router } from 'nanoroute'

const history = createMemoryHistory({ initialEntries: ['/'] })
render(<Router history={history}><App /></Router>)

history.navigate('/users/7')
expect(history.entries).toEqual(['/', '/users/7'])
expect(history.index).toBe(1)
```

`createMemoryHistory` resolves relative targets (`'sub'`, `'?q=1'`, `'#top'`, `'../x'`)
against the current entry, truncates forward entries on push (like a real session), and
caps the stack at `maxEntries` (default `50`) so a long-lived router can't grow it
forever.

### Server-side rendering

```tsx
import { setServerUrl } from 'nanoroute'

setServerUrl(request.url) // once per request, before renderToString / renderToPipeableStream
```

On the client, the same snapshot is read from `window.location`, so hydration matches
without any extra setup on your part.

## API reference

| Export | Notes |
| --- | --- |
| `<Routes>` / `<Route>` | `path`, `element`, nested `children`. `<Route>` is config only. |
| `<Outlet />` | Renders the matched child route. |
| `<Link to>` | Plus `replace`, `state`, and every `<a>` prop including `ref`. Modified clicks, `target`, and cross-origin URLs fall through to the browser. |
| `<Navigate to>` | Redirects on mount; `replace` defaults to `true`. |
| `<Router history>` | Runs a subtree against any history. |
| `<MemoryRouter>` | `initialEntries`, `initialIndex`, `maxEntries`. |
| `useNavigate()` | `(to, { replace, state })`. `to` may be a delta: `navigate(-1)`. |
| `useLocation()` | `{ pathname, search, hash, state }`. |
| `useParams<T>()` | Params of the matched route. |
| `useSearchParams()` | `[URLSearchParams, setSearchParams]`; the setter replaces by default. |
| `useMatch(pattern)` | Params or `null` — handy for active links. |
| `useRouterHistory()` | The history driving this subtree. |
| `navigate(to, opts)` | Module-level, for use outside React. Targets the browser history. |
| `matchPath(pattern, pathname)` | Standalone matcher. |
| `createMemoryHistory` / `createBrowserHistory` / `setServerUrl` | History factories. |

All prop and return types (`LinkProps`, `RouterHistory`, `MemoryHistory`,
`RouteParams`, `SearchParamsUpdate`, …) are exported from `nanoroute` directly — no
`@types` package, no duplicated ambient types.

## TypeScript

`useParams` and `useMatch` are the two spots you'll usually reach for a generic:

```tsx
const { id } = useParams<{ id: string }>()

const params = useMatch('/files/*') // RouteParams | null
if (params) console.log(params['*']) // the wildcard capture
```

## FAQ

#### What is nanoroute?

nanoroute is a tiny, dependency-free client-side router for React 19+. It matches the
current URL against a tree of `<Route>` elements and renders the matched component,
with support for nested layouts, dynamic params, wildcards, search params, and a
memory history for tests.

#### Is nanoroute a good react-router alternative?

Yes, if you want URL-based rendering, nested layouts, and typed params without
adopting a data-loading framework. It is not a drop-in replacement — nanoroute has no
loaders, actions, or framework mode by design. See
[nanoroute vs. react-router](#nanoroute-vs-react-router).

#### Does nanoroute require a `<BrowserRouter>` provider?

No. `<Routes>` reads the browser URL by default with zero setup. Wrap in `<Router>` or
`<MemoryRouter>` only when you want to swap in a different history, e.g. in tests.

#### Does nanoroute support data loaders, actions, or SSR frameworks like Remix or Next.js?

No — that's explicitly out of scope; see
[Deliberately not included](#deliberately-not-included). nanoroute does support
server-side rendering itself via `setServerUrl`, and works fine as the client-side
router inside a custom SSR setup.

#### How do I test components that use nanoroute?

Render them inside `<MemoryRouter initialEntries={[...]}>`, or build a
`createMemoryHistory()` instance and pass it to `<Router history={...}>` to drive and
assert on navigation directly. See [History & testing](#history--testing).

#### What React version does nanoroute require?

React 19 or newer. nanoroute renders context providers directly (`<Context value={…}>`)
and passes `ref` as a plain prop, both React 19 features.

#### Is nanoroute CommonJS-compatible?

No, ESM only. CommonJS consumers need a bundler or `await import('nanoroute')`.

## Deliberately not included

Data loaders, lazy routes, scroll restoration, `basename`, hash history, relative
`<Routes>` nesting, and `NavLink` (use `useMatch` for active styling). Reach for
react-router if you need them.

## Notes

- ESM only. Consumers on CommonJS need a bundler or `await import()`.
- `useLocation().state` refreshes when the URL changes; a `replaceState` that only
  swaps `state` will not re-render on its own.

## Contributing

```sh
npm run lint       # eslint src
npm run typecheck  # tsc -p tsconfig.json
npm run test       # compiles with tsc, then runs node --test
npm run build      # tsup -> dist/
```

Issues and pull requests: [github.com/SheikhAminul/nanoroute](https://github.com/SheikhAminul/nanoroute).

## License

MIT © [Sheikh Aminul Islam](https://github.com/SheikhAminul)