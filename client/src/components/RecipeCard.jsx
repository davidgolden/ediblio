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
import RecipeButtons from "./recipes/RecipeButtons";

@inject('apiStore')
@observer
export default class RecipeCard extends React.Component {
    static propTypes = {
        recipe: PropTypes.object,
    };

    deleteRecipe = () => {
        if (confirm('Are you sure you want to do that?')) {
            this.props.apiStore.deleteRecipe(this.props.recipe._id);
        }
    };

    addToGroceryList = () => {
        this.props.apiStore.addToGroceryList(this.props.recipe._id, this.props.recipe.ingredients);
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
                    <RecipeButtons
                        recipe_id={recipe._id}
                        author_id={recipe.author.id}
                        addToGroceryList={this.addToGroceryList}
                        deleteRecipe={this.deleteRecipe}
                    />
                </div>
            </div>
        )
    }
}
