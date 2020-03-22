import classNames from "classnames";
import styles from "../../../pages/styles/RecipeContainer.module.scss";
import {observer} from "mobx-react";
import React, {useContext, useState} from "react";
import PropTypes from 'prop-types';
import {ApiStoreContext} from "../../stores/api_store";
import axios from "axios";
import Router from "next/router";
import Button from "../utilities/buttons/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faSearch} from "@fortawesome/free-solid-svg-icons";
import RecipeButtons from "./RecipeButtons";
import RecipeForm from "../../../pages/add";
import ShowRecipe from "./ShowRecipe";
import JsonLd from "../utilities/JsonLd";

const recipeContainerClassName = classNames({
    [styles.recipeContainer]: true,
});
const recipeEditButtonsClassName = classNames({
    [styles.recipeEditButtons]: true,
});
const toggleEditClassName = classNames({
    [styles.toggleEdit]: true,
});

const RecipePage = observer(props => {
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
            context.deleteRecipe(props.recipe.id)
                .then(() => {
                    Router.push("/");
                });
        }
    };

    return (
        <div className={recipeContainerClassName}>
            <div className={recipeEditButtonsClassName}>
                <div>
                    {context.loggedIn && (recipe.author_id === context.user.id) && (
                        <Button className={toggleEditClassName} onClick={toggleEdit}>
                            <FontAwesomeIcon icon={edit ? faSearch : faEdit}/> {edit ? "View" : "Edit"}
                        </Button>)}
                </div>
                <div>{context.loggedIn && <RecipeButtons
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

RecipePage.propTypes = {
    recipe: PropTypes.object.isRequired,
};

export default RecipePage;
