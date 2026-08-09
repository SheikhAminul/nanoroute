import assert from 'node:assert/strict'
import test from 'node:test'
import { matchPath } from '../src/matching.js'

test('static and dynamic segments', () => {
	assert.deepEqual(matchPath('/users/:id', '/users/7'), { id: '7' })
	assert.deepEqual(matchPath('/users/:id', '/users/7/'), { id: '7' })
	assert.equal(matchPath('/users/:id', '/users'), null)
	assert.equal(matchPath('/users/:id', '/users/7/posts'), null)
	assert.deepEqual(matchPath('/', '/'), {})
	assert.deepEqual(matchPath('/', ''), {})
})

test('wildcards', () => {
	assert.deepEqual(matchPath('/files/*', '/files/a/b.txt'), { '*': 'a/b.txt' })
	assert.deepEqual(matchPath('/files/*', '/files'), { '*': '' })
	assert.deepEqual(matchPath('/*', '/anything/deep'), { '*': 'anything/deep' })
	assert.deepEqual(matchPath('/*', '/'), { '*': '' })
})

test('regex metacharacters are literal', () => {
	assert.equal(matchPath('/a.b', '/axb'), null)
	assert.deepEqual(matchPath('/a.b', '/a.b'), {})
	assert.deepEqual(matchPath('/c++', '/c++'), {})
})

test('decoding never throws', () => {
	assert.deepEqual(matchPath('/users/:id', '/users/a%20b'), { id: 'a b' })
	assert.deepEqual(matchPath('/users/:id', '/users/%'), { id: '%' })
	assert.deepEqual(matchPath('/users/:id', '/users/%E4%B8%AD'), { id: '中' })
})

test('pattern cache eviction keeps results correct', () => {
	for (let index = 0; index < 400; index += 1) matchPath(`/generated/${index}/:x`, '/')
	assert.deepEqual(matchPath('/users/:id', '/users/7'), { id: '7' })
	assert.deepEqual(matchPath('/generated/0/:x', '/generated/0/y'), { x: 'y' })
})