import type { CompiledPattern, RouteParams } from './types.js'

const WILDCARD_SEGMENT = '*'
const STATIC_SEGMENT_SCORE = 8
const DYNAMIC_SEGMENT_SCORE = 4
// A penalty, not a reward: "/*" must rank below "/", which scores nothing at all.
const WILDCARD_SEGMENT_PENALTY = -2
const MAX_CACHED_PATTERNS = 256

const patternCache = new Map<string, CompiledPattern>()

const escapeRegExp = (value: string): string =>
	value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Bounded cache, so dynamically built patterns cannot grow it forever. */
const cachePattern = (pattern: string, compiled: CompiledPattern): void => {
	if (patternCache.size >= MAX_CACHED_PATTERNS) {
		const oldest = patternCache.keys().next().value
		if (oldest !== undefined) patternCache.delete(oldest)
	}
	patternCache.set(pattern, compiled)
}

const compilePattern = (pattern: string): CompiledPattern => {
	const cached = patternCache.get(pattern)
	if (cached) return cached

	const paramNames: string[] = []
	let source = ''
	let specificity = 0

	for (const segment of pattern.split('/')) {
		if (!segment) continue

		if (segment === WILDCARD_SEGMENT) {
			paramNames.push(WILDCARD_SEGMENT)
			source += '(?:/(.*))?' // "/files/*" also matches "/files"
			specificity += WILDCARD_SEGMENT_PENALTY
		} else if (segment.startsWith(':')) {
			paramNames.push(segment.slice(1))
			source += '/([^/]+)'
			specificity += DYNAMIC_SEGMENT_SCORE
		} else {
			source += `/${escapeRegExp(segment)}`
			specificity += STATIC_SEGMENT_SCORE
		}
	}

	const compiled: CompiledPattern = {
		matcher: new RegExp(`^${source}/?$`, 'i'),
		paramNames,
		specificity,
	}
	cachePattern(pattern, compiled)
	return compiled
}

// A malformed escape such as "/users/%" must not throw during render.
const decodeSegment = (value: string | undefined): string => {
	if (!value) return ''
	try {
		return decodeURIComponent(value)
	} catch {
		return value
	}
}

/** Matching hot path: no cache lookup, the route table holds its own patterns. */
const matchCompiled = (
	{ matcher, paramNames }: CompiledPattern,
	pathname: string,
): RouteParams | null => {
	const captures = matcher.exec(pathname)
	if (!captures) return null

	const params: RouteParams = {}
	paramNames.forEach((name, position) => {
		params[name] = decodeSegment(captures[position + 1])
	})
	return params
}

/** Returns the captured params, or `null` when the pathname does not match. */
const matchPath = (pattern: string, pathname: string): RouteParams | null =>
	matchCompiled(compilePattern(pattern), pathname)

export { compilePattern, matchCompiled, matchPath }