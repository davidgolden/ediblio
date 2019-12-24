import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import AddToCloudButton from "../utilities/buttons/AddToCloudButton";
import AddToGroceryListButton from "../utilities/buttons/AddToGroceryListButton";
import DeleteButton from "../utilities/buttons/DeleteButton";
import {ApiStoreContext} from "../../stores/api_store";
import {observer} from "mobx-react";

const RecipeButtons = observer(props => {

    const context = useContext(ApiStoreContext);

    const addToCollection = (collectionName = "Favorites") => {
        const collection = context.user.collections.find(c => c.name === collectionName);
        if (collection) {
            collection.recipes.push(props.recipe_id);
            context.putCollection(collection);
        }
    };

    const removeFromCollection = (collectionId, recipeId) => {
        const collection = context.user.collections.find(c => c._id === collectionId);
        if (collection) {
            collection.recipes = collection.recipes.filter(r => r._id !== recipeId);
            context.putCollection(collection);
        }
    };

    if (!context.user) {
        return false;
    }

    // const inCloud = !!(context.user.recipes.find(id => id === props.recipe_id));
    const inMenu = !!(context.user.menu.find(item => item._id === props.recipe_id) || context.user.menu.includes(props.recipe_id));
    const isAuthor = props.author_id === context.user._id;

    // if in cloud, show inCloud
    // if in cloud and not author, show remove from cloud
    // if not in cloud, show add to cloud
    // if not on menu show add to grocery list

    return (
        <React.Fragment>

            <AddToCloudButton recipe_id={props.recipe_id} removeFromCollection={removeFromCollection} addToCollection={addToCollection}/>

            <AddToGroceryListButton
                disabled={inMenu}
                onClick={props.addToGroceryList}/>

            {(isAuthor) &&
            <DeleteButton onClick={props.deleteRecipe}/>}

        </React.Fragment>
    )
});

RecipeButtons.propTypes = {
    recipe_id: PropTypes.string.isRequired,
    author_id: PropTypes.string.isRequired,
    // removeFromCloud: PropTypes.func.isRequired,
    // addToCloud: PropTypes.func.isRequired,
    addToGroceryList: PropTypes.func.isRequired,
    deleteRecipe: PropTypes.func.isRequired,
};

export default RecipeButtons;
