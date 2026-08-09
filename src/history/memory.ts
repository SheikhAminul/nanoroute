import type { HistoryEntry, MemoryHistory, MemoryHistoryOptions } from '../types.js'

// Any absolute base works; only the path part of the result is kept.
const MEMORY_ORIGIN = 'http://memory.router'
const DEFAULT_MAX_ENTRIES = 50

const clamp = (value: number, max: number): number =>
	Math.min(Math.max(value, 0), Math.max(max, 0))

/** Resolves relative targets ("../x", "?q=1", "#top") against the current entry. */
const resolveMemoryUrl = (target: string, currentUrl: string): string => {
	const resolved = new URL(target, MEMORY_ORIGIN + currentUrl)
	return resolved.pathname + resolved.search + resolved.hash
}

/**
 * History kept in a plain array — nothing touches `window`. Use it for tests,
 * embedded views, and any environment without a real address bar.
 */
const createMemoryHistory = ({
	initialEntries = ['/'],
	initialIndex,
	maxEntries = DEFAULT_MAX_ENTRIES,
}: MemoryHistoryOptions = {}): MemoryHistory => {
	const entries: HistoryEntry[] = (
		initialEntries.length > 0 ? initialEntries : ['/']
	).map((url) => ({ url, state: null }))

	let index = clamp(initialIndex ?? entries.length - 1, entries.length - 1)

	const subscribers = new Set<() => void>()
	const notifySubscribers = (): void => {
		for (const listener of [...subscribers]) listener()
	}

	// The array is never empty, so the fallback is unreachable.
	const currentEntry = (): HistoryEntry => entries[index] ?? { url: '/', state: null }

	return {
		subscribe: (listener) => {
			subscribers.add(listener)
			return () => {
				subscribers.delete(listener)
			}
		},
		getUrl: () => currentEntry().url,
		getServerUrl: () => currentEntry().url,
		getState: () => currentEntry().state,
		navigate: (target, { replace = false, state = null } = {}) => {
			if (typeof target === 'number') {
				const nextIndex = clamp(index + target, entries.length - 1)
				if (nextIndex === index) return // already at the end of the stack
				index = nextIndex
			} else {
				const url = resolveMemoryUrl(target, currentEntry().url)
				if (replace) {
					entries[index] = { url, state }
				} else {
					entries.length = index + 1 // drop forward entries, like a real session
					entries.push({ url, state })
					// Bounded, so a long-lived router cannot grow the stack forever.
					if (entries.length > maxEntries) {
						entries.splice(0, entries.length - maxEntries)
					}
					index = entries.length - 1
				}
			}
			notifySubscribers()
		},
		get entries() {
			return entries.map((entry) => entry.url)
		},
		get index() {
			return index
		},
	}
}

export { createMemoryHistory }