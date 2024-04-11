import { flow } from 'fp-ts/function';
import * as O from 'fp-ts/Option';

import type { ValueOf } from '@/utils';

export type AppPagePath = ValueOf<typeof AppPath>;
export type AppNoCredsRequiredPath = ValueOf<Pick<typeof AppPath, 'login' | 'about'>>;

export const AppPath = {
  root: '/',
  login: '/login',
  about: '/about',
  chat: '/chat',
} as const;
const AUTH_NOT_REQUIRED: Array<AppNoCredsRequiredPath> = [AppPath.about, AppPath.login];

export const isNotCredsRequiredPath = (pathName: string): pathName is AppNoCredsRequiredPath =>
  AUTH_NOT_REQUIRED.some((p) => p === pathName);

export const getAppPageSafePath: () => O.Option<AppNoCredsRequiredPath> = flow(
  () => window.location.pathname,
  O.fromPredicate(isNotCredsRequiredPath),
);

export const pushHistoryState = (path: AppPagePath): void => {
  window.history.pushState({}, '', path);
};
