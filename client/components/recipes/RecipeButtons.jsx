import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import AddToCollection from "../utilities/buttons/AddToCollection";
import AddToGroceryListButton from "../utilities/buttons/AddToGroceryListButton";
import DeleteButton from "../utilities/buttons/DeleteButton";
import {ApiStoreContext} from "../../stores/api_store";
import {observer} from "mobx-react";
import axios from "axios";

const RecipeButtons = observer(props => {

    const context = useContext(ApiStoreContext);

    const addToCollection = async (collectionName = "Favorites") => {
        const collection = context.user.collections.find(c => c.name === collectionName);
        if (collection) {
            try {
                await axios.post(`/api/collections/${collection.id}/recipes/${props.recipe.id}`);
                collection.recipes.push(props.recipe);
            } catch (error) {
                context.handleError(error);
            }
        }
    };

    const removeFromCollection = async (collectionId, recipeId) => {
        const collection = context.user.collections.find(c => c.id === collectionId);
        if (collection) {
            try {
                await axios.delete(`/api/collections/${collection.id}/recipes/${props.recipe.id}`);
                collection.recipes = collection.recipes.filter(r => r.id !== recipeId);
            } catch (error) {
                context.handleError(error);
            }
        }
    };

    if (!context.user) {
        return false;
    }

    // const inCloud = !!(context.user.recipes.find(id => id === props.recipe_id));
    const inMenu = !!(context.user?.menu?.find(item => item && item.id === props.recipe.id) || context.user?.menu?.includes(props.recipe.id));
    const isAuthor = props.recipe.author_id === context.user.id;

    // if in cloud, show inCloud
    // if in cloud and not author, show remove from cloud
    // if not in cloud, show add to cloud
    // if not on menu show add to grocery list

    return (
        <React.Fragment>

            <AddToCollection recipe_id={props.recipe.id} removeFromCollection={removeFromCollection} addToCollection={addToCollection}/>

            <AddToGroceryListButton
                disabled={inMenu}
                onClick={props.addToGroceryList}/>

            {(isAuthor) &&
            <DeleteButton onClick={props.deleteRecipe}/>}

        </React.Fragment>
    )
});

RecipeButtons.propTypes = {
    recipe: PropTypes.object.isRequired,
    addToGroceryList: PropTypes.func.isRequired,
    deleteRecipe: PropTypes.func.isRequired,
};

export default RecipeButtons;
