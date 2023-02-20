import React, {useContext, useMemo, useState} from "react";
import styles from "../client/components/modals/styles/LoginModal.module.scss";
import {clientFetch} from "../client/utils/cookies";
import {ApiStoreContext} from "../client/stores/api_store";
import Router from "next/router";
import URI from 'urijs';

const Register = (props) => {
    const context = useContext(ApiStoreContext);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const inviteToken = useMemo(() => {
        const query = new URI().search();
        const parsed = URI.parseQuery(query);
        return parsed.token ? parsed.token : "";
    }, [])

    async function handleRegister(e) {
        e.preventDefault();
        try {
            const response = await clientFetch.post("/api/users/register", {
                email,
                username,
                password,
                inviteToken,
            });
            context.setUser(response.data.user);
            await Router.push(`/?jwt=${response.data.jwt}`);
        } catch (e) {
            setErrorMessage(e.response.data.detail);
        }
    }

    const validated = email && password && password === passwordConfirm && username;

    return <div className={styles.container}>
        <div>
            <h2>Create Account</h2>
            {errorMessage && <p>{errorMessage}</p>}
            <form onSubmit={handleRegister}>
                <div>
                    <input type="text" name="username" placeholder='Username'
                           value={username} onChange={e => setUsername(e.target.value)}
                    />
                </div>
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
                    <input type="password" name="password" placeholder='Confirm Password'
                           value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)}
                    />
                    {password !== passwordConfirm && passwordConfirm.length > 0 &&
                        <small>Passwords don't match!</small>}
                </div>
                <div>
                    <button type='submit' disabled={!validated}
                            value='Register'>Register
                    </button>
                </div>
            </form>
        </div>
    </div>
}

export async function getServerSideProps() {
    return {
        props: {}
    }
}

export default Register;