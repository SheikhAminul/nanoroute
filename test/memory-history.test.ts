import assert from 'node:assert/strict'
import test from 'node:test'
import { createMemoryHistory } from '../src/history/memory.js'

test('defaults to a single root entry', () => {
	const history = createMemoryHistory()
	assert.equal(history.getUrl(), '/')
	assert.deepEqual(history.entries, ['/'])
	assert.equal(history.index, 0)
})

test('push, replace and forward truncation', () => {
	const history = createMemoryHistory({ initialEntries: ['/a'] })
	history.navigate('/b')
	history.navigate('/c', { state: { n: 1 } })
	assert.deepEqual(history.entries, ['/a', '/b', '/c'])
	assert.deepEqual(history.getState(), { n: 1 })

	history.navigate(-1)
	history.navigate('/d')
	assert.deepEqual(history.entries, ['/a', '/b', '/d'])

	history.navigate('/e', { replace: true })
	assert.deepEqual(history.entries, ['/a', '/b', '/e'])
	assert.equal(history.index, 2)
})

test('deltas clamp and no-ops stay silent', () => {
	const history = createMemoryHistory({ initialEntries: ['/a', '/b', '/c'] })
	let notifications = 0
	history.subscribe(() => { notifications += 1 })

	history.navigate(-99)
	assert.equal(history.getUrl(), '/a')
	history.navigate(99)
	assert.equal(history.getUrl(), '/c')
	assert.equal(notifications, 2)

	history.navigate(1) // already at the end
	assert.equal(notifications, 2)
})

test('initialIndex selects the starting entry', () => {
	assert.equal(createMemoryHistory({ initialEntries: ['/a', '/b'], initialIndex: 0 }).getUrl(), '/a')
	assert.equal(createMemoryHistory({ initialEntries: ['/a', '/b'], initialIndex: 99 }).getUrl(), '/b')
	assert.equal(createMemoryHistory({ initialEntries: [] }).getUrl(), '/')
})

test('relative targets resolve against the current entry', () => {
	const history = createMemoryHistory({ initialEntries: ['/docs/intro'] })
	history.navigate('setup')
	assert.equal(history.getUrl(), '/docs/setup')
	history.navigate('?q=1')
	assert.equal(history.getUrl(), '/docs/setup?q=1')
	history.navigate('#top')
	assert.equal(history.getUrl(), '/docs/setup?q=1#top')
	history.navigate('../guide')
	assert.equal(history.getUrl(), '/guide')
})

test('the stack is bounded and drops old state', () => {
	const history = createMemoryHistory({ initialEntries: ['/0'], maxEntries: 3 })
	for (const step of [1, 2, 3, 4]) history.navigate(`/${step}`, { state: { step } })
	assert.deepEqual(history.entries, ['/2', '/3', '/4'])
	assert.equal(history.index, 2)
})

test('unsubscribing stops notifications', () => {
	const history = createMemoryHistory()
	let notifications = 0
	const unsubscribe = history.subscribe(() => { notifications += 1 })
	history.navigate('/a')
	unsubscribe()
	history.navigate('/b')
	assert.equal(notifications, 1)
})

test('a listener may unsubscribe while being notified', () => {
	const history = createMemoryHistory()
	const seen: string[] = []
	const first = history.subscribe(() => { seen.push('first'); first() })
	history.subscribe(() => { seen.push('second') })
	history.navigate('/a')
	history.navigate('/b')
	assert.deepEqual(seen, ['first', 'second', 'second'])
})

test('instances are isolated', () => {
	const a = createMemoryHistory({ initialEntries: ['/a'] })
	const b = createMemoryHistory({ initialEntries: ['/b'] })
	a.navigate('/changed')
	assert.equal(b.getUrl(), '/b')
})