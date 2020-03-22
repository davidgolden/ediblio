import React, {useState, useContext, useEffect} from 'react';
import styles from '../../styles/UserSettings.module.scss';
import classNames from 'classnames';
import Button from "../../../client/components/utilities/buttons/Button";
import {ApiStoreContext} from "../../../client/stores/api_store";
import axios from "axios";
import UserWall from "../../../client/components/utilities/UserWall";
import {observer} from "mobx-react";
import {clientFetch, getCookieFromServer} from "../../../client/utils/cookies";
import {handleJWT} from "../../../hooks/handleJWT";

const settingsContainerClassName = classNames({
    [styles.settingsContainer]: true,
});

const Settings = observer(props => {
    handleJWT();
    const context = useContext(ApiStoreContext);

    const [profileImage, setProfileImage] = useState(props.user ? props.user.profile_image : '');
    const [username, setUsername] = useState(props.user ? props.user.username : '');
    const [email, setEmail] = useState(props.user ? props.user.email : '');
    const [password, setPassword] = useState(props.user ? props.user.password : '');
    const [confirm, setConfirm] = useState(props.user ? props.user.password : '');
    const [current, setCurrent] = useState(true);
    const [displayImage, setDisplayImage] = useState(null);

    const handleSubmit = async () => {
        if (password !== confirm) {
            return alert('Passwords do not match!')
        } else {
            try {
                const query = {};

                if (username !== props.user.username) {
                    query.username = username;
                }
                if (email !== props.user.email) {
                    query.email = email;
                }
                if (password !== props.user.password) {
                    query.password = password;
                }
                if (profileImage !== props.user.profile_image) {
                    const fd = new FormData();
                    fd.append('file', profileImage);
                    fd.append('upload_preset', 'profile_image');
                    fd.append('resource_type', 'image');
                    fd.append('folder', props.user.id);
                    const response = await clientFetch.post(`https://api.cloudinary.com/v1_1/recipecloud/upload`, fd);
                    query.profileImage = response.data.secure_url;
                }

                const response = await clientFetch.patch(`/api/users/${context.user.id}`, query);

                context.user = {
                    ...context.user,
                    ...response.data.user,
                };
                setCurrent(true);
            } catch (error) {
                context.handleError(error);
            }
        }
    };

    useEffect(() => {
        setCurrent(false);
    }, [username, email, password, confirm, profileImage]);

    const handleFileUpload = async file => {
        const imageCompression = require('browser-image-compression').default;
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true
        };
        try {
            const compressedFile = await imageCompression(file, options);
            const blobURL = window.URL.createObjectURL(compressedFile);
            setDisplayImage(blobURL);
            setProfileImage(compressedFile);
        } catch (error) {
            console.log(error);
        }
    };

    const submitButtonClassName = classNames({
        [styles.submitButton]: true,
        [styles.submitButtonDisabled]: current,
    });

    return (
        <UserWall>
            <div className={settingsContainerClassName}>
                <h1>Edit Profile</h1>
                <div>
                    {(profileImage || displayImage) && <img src={displayImage || profileImage}/>}
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
        </UserWall>
    )
});

export async function getServerSideProps ({query, req}) {
    try {
        const currentFullUrl = req.protocol + "://" + req.headers.host.replace(/\/$/, "");
        const jwt = getCookieFromServer('jwt', req);

        const response = await axios.get(`${currentFullUrl}/api/users/${query.user_id}`, {
            headers: jwt ? {'x-access-token': jwt} : {},
        });
        return {
            props: {
                user: response.data.user,
                user_id: query.user_id,
            }
        }
    } catch (error) {
        return {props: {}}
    }
};

export default Settings;
