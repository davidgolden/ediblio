import React, {useState, useContext} from 'react';
import PropTypes from 'prop-types';
import AddIngredients from '../ingredients/AddIngredients';
import classNames from 'classnames';
import styles from './styles/ShowRecipe.module.scss';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faShoppingBag, faStar} from '@fortawesome/free-solid-svg-icons';
import Button from "../utilities/buttons/Button";
import {ApiStoreContext} from "../../stores/api_store";
import Link from "next/link";
import {observer} from "mobx-react";
import Rating from 'react-rating';
import {clientFetch} from "../../utils/cookies";
import Markdown from 'react-markdown';
import {getCdnImageUrl} from "../../utils/images";

const showRecipeContainerClassName = classNames({
    [styles.showRecipeContainer]: true,
});
const showRecipeTitleClassName = classNames({
    [styles.showRecipeTitle]: true,
});
const showRecipeImageClassName = classNames({
    [styles.showRecipeImage]: true,
});
const recipeNotesClassName = classNames({
    [styles.recipeNotes]: true,
});

const ShowRecipe = observer(props => {
    const [added, setAdded] = useState(false);
    const [avgRating, setAvgRating] = useState(props.recipe.avg_rating ? Math.round(props.recipe.avg_rating * 2) / 2 : 0);
    const [userRating, setUserRating] = useState(props.recipe.user_rating);
    const [ingredientIdsToAdd, setIngredientIdsToAdd] = useState(props.recipe.ingredients.map(ing => ing.id));
    const context = useContext(ApiStoreContext);

    const handleAddToList = async () => {
        try {
            await props.addToGroceryList(props.recipe.ingredients.filter(ing => ingredientIdsToAdd.includes(ing.id)));
            setAdded(true);
        } catch (error) {
            context.handleError(error);
        }
    };

    const showRecipeButtonsClassName = classNames({
        [styles.showRecipeButtons]: true,
        [styles.showRecipeButtonsDisabled]: added,
    });
    const showRecipeIngredientsClassName = classNames({
        [styles.showRecipeIngredients]: true,
        [styles.showRecipeIngredientsFull]: !props.recipe.image,
    });

    return (
        <div className={showRecipeContainerClassName}>
            <div className={showRecipeTitleClassName}>
                <div>
                    <h1>{props.recipe.name} {props.recipe.total_ratings > 0 &&
                    <span>{avgRating} <FontAwesomeIcon icon={faStar}/></span>}</h1>
                    <h2>Submitted by <Link href={"/users/[user_id]/recipes"}
                                           as={`/users/${props.recipe.author_id}/recipes`}>
                        {props.recipe.author_username}
                    </Link>. {props.recipe.url &&
                    <a href={props.recipe.url} target='_blank'>View Original Recipe</a>}</h2>
                    <div className={styles.ratingContainer}>
                        {(userRating || context.loggedIn) && <>
                            <Rating
                                fractions={2}
                                emptySymbol={"far fa-star"}
                                fullSymbol="fas fa-star"
                                readonly={!context.loggedIn}
                                initialRating={userRating} // needs to be actual rating
                                onClick={async v => {
                                    if (context.loggedIn) {
                                        const response = await clientFetch.post('/api/rating', {
                                            recipe_id: props.recipe.id,
                                            rating: v,
                                        });
                                        setAvgRating(Math.round(response.data.avg_rating * 2) / 2);
                                        setUserRating(v);
                                    }
                                }}
                            />
                        </>}
                    </div>
                </div>
            </div>
            <div className={showRecipeImageClassName}>
                <img src={getCdnImageUrl(props.recipe.image)}/>
            </div>
            <div className={showRecipeIngredientsClassName}>
                <h3>Recipe Notes</h3>
                <div className={recipeNotesClassName}>
                    <Markdown children={props.recipe.notes}/>
                </div>
                <AddIngredients
                    canAdd={false}
                    ingredients={props.recipe.ingredients}
                    selectedIngredientIds={ingredientIdsToAdd}
                    setSelectedIngredientIds={setIngredientIdsToAdd}
                    handleUpdateIngredient={props.handleUpdateIngredient}
                />
                <div className={showRecipeButtonsClassName}>
                    {context.loggedIn ? <Button onClick={handleAddToList}>
                        <FontAwesomeIcon icon={faShoppingBag}/> {added ? 'Added To' : 'Add To'} Grocery List
                    </Button> : <p>Login or Register to Add to Grocery List</p>}
                </div>
            </div>
        </div>
    )
});

ShowRecipe.propTypes = {
    handleUpdateIngredient: PropTypes.func.isRequired,
    recipe: PropTypes.object.isRequired,
};

export default ShowRecipe;
