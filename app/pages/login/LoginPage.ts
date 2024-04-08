import { Component } from '@/components';

export class LoginPage extends Component<'div'> {
  constructor() {
    super('div', { id: 'login-page' });
    this.setTextContent('Login Page');
  }
}
