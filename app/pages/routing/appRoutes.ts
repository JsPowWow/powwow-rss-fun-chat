import { findFirst } from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import type * as O from 'fp-ts/Option';

import type { ValueOf } from '@/utils';

export type AppPagePath = ValueOf<typeof AppPath>;

export const AppPath = {
  root: '/',
  login: '/login',
  about: '/about',
  chat: '/chat',
} as const;

export const appRoutes = {
  homePage: {
    label: 'Home',
    pathName: AppPath.root,
  },
  loginPage: {
    label: 'Login',
    pathName: AppPath.login,
  },
  aboutPage: {
    label: 'About',
    pathName: AppPath.about,
  },
  chatPage: {
    label: 'Chat',
    pathName: AppPath.chat,
  },
} as const satisfies Record<string, { pathName: AppPagePath; label: string }>;

const isAppPagePath =
  (path: string) =>
  <Path extends AppPagePath>(p: Path): boolean =>
    p === path;

export const getAppPagePath = (pathName: string): O.Option<AppPagePath> =>
  pipe(Object.values(AppPath), findFirst(isAppPagePath(pathName)));

export const pushHistoryState = (path: AppPagePath): void => {
  window.history.pushState({}, '', path);
};
