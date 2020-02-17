import React, {useContext, useState} from 'react';
import Modal from "./Modal";
import Button from "../utilities/buttons/Button";
import Link from "next/link";
import {ApiStoreContext} from "../../stores/api_store";
import styles from './styles/LoginModal.scss';

function Login(props) {
    const context = useContext(ApiStoreContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLoginSubmit = e => {
        e.preventDefault();
        context.userLogin(email, password);
    };

    return <div>
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
                        value='Login'>Login</button>
            </div>
        </form>
        <div>
            <button onClick={() => props.setView('forgot')}>Forgot Password?</button>
            <button onClick={() => props.setView('register')}>Don't have an account? Register</button>
        </div>

    </div>
}

function Register(props) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');

    const context = useContext(ApiStoreContext);

    const handleSubmit = () => {
        if (password !== confirm) {
            return alert('Passwords do not match!')
        }
        context.registerUser({
            username: username,
            email: email,
            password: password
        })
            .then(() => {
                props.navigate("/")
            })
            .catch(err => {
                console.log(err);
            })
    };

    return <div>
        <h1>Create an Account</h1>
        <h6>It's free and your information will stay private.</h6>
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
        </div>
        <div>
            <input type='password' id='confirm' onChange={e => setConfirm(e.target.value)}
                   placeholder='Confirm Password' value={confirm}/>
        </div>
        <div>
            <Button onClick={handleSubmit}>Create Account</Button>
        </div>
    </div>
}

function Forgot(props) {
    const [email, setEmail] = useState('');

    const context = useContext(ApiStoreContext);

    const sendResetEmail = e => {
        e.preventDefault();
        context.forgotPassword(email)
            .then(() => {
                alert(`An email has been sent to ${email} with further instructions!`);
            });
    };

    return <div>
        <h1>Reset Password</h1>
        <form onSubmit={sendResetEmail} autoComplete={'off'}>
            <h6>Enter your email, click submit, and we will email you a password reset token. You can use that token
                to change your password.</h6>
            <div>
                <input type='email' value={email}
                       onChange={e => setEmail(e.target.value)} placeholder='Enter Email'/>
            </div>
            <div>
                <button type='submit'>Send Reset Token</button>
            </div>
            <div>
                <button
                    onClick={() => setView('reset')}>Already Have a Token?
                </button>
            </div>
        </form>
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
