import { matchPath } from '../matching.js';
import { useLocation } from './use-location.js';
import type { RouteParams } from '../types.js';

/** Params when the current pathname matches the pattern, otherwise `null`. */
const useMatch = (pattern: string): RouteParams | null => {
  const { pathname } = useLocation();
  return matchPath(pattern, pathname);
};

export { useMatch };
