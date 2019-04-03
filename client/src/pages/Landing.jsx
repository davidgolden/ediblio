import React, { useState } from 'react';
import classNames from 'classnames';
import styles from './styles/Landing.scss';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCloudUploadAlt, faSearchPlus, faListOl, faShoppingCart} from '@fortawesome/free-solid-svg-icons'
import Button from "../components/utilities/buttons/Button";

const Landing = props => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');

    const handleSubmit = () => {
        if (password !== confirm) {
            return alert('Passwords do not match!')
        }
        this.props.apiStore.registerUser({
            username: username,
            email: email,
            password: password
        })
            .then(() => {
                props.navigate("/")
            })
    };

    const landingContainerClassName = classNames({
        [styles.landingContainer]: true,
    });
    const infoContainerClassName = classNames({
        [styles.infoContainer]: true,
    });
    const signupContainerClassName = classNames({
        [styles.signupContainer]: true,
    });
    const infoBoxClassName = classNames({
        [styles.infoBox]: true,
    });
    const infoBlockClassName = classNames({
        [styles.infoBlock]: true,
    });
    const submitButtonClassName = classNames({
        [styles.submitButton]: true,
        [styles.submitButtonDisabled]: !(username && email && password && confirm)
    });

    return (
        <div className={landingContainerClassName}>
            <div className={infoContainerClassName}>

                <div className={infoBoxClassName}>
                    <FontAwesomeIcon icon={faCloudUploadAlt}/>
                    <h6><span className={infoBlockClassName}>Add recipes</span> to your recipe cloud, then easily
                        populate your grocery list with their ingredients.</h6>
                </div>
                <div className={infoBoxClassName}>
                    <FontAwesomeIcon icon={faSearchPlus}/>
                    <h6><span className={infoBlockClassName}>Browse yours</span> or others&#39; recipes by tag, then
                        easily add those recipes to your recipe cloud.</h6>
                </div>

                <div className={infoBoxClassName}>
                    <FontAwesomeIcon icon={faListOl}/>
                    <h6><span className={infoBlockClassName}>Add ingredients</span> to your list and recipes to your
                        menu with a single click. Duplicate ingredients are automatically totaled.</h6>
                </div>
                <div className={infoBoxClassName}>
                    <FontAwesomeIcon icon={faShoppingCart}/>
                    <h6><span className={infoBlockClassName}>Switch to store mode</span> to view and delete
                        ingredients on your phone as you shop.</h6>
                </div>
            </div>
            <div className={signupContainerClassName}>
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
                    <input type='password' id='confirm' onChange={e => setConfirm(e.target.vaule)}
                           placeholder='Confirm Password' value={confirm}/>
                </div>
                <div>
                    <Button className={submitButtonClassName} onClick={handleSubmit}>Create Account</Button>
                </div>
            </div>
        </div>
    )
};

export default Landing;
