import type { ComponentPropsWithRef, ReactNode } from 'react'

/* ─── location & navigation ─────────────────────────────────────────────── */

type RouteParams = Record<string, string>

interface RouterLocation {
  pathname: string
  search: string
  hash: string
  state: unknown
}

interface NavigationOptions {
  /** Overwrite the current entry instead of pushing a new one. */
  replace?: boolean
  /** Arbitrary value stored on the history entry. */
  state?: unknown
}

/** A path, or a history delta: `navigate(-1)` goes back. */
type NavigationTarget = string | number

type NavigateFunction = (target: NavigationTarget, options?: NavigationOptions) => void

/* ─── history ───────────────────────────────────────────────────────────── */

/** Everything the hooks need from a history implementation. */
interface RouterHistory {
  subscribe: (listener: () => void) => () => void
  getUrl: () => string
  getServerUrl: () => string
  getState: () => unknown
  navigate: NavigateFunction
}

interface MemoryHistory extends RouterHistory {
  /** Visited URLs, oldest first — useful for assertions in tests. */
  readonly entries: readonly string[]
  /** Position of the current entry in `entries`. */
  readonly index: number
}

interface MemoryHistoryOptions {
  initialEntries?: string[]
  /** Defaults to the last entry. */
  initialIndex?: number
  /** Oldest entries are dropped past this, like a real session history. */
  maxEntries?: number
}

interface HistoryEntry {
  url: string
  state: unknown
}

/* ─── components ────────────────────────────────────────────────────────── */

interface RouterProps {
  history: RouterHistory
  children: ReactNode
}

interface MemoryRouterProps extends MemoryHistoryOptions {
  children: ReactNode
}

interface RouteProps {
  /** Pattern relative to the parent route. `":id"` captures, `"*"` matches the rest. */
  path?: string
  element?: ReactNode
  /** Nested `<Route>` elements, rendered through `<Outlet />`. */
  children?: ReactNode
}

interface RoutesProps {
  children: ReactNode
}

type LinkProps = Omit<ComponentPropsWithRef<'a'>, 'href'> & {
  to: string
  replace?: boolean
  state?: unknown
}

interface NavigateProps {
  to: string
  replace?: boolean
  state?: unknown
}

/* ─── search params ─────────────────────────────────────────────────────── */

type SearchParamsInput = ConstructorParameters<typeof URLSearchParams>[0]

type SearchParamsUpdate =
  | SearchParamsInput
  | ((current: URLSearchParams) => SearchParamsInput)

type SetSearchParams = (
  update: SearchParamsUpdate,
  options?: NavigationOptions,
) => void

/* ─── internal ──────────────────────────────────────────────────────────── */

interface CompiledPattern {
  matcher: RegExp
  paramNames: string[]
  specificity: number
}

interface FlattenedRoute {
  pattern: string
  compiled: CompiledPattern
  /** Outermost element first; folded into nested `<Outlet />` providers. */
  elements: ReactNode[]
}

interface RouteMatch {
  params: RouteParams
  tree: ReactNode
}

export type {
  CompiledPattern,
  FlattenedRoute,
  HistoryEntry,
  LinkProps,
  MemoryHistory,
  MemoryHistoryOptions,
  MemoryRouterProps,
  NavigateFunction,
  NavigateProps,
  NavigationOptions,
  NavigationTarget,
  RouteMatch,
  RouteParams,
  RouteProps,
  RouterHistory,
  RouterLocation,
  RouterProps,
  RoutesProps,
  SearchParamsInput,
  SearchParamsUpdate,
  SetSearchParams,
}