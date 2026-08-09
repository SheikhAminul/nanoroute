import type { RouterHistory } from '../types.js'

const noop = (): void => { }

/**
 * A history frozen to one URL, isolated per call — unlike `setServerUrl`, safe
 * under concurrent requests (streaming SSR, or any runtime that reuses a module
 * scope across requests), since nothing is shared between calls.
 */
const createStaticHistory = (url: string): RouterHistory => ({
	subscribe: () => noop,
	getUrl: () => url,
	getServerUrl: () => url,
	getState: () => null,
	navigate: noop,
})

export { createStaticHistory }