import React, {useState, useContext} from 'react';
import classNames from 'classnames';
import styles from './styles/Forgot.module.scss';
import {ApiStoreContext} from "../client/stores/api_store";
import {getUrlParts} from "../client/utils/cookies";
import {useRouter} from "next/router";

const ForgotPassword = props => {
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');

    const context = useContext(ApiStoreContext);
    const router = useRouter();

    const handleReset = async e => {
        e.preventDefault();
        const {jwt} = await context.resetPassword(token, password);
        await router.push("/?jwt="+jwt);
    };

    const containerClassName = classNames({
        [styles.container]: true,
    });
    const buttonContainerClassName = classNames({
        [styles.buttonContainer]: true,
    });

    return (
        <div className={containerClassName}>
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
                </form>
            </div>
        </div>
    )

};

export default ForgotPassword

export async function getServerSideProps({req}) {
    const {currentFullUrl} = getUrlParts(req);

    return {
        props: {
            currentFullUrl,
        }
    }
};
