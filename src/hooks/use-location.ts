import { useMemo, useSyncExternalStore } from 'react';
import { useRouterHistory } from './use-router-history.js';
import type { RouterHistory, RouterLocation } from '../types.js';

const readLocation = (history: RouterHistory, url: string): RouterLocation => {
  const hashIndex = url.indexOf('#');
  const hash = hashIndex < 0 ? '' : url.slice(hashIndex);
  const withoutHash = hashIndex < 0 ? url : url.slice(0, hashIndex);
  const searchIndex = withoutHash.indexOf('?');

  return {
    pathname: searchIndex < 0 ? withoutHash : withoutHash.slice(0, searchIndex),
    search: searchIndex < 0 ? '' : withoutHash.slice(searchIndex),
    hash,
    state: history.getState(),
  };
};

const useLocation = (): RouterLocation => {
  const history = useRouterHistory();
  const url = useSyncExternalStore(
    history.subscribe,
    history.getUrl,
    history.getServerUrl,
  );
  // A single call whose arguments are exactly the dependencies — the shape
  // React Compiler can carry through to its output.
  return useMemo(() => readLocation(history, url), [history, url]);
};

export { useLocation };
