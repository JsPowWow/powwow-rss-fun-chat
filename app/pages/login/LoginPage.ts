import type { IUserData } from '@/appConfig/types.ts';
import { Component } from '@/components';
import { isSome } from '@/utils';

import classes from './LoginPage.module.css';

export type LoginOnSubmitCallback = (userData: IUserData) => void | Partial<Record<'username' | 'userpwd', Error>>;

export type LoginPageProps = {
  onSubmit?: LoginOnSubmitCallback;
  userName?: string;
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
    const username = formData.get('username') ?? '';
    const password = formData.get('userpwd') ?? '';
    if (isSome<string>(username) && isSome<string>(password)) {
      this.props?.onSubmit?.({
        username,
        password,
      });
    }
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
          value: this.props?.userName ?? '',
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
