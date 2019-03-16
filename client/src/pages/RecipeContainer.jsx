import React from 'react';
import RecipeForm from './AddRecipe';
import ShowRecipe from '../components/recipes/ShowRecipe';
import {inject, observer} from 'mobx-react';
import {addIngredient, canBeAdded} from "../utils/conversions";
import styles from './styles/RecipeContainer.scss';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import Button from "../components/utilities/buttons/Button";

@inject('apiStore')
@observer
export default class RecipeContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            edit: false,
            recipe: null,
        };
    }

    addToGroceryList = () => {
        // add current recipe to menu
        // add all ingredients to grocery list
        const currentMenu = this.props.apiStore.user.menu;
        currentMenu.push(this.props.recipe_id);

        const currentGroceryList = this.props.apiStore.user.groceryList;

        const onCurrentList = ingredient => {
            return currentGroceryList.findIndex(item => {
                return item.name === ingredient ||
                    item.name === ingredient + 's' ||
                    item.name === ingredient + 'es' ||
                    item.name === ingredient.slice(0, -1) ||
                    item.name === ingredient.slice(0, -2);
            })
        };

        this.state.recipe.ingredients
            .filter(item => item) // filter out ingredients that are undefined??
            .forEach(ingredient => {
                const i = onCurrentList(ingredient.name);
                if (i > -1) {
                    let m = currentGroceryList[i].measurement;
                    let q = currentGroceryList[i].quantity;
                    // check if item can be added
                    if (canBeAdded(m, ingredient.measurement)) {
                        // if it can be added, add it
                        let newQM = addIngredient(q, m, Number(ingredient.quantity), ingredient.measurement);
                        currentGroceryList[i].quantity = newQM.quantity;
                        currentGroceryList[i].measurement = newQM.measurement;
                    } else {
                        // if it can't be added, push it to grocery list
                        currentGroceryList.splice(currentGroceryList.length, 0, ingredient);
                    }
                } else {
                    // here if ingredient is not on current list
                    currentGroceryList.splice(currentGroceryList.length, 0, ingredient);
                    // user.groceryList.push(ingredient);
                }
            });

        this.props.apiStore.patchUser({
            menu: currentMenu,
            groceryList: currentGroceryList,
        });
    };

    componentDidMount() {
        this.props.apiStore.getRecipe(this.props.recipe_id)
            .then(recipe => {
                this.setState({
                    recipe: recipe,
                })
            });
    }

    toggleEdit = () => {
        this.setState(prevState => {
            return {
                edit: !prevState.edit
            }
        });
    };

    handleUpdateIngredient = (ingredient, i) => {
        let ingredientList = this.state.recipe.ingredients;
        ingredientList.splice(i, 1, ingredient);
        this.setState({
            recipe: {
                ...this.state.recipe,
                ingredients: ingredientList,
            }
        });
    };

    handleAddIngredient = () => {
        let ingredientList = this.state.recipe.ingredients;
        let ingredient = {quantity: '', measurement: '#', name: ''};
        ingredientList.push(ingredient);
        this.setState({
            recipe: {
                ...this.state.recipe,
                ingredients: ingredientList,
            }
        });
    };

    handleDeleteIngredient = (event, i) => {
        let ingredientList = this.state.recipe.ingredients;
        ingredientList.splice(i, 1);
        this.setState({
            recipe: {
                ...this.state.recipe,
                ingredients: ingredientList,
            }
        });
    };

    deleteRecipe = () => {
        if (confirm('Are you sure you want to do that?')) {
            this.props.apiStore.deleteRecipe(this.props.recipe_id);
        }
    };

    render() {
        const recipeContainerClassName = classNames({
            [styles.recipeContainer]: true,
        });
        const recipeEditButtonsClassName = classNames({
            [styles.recipeEditButtons]: true,
        });

        return (
            <div className={recipeContainerClassName}>
                {this.state.recipe && this.props.apiStore.isLoggedIn && this.state.recipe.author.id === this.props.apiStore.user._id && (
                    <div className={recipeEditButtonsClassName}>
                        <Button onClick={this.toggleEdit}>
                            {this.state.edit === false ? (
                                <React.Fragment>
                                    <FontAwesomeIcon icon={faEdit}/> Edit</React.Fragment>) : (
                                <React.Fragment>
                                    <FontAwesomeIcon icon={faSearch}/> View
                                </React.Fragment>)
                            }
                        </Button>
                        <Button onClick={this.deleteRecipe}>
                            <FontAwesomeIcon icon={faTrashAlt}/> Delete Recipe
                        </Button>
                    </div>
                )}
                {this.state.edit === true ? (
                    <RecipeForm
                        user={this.props.user}
                        tags={this.props.tags}
                        recipe={this.state.recipe}
                        toggleEdit={this.toggleEdit}
                        editMode={this.state.edit}
                    />
                ) : (
                    <ShowRecipe
                        recipe={this.state.recipe}
                        addToGroceryList={this.addToGroceryList}
                        handleDeleteIngredient={this.handleDeleteIngredient}
                        handleAddIngredient={this.handleAddIngredient}
                        handleUpdateIngredient={this.handleUpdateIngredient}
                    />
                )}
            </div>
        )
    }
}
