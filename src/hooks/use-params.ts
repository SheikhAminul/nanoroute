import { useContext } from 'react';
import { RouteParamsContext } from '../contexts.js';
import type { RouteParams } from '../types.js';

const useParams = <Params extends RouteParams = RouteParams>(): Params =>
  useContext(RouteParamsContext) as Params;

export { useParams };
