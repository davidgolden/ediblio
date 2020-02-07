import React, { useState, useContext } from 'react';
import RecipeInformation from '../client/components/recipes/RecipeInformation';
import AddIngredients from '../client/components/recipes/AddIngredients';
import Button from "../client/components/utilities/buttons/Button";
import styles from './styles/AddRecipe.scss';
import classNames from 'classnames';
import {ApiStoreContext} from "../client/stores/api_store";
import {observer} from "mobx-react";
import Router from 'next/router';
import axios from 'axios';

const RecipeForm = observer(props => {
    const [name, setName] = useState(props.editMode ? props.recipe.name : '');
    const [url, setUrl] = useState(props.editMode ? props.recipe.url : '');
    const [image, setImage] = useState(props.editMode ? props.recipe.image : '');
    const [rawImage, setRawImage] = useState('');
    const [notes, setNotes] = useState(props.editMode ? props.recipe.notes : '');
    const [ingredients, setIngredients] = useState(props.editMode ? props.recipe.ingredients : []);
    const [updated, setUpdated] = useState(new Set());
    const [submitted, setSubmitted] = useState(false);

    const context = useContext(ApiStoreContext);

    function addToUpdated(update) {
        setUpdated(u => {
            const newUpdate = u;
            newUpdate.add(update);
            return newUpdate;
        })
    }

    function handleUpdateAllIngredients(ingredients) {
        addToUpdated('ingredients');
        setIngredients(ingredients);
    }

    function handleRecipeImageChange(data, raw = false) {
        addToUpdated('image');
        if (!raw) {
            setImage(data);
        } else {
            const blobURL = window.URL.createObjectURL(data);
            setImage(blobURL);
            setRawImage(data);
        }
    }

    function handleUrlChange(e) {
        addToUpdated('url');
        setUrl(e.target.value);
    }

    function handleNameChange(e) {
        addToUpdated('name');
        setName(e.target.value);
    }

    function handleNotesChange(e) {
        addToUpdated('notes');
        setNotes(e.target.value);
    }

    const handleSubmit = async () => {
        setSubmitted(true);
        const uploadObject = {};
        if (updated.has('name')) {
            uploadObject.name = name;
        }
        if (updated.has('url')) {
            uploadObject.url = url;
        }
        if (updated.has('image')) {
            const fd = new FormData();
            fd.append('file', rawImage ? rawImage : image);
            fd.append('upload_preset', 'l9apptfs');
            fd.append('resource_type', 'image');
            const response = await axios.post(`https://api.cloudinary.com/v1_1/recipecloud/upload`, fd);
            uploadObject.image = response.data.secure_url;
        }
        if (updated.has('notes')) {
            uploadObject.notes = notes;
        }
        if (updated.has('ingredients')) {
            uploadObject.ingredients = ingredients;
        }
        if (props.editMode) {
            context.patchRecipe(props.recipe.id, uploadObject)
                .then(recipe => {
                    props.updateRecipe(recipe);
                    props.toggleEdit();
                })
        } else {
            context.createRecipe(uploadObject)
                .then(() => {
                    Router.push("/");
                })
        }
    };

    const recipeFormClassName = classNames({
        [styles.recipeForm]: true,
    });
    const submitButtonClassName = classNames({
        [styles.submitButton]: true,
        [styles.submitButtonDisabled]: !name || submitted,
    });

    return (
        <div className={recipeFormClassName}>
            <h2>Submit a Recipe</h2>
            <RecipeInformation
                name={name}
                url={url}
                image={image}
                notes={notes}
                handleRecipeLinkChange={handleUrlChange}
                handleRecipeNameChange={handleNameChange}
                handleRecipeImageChange={handleRecipeImageChange}
                handleRecipeNotesChange={handleNotesChange}
            />
            <AddIngredients
                ingredients={ingredients}
                handleUpdateAllIngredients={handleUpdateAllIngredients}
            />
            <div>
                {context.user ?
                    <Button className={submitButtonClassName} onClick={handleSubmit}>{props.editMode ? "Save" : "Submit!"}</Button> :
                    <p>You must be logged in to add a recipe!</p>}
            </div>
        </div>
    )
});

RecipeForm.defaultProps = {
    editMode: false,
};

export default RecipeForm;
