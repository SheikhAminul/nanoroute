import { useCallback, useMemo } from 'react';
import { useLocation } from './use-location.js';
import { useNavigate } from './use-navigate.js';
import type {
  NavigationOptions,
  RouterLocation,
  SearchParamsUpdate,
  SetSearchParams,
} from '../types.js';

const buildSearchUrl = (location: RouterLocation, update: SearchParamsUpdate): string => {
  const resolved =
    typeof update === 'function' ? update(new URLSearchParams(location.search)) : update;
  const query = new URLSearchParams(resolved).toString();
  return location.pathname + (query && `?${query}`) + location.hash;
};

const useSearchParams = (): [URLSearchParams, SetSearchParams] => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  // Defaults to `replace` so filter and pagination controls do not flood history.
  const setSearchParams = useCallback(
    (update: SearchParamsUpdate, options?: NavigationOptions) =>
      navigate(buildSearchUrl(location, update), { replace: true, ...options }),
    [navigate, location],
  );

  return [searchParams, setSearchParams];
};

export { useSearchParams };
