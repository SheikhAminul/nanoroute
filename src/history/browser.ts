import type { RouterHistory } from '../types.js'

// `hashchange` matters too: clicking a plain `<a href="#section">` moves the
// hash without emitting `popstate`.
const HISTORY_EVENTS = ['popstate', 'hashchange'] as const

let serverUrl = '/'

/** Set the requested URL before rendering on the server. */
const setServerUrl = (url: string): void => {
	serverUrl = url
}

/**
 * Reads and writes `window.history`. Creating one touches no globals, so this
 * is safe to call while rendering on the server.
 */
const createBrowserHistory = (): RouterHistory => {
	const subscribers = new Set<() => void>()

	const notifySubscribers = (): void => {
		// Iterate a copy: a subscriber may unsubscribe (or resubscribe) while running.
		for (const listener of [...subscribers]) listener()
	}

	// A primitive string, so React can compare snapshots without tearing.
	const readUrl = (): string =>
		window.location.pathname + window.location.search + window.location.hash

	return {
		// Listeners exist only while at least one component is mounted: attached on
		// the first subscriber, removed on the last.
		subscribe: (listener) => {
			if (subscribers.size === 0) {
				for (const event of HISTORY_EVENTS) {
					window.addEventListener(event, notifySubscribers)
				}
			}
			subscribers.add(listener)

			return () => {
				subscribers.delete(listener)
				if (subscribers.size > 0) return
				for (const event of HISTORY_EVENTS) {
					window.removeEventListener(event, notifySubscribers)
				}
			}
		},
		getUrl: readUrl,
		// Also used for the hydration render, where the browser URL is the requested
		// URL and therefore matches the server-rendered markup.
		getServerUrl: () => (typeof window === 'undefined' ? serverUrl : readUrl()),
		getState: () => (typeof window === 'undefined' ? null : window.history.state),
		navigate: (target, { replace = false, state = null } = {}) => {
			if (typeof target === 'number') {
				window.history.go(target)
				return
			}
			window.history[replace ? 'replaceState' : 'pushState'](state, '', target)
			notifySubscribers()
		},
	}
}

/** The history used when no `<Router>` is present. */
const browserHistory = createBrowserHistory()

/** Navigates the browser history from outside React. Needs a DOM. */
const navigate = browserHistory.navigate

export { browserHistory, createBrowserHistory, navigate, setServerUrl }