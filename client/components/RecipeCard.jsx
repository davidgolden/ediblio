import React, {useState, useContext} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './styles/RecipeCard.module.scss';
import RecipeButtons from "./recipes/RecipeButtons";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faImage, faStar} from '@fortawesome/free-solid-svg-icons';
import UserImageSmall from "./utilities/UserImageSmall";
import {ApiStoreContext} from "../stores/api_store";
import Button from "./utilities/buttons/Button";
import Link from "next/link";
import {clientFetch} from "../utils/cookies";

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

const RecipeCard = props => {
    const context = useContext(ApiStoreContext);
    const [showButtons, setShowButtons] = useState(false);
    const [inMenu, setInMenu] = useState(props.recipe.in_menu);

    const addToGroceryList = async () => {
        try {
            const response = await clientFetch.post(`/api/users/${context.user.id}/recipes/${props.recipe.id}`);
            context.user = response.data.user;
            setInMenu(true);
        } catch (error) {
            context.handleError(error);
        }
    };

    const deleteRecipe = () => {
        if (confirm('Are you sure you want to do that?')) {
            props.deleteRecipe(props.recipe.id);
        }
    };

    return (
        <div className={recipeCardClassName} onMouseOver={() => setShowButtons(true)}
             onMouseLeave={() => setShowButtons(false)}>
            <Button onClick={async () => {
                await context.openRecipeModal(props.recipe.id);
            }}>
                <div className={recipeCardImageClassName}>
                    {props.recipe.image ? <img src={props.recipe.image}/> :
                        <div><FontAwesomeIcon icon={faImage}/></div>}
                </div>
                <div className={recipeCardTextClassName}>
                    <h3>{props.recipe.name}</h3>
                </div>
            </Button>
            <div className={recipeCardButtonClassName}>
                {showButtons && <RecipeButtons
                    recipe={props.recipe}
                    inMenu={inMenu}
                    addToGroceryList={addToGroceryList}
                    deleteRecipe={deleteRecipe}
                />}
            </div>
            {showButtons && <Link href={"/users/[user_id]/recipes"} as={`/users/${props.recipe.author_id}/recipes`}>
                <a>
                    <UserImageSmall profileImage={props.recipe.author_image} size={50} className={styles.userImage}/>
                </a>
            </Link>}
            {showButtons && props.recipe.total_ratings > 0 && <div className={styles.recipeRating}>
                <FontAwesomeIcon
                    icon={faStar}/> {props.recipe.avg_rating ? Math.round(props.recipe.avg_rating * 2) / 2 : 0} / {props.recipe.total_ratings}
            </div>}
        </div>
    )
};

RecipeCard.propTypes = {
    recipe: PropTypes.object.isRequired,
    deleteRecipe: PropTypes.func.isRequired,
};

export default RecipeCard;
