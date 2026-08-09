import { useRouterHistory } from './use-router-history.js';
import type { NavigateFunction } from '../types.js';

/** Stable per history, so it is safe in dependency arrays. */
const useNavigate = (): NavigateFunction => useRouterHistory().navigate;

export { useNavigate };
