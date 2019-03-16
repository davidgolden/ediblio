import React from 'react';
import {Link, navigate} from "@reach/router";
import PropTypes from 'prop-types';
import {inject, observer} from 'mobx-react';
import classNames from 'classnames';
import styles from './styles/RecipeCard.scss';
import RemoveButton from "./utilities/buttons/RemoveButton";
import InCloudButton from "./utilities/buttons/InCloudButton";
import AddToCloudButton from "./utilities/buttons/AddToCloudButton";
import AddToGroceryListButton from "./utilities/buttons/AddToGroceryListButton";
import DeleteButton from "./utilities/buttons/DeleteButton";

@inject('apiStore')
@observer
export default class RecipeCard extends React.Component {
    static propTypes = {
        recipe: PropTypes.object,
    };

    removeFromCloud = () => {
        let currentCloud = this.props.apiStore.user.recipes;
        currentCloud = currentCloud.filter(recipe => recipe.id !== this.props.recipe.id);
        this.props.apiStore.patchUser({
            recipes: currentCloud,
        })
    };

    addToCloud = () => {
        let currentCloud = this.props.apiStore.user.recipes;
        currentCloud.push(this.props.recipe);
        this.props.apiStore.patchUser({
            recipes: currentCloud,
        })
    };

    deleteRecipe = () => {
        if (confirm('Are you sure you want to do that?')) {
            this.props.apiStore.deleteRecipe(this.props.recipe._id);
        }
    };

    addToGroceryList = () => {
        const menu = this.props.apiStore.user.menu;
        let groceryList = this.props.apiStore.user.groceryList;

        menu.push(this.props.recipe._id);
        groceryList = groceryList.concat(this.props.recipe.ingredients);

        this.props.apiStore.patchUser({
            menu: menu,
            groceryList: groceryList,
        })
    };

    render() {
        const {recipe, apiStore} = this.props;

        const recipeCardClassName = classNames({
            [styles.recipeCard]: true,
        });
        const recipeCardImageClassName = classNames({
            [styles.recipeCardImage]: true,
        });
        const recipeCardTextClassName = classNames({
            [styles.recipeCardText]: true,
        });
        const recipeCardButtonClassName = classNames({
            [styles.recipeCardButtons]: true,
        });

        let buttons = [];
        if (apiStore.isLoggedIn) {
            const inCloud = apiStore.user.recipes.includes(recipe._id) || recipe.author.id === apiStore.user._id;
            if (apiStore.user._id === recipe.author.id) {
                buttons.push(<InCloudButton disabled={true}/>)
            }
            if (inCloud && apiStore.user._id !== recipe.author.id) {
                buttons.push(<RemoveButton onClick={this.removeFromCloud}/>)
            }
            buttons.push(<AddToCloudButton disabled={inCloud} onClick={this.addToCloud}/>);
            buttons.push(<AddToGroceryListButton disabled={apiStore.user.menu.find(item => item._id === recipe._id)}
                                                 onClick={this.addToGroceryList}/>)
            if (apiStore.user.isAdmin) {
                buttons.push(<DeleteButton onClick={this.deleteRecipe}/>)
            }
        }

        return (
            <div className={recipeCardClassName}>
                <Link to={`/recipes/${recipe._id}`}>
                    <div>
                        <img src={recipe.image} className={recipeCardImageClassName}/>
                    </div>
                    <div className={recipeCardTextClassName}>
                        <h3>{recipe.name}</h3>
                    </div>
                </Link>
                <div className={recipeCardButtonClassName}>
                    {buttons.map(item => item)}
                </div>
            </div>
        )
    }
}
