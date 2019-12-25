import React, {useState, useContext, useEffect} from 'react';
import RecipeForm from './AddRecipe';
import ShowRecipe from '../client/components/recipes/ShowRecipe';
import styles from './styles/RecipeContainer.scss';
import classNames from 'classnames';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch, faEdit} from '@fortawesome/free-solid-svg-icons'
import Button from "../client/components/utilities/buttons/Button";
import RecipeButtons from "../client/components/recipes/RecipeButtons";
import {ApiStoreContext} from "../client/stores/api_store";
import {observer} from "mobx-react";
import axios from "axios";
import Router from 'next/router';

const RecipeContainer = observer(props => {
    const [edit, setEdit] = useState(false);
    const [recipe, setRecipe] = useState(props.recipe);

    const context = useContext(ApiStoreContext);

    const addToGroceryList = () => {
        context.addToGroceryList(recipe._id, recipe.ingredients);
    };

    const updateRecipe = fullRecipe => {
        setRecipe(fullRecipe);
    };

    const toggleEdit = () => {
        setEdit(!edit);
    };

    function handleUpdateAllIngredients(ingredients) {
        setRecipe({
            ...recipe,
            ingredients: ingredients,
        });
    }

    const deleteRecipe = () => {
        if (confirm('Are you sure you want to do that?')) {
            context.deleteRecipe(props.recipe_id)
                .then(() => {
                    Router.push("/");
                });
        }
    };

    const recipeContainerClassName = classNames({
        [styles.recipeContainer]: true,
    });
    const recipeEditButtonsClassName = classNames({
        [styles.recipeEditButtons]: true,
    });
    const toggleEditClassName = classNames({
        [styles.toggleEdit]: true,
    });

    return (
        <div className={recipeContainerClassName}>
            <div className={recipeEditButtonsClassName}>
                <div>
                    {context.user && (recipe.author_id._id === context.user._id) && (
                        <Button className={toggleEditClassName} onClick={toggleEdit}>
                            <FontAwesomeIcon icon={edit ? faSearch : faEdit}/> {edit ? "View" : "Edit"}
                        </Button>)}
                </div>
                <div>{context.user && <RecipeButtons
                    recipe_id={recipe._id}
                    author_id={recipe.author_id._id}
                    addToGroceryList={addToGroceryList}
                    deleteRecipe={deleteRecipe}
                />}
                </div>
            </div>

            {edit === true ? (
                <RecipeForm
                    tags={props.tags}
                    recipe={recipe}
                    toggleEdit={toggleEdit}
                    editMode={edit}
                    updateRecipe={updateRecipe}
                />
            ) : (
                <ShowRecipe
                    recipe={recipe}
                    addToGroceryList={addToGroceryList}
                    handleUpdateAllIngredients={handleUpdateAllIngredients}
                />
            )}
        </div>
    )
});

RecipeContainer.getInitialProps = async ({req, query}) => {
    const response = await axios.get(`${req.protocol}://${req.headers.host}/api/recipes/${query.recipe_id}`, {
        headers: req.headers.cookie && {
            cookie: req.headers.cookie,
        },
    });
    return {
        recipe: response.data.recipe,
        recipe_id: query.recipe_id,
    };
};

export default RecipeContainer;
