import { useContext } from 'react';
import { HistoryContext } from '../contexts.js';
import type { RouterHistory } from '../types.js';

/** The history driving this subtree — the browser one unless a `<Router>` overrides it. */
const useRouterHistory = (): RouterHistory => useContext(HistoryContext);

export { useRouterHistory };
