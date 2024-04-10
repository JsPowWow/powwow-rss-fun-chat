import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

import type { UserAuthData } from '@/api/auth.ts';
import { validateUserInput } from '@/api/auth.ts';
import { Component } from '@/components';
import { noop } from '@/utils';

import classes from './LoginPage.module.css';

export type LoginPageProps = {
  onSubmit?: (userData: UserAuthData) => void;
  initUserName?: string;
};
export class LoginPage extends Component<'div'> {
  public static ID = 'login-page';

  private readonly form: Component<'form'>;

  private readonly props?: LoginPageProps;

  public static create = (props?: LoginPageProps): LoginPage => new LoginPage(props);

  constructor(props?: LoginPageProps) {
    super('div', { id: LoginPage.ID, className: classes.center });
    this.props = props;
    this.form = this.createForm();
    this.appendChildren([new Component('h1').setTextContent('Welcome'), this.form]);
    this.form.element.addEventListener('submit', this.handleFormSubmit);
  }

  private handleFormSubmit = (e: SubmitEvent): void => {
    e.preventDefault();
    const formData = new FormData(this.form.element, e.submitter);
    // const text = formData.get('username');

    pipe(
      { username: formData.get('username'), password: formData.get('userpwd') },
      validateUserInput,
      E.fold(noop, (userData) => {
        this.props?.onSubmit?.(userData);
      }),
    );
  };

  private createForm(): Component<'form'> {
    return new Component(
      'form',
      { id: 'fun-chat-login-form' },
      new Component(
        'div',
        { className: classes.txt_field },
        new Component('input').setProps({
          type: 'text',
          required: true,
          name: 'username',
          value: this.props?.initUserName ?? '',
        }),
        new Component('span'),
        new Component('label').setTextContent('UserName'),
      ),
      new Component(
        'div',
        { className: classes.txt_field },
        new Component('input').setProps({
          type: 'password',
          required: true,
          name: 'userpwd',
        }),
        new Component('span'),
        new Component('label').setTextContent('Password'),
      ),
      new Component('input').setProps({ type: 'submit', value: 'Login' }),
    );
  }
}
