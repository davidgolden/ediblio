import React, { useState } from 'react';
import axios from 'axios';
import styles from './styles/RecipeInformation.scss';
import classNames from 'classnames';
import ImageLoader from "../utilities/ImageLoader";

const RecipeInformation = props => {
    const [foundImage, setFoundImage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(false);

    const scrapeImage = link => {
        setLoading(true);

        axios.post('/api/scrape', {
            imageUrl: link,
        })
            .then(response => {
                setLoading(false);
                setFoundImage(true);

                props.handleRecipeImageChange(response.data.imageUrl);
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
            useWebWorker: true
        };
        try {
            const compressedFile = await imageCompression(file, options);
            setFoundImage(true);
            setUploadedImage(true);

            props.handleRecipeImageChange(compressedFile, true);
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
            <label htmlFor={'file'}>Recipe Image</label>
            <input type={'file'} name={'file'}
                   onChange={e => handleFileUpload(e.target.files[0])}
                   accept={'image/*'}
            />
            <label htmlFor='notes'>Notes</label>
            <textarea name='notes' value={props.notes}
                      onChange={props.handleRecipeNotesChange}/>
        </div>
    )
};

export default RecipeInformation;
