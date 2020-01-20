import React, {useState, useContext} from 'react';
import PropTypes from 'prop-types';
import AddIngredients from './AddIngredients';
import classNames from 'classnames';
import styles from './styles/ShowRecipe.scss';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faShoppingBag, faStar, faStarHalf, faStarHalfAlt} from '@fortawesome/free-solid-svg-icons';
import Button from "../utilities/buttons/Button";
import {ApiStoreContext} from "../../stores/api_store";
import Link from "next/link";
import {observer} from "mobx-react";
import Rating from 'react-rating';
import axios from 'axios';

const showRecipeContainerClassName = classNames({
    [styles.showRecipeContainer]: true,
});
const showRecipeTitleClassName = classNames({
    [styles.showRecipeTitle]: true,
});
const showRecipeImageClassName = classNames({
    [styles.showRecipeImage]: true,
});

const ShowRecipe = observer(props => {
    const [added, setAdded] = useState(false);
    const context = useContext(ApiStoreContext);

    const handleAddToList = () => {
        props.addToGroceryList();
        setAdded(true);
    };

    const showRecipeButtonsClassName = classNames({
        [styles.showRecipeButtons]: true,
        [styles.showRecipeButtonsDisabled]: added,
    });
    const showRecipeIngredientsClassName = classNames({
        [styles.showRecipeIngredients]: true,
        [styles.showRecipeIngredientsFull]: !props.recipe.image,
    });

    console.log(props.recipe);

    return (
        <div className={showRecipeContainerClassName}>
            <div className={showRecipeTitleClassName}>
                <div>
                    <h1>{props.recipe.name}</h1>
                    <h2>Submitted by <Link href={"/users/[user_id]/recipes"} as={`/users/${props.recipe.author_id._id}/recipes`}>
                        <a>
                            {props.recipe.author_id.username}
                        </a>
                    </Link>. {props.recipe.url &&
                    <a href={props.recipe.url} target='_blank'>View Original Recipe</a>}</h2>
                    <div className={styles.ratingContainer}>
                        <Rating
                            fractions={2}
                            emptySymbol={"far fa-star"}
                            fullSymbol="fas fa-star"
                            quiet={!context.user}
                            initialRating={props.recipe.rating?.[0]?.avgRating ? Math.round(props.recipe.rating[0].avgRating*2)/2 : 0} // needs to be actual rating
                            onClick={v => {
                                axios.post('/api/rating', {
                                    recipe_id: props.recipe._id,
                                    rating: v,
                                })
                            }} // create rating
                            // onHover={() => {}} // switch from displaying actual to animation
                            // onChange={() => {}} // change rating to user's rating
                        />
                    </div>
                    <div>
                        {props.recipe.tags.map(tag => {
                            return <span key={tag}>{tag}</span>
                        })}
                    </div>
                </div>
            </div>
            <div className={showRecipeImageClassName}>
                <img src={props.recipe.image}/>
            </div>
            <div className={showRecipeIngredientsClassName}>
                <h3>Recipe Notes</h3>
                <p>{props.recipe.notes}</p>
                <AddIngredients
                    ingredients={props.recipe.ingredients}
                    handleUpdateAllIngredients={props.handleUpdateAllIngredients}
                />
                <div className={showRecipeButtonsClassName}>
                    {context.user ? <Button onClick={handleAddToList}>
                        <FontAwesomeIcon icon={faShoppingBag}/> {added ? 'Added To' : 'Add To'} Grocery List
                    </Button> : <p>Login or Register to Add to Grocery List</p>}
                </div>
            </div>
        </div>
    )
});

ShowRecipe.propTypes = {
    handleUpdateAllIngredients: PropTypes.func.isRequired,
    recipe: PropTypes.object.isRequired,
};

export default ShowRecipe;
