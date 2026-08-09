import assert from 'node:assert/strict'
import test from 'node:test'
import { createStaticHistory } from '../src/history/static.js'

test('reports the frozen url and empty state', () => {
	const history = createStaticHistory('/users/7?tab=a')
	assert.equal(history.getUrl(), '/users/7?tab=a')
	assert.equal(history.getServerUrl(), '/users/7?tab=a')
	assert.equal(history.getState(), null)
})

test('navigate and subscribe are no-ops', () => {
	const history = createStaticHistory('/a')
	let notifications = 0
	const unsubscribe = history.subscribe(() => { notifications += 1 })

	history.navigate('/b')
	assert.equal(history.getUrl(), '/a', 'the url never changes')
	assert.equal(notifications, 0)

	unsubscribe()
})

test('instances are isolated, unlike setServerUrl', () => {
	const a = createStaticHistory('/a')
	const b = createStaticHistory('/b')
	assert.equal(a.getUrl(), '/a')
	assert.equal(b.getUrl(), '/b')
})