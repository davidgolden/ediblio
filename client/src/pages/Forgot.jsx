import React, { useState, useContext } from 'react';
import classNames from 'classnames';
import styles from './styles/Forgot.scss';
import {ApiStoreContext} from "../stores/api_store";

const ForgotPassword = props => {
    const [email, setEmail] = useState('');
    const [view, setView] = useState('forgot');
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');

    const context = useContext(ApiStoreContext);

    const handleReset = e => {
        e.preventDefault();
        context.resetPassword(token, password)
            .then(() => {
                alert('Successfully updated password!');
                return props.navigate('/');
            });
    };

    const sendResetEmail = e => {
        e.preventDefault();
        context.forgotPassword(email)
            .then(() => {
                alert(`An email has been sent to ${email} with further instructions!`);
                return setView('reset');
            });
    };

    const containerClassName = classNames({
        [styles.container]: true,
    });
    const buttonContainerClassName = classNames({
        [styles.buttonContainer]: true,
    });

    return (
        <div className={containerClassName}>
            {view === 'forgot' ? (
                <div>
                    <h1>Reset Password</h1>
                    <form onSubmit={sendResetEmail} autoComplete={'off'}>
                        <h6>Enter your email, click submit, and we will email you a password reset token. You can use that token
                            to change your password.</h6>
                        <div>
                            <input type='email' value={email}
                                   onChange={e => setEmail(e.target.value)} placeholder='Enter Email'/>
                        </div>
                        <div className={buttonContainerClassName}>
                            <button type='submit'>Send Reset Token</button>
                        </div>
                        <div className={buttonContainerClassName}>
                            <button
                                onClick={() => setView('reset')}>Already Have a Token?
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div>
                    <form onSubmit={handleReset} autoComplete={'off'}>
                        <h6>You should have a reset token waiting for you in your inbox. Enter it here along with your new
                            password. Didn't get an email? Try checking your spam folder or resending the email.</h6>
                        <div>
                            <input type='text' value={token}
                                   autoComplete={'off'}
                                   onChange={e => setToken(e.target.value)} placeholder='Enter Reset Token'/>
                        </div>
                        <div>
                            <input type='password' value={password}
                                   autoComplete={'off'}
                                   onChange={e => setPassword(e.target.value)}
                                   placeholder='Enter New Password'/>
                        </div>
                        <div>
                            <input type='password' value={confirm}
                                   autoComplete={'off'}
                                   onChange={e => setConfirm(e.target.value)}
                                   placeholder='Confirm New Password'/>
                        </div>
                        <div className={buttonContainerClassName}>
                            <button type='submit'>Reset Password</button>
                        </div>
                        <div className={buttonContainerClassName}>
                            <button
                                onClick={() => setView('forgot')}>Resend Token
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )

};

export default ForgotPassword
