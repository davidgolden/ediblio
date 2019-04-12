import React, { useContext } from 'react';
import {Link} from "@reach/router";
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './styles/RecipeCard.scss';
import RecipeButtons from "./recipes/RecipeButtons";
import {ApiStoreContext} from "../stores/api_store";

const RecipeCard = props => {

    const context = useContext(ApiStoreContext);

    const deleteRecipe = () => {
        if (confirm('Are you sure you want to do that?')) {
            context.deleteRecipe(props.recipe._id);
        }
    };

    const addToGroceryList = () => {
        context.addToGroceryList(props.recipe._id, props.recipe.ingredients);
    };

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
            <Link to={`/recipes/${props.recipe._id}`}>
                <div>
                    <img src={props.recipe.image} className={recipeCardImageClassName}/>
                </div>
                <div className={recipeCardTextClassName}>
                    <h3>{props.recipe.name}</h3>
                </div>
            </Link>
            <div className={recipeCardButtonClassName}>
                <RecipeButtons
                    recipe_id={props.recipe._id}
                    author_id={props.recipe.author_id._id}
                    addToGroceryList={addToGroceryList}
                    deleteRecipe={deleteRecipe}
                />
            </div>
        </div>
    )
};

RecipeCard.propTypes = {
    recipe: PropTypes.object,
};

export default RecipeCard;
