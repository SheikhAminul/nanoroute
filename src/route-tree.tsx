import { Children, Fragment, isValidElement } from 'react'
import type { ReactNode } from 'react'
import { OutletContext } from './contexts.js'
import { compilePattern, matchCompiled } from './matching.js'
import type { FlattenedRoute, RouteMatch, RouteProps } from './types.js'

const joinPaths = (basePath: string, path: string): string =>
	`${basePath}/${path}`.replace(/\/{2,}/g, '/')

/** Turns the `<Route>` tree into a flat list, deepest routes first. */
const flattenRouteTree = (
	children: ReactNode,
	basePath = '',
	ancestorElements: ReactNode[] = [],
): FlattenedRoute[] => {
	const routes: FlattenedRoute[] = []

	Children.forEach(children, (child) => {
		if (!isValidElement<RouteProps>(child)) return

		if (child.type === Fragment) {
			routes.push(...flattenRouteTree(child.props.children, basePath, ancestorElements))
			return
		}

		const { path = '', element, children: nestedRoutes } = child.props
		const pattern = joinPaths(basePath, path)
		const elements = [...ancestorElements, element]

		if (nestedRoutes) routes.push(...flattenRouteTree(nestedRoutes, pattern, elements))
		routes.push({ pattern, compiled: compilePattern(pattern), elements })
	})

	return routes
}

/** Folds [Layout, Page] into a Layout whose `<Outlet />` yields Page. */
const buildNestedElement = (elements: ReactNode[]): ReactNode =>
	elements.reduceRight<ReactNode>(
		(outlet, element) =>
			element ? <OutletContext value={outlet}>{element}</OutletContext> : outlet,
		null,
	)

// Stable sort keeps declaration order (and index routes ahead of their layout)
// among equally specific patterns.
const byDescendingSpecificity = (a: FlattenedRoute, b: FlattenedRoute): number =>
	b.compiled.specificity - a.compiled.specificity

/** Static beats dynamic beats wildcard, whatever the declaration order. */
const buildRouteTable = (children: ReactNode): FlattenedRoute[] =>
	flattenRouteTree(children).sort(byDescendingSpecificity)

const findRouteMatch = (
	routes: FlattenedRoute[],
	pathname: string,
): RouteMatch | null => {
	for (const route of routes) {
		const params = matchCompiled(route.compiled, pathname)
		if (params) return { params, tree: buildNestedElement(route.elements) }
	}
	return null
}

export { buildRouteTable, findRouteMatch, flattenRouteTree }