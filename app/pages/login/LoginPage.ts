import { Component } from '@/components';
import type { Nullable } from '@/utils';

import classes from './LoginPage.module.css';

export type OnSubmitErrors = Nullable<Record<'username' | 'userpwd', string>>;

export type LoginOnSubmitCallback = (userData: {
  username: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
}) => OnSubmitErrors;

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

    this.props?.onSubmit?.({
      username: formData.get('username') ?? '',
      password: formData.get('userpwd') ?? '',
    });
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
