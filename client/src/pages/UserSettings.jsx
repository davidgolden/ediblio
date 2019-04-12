import React, { useState, useContext, useEffect } from 'react';
import styles from './styles/UserSettings.scss';
import classNames from 'classnames';
import Button from "../components/utilities/buttons/Button";
import {ApiStoreContext} from "../stores/api_store";
import {processFile} from "../utils/images";

const UserSettings = props => {
    const context = useContext(ApiStoreContext);

    const [profileImage, setProfileImage] = useState(context.user ? context.user.profileImage : '');
    const [username, setUsername] = useState(context.user ? context.user.username : '');
    const [email, setEmail] = useState(context.user ? context.user.email : '');
    const [password, setPassword] = useState(context.user ? context.user.password : '');
    const [confirm, setConfirm] = useState(context.user ? context.user.password : '');
    const [current, setCurrent] = useState(true);

    const handleSubmit = () => {
        if (password !== confirm) {
            return alert('Passwords do not match!')
        } else {
            context.patchUser({
                username: username,
                email: email,
                password: password,
                profileImage: profileImage,
            });
            setCurrent(true);
        }
    };

    // using this for now because we can't listen to user object for useEffect hook
    // because getUser updates that object on every call, so we have to look at an actual value
    const id = context.user && context.user._id;

    useEffect(() => {
        setCurrent(false);
    }, [username, email, password, confirm, profileImage]);

    const handleFileUpload = file => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onloadend = readerEvent => {
            const dataURI = readerEvent.target.result;
            if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
                alert('Your image size is too big and our image compression tools are not supported on your browser. Please use a smaller image!');
                return false;
            }
            processFile(dataURI, 800, 800, file.type)
                .then(uri => {
                    setProfileImage(uri);
                });
        };
    };

    useEffect(() => {
        context.getUser(props.user_id)
            .then(user => {
                setUsername(user.username);
                setEmail(user.email);
                setProfileImage(user.profileImage);
                setPassword(user.password);
                setConfirm(user.password);
                setCurrent(true);
            })
    }, [id]);

    if (!context.isLoggedIn || context.user._id !== props.user_id) {
        return <p>You do not have permission to view this page!</p>
    }

    const settingsContainerClassName = classNames({
        [styles.settingsContainer]: true,
    });
    const submitButtonClassName = classNames({
        [styles.submitButton]: true,
        [styles.submitButtonDisabled]: current,
    });

    return (
        <div className={settingsContainerClassName}>
            <h1>Edit Profile</h1>
            <div>
                {profileImage && <img src={profileImage} />}
                <input onChange={e => handleFileUpload(e.target.files[0])} type={'file'} accept={'image/*'} />
            </div>
            <div>
                <label htmlFor='username'>Username</label>
                <input type='text' name='username' value={username}
                       onChange={e => setUsername(e.target.value)}/>
            </div>
            <div>
                <label htmlFor='email'>Email</label>
                <input type='email' name='email' value={email}
                       onChange={e => setEmail(e.target.value)}/>
            </div>
            <div>
                <label htmlFor='password'>Password</label>
                <input type='password' name='password' value={password}
                       onChange={e => setPassword(e.target.value)}/>
            </div>
            <div>
                <label htmlFor='confirm'>Confirm Password</label>
                <input type='password' name='confirm' value={confirm}
                       onChange={e => setConfirm(e.target.value)}/>
            </div>
            <div>
                <Button className={submitButtonClassName} onClick={handleSubmit}>{current ? 'Up to Date' : 'Submit'}</Button>
            </div>
        </div>
    )
}

export default UserSettings;
