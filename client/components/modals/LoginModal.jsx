import React, {useContext, useState} from 'react';
import Modal from "./Modal";
import Button from "../utilities/buttons/Button";
import {ApiStoreContext} from "../../stores/api_store";
import styles from './styles/LoginModal.module.scss';
import Router from "next/router";

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
        <h2>Sign in with Google</h2>
        <a href={"/auth/google"}>
            <div className={styles.googleWrapper}>
                <div className={styles.googleIcon} style={{"padding": "15px"}}>
                    <div style={{"width": "18px", height: "18px"}}
                    >
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="18px" height="18px"
                             viewBox="0 0 48 48" className="abcRioButtonSvg">
                            <g>
                                <path fill="#EA4335"
                                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                <path fill="#4285F4"
                                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                <path fill="#FBBC05"
                                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                <path fill="#34A853"
                                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                <path fill="none" d="M0 0h48v48H0z"></path>
                            </g>
                        </svg>
                    </div>
                </div>
                <span style={{"lineHeight": "48px"}} className={styles.googleContents}><span>Sign in with Google</span><span style={{"display": "none"}}>Signed in with Google</span></span>
            </div>
        </a>
        <h2>Login with Email</h2>
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
            <button onClick={() => props.setView('forgot')}>Forgot Password?</button>
            <button onClick={() => props.setView('register')}>Register</button>
        </div>

    </div>
}

function Register(props) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');

    const context = useContext(ApiStoreContext);

    const handleSubmit = e => {
        e.preventDefault();
        if (password !== confirm) {
            return alert('Passwords do not match!')
        }
        context.removeTopModal();
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
            </div>
            <div>
                <input type='password' id='confirm' onChange={e => setConfirm(e.target.value)}
                       placeholder='Confirm Password' value={confirm}/>
            </div>
            <div>
                <Button role={'submit'}>Create Account</Button>
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
