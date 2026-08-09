import type { MouseEvent as ReactMouseEvent, ReactElement } from 'react'
import { useNavigate } from '../hooks/use-navigate.js'
import type { LinkProps } from '../types.js'

const isPlainLeftClick = (
	event: ReactMouseEvent<HTMLAnchorElement>,
	target?: string,
): boolean =>
	!event.defaultPrevented &&
	event.button === 0 &&
	!(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) &&
	(!target || target === '_self')

const isInternalHref = (to: string): boolean => {
	if (typeof window === 'undefined') return true
	try {
		return new URL(to, window.location.href).origin === window.location.origin
	} catch {
		return false
	}
}

const Link = ({
	to,
	replace,
	state,
	onClick,
	target,
	...anchorProps
}: LinkProps): ReactElement => {
	const navigate = useNavigate()

	return (
		<a
			{...anchorProps}
			href={to}
			target={target}
			onClick={(event) => {
				onClick?.(event)
				if (!isPlainLeftClick(event, target) || !isInternalHref(to)) return
				event.preventDefault()
				navigate(to, { replace, state })
			}}
		/>
	)
}

export { Link }