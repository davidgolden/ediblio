import React, { useState } from 'react';
import styles from './styles/RecipeInformation.module.scss';
import classNames from 'classnames';
import ImageLoader from "../utilities/ImageLoader";
import {clientFetch} from "../../utils/cookies";
import DraftEditor from "../utilities/DraftEditor";

const RecipeInformation = props => {
    const [foundImage, setFoundImage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(false);

    const scrapeImage = link => {
        setLoading(true);

        clientFetch.post('/api/scrape', {
            imageUrl: link,
        })
            .then(async response => {
                setLoading(false);
                setFoundImage(true);
                let binary = Buffer.from(response.data);
                let imgData = new Blob([binary], { type: 'application/octet-binary' });
                props.handleRecipeImageChange(imgData);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const handleRecipeLinkChange = e => {
        props.handleRecipeLinkChange(e);
        if (e.target.value && !uploadedImage) {
            window.setTimeout(scrapeImage(e.target.value), 2000);
        }
    };

    const handleFileUpload = async file => {
        const imageCompression = require('browser-image-compression').default;
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            onProgress: () => {},
        };
        try {
            const compressedFile = await imageCompression(file, options);
            setLoading(true);
            props.handleRecipeImageChange(compressedFile, true);
            setLoading(false);
            setFoundImage(true);
            setUploadedImage(true);
        } catch (error) {
            console.log(error);
        }
    };

    const recipeInformationClassName = classNames({
        [styles.recipeInformation]: true,
    });

    return (
        <div className={recipeInformationClassName}>
            <h3>Recipe Information</h3>
            <label htmlFor='name'>Recipe Name</label>
            <input type='text' name='name' value={props.name}
                   onChange={props.handleRecipeNameChange}/>
            <label htmlFor='link'>Recipe URL</label>
            <input type='text' name='link' value={props.url}
                   onChange={handleRecipeLinkChange}/>
            <ImageLoader
                loading={loading}
                foundImage={foundImage}
                uploadedImage={uploadedImage}
                image={props.image}
            />
            <label htmlFor={'image'}>Recipe Image</label>
            <input type={'file'} name={'image'}
                   onChange={e => handleFileUpload(e.target.files[0])}
                   accept={'image/*'}
            />
            <label htmlFor='notes'>Notes</label>
            <DraftEditor value={props.notes || ""} handleChange={props.handleRecipeNotesChange}/>
        </div>
    )
};

export default RecipeInformation;
