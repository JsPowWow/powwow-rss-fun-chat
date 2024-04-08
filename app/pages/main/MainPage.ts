import { Component } from '@/components';

export class MainPage extends Component<'div'> {
  constructor() {
    super('div', { id: 'main-page' });
    this.setTextContent('Main Page');
  }
}
