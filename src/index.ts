export { Link } from './components/link.js'
export { Navigate } from './components/navigate.js'
export { Outlet } from './components/outlet.js'
export { MemoryRouter, Router } from './components/router.js'
export { Route, Routes } from './components/routes.js'
export {
	browserHistory,
	createBrowserHistory,
	navigate,
	setServerUrl,
} from './history/browser.js'
export { createMemoryHistory } from './history/memory.js'
export { useLocation } from './hooks/use-location.js'
export { useMatch } from './hooks/use-match.js'
export { useNavigate } from './hooks/use-navigate.js'
export { useParams } from './hooks/use-params.js'
export { useRouterHistory } from './hooks/use-router-history.js'
export { useSearchParams } from './hooks/use-search-params.js'
export { matchPath } from './matching.js'

export type {
	LinkProps,
	MemoryHistory,
	MemoryHistoryOptions,
	MemoryRouterProps,
	NavigateFunction,
	NavigateProps,
	NavigationOptions,
	NavigationTarget,
	RouteParams,
	RouteProps,
	RouterHistory,
	RouterLocation,
	RouterProps,
	RoutesProps,
	SearchParamsInput,
	SearchParamsUpdate,
	SetSearchParams,
} from './types.js'