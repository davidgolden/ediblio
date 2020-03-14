import React, {useState, useContext, useEffect} from 'react';
import RecipeForm from '../add';
import ShowRecipe from '../../client/components/recipes/ShowRecipe';
import styles from '../styles/RecipeContainer.module.scss';
import classNames from 'classnames';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch, faEdit} from '@fortawesome/free-solid-svg-icons'
import Button from "../../client/components/utilities/buttons/Button";
import RecipeButtons from "../../client/components/recipes/RecipeButtons";
import {ApiStoreContext} from "../../client/stores/api_store";
import {observer} from "mobx-react";
import axios from "axios";
import Router from 'next/router';
import JsonLd from "../../client/components/utilities/JsonLd";

const recipeContainerClassName = classNames({
    [styles.recipeContainer]: true,
});
const recipeEditButtonsClassName = classNames({
    [styles.recipeEditButtons]: true,
});
const toggleEditClassName = classNames({
    [styles.toggleEdit]: true,
});

const Recipe_id = observer(props => {
    const [edit, setEdit] = useState(false);
    const [recipe, setRecipe] = useState(props.recipe);
    const [inMenu, setInMenu] = useState(props.recipe.in_menu);

    const context = useContext(ApiStoreContext);

    const addToGroceryList = async (ingredients) => {
        try {
            await axios.patch(`/api/users/${context.user.id}/recipes/${props.recipe.id}`, {
                ingredients,
            });
            setInMenu(true);
        } catch (error) {
            context.handleError(error);
        }
    };

    const updateRecipe = fullRecipe => {
        setRecipe(fullRecipe);
    };

    const toggleEdit = () => {
        setEdit(!edit);
    };

    function handleUpdateIngredient(ingredient) {
        setRecipe({
            ...recipe,
            ingredients: recipe.ingredients.map(ing => {
                if (ing.id === ingredient.id) {
                    return ingredient;
                }
                return ing;
            })
        })
    }

    const deleteRecipe = () => {
        if (confirm('Are you sure you want to do that?')) {
            context.deleteRecipe(props.recipe_id)
                .then(() => {
                    Router.push("/");
                });
        }
    };

    return (
        <div className={recipeContainerClassName}>
            <div className={recipeEditButtonsClassName}>
                <div>
                    {context.user && (recipe.author_id === context.user.id) && (
                        <Button className={toggleEditClassName} onClick={toggleEdit}>
                            <FontAwesomeIcon icon={edit ? faSearch : faEdit}/> {edit ? "View" : "Edit"}
                        </Button>)}
                </div>
                <div>{context.user && <RecipeButtons
                    recipe={recipe}
                    inMenu={inMenu}
                    addToGroceryList={addToGroceryList}
                    deleteRecipe={deleteRecipe}
                />}
                </div>
            </div>

            {edit === true ? (
                <RecipeForm
                    recipe={recipe}
                    toggleEdit={toggleEdit}
                    editMode={edit}
                    updateRecipe={updateRecipe}
                    handleUpdateIngredient={handleUpdateIngredient}
                />
            ) : (
                <ShowRecipe
                    recipe={recipe}
                    addToGroceryList={addToGroceryList}
                    handleUpdateIngredient={handleUpdateIngredient}
                />
            )}

            <JsonLd data={{
                "@context": "https://schema.org/",
                "@type": "Recipe",
                "sameAs": recipe.url,
                "recipeIngredient": recipe.ingredients,
                "name": recipe.name,
                "image": recipe.image,
            }}/>
        </div>
    )
});

Recipe_id.getInitialProps = async ({req, query}) => {
    const currentFullUrl = typeof window !== 'undefined' ? window.location.origin : req.protocol + "://" + req.headers.host.replace(/\/$/, "");

    const response = await axios.get(`${currentFullUrl}/api/recipes/${query.recipe_id}`, {
        headers: req?.headers?.cookie && {
            cookie: req.headers.cookie,
        },
    });
    return {
        recipe: response.data.recipe,
        recipe_id: query.recipe_id,
        user: req?.user,
    };
};

export default Recipe_id;
