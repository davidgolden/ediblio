import React, {useContext, useState} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './styles/RecipeCard.scss';
import RecipeButtons from "./recipes/RecipeButtons";
import {ApiStoreContext} from "../stores/api_store";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faUser} from '@fortawesome/free-solid-svg-icons';
import Link from "next/link";

const RecipeCard = props => {

    const context = useContext(ApiStoreContext);
    const [showButtons, setShowButtons] = useState(false);

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
    const userImageClassName = classNames({
        [styles.userImage]: true,
    });

    return (
        <div className={recipeCardClassName} onMouseOver={() => setShowButtons(true)}
             onMouseLeave={() => setShowButtons(false)}>
            <Link href={`/recipes/${props.recipe._id}`}>
                <>
                    <div>
                        <img src={props.recipe.image} className={recipeCardImageClassName}/>
                    </div>
                    <div className={recipeCardTextClassName}>
                        <h3>{props.recipe.name}</h3>
                    </div>
                </>
            </Link>
            <div className={recipeCardButtonClassName}>
                {showButtons && <RecipeButtons
                    recipe_id={props.recipe._id}
                    author_id={props.recipe.author_id._id}
                    addToGroceryList={addToGroceryList}
                    deleteRecipe={deleteRecipe}
                />}
            </div>
            <div className={userImageClassName}>
                {props.recipe.author_id.profileImage ?
                    <img src={props.recipe.author_id.profileImage}/> :
                    <FontAwesomeIcon icon={faUser}/>}
            </div>
        </div>
    )
};

RecipeCard.propTypes = {
    recipe: PropTypes.object,
};

export default RecipeCard;
