import { useContext } from 'react'
import type { ReactNode } from 'react'
import { OutletContext } from '../contexts.js'

/** Renders the matched child route of the current route. */
const Outlet = (): ReactNode => useContext(OutletContext)

export { Outlet }