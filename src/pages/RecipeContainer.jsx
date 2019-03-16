import React from 'react';
import RecipeForm from './AddRecipe';
import ShowRecipe from '../components/recipes/ShowRecipe';
import {inject, observer} from 'mobx-react';
import {addIngredient, canBeAdded} from "../utils/conversions";

@inject('apiStore')
@observer
export default class RecipeContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            edit: false,
            recipe: null,
        };

        // this.sortByTag = (tag) => {
        //     // event.preventDefault();
        //     let allRecipes = Array.from(document.getElementsByName('tags'));
        //     let unmatchedRecipes = allRecipes.filter(recipe => recipe.value.includes(tag) === false);
        //     let matchedRecipes = allRecipes.filter(recipe => recipe.value.includes(tag) === true);
        //
        //     if (tag === 'all') {
        //         allRecipes.forEach(recipe => {
        //             recipe.parentElement.style.display = 'inline-block';
        //
        //             setTimeout(function () {
        //                 recipe.parentElement.style.opacity = '1';
        //             }, 500);
        //         });
        //
        //     } else {
        //         unmatchedRecipes.forEach(recipe => {
        //             recipe.parentElement.style.opacity = '0';
        //             setTimeout(function () {
        //                 recipe.parentElement.style.display = 'none';
        //             }, 500);
        //         });
        //
        //         matchedRecipes.forEach(recipe => {
        //             recipe.parentElement.style.display = 'inline-block';
        //
        //             setTimeout(function () {
        //                 recipe.parentElement.style.opacity = '1';
        //             }, 500);
        //         });
        //     }
        //     ;
        // }
    }

    // sortByUser = (user) => {
    //     // event.preventDefault();
    //     this.setState({show: false}, function () {
    //         let allRecipes = Array.from(document.getElementsByName('author'));
    //         let unmatchedRecipes = allRecipes.filter(recipe => recipe.value.includes(user) === false);
    //         let matchedRecipes = allRecipes.filter(recipe => recipe.value.includes(user) === true);
    //
    //         unmatchedRecipes.forEach(recipe => {
    //             recipe.parentElement.style.opacity = '0';
    //             setTimeout(function () {
    //                 recipe.parentElement.style.display = 'none';
    //             }, 500);
    //         });
    //
    //         matchedRecipes.forEach(recipe => {
    //             recipe.parentElement.style.display = 'inline-block';
    //
    //             setTimeout(function () {
    //                 recipe.parentElement.style.opacity = '1';
    //             }, 500);
    //         });
    //     })
    // }

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
        return (
            <div>
                <div className='show-recipe-state'>
                    {this.state.recipe && this.props.apiStore.isLoggedIn && this.state.recipe.author.id === this.props.apiStore.userId && (
                        <div className='form-group edit'>
                            <button className='btn btn-primary btn-md' onClick={this.toggleEdit}>
                                {this.state.edit === false ? (
                                    <React.Fragment>
                                        <i className="fas fa-edit"/> Edit</React.Fragment>) : (
                                    <React.Fragment>
                                        <i className="fas fa-search"/> View
                                    </React.Fragment>)
                                }
                            </button>
                            <button className='btn btn-primary btn-md' onClick={this.deleteRecipe}><i
                                className="fas fa-trash-alt"/> Delete Recipe
                            </button>
                        </div>
                    )}
                    {this.state.edit === true ? (
                        <div className='show-recipe-style'>
                            <RecipeForm
                                user={this.props.user}
                                tags={this.props.tags}
                                recipe={this.state.recipe}
                                toggleEdit={this.toggleEdit}
                            />
                        </div>
                    ) : (
                        <ShowRecipe
                            recipe={this.state.recipe}
                            addToGroceryList={this.addToGroceryList}
                            handleDeleteIngredient={this.handleDeleteIngredient}
                            handleAddIngredient={this.handleAddIngredient}
                            handleUpdateIngredient={this.handleUpdateIngredient}
                            showRecipe={this.showRecipe}
                            sortByUser={this.sortByUser}
                        />
                    )}
                </div>
            </div>
        )
    }
}
