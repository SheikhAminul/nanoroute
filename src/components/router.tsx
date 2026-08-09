import { useState } from 'react'
import type { ReactElement } from 'react'
import { HistoryContext } from '../contexts.js'
import { createMemoryHistory } from '../history/memory.js'
import type { MemoryRouterProps, RouterProps } from '../types.js'

/** Runs the subtree against any history. Omit it entirely to use the browser. */
const Router = ({ history, children }: RouterProps): ReactElement => (
	<HistoryContext value={history}>{children}</HistoryContext>
)

/** Routes in memory, leaving the address bar untouched. */
const MemoryRouter = ({ children, ...options }: MemoryRouterProps): ReactElement => {
	// Created once per mount; later prop changes are ignored, as in a real session.
	const [history] = useState(() => createMemoryHistory(options))
	return <Router history={history}>{children}</Router>
}

export { MemoryRouter, Router }