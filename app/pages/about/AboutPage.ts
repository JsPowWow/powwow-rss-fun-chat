import { Component } from '@/components';

export class AboutPage extends Component<'div'> {
  constructor() {
    super('div', { id: 'about-page' });
    this.setTextContent('About Page');
  }
}
