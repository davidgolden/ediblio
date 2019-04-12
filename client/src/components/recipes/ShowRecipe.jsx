import React, {useState, useContext} from 'react';
import AddIngredients from './AddIngredients';
import classNames from 'classnames';
import styles from './styles/ShowRecipe.scss';
import {Link} from '@reach/router';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faShoppingBag} from '@fortawesome/free-solid-svg-icons';
import Button from "../utilities/buttons/Button";
import {ApiStoreContext} from "../../stores/api_store";

const ShowRecipe = props => {
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
                    <h2>Submitted by <Link to={`/users/${props.recipe.author_id._id}/recipes`}>
                        {props.recipe.author_id.username}
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
                    handleAddIngredient={props.handleAddIngredient}
                    handleUpdateIngredient={props.handleUpdateIngredient}
                    handleDeleteIngredient={props.handleDeleteIngredient}
                />
                <div className={showRecipeButtonsClassName}>
                    {context.isLoggedIn ? <Button onClick={handleAddToList}>
                        <FontAwesomeIcon icon={faShoppingBag}/> {added ? 'Added To' : 'Add To'} Grocery List
                    </Button> : <p>Login or Register to Add to Grocery List</p>}
                </div>
            </div>}
        </div>
    )
};

export default ShowRecipe;
