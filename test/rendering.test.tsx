import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactElement } from 'react'
import {
	createMemoryHistory,
	MemoryRouter,
	Outlet,
	Route,
	Router,
	Routes,
	setServerUrl,
	useLocation,
	useMatch,
	useParams,
} from '../src/index.js'

const Shell = () => <div>shell[<Outlet />]</div>
const Home = () => <span>home</span>
const NewUser = () => <span>new-user</span>
const User = () => <span>user:{useParams<{ id: string }>().id}</span>
const Active = () => <span>active:{String(Boolean(useMatch('/users/:id')))}</span>
const Files = () => <span>files:{useParams()['*']}</span>
const Query = () => <span>q:{useLocation().search}|s:{String(useLocation().state)}</span>
const Missing = () => <span>404</span>

const App = (): ReactElement => (
	<Routes>
		<Route path="/" element={<Shell />}>
			<Route path="" element={<Home />} />
			<Route path="users/:id" element={<><User /><Active /></>} />
			<Route path="users/new" element={<NewUser />} />
			<Route path="files/*" element={<Files />} />
			<Route path="q" element={<Query />} />
		</Route>
		<Route path="*" element={<Missing />} />
	</Routes>
)

const renderAt = (url: string): string => {
	setServerUrl(url)
	return renderToStaticMarkup(<App />)
}

test('index route wins over the catch-all', () => {
	assert.equal(renderAt('/'), '<div>shell[<span>home</span>]</div>')
})

test('nested layout renders through Outlet', () => {
	assert.equal(
		renderAt('/users/7'),
		'<div>shell[<span>user:7</span><span>active:true</span>]</div>',
	)
})

test('static segments outrank dynamic ones regardless of order', () => {
	assert.equal(renderAt('/users/new'), '<div>shell[<span>new-user</span>]</div>')
})

test('wildcards and catch-all', () => {
	assert.equal(renderAt('/files/a/b.txt'), '<div>shell[<span>files:a/b.txt</span>]</div>')
	assert.equal(renderAt('/files'), '<div>shell[<span>files:</span>]</div>')
	assert.equal(renderAt('/nope/deep'), '<span>404</span>')
})

test('query strings do not affect matching', () => {
	assert.equal(renderAt('/q?tab=a'), '<div>shell[<span>q:?tab=a|s:null</span>]</div>')
})

test('MemoryRouter renders its own entry, ignoring the server url', () => {
	setServerUrl('/users/1')
	assert.equal(
		renderToStaticMarkup(
			<MemoryRouter initialEntries={['/files/x']}>
				<App />
			</MemoryRouter>,
		),
		'<div>shell[<span>files:x</span>]</div>',
	)
})

test('MemoryRouter honours initialIndex', () => {
	assert.equal(
		renderToStaticMarkup(
			<MemoryRouter initialEntries={['/', '/users/2']} initialIndex={0}>
				<App />
			</MemoryRouter>,
		),
		'<div>shell[<span>home</span>]</div>',
	)
})

test('an external history can be inspected after navigating', () => {
	const history = createMemoryHistory({ initialEntries: ['/'] })
	assert.equal(
		renderToStaticMarkup(<Router history={history}><App /></Router>),
		'<div>shell[<span>home</span>]</div>',
	)
	history.navigate('/users/7')
	assert.deepEqual(history.entries, ['/', '/users/7'])
	assert.equal(
		renderToStaticMarkup(<Router history={history}><App /></Router>),
		'<div>shell[<span>user:7</span><span>active:true</span>]</div>',
	)
})

test('fragments in the route tree are flattened', () => {
	const Wrapped = () => (
		<Routes>
			<>
				<Route path="/a" element={<span>a</span>} />
				<Route path="/b" element={<span>b</span>} />
			</>
		</Routes>
	)
	assert.equal(
		renderToStaticMarkup(<MemoryRouter initialEntries={['/b']}><Wrapped /></MemoryRouter>),
		'<span>b</span>',
	)
})

test('no match renders nothing', () => {
	const Empty = () => (
		<Routes>
			<Route path="/only" element={<span>only</span>} />
		</Routes>
	)
	assert.equal(
		renderToStaticMarkup(<MemoryRouter initialEntries={['/other']}><Empty /></MemoryRouter>),
		'',
	)
})