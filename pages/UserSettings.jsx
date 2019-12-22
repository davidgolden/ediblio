import React, {useState, useContext, useEffect} from 'react';
import styles from './styles/UserSettings.scss';
import classNames from 'classnames';
import Button from "../client/components/utilities/buttons/Button";
import {ApiStoreContext} from "../client/stores/api_store";
import {processFile} from "../client/utils/images";
import axios from "axios";

const UserSettings = props => {
    const context = useContext(ApiStoreContext);

    const [profileImage, setProfileImage] = useState(props.user ? props.user.profileImage : '');
    const [username, setUsername] = useState(props.user ? props.user.username : '');
    const [email, setEmail] = useState(props.user ? props.user.email : '');
    const [password, setPassword] = useState(props.user ? props.user.password : '');
    const [confirm, setConfirm] = useState(props.user ? props.user.password : '');
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

    if (!props.user) {
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
                {profileImage && <img src={profileImage}/>}
                <input onChange={e => handleFileUpload(e.target.files[0])} type={'file'} accept={'image/*'}/>
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
                <Button className={submitButtonClassName}
                        onClick={handleSubmit}>{current ? 'Up to Date' : 'Submit'}</Button>
            </div>
        </div>
    )
};

UserSettings.getInitialProps = async ({query, req}) => {
    const response = await axios.get(`${req.protocol}://${req.headers.host}/api/users/${query.user_id}`, {
        headers: {
            cookie: req.headers.cookie,
        }
    });
    return {
        user: response.data.user,
        user_id: query.user_id,
    }
};

export default UserSettings;
