import React, { useState, useContext, useEffect } from 'react';
import RecipeForm from './AddRecipe';
import ShowRecipe from '../components/recipes/ShowRecipe';
import styles from './styles/RecipeContainer.scss';
import classNames from 'classnames';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch, faEdit} from '@fortawesome/free-solid-svg-icons'
import Button from "../components/utilities/buttons/Button";
import RecipeButtons from "../components/recipes/RecipeButtons";
import {ApiStoreContext} from "../stores/api_store";

const RecipeContainer = props => {
    const [edit, setEdit] = useState(false);
    const [recipe, setRecipe] = useState(null);

    const context = useContext(ApiStoreContext);

    const addToGroceryList = () => {
        context.addToGroceryList(recipe._id, recipe.ingredients);
    };

    const updateRecipe = fullRecipe => {
        setRecipe(fullRecipe);
    };

    useEffect(() => {
        context.getRecipe(props.recipe_id)
            .then(recipe => {
                setRecipe(recipe);
            });
    });

    const toggleEdit = () => {
        setEdit(!edit);
    };

    const handleUpdateIngredient = (index, ingredient) => {
        let ingredientList = recipe.ingredients;
        ingredientList[index] = {
            ...ingredientList[index],
            ...ingredient,
        };
        setRecipe({
            ...recipe,
            ingredients: ingredientList,
        });
    };

    const handleAddIngredient = () => {
        let ingredientList = recipe.ingredients;
        let ingredient = {quantity: '', measurement: '#', name: ''};
        ingredientList.push(ingredient);
        setRecipe({
            ...recipe,
            ingredients: ingredientList,
        });
    };

    const handleDeleteIngredient = index => {
        let ingredientList = recipe.ingredients;
        ingredientList.splice(index, 1);
        setRecipe({
            ...recipe,
            ingredients: ingredientList,
        });
    };

    const deleteRecipe = () => {
        if (confirm('Are you sure you want to do that?')) {
            context.deleteRecipe(props.recipe_id)
                .then(() => {
                    props.navigate("/");
                });
        }
    };

    const recipeContainerClassName = classNames({
        [styles.recipeContainer]: true,
    });
    const recipeEditButtonsClassName = classNames({
        [styles.recipeEditButtons]: true,
    });
    const toggleEditClassName = classNames({
        [styles.toggleEdit]: true,
    });

    return (
        <div className={recipeContainerClassName}>

            <div className={recipeEditButtonsClassName}>
                {recipe && context.isLoggedIn && recipe.author.id === context.user._id && (
                    <Button className={toggleEditClassName} onClick={toggleEdit}>
                        {edit === false ? (
                            <React.Fragment>
                                <FontAwesomeIcon icon={faEdit}/> Edit</React.Fragment>) : (
                            <React.Fragment>
                                <FontAwesomeIcon icon={faSearch}/> View
                            </React.Fragment>)
                        }
                    </Button>)}
                {recipe && context.isLoggedIn && <RecipeButtons
                    recipe_id={recipe._id}
                    author_id={recipe.author.id}
                    addToGroceryList={addToGroceryList}
                    deleteRecipe={deleteRecipe}
                />}
            </div>
            {edit === true ? (
                <RecipeForm
                    user={props.user}
                    tags={props.tags}
                    recipe={recipe}
                    toggleEdit={toggleEdit}
                    editMode={edit}
                    updateRecipe={updateRecipe}
                />
            ) : (
                <ShowRecipe
                    recipe={recipe}
                    addToGroceryList={addToGroceryList}
                    handleDeleteIngredient={handleDeleteIngredient}
                    handleAddIngredient={handleAddIngredient}
                    handleUpdateIngredient={handleUpdateIngredient}
                />
            )}
        </div>
    )
};

export default RecipeContainer;
