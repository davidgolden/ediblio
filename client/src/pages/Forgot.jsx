import React from 'react';
import {inject, observer} from 'mobx-react';
import classNames from 'classnames';
import styles from './styles/Forgot.scss';

const SendEmailForm = (props) => {
    const buttonContainerClassName = classNames({
        [styles.buttonContainer]: true,
    });

    return (
        <div>
            <h1>Reset Password</h1>
            <form onSubmit={props.sendResetEmail} autoComplete={'off'}>
                <h6>Enter your email, click submit, and we will email you a password reset token. You can use that token
                    to change your password.</h6>
                <div>
                    <input type='email' value={props.email}
                           onChange={props.handleEmailChange} placeholder='Enter Email'/>
                </div>
                <div className={buttonContainerClassName}>
                    <button type='submit'>Send Reset Token</button>
                </div>
                <div className={buttonContainerClassName}>
                    <button
                            onClick={() => props.changeView('reset')}>Already Have a Token?
                    </button>
                </div>
            </form>
        </div>
    )
}

const ResetPasswordForm = (props) => {
    const buttonContainerClassName = classNames({
        [styles.buttonContainer]: true,
    });

    return (
        <div>
            <form onSubmit={props.handleReset} autoComplete={'off'}>
                <h6>You should have a reset token waiting for you in your inbox. Enter it here along with your new
                    password. Didn't get an email? Try checking your spam folder or resending the email.</h6>
                <div>
                    <input type='text' value={props.token}
                           autoComplete={'off'}
                           onChange={props.handleTokenChange} placeholder='Enter Reset Token'/>
                </div>
                <div>
                    <input type='password' value={props.password}
                           autoComplete={'off'}
                           onChange={props.handlePasswordChange}
                           placeholder='Enter New Password'/>
                </div>
                <div>
                    <input type='password' value={props.confirm}
                           autoComplete={'off'}
                           onChange={props.handleConfirmChange}
                           placeholder='Confirm New Password'/>
                </div>
                <div className={buttonContainerClassName}>
                    <button type='submit'>Reset Password</button>
                </div>
                <div className={buttonContainerClassName}>
                    <button
                            onClick={() => props.changeView('forgot')}>Resend Token
                    </button>
                </div>
            </form>
        </div>
    )
}

@inject('apiStore')
@observer
class ForgotPassword extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            view: 'forgot',
            token: '',
            password: '',
            confirm: ''
        }

        this.changeView = (view) => {
            this.setState({view: view})
        }

        this.handleEmailChange = e => {
            this.setState({email: e.target.value})
        }
        this.handleTokenChange = e => {
            this.setState({token: e.target.value})
        }
        this.handlePasswordChange = e => {
            this.setState({password: e.target.value})
        }
        this.handleConfirmChange = e => {
            this.setState({confirm: e.target.value})
        }

        this.handleReset = e => {
            e.preventDefault();
            this.props.apiStore.resetPassword(this.state.token, this.state.password)
                .then(() => {
                    alert('Successfully updated password!');
                    return this.props.navigate('/');
                });
        };


        this.sendResetEmail = e => {
            e.preventDefault();
            this.props.apiStore.forgotPassword(this.state.email)
                .then(() => {
                    alert(`An email has been sent to ${this.state.email} with further instructions!`);
                    return this.setState({view: 'reset'})
                });
        }
    }

    render() {
        const containerClassName = classNames({
            [styles.container]: true,
        });

        return (
            <div className={containerClassName}>
                {this.state.view === 'forgot' ? (
                    <SendEmailForm
                        sendResetEmail={this.sendResetEmail}
                        email={this.state.email}
                        handleEmailChange={this.handleEmailChange}
                        changeView={this.changeView}
                    />
                ) : (
                    <ResetPasswordForm
                        handleReset={this.handleReset}
                        token={this.state.token}
                        handleTokenChange={this.handleTokenChange}
                        password={this.state.password}
                        confirm={this.state.confirm}
                        handlePasswordChange={this.handlePasswordChange}
                        handleConfirmChange={this.handleConfirmChange}
                        changeView={this.changeView}
                    />
                )}
            </div>
        )
    }

}

export default ForgotPassword
