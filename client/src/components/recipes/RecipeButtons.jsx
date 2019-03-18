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
        currentCloud = currentCloud.filter(recipe_id => recipe_id !== this.props.recipe_id);
        this.props.apiStore.patchUser({
            recipes: currentCloud,
        })
    };

    render() {
        const {apiStore} = this.props;

        if (!apiStore.isLoggedIn) {
            return false;
        }

        const inCloud = !!(apiStore.user.recipes.find(id => id === this.props.recipe_id));
        const inMenu = !!(apiStore.user.menu.find(item => item._id === this.props.recipe_id) || apiStore.user.menu.includes(this.props.recipe_id));
        const isAuthor = this.props.author_id === apiStore.user._id;

        // if in cloud, show inCloud
        // if in cloud and not author, show remove from cloud
        // if not in cloud, show add to cloud
        // if not on menu show add to grocery list

        return (
            <React.Fragment>

                {(inCloud || isAuthor) && <InCloudButton disabled={true}/>}

                {inCloud && !isAuthor &&
                <RemoveButton onClick={this.removeFromCloud}/>}

                {!inCloud && !isAuthor && <AddToCloudButton disabled={inCloud} onClick={this.addToCloud}/>}

                <AddToGroceryListButton
                    disabled={inMenu}
                    onClick={this.props.addToGroceryList}/>

                {(apiStore.user.isAdmin || isAuthor) &&
                <DeleteButton onClick={this.props.deleteRecipe}/>}

            </React.Fragment>
        );
    }
}
