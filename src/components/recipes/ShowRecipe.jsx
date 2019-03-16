import React from 'react';
import AddIngredients from './AddIngredients';
import classNames from 'classnames';
import styles from './styles/ShowRecipe.scss';
import { inject, observer } from 'mobx-react';

const RecipeTitle = (props) => {
    const RecipeTags = props.tags.map((tag, i) => {
        return <span key={i} className='tag'>{tag}</span>
    })
    return (
        <div>
            <h1>{props.name}</h1>
            <h5>Submitted by <button className='author-text'
                                     onClick={() => props.sortByUser(props.author.id)}>{props.author.username}</button>. {props.url &&
            <a href={props.url} className='author-text' target='_blank'>View Original Recipe</a>}</h5>
            {RecipeTags}
        </div>
    )
}

@inject('apiStore')
@observer
export default class ShowRecipe extends React.Component {
    constructor(props) {
        super(props);
    }

    handleUpdateIngredient = (ingredient, i) => {
        let ingredientList = this.props.recipe.ingredients;
        ingredientList.splice(i, 1, ingredient);
        this.setState({ingredients: ingredientList});
    };

    handleAddIngredient = () => {
        let ingredientList = this.props.recipe.ingredients;
        let ingredient = {quantity: '', measurement: '#', name: ''};
        ingredientList.push(ingredient);
        this.setState({ingredients: ingredientList})
    };

    handleDeleteIngredient = (event, i) => {
        let ingredientList = this.props.recipe.ingredients;
        ingredientList.splice(i, 1);
        this.setState({ingredients: ingredientList});
    };

    render() {
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
        });
        const showRecipeIngredientsClassName = classNames({
            [styles.showRecipeIngredients]: true,
        });

        return (
            <div className={showRecipeContainerClassName}>
                <div className={showRecipeTitleClassName}>
                    {this.props.recipe && <RecipeTitle
                        name={this.props.recipe.name}
                        author={this.props.recipe.author}
                        url={this.props.recipe.url}
                        tags={this.props.recipe.tags}
                        sortByUser={this.props.sortByUser}
                        showRecipe={this.props.showRecipe}
                    />}
                </div>
                <div className={showRecipeImageClassName}>
                    {this.props.recipe && <img src={this.props.recipe.image}/>}
                </div>
                {this.props.recipe && <div className={showRecipeIngredientsClassName}>
                    <h3>Recipe Notes</h3>
                    <p>{this.props.recipe.notes}</p>
                    <AddIngredients
                        ingredients={this.props.recipe.ingredients}
                        handleAddIngredient={this.handleAddIngredient}
                        handleUpdateIngredient={this.handleUpdateIngredient}
                        handleDeleteIngredient={this.handleDeleteIngredient}
                    />
                    <div className={showRecipeButtonsClassName}>
                        {this.props.apiStore.isLoggedIn ? <button onClick={this.props.addToGroceryList}><i
                            className="fas fa-shopping-bag" /> Add To Grocery List
                        </button> : <p>Login or Register to Add to Grocery List</p>}
                    </div>
                </div>}
            </div>
        )
    }
}
