import { createContext } from 'react'
import type { ReactNode } from 'react'
import { browserHistory } from './history/browser.js'
import type { RouteParams, RouterHistory } from './types.js'

/** Defaults to the browser, so a plain app needs no provider at all. */
const HistoryContext = createContext<RouterHistory>(browserHistory)

const RouteParamsContext = createContext<RouteParams>({})

const OutletContext = createContext<ReactNode>(null)

export { HistoryContext, OutletContext, RouteParamsContext }