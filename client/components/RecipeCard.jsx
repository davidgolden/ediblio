import React, {useContext, useState} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './styles/RecipeCard.scss';
import RecipeButtons from "./recipes/RecipeButtons";
import {ApiStoreContext} from "../stores/api_store";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faUser, faImage} from '@fortawesome/free-solid-svg-icons';
import Link from "next/link";
import UserImageSmall from "./utilities/UserImageSmall";

const RecipeCard = props => {

    const context = useContext(ApiStoreContext);
    const [showButtons, setShowButtons] = useState(false);

    const deleteRecipe = () => {
        if (confirm('Are you sure you want to do that?')) {
            props.deleteRecipe(props.recipe._id);
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
        <div className={recipeCardClassName} onMouseOver={() => setShowButtons(true)}
             onMouseLeave={() => setShowButtons(false)}>
            <Link href={`/recipes/[recipe_id]`} as={`/recipes/${props.recipe._id}`}>
                <a>
                    <div className={recipeCardImageClassName}>
                        {props.recipe.image ? <img src={props.recipe.image} /> : <div><FontAwesomeIcon icon={faImage} /></div>}
                    </div>
                    <div className={recipeCardTextClassName}>
                        <h3>{props.recipe.name}</h3>
                    </div>
                </a>
            </Link>
            <div className={recipeCardButtonClassName}>
                {showButtons && <RecipeButtons
                    recipe_id={props.recipe._id}
                    author_id={props.recipe['owner.id']}
                    addToGroceryList={addToGroceryList}
                    deleteRecipe={deleteRecipe}
                />}
            </div>
            {showButtons && <UserImageSmall id={props.recipe['owner.id']} profileImage={props.recipe['owner.profile_image']}/>}
        </div>
    )
};

RecipeCard.propTypes = {
    recipe: PropTypes.object.isRequired,
    deleteRecipe: PropTypes.func.isRequired,
};

export default RecipeCard;
