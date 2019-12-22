import React, {useState, useContext, useEffect} from 'react';
import RecipeForm from './AddRecipe';
import ShowRecipe from '../client/components/recipes/ShowRecipe';
import styles from './styles/RecipeContainer.scss';
import classNames from 'classnames';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch, faEdit} from '@fortawesome/free-solid-svg-icons'
import Button from "../client/components/utilities/buttons/Button";
import RecipeButtons from "../client/components/recipes/RecipeButtons";
import {ApiStoreContext} from "../client/stores/api_store";
import {observer} from "mobx-react";
import axios from "axios";

const RecipeContainer = observer(props => {
    const [edit, setEdit] = useState(false);
    const [recipe, setRecipe] = useState(props.recipe);

    const context = useContext(ApiStoreContext);

    const addToGroceryList = () => {
        context.addToGroceryList(recipe._id, recipe.ingredients);
    };

    const updateRecipe = fullRecipe => {
        setRecipe(fullRecipe);
    };

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

    const handleAddIngredient = (quantity = '1', measurement = '#', name = '') => {
        let ingredientList = recipe.ingredients;
        let ingredient = {quantity, measurement, name};
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
                {recipe && context.user && (recipe.author_id._id === context.user._id || context.user.isAdmin) && (
                    <Button className={toggleEditClassName} onClick={toggleEdit}>
                        {edit === false ? (
                            <React.Fragment>
                                <FontAwesomeIcon icon={faEdit}/> Edit</React.Fragment>) : (
                            <React.Fragment>
                                <FontAwesomeIcon icon={faSearch}/> View
                            </React.Fragment>)
                        }
                    </Button>)}
                    {recipe && context.user && <RecipeButtons
                        recipe_id={recipe._id}
                        author_id={recipe.author_id._id}
                        addToGroceryList={addToGroceryList}
                        deleteRecipe={deleteRecipe}
                    />}
            </div>
            {edit === true ? (
                <RecipeForm
                    // user={props.user}
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
});

RecipeContainer.getInitialProps = async ({req, query}) => {
    const response = await axios.get(`${req.protocol}://${req.headers.host}/api/recipes/${query.recipe_id}`, {
        headers: {
            cookie: req.headers.cookie,
        },
    });
    return {
        recipe: response.data.recipe,
        recipe_id: query.recipe_id,
    };
};

export default RecipeContainer;
