import React, {useContext, useState} from 'react';
import Modal from "./Modal";
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
    forgot: Forgot,
};

export default function LoginModal(props) {
    const [view, setView] = useState("login");

    const ViewComponent = component[view];

    return <Modal className={styles.container}>
        <ViewComponent setView={setView}/>
    </Modal>
}
