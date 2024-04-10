import { Component } from '@/components';

import classes from './AboutPage.module.css';

export class AboutPage extends Component<'div'> {
  public static ID = 'about-page';

  public static create = (): AboutPage => new AboutPage();

  constructor() {
    super('div', { id: AboutPage.ID });
    this.setTextContent('About Page');
    this.toggleClass(classes.aboutPage);
  }
}
