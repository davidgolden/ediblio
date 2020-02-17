import React, {useState} from 'react';
import Modal from "./Modal";
import Button from "../utilities/buttons/Button";
import Link from "next/link";

export default function LoginModal(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleEmailChange = e => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = e => {
        setPassword(e.target.value);
    };

    const handleLoginSubmit = e => {
        e.preventDefault();
        context.userLogin(email, password);
    };

    return <Modal>
        <form onSubmit={handleLoginSubmit}>
            <input type="email" name="email" placeholder='Email'
                   value={email}
                   onChange={handleEmailChange}/>
            <input type="password" name="password" placeholder='Password'
                   value={password}
                   onChange={handlePasswordChange}/>
            <Button type='submit'
                    value='Login'>Login</Button>
        </form>


        <Link href={'/forgot'}>
            <a>
                Forgot Password?
            </a>
        </Link>
        <Link href={'/register'}>
            <a>
                Register
            </a>
        </Link>
    </Modal>
}
