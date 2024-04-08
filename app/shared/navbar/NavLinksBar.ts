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
