import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import InCloudButton from "../utilities/buttons/InCloudButton";
import RemoveButton from "../utilities/buttons/RemoveButton";
import AddToCloudButton from "../utilities/buttons/AddToCloudButton";
import AddToGroceryListButton from "../utilities/buttons/AddToGroceryListButton";
import DeleteButton from "../utilities/buttons/DeleteButton";
import {ApiStoreContext} from "../../stores/api_store";

const RecipeButtons = props => {

    const context = useContext(ApiStoreContext);

    const addToCloud = () => {
        let currentCloud = props.apiStore.user.recipes;
        currentCloud.push(props.recipe_id);
        context.patchUser({
            recipes: currentCloud,
        })
    };

    const removeFromCloud = () => {
        let currentCloud = context.user.recipes;
        currentCloud = currentCloud.filter(recipe_id => recipe_id !== props.recipe_id);
        context.patchUser({
            recipes: currentCloud,
        })
    };

    if (!context.isLoggedIn) {
        return false;
    }

    const inCloud = !!(context.user.recipes.find(id => id === props.recipe_id));
    const inMenu = !!(context.user.menu.find(item => item._id === props.recipe_id) || context.user.menu.includes(props.recipe_id));
    const isAuthor = props.author_id === context.user._id;

    // if in cloud, show inCloud
    // if in cloud and not author, show remove from cloud
    // if not in cloud, show add to cloud
    // if not on menu show add to grocery list

    return (
        <React.Fragment>

            {(inCloud || isAuthor) && <InCloudButton disabled={true}/>}

            {inCloud && !isAuthor &&
            <RemoveButton onClick={removeFromCloud}/>}

            {!inCloud && !isAuthor && <AddToCloudButton disabled={inCloud} onClick={addToCloud}/>}

            <AddToGroceryListButton
                disabled={inMenu}
                onClick={props.addToGroceryList}/>

            {(context.user.isAdmin || isAuthor) &&
            <DeleteButton onClick={props.deleteRecipe}/>}

        </React.Fragment>
    )
};

RecipeButtons.propTypes = {
    recipe_id: PropTypes.string.isRequired,
    author_id: PropTypes.string.isRequired,
    // removeFromCloud: PropTypes.func.isRequired,
    // addToCloud: PropTypes.func.isRequired,
    addToGroceryList: PropTypes.func.isRequired,
    deleteRecipe: PropTypes.func.isRequired,
};

export default RecipeButtons;
