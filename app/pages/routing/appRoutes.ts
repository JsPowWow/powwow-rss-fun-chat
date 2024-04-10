import { findFirst } from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';

import type { ValueOf } from '@/utils';

export type AppPagePath = ValueOf<typeof AppPath>;

export const AppPath = {
  root: '/',
  login: '/login',
  about: '/about',
  chat: '/chat',
} as const;

export type AppNoAuthRequirePath = ValueOf<Pick<typeof AppPath, 'login' | 'about'>>;
const AUTH_NOT_REQUIRED: Array<AppNoAuthRequirePath> = [AppPath.about, AppPath.login];

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

export const getAppPageFrom = (pathName: string): E.Either<null, AppPagePath> =>
  pipe(
    pathName,
    getAppPagePath,
    O.match(
      () => E.left(null),
      (p) => E.right(p),
    ),
  );

export const isNotRequiredToAuthPath = (pathName: string): pathName is AppNoAuthRequirePath =>
  AUTH_NOT_REQUIRED.some((p) => p === pathName);

export const getAppPageSafePath: () => O.Option<AppNoAuthRequirePath> = flow(
  () => window.location.pathname,
  O.fromPredicate(isNotRequiredToAuthPath),
);

export const pushHistoryState = (path: AppPagePath): void => {
  window.history.pushState({}, '', path);
};
