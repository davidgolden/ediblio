import React from 'react';
import RecipeForm from './AddRecipe';
import ShowRecipe from '../components/recipes/ShowRecipe';
import {inject, observer} from 'mobx-react';
import {addIngredient, canBeAdded} from "../utils/conversions";
import styles from './styles/RecipeContainer.scss';
import classNames from 'classnames';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch, faEdit, faTrashAlt} from '@fortawesome/free-solid-svg-icons'
import Button from "../components/utilities/buttons/Button";
import RecipeButtons from "../components/recipes/RecipeButtons";

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
        this.props.apiStore.addToGroceryList(this.props.recipe_id, this.state.recipe.ingredients);
    }

    updateRecipe = fullRecipe => {
        console.log(fullRecipe)
        this.setState({
            recipe: fullRecipe,
        })
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

    handleUpdateIngredient = (id, ingredient) => {
        let ingredientList = this.state.recipe.ingredients.map(item => {
            if (item._id === id) {
                return {
                    ...item,
                    ...ingredient,
                };
            }
            return item;
        });
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

    handleDeleteIngredient = id => {
        let ingredientList = this.state.recipe.ingredients.filter(item => item._id !== id);
        this.setState({
            recipe: {
                ...this.state.recipe,
                ingredients: ingredientList,
            }
        });
    };

    deleteRecipe = () => {
        if (confirm('Are you sure you want to do that?')) {
            this.props.apiStore.deleteRecipe(this.props.recipe_id)
                .then(() => {
                    this.props.navigate("/");
                });
        }
    };

    render() {
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
                    {this.state.recipe && this.props.apiStore.isLoggedIn && this.state.recipe.author.id === this.props.apiStore.user._id && (
                        <Button className={toggleEditClassName} onClick={this.toggleEdit}>
                            {this.state.edit === false ? (
                                <React.Fragment>
                                    <FontAwesomeIcon icon={faEdit}/> Edit</React.Fragment>) : (
                                <React.Fragment>
                                    <FontAwesomeIcon icon={faSearch}/> View
                                </React.Fragment>)
                            }
                        </Button>)}
                    {this.state.recipe && this.props.apiStore.isLoggedIn && <RecipeButtons
                        recipe_id={this.state.recipe._id}
                        author_id={this.state.recipe.author.id}
                        addToGroceryList={this.addToGroceryList}
                        deleteRecipe={this.deleteRecipe}
                    />}
                </div>
                {this.state.edit === true ? (
                    <RecipeForm
                        user={this.props.user}
                        tags={this.props.tags}
                        recipe={this.state.recipe}
                        toggleEdit={this.toggleEdit}
                        editMode={this.state.edit}
                        updateRecipe={this.updateRecipe}
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
