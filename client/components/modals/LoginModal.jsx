import React, {useContext, useState} from 'react';
import Modal from "./Modal";
import Button from "../utilities/buttons/Button";
import {ApiStoreContext} from "../../stores/api_store";
import styles from './styles/LoginModal.module.scss';
import Router from "next/router";
import classNames from 'classnames';

function Login(props) {
    const context = useContext(ApiStoreContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLoginSubmit = e => {
        e.preventDefault();
        context.removeTopModal();
        context.userLogin(email, password);
    };

    return <div>
        <h2>Login</h2>
        <form onSubmit={handleLoginSubmit}>
            <div>
                <input type="email" name="email" placeholder='Email'
                       value={email} onChange={e => setEmail(e.target.value)}
                />
            </div>
            <div>
                <input type="password" name="password" placeholder='Password'
                       value={password} onChange={e => setPassword(e.target.value)}
                />
            </div>
            <div>
                <button type='submit'
                        value='Login'>Login
                </button>
            </div>
        </form>
        <div>
            <button onClick={e => {
                e.stopPropagation();
                props.setView('forgot')
            }}>Forgot Password?
            </button>
            <button disabled style={{cursor: "pointer"}}>Invite Only</button>
        </div>
    </div>
}

function Register(props) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');

    const context = useContext(ApiStoreContext);

    const registerButtonClassName = classNames({
        [styles.registerButton]: true,
        [styles.registerButtonDisabled]: password.length < 8 || confirm.length < 8 || (password !== confirm) || !email || !username,
    });

    const handleSubmit = e => {
        e.preventDefault();
        if (password !== confirm) {
            return alert('Passwords do not match!')
        }
        context.removeTopModal();
        context.registerUser({
            username: username,
            email: email,
            password: password,
        })
    };

    return <div>
        <h2>Create an Account</h2>
        <p>It's free and your information will stay private.</p>
        <form onSubmit={handleSubmit}>
            <div>
                <input type='text' value={username} name='username'
                       onChange={e => setUsername(e.target.value)}
                       placeholder='Choose a Username'/>
            </div>
            <div>
                <input type='email' value={email} name='email' onChange={e => setEmail(e.target.value)}
                       placeholder='Email (used for login)'/>
            </div>
            <div>
                <input type='password' id='password' placeholder='Password' onChange={e => setPassword(e.target.value)}
                       name='password' value={password}/>
                <small>Must be at least 8 characters.</small>
            </div>
            <div>
                <input type='password' id='confirm' onChange={e => setConfirm(e.target.value)}
                       placeholder='Confirm Password' value={confirm}/>
            </div>
            <div>
                <Button className={registerButtonClassName} role={'submit'}>Create Account</Button>
            </div>
        </form>

    </div>
}

function Forgot(props) {
    const [email, setEmail] = useState('');

    const context = useContext(ApiStoreContext);

    const sendResetEmail = e => {
        e.preventDefault();
        context.removeTopModal();
        context.forgotPassword(email)
            .then(() => {
                alert(`An email has been sent to ${email} with further instructions!`);
            });
    };

    return <div>
        <h2>Reset Password</h2>
        <p>Enter your email, click submit, and we will email you a password reset token. You can use that token
            to change your password.</p>
        <form onSubmit={sendResetEmail} autoComplete={'off'}>
            <div>
                <input type='email' value={email}
                       onChange={e => setEmail(e.target.value)} placeholder='Enter Email'/>
            </div>
            <div>
                <button type='submit'>Send Reset Token</button>
            </div>
        </form>
        <div>
            <button onClick={() => {
                context.removeTopModal();
                Router.push("/reset");
            }}>Already Have a Token?
            </button>
        </div>
    </div>
}

const component = {
    login: Login,
    register: Register,
    forgot: Forgot,
};

export default function LoginModal(props) {
    const [view, setView] = useState("login");

    const ViewComponent = component[view];

    return <Modal className={styles.container}>
        <ViewComponent setView={setView}/>
    </Modal>
}
