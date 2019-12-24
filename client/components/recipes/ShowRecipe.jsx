import React, {useState, useContext} from 'react';
import PropTypes from 'prop-types';
import AddIngredients from './AddIngredients';
import classNames from 'classnames';
import styles from './styles/ShowRecipe.scss';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faShoppingBag} from '@fortawesome/free-solid-svg-icons';
import Button from "../utilities/buttons/Button";
import {ApiStoreContext} from "../../stores/api_store";
import Link from "next/link";
import {observer} from "mobx-react";

const ShowRecipe = observer(props => {
    const [added, setAdded] = useState(false);
    const context = useContext(ApiStoreContext);

    const handleAddToList = () => {
        props.addToGroceryList();
        setAdded(true);
    };

    const showRecipeContainerClassName = classNames({
        [styles.showRecipeContainer]: true,
    });
    const showRecipeTitleClassName = classNames({
        [styles.showRecipeTitle]: true,
    });
    const showRecipeImageClassName = classNames({
        [styles.showRecipeImage]: true,
    });
    const showRecipeButtonsClassName = classNames({
        [styles.showRecipeButtons]: true,
        [styles.showRecipeButtonsDisabled]: added,
    });
    const showRecipeIngredientsClassName = classNames({
        [styles.showRecipeIngredients]: true,
    });

    return (
        <div className={showRecipeContainerClassName}>
            <div className={showRecipeTitleClassName}>
                {props.recipe && <div>
                    <h1>{props.recipe.name}</h1>
                    <h2>Submitted by <Link href={`/users/${props.recipe.author_id._id}/recipes`}>
                        <a>
                            {props.recipe.author_id.username}
                        </a>
                    </Link>. {props.recipe.url &&
                    <a href={props.recipe.url} target='_blank'>View Original Recipe</a>}</h2>
                    <div>
                        {props.recipe.tags.map(tag => {
                            return <span key={tag}>{tag}</span>
                        })}
                    </div>
                </div>}
            </div>
            <div className={showRecipeImageClassName}>
                {props.recipe && <img src={props.recipe.image}/>}
            </div>
            {props.recipe && <div className={showRecipeIngredientsClassName}>
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
            </div>}
        </div>
    )
});

ShowRecipe.propTypes = {
    handleUpdateAllIngredients: PropTypes.func.isRequired,
    recipe: PropTypes.object.isRequired,
};

export default ShowRecipe;
