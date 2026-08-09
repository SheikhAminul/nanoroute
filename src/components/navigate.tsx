import { useEffect, useRef } from 'react'
import { useNavigate } from '../hooks/use-navigate.js'
import type { NavigateProps } from '../types.js'

/** Redirects on mount. */
const Navigate = ({ to, replace = true, state }: NavigateProps): null => {
	const navigate = useNavigate()

	// Kept in a ref so an inline `state` object cannot retrigger the redirect.
	// Written in an effect, never during render, and declared first so it is
	// already current by the time the redirect effect below runs.
	const stateRef = useRef(state)
	useEffect(() => {
		stateRef.current = state
	})

	useEffect(() => {
		navigate(to, { replace, state: stateRef.current })
	}, [navigate, to, replace])

	return null
}

export { Navigate }