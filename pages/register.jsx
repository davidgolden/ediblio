import {prismaClient} from "../db/index";
import React, {useContext, useState} from "react";
import styles from "../client/components/modals/styles/LoginModal.module.scss";
import {clientFetch} from "../client/utils/cookies";
import {ApiStoreContext} from "../client/stores/api_store";
import Router from "next/router";

const Register = () => {
    const context = useContext(ApiStoreContext);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    async function handleRegister(e) {
        e.preventDefault();
        const response = await clientFetch.post("/api/users/register", {
            email,
            username,
            password,
        });
        context.setUser(response.data.user);
        await Router.push(`/?jwt=${response.data.jwt}`);
    }

    const validated = email && password && password === passwordConfirm && username;

    return <div className={styles.container}>
        <div>
            <h2>Create First Account</h2>
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
                    {password !== passwordConfirm && passwordConfirm.length > 0 && <small>Passwords don't match!</small>}
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
    const userCount = await prismaClient.users.count();

    if (userCount === 0) {
        return {
            props: {}
        }
    } else {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        }
    }
}

export default Register;