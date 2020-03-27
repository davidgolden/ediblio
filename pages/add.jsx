import React, { useState, useContext } from 'react';
import RecipeInformation from '../client/components/recipes/RecipeInformation';
import AddIngredients from '../client/components/recipes/AddIngredients';
import Button from "../client/components/utilities/buttons/Button";
import styles from './styles/AddRecipe.module.scss';
import classNames from 'classnames';
import {ApiStoreContext} from "../client/stores/api_store";
import {observer} from "mobx-react";
import Router from 'next/router';
import {handleJWT} from "../hooks/handleJWT";
import {clientFetch} from "../client/utils/cookies";
import axios from 'axios';

const RecipeForm = observer(props => {
    handleJWT();
    const [name, setName] = useState(props.editMode ? props.recipe.name : '');
    const [url, setUrl] = useState(props.editMode ? props.recipe.url : '');
    const [image, setImage] = useState(props.editMode ? props.recipe.image : '');
    const [rawImage, setRawImage] = useState('');
    const [notes, setNotes] = useState(props.editMode ? props.recipe.notes : '');
    const [ingredients, setIngredients] = useState(props.editMode ? props.recipe.ingredients : []);
    const [updated, setUpdated] = useState(new Set());
    const [submitted, setSubmitted] = useState(false);

    const [ingredientIdsToRemove, setIngredientIdsToRemove] = useState([]);

    const context = useContext(ApiStoreContext);

    function addToUpdated(update) {
        setUpdated(u => {
            const newUpdate = u;
            newUpdate.add(update);
            return newUpdate;
        })
    }

    async function handleAddIngredient(ingredient) {
        try {
            if (props.editMode) {
                const response = await clientFetch.post(`/api/recipes/${props.recipe.id}/ingredients`, ingredient);
                setIngredients([{...ingredient, id: response.data.id}].concat(ingredients))
            } else {
                setIngredients([ingredient].concat(ingredients))
            }
            addToUpdated('ingredients');
        } catch (error) {
            context.handleError(error);
        }
    }

    async function removeSelectedIngredients() {
        try {
            if (props.editMode) {
                await clientFetch.delete(`/api/recipes/${props.recipe.id}/ingredients`, {
                    data: {
                        ingredient_ids: ingredientIdsToRemove,
                    }
                });
                setIngredients(ingredients.filter(ing => !ingredientIdsToRemove.includes(ing.id)));
            } else {
                setIngredients(ingredients.filter((ing, idx) => !ingredientIdsToRemove.includes(idx)));
            }

            setIngredientIdsToRemove([]);
        } catch (error) {
            context.handleError(error)
        }
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

    function handleNotesChange(value) {
        addToUpdated('notes');
        setNotes(value);
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
    const saveListClassName = classNames({
        [styles.saveList]: true,
        [styles.saveListDisabled]: ingredientIdsToRemove.length === 0,
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
                canAdd={true}
                ingredients={ingredients}
                handleAddIngredient={handleAddIngredient}
                selectedIngredientIds={ingredientIdsToRemove}
                setSelectedIngredientIds={setIngredientIdsToRemove}
                handleUpdateIngredient={() => {}}
            />
            <div>
                <Button className={saveListClassName} onClick={removeSelectedIngredients}>Remove Selected</Button>
                {context.loggedIn ?
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
