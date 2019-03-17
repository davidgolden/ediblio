import React from 'react';
import PropTypes from 'prop-types';
import {inject, observer} from 'mobx-react';
import InCloudButton from "../utilities/buttons/InCloudButton";
import RemoveButton from "../utilities/buttons/RemoveButton";
import AddToCloudButton from "../utilities/buttons/AddToCloudButton";
import AddToGroceryListButton from "../utilities/buttons/AddToGroceryListButton";
import DeleteButton from "../utilities/buttons/DeleteButton";

@inject('apiStore')
@observer
export default class RecipeButtons extends React.Component {
    static propTypes = {
        recipe_id: PropTypes.string.isRequired,
        author_id: PropTypes.string.isRequired,
        // removeFromCloud: PropTypes.func.isRequired,
        // addToCloud: PropTypes.func.isRequired,
        addToGroceryList: PropTypes.func.isRequired,
        deleteRecipe: PropTypes.func.isRequired,
    };

    addToCloud = () => {
        let currentCloud = this.props.apiStore.user.recipes;
        currentCloud.push(this.props.recipe_id);
        this.props.apiStore.patchUser({
            recipes: currentCloud,
        })
    };

    removeFromCloud = () => {
        let currentCloud = this.props.apiStore.user.recipes;
        currentCloud = currentCloud.filter(recipe => recipe.id !== this.props.recipe_id);
        this.props.apiStore.patchUser({
            recipes: currentCloud,
        })
    };

    render() {
        const {apiStore} = this.props;

        if (!apiStore.isLoggedIn) {
            return false;
        }

        const inCloud = apiStore.user.recipes.includes(this.props.recipe_id) || this.props.author_id === apiStore.user._id;

        return (
            <React.Fragment>
                {apiStore.user._id === this.props.author_id &&
                <InCloudButton disabled={true}/>}
                {inCloud && apiStore.user._id !== this.props.author_id &&
                <RemoveButton onClick={this.removeFromCloud}/>}
                <AddToCloudButton disabled={inCloud} onClick={this.addToCloud}/>
                <AddToGroceryListButton
                    disabled={apiStore.user.menu.find(item => item._id === this.props.recipe_id)}
                    onClick={this.props.addToGroceryList}/>
                {(apiStore.user.isAdmin || apiStore.user._id === this.props.author_id) &&
                <DeleteButton onClick={this.props.deleteRecipe}/>}
            </React.Fragment>
        );
    }
}
