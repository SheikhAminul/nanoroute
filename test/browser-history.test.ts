import assert from 'node:assert/strict'
import test from 'node:test'
import { createBrowserHistory } from '../src/history/browser.js'

type Listener = () => void

const installFakeWindow = () => {
	const listeners = new Map<string, Set<Listener>>()
	const location = { pathname: '/', search: '', hash: '', href: 'http://app.test/' }

	const applyUrl = (url: string): void => {
		const parsed = new URL(url, location.href)
		location.pathname = parsed.pathname
		location.search = parsed.search
		location.hash = parsed.hash
		location.href = parsed.href
	}

	const fakeWindow = {
		location,
		history: {
			state: null as unknown,
			go: () => { },
			pushState(state: unknown, _title: string, url: string) {
				applyUrl(url)
				this.state = state
			},
			replaceState(state: unknown, _title: string, url: string) {
				applyUrl(url)
				this.state = state
			},
		},
		addEventListener(type: string, listener: Listener) {
			let set = listeners.get(type)
			if (!set) {
				set = new Set()
				listeners.set(type, set)
			}
			set.add(listener)
		},
		removeEventListener(type: string, listener: Listener) {
			listeners.get(type)?.delete(listener)
		},
	}

	Object.defineProperty(globalThis, 'window', {
		value: fakeWindow,
		writable: true,
		configurable: true,
	})

	return {
		listenerCount: (type: string) => listeners.get(type)?.size ?? 0,
		dispatch: (type: string) => listeners.get(type)?.forEach((listener) => listener()),
	}
}

const dom = installFakeWindow()

test('listeners are attached on the first subscriber and removed on the last', () => {
	const history = createBrowserHistory()
	assert.equal(dom.listenerCount('popstate'), 0)

	const first = history.subscribe(() => { })
	const second = history.subscribe(() => { })
	assert.equal(dom.listenerCount('popstate'), 1, 'one shared listener, not one per subscriber')
	assert.equal(dom.listenerCount('hashchange'), 1)

	first()
	assert.equal(dom.listenerCount('popstate'), 1, 'still subscribed')

	second()
	assert.equal(dom.listenerCount('popstate'), 0, 'detached with the last subscriber')
	assert.equal(dom.listenerCount('hashchange'), 0)
})

test('resubscribing reattaches', () => {
	const history = createBrowserHistory()
	history.subscribe(() => { })()
	const again = history.subscribe(() => { })
	assert.equal(dom.listenerCount('popstate'), 1)
	again()
	assert.equal(dom.listenerCount('popstate'), 0)
})

test('navigate updates the url and notifies', () => {
	const history = createBrowserHistory()
	let notifications = 0
	const unsubscribe = history.subscribe(() => { notifications += 1 })

	history.navigate('/users/7?tab=a#top', { state: { from: 'test' } })
	assert.equal(history.getUrl(), '/users/7?tab=a#top')
	assert.deepEqual(history.getState(), { from: 'test' })
	assert.equal(notifications, 1)

	history.navigate('/replaced', { replace: true })
	assert.equal(history.getUrl(), '/replaced')
	assert.equal(notifications, 2)

	unsubscribe()
	assert.equal(dom.listenerCount('popstate'), 0)
})

test('popstate and hashchange both notify', () => {
	const history = createBrowserHistory()
	let notifications = 0
	const unsubscribe = history.subscribe(() => { notifications += 1 })

	dom.dispatch('popstate')
	dom.dispatch('hashchange')
	assert.equal(notifications, 2)

	unsubscribe()
	dom.dispatch('popstate')
	assert.equal(notifications, 2, 'no notifications after unmount')
})