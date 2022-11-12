import React, { useState, useContext } from 'react';
import RecipeInformation from '../client/components/recipes/RecipeInformation';
import AddIngredients from '../client/components/ingredients/AddIngredients';
import Button from "../client/components/utilities/buttons/Button";
import styles from './styles/AddRecipe.module.scss';
import classNames from 'classnames';
import {ApiStoreContext} from "../client/stores/api_store";
import {observer} from "mobx-react";
import Router from 'next/router';
import {clientFetch, getUrlParts} from "../client/utils/cookies";

const RecipeForm = observer(props => {
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
                setIngredients(v => [{id: String(v.length), ...ingredient}].concat(ingredients))
            }
            addToUpdated('ingredients');
        } catch (error) {
            context.handleError(error.response.data.detail);
        }
    }

    function handleUpdateIngredient(ingredient) {
        addToUpdated('ingredients');
        setIngredients(ingredients.map(ing => {
            if (ing.id === ingredient.id) {
                return ingredient;
            }
            return ing;
        }));
    }

    async function removeSelectedIngredients() {
        try {
            if (props.editMode) {
                await clientFetch.delete(`/api/recipes/${props.recipe.id}/ingredients`, {
                    data: {
                        ingredient_ids: ingredientIdsToRemove,
                    }
                });
            }

            setIngredients(ingredients.filter(ing => !ingredientIdsToRemove.includes(ing.id)));
            setIngredientIdsToRemove([]);
        } catch (error) {
            context.handleError(error)
        }
    }

    function handleRecipeImageChange(data, raw = false) {
        addToUpdated('image');
        const blobURL = window.URL.createObjectURL(data);
        setImage(blobURL);
        setRawImage(data);
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
        const fd = new FormData();
        if (updated.has('name')) {
            fd.append("name", name);
        }
        if (updated.has('url')) {
            fd.append("url", url);
        }
        if (updated.has('image')) {
            const img = rawImage || image;
            fd.append("image", img, img.name);
        }
        if (updated.has('notes')) {
            fd.append("notes", notes);
        }
        if (updated.has('ingredients')) {
            let ingredientsToSubmit = ingredients;
            if (!props.editMode) {
                // when creating a new recipe, IDs are fake, so we don't want to submit them
                ingredientsToSubmit = ingredients.map(ing => ({name: ing.name, measurement: ing.measurement, quantity: ing.quantity}));
            }
            fd.append("ingredients", JSON.stringify(ingredientsToSubmit));
        }
        if (props.editMode) {
            try {
                const recipe = await context.patchRecipe(props.recipe.id, fd);
                props.updateRecipe(recipe);
                props.toggleEdit();
            } catch (e) {
                setSubmitted(false);
            }
        } else {
            try {
                await context.createRecipe(fd);
                await Router.push("/");
            } catch (e) {
                setSubmitted(false);
            }
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
                handleUpdateIngredient={handleUpdateIngredient}
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

export async function getServerSideProps({req}) {
    const {currentFullUrl} = getUrlParts(req);

    return {
        props: {
            currentFullUrl,
        }
    }
};

export default RecipeForm;
