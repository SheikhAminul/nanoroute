import { useMemo } from 'react'
import type { ReactElement } from 'react'
import { RouteParamsContext } from '../contexts.js'
import { useLocation } from '../hooks/use-location.js'
import { buildRouteTable, findRouteMatch } from '../route-tree.js'
import type { RouteProps, RoutesProps } from '../types.js'

/** Configuration only — `<Routes>` reads these props and never renders it. */
const Route: (props: RouteProps) => null = () => null

// Both memos wrap a single call whose arguments are exactly the dependencies,
// which is the shape React Compiler can carry through to its output. Loops and
// early returns inside a useMemo body make it bail out instead.
const Routes = ({ children }: RoutesProps): ReactElement | null => {
	const { pathname } = useLocation()
	const routes = useMemo(() => buildRouteTable(children), [children])
	const match = useMemo(() => findRouteMatch(routes, pathname), [routes, pathname])

	if (!match) return null
	return <RouteParamsContext value={match.params}>{match.tree}</RouteParamsContext>
}

export { Route, Routes }