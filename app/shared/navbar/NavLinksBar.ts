import { Component } from '@/components';
import { isInstanceOf, isSomeFunction } from '@/utils';

import classes from './NavLinksBar.module.css';

type NavLinkClickCallback = (route: string) => void;

export class NavLinksBar extends Component<'nav'> {
  private readonly onLinkClick?: NavLinkClickCallback;

  constructor(onLinkClick?: NavLinkClickCallback) {
    super('nav', { id: 'nav-bar' });
    this.onLinkClick = onLinkClick;
    this.toggleClass(classes.navbar);
    this.element.addEventListener('click', this.handleNavLinkClick);
  }

  public render(routes: Array<{ pathName: string; label: string }>): typeof this {
    this.destroyChildren();

    routes.forEach(({ pathName, label }) => {
      const link = new Component('a');
      link.setTextContent(label).toggleClass(classes.navLink).setProps({
        href: pathName,
      });
      this.appendChild(link);
    });
    return this;
  }

  private handleNavLinkClick = (e: Event): void => {
    if (isInstanceOf(HTMLAnchorElement, e.target)) {
      e.preventDefault();
      if (isSomeFunction(this.onLinkClick)) {
        this.onLinkClick(e.target.pathname);
      }
    }
  };
}

// const navBar = new NavLinksBar(this.handleNavBarLinkClick);
// this.root.appendChild(navBar.element);
// navBar.render(Object.values(appRoutes).map((route) => ({ ...route })));
// const { pathname } = window.location;
// const { chatPage, loginPage, homePage, aboutPage } = appRoutes;

// match(pathname)
//   .with(homePage.pathName, flow(this.authorize, this.showChatPage))
//   .with(loginPage.pathName, flow(this.authorize, this.showLoginPage))
//   .with(aboutPage.pathName, flow(this.authorize, this.showAboutPage))
//   .with(chatPage.pathName, flow(this.authorize, this.showChatPage))
//   .otherwise(flow(this.authorize, this.showChatPage));
// ...
// ...
// private handleNavBarLinkClick = (_pathName: string): void => {
//   // pipe(getAppPagePath(`${pathName}`), fold(this.log(`The "${pathName}" path not found.`, 'warn'), this.navigate));
// };
//
