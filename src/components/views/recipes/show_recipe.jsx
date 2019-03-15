import React from 'react';
import AddIngredients from './add_ingredients';

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


class ShowRecipe extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            recipe: props.recipe
        }

        this.handleUpdateIngredient = (ingredient, i) => {
            let ingredientList = this.state.recipe.ingredients;
            ingredientList.splice(i, 1, ingredient);
            this.setState({ingredients: ingredientList});
        }
        this.handleAddIngredient = event => {
            event.preventDefault();
            let ingredientList = this.state.recipe.ingredients;
            let ingredient = {quantity: '', measurement: '#', name: ''};
            ingredientList.push(ingredient);
            this.setState({ingredients: ingredientList})
        }
        this.handleDeleteIngredient = (event, i) => {
            event.preventDefault();
            let ingredientList = this.state.recipe.ingredients;
            ingredientList.splice(i, 1);
            this.setState({ingredients: ingredientList});
        }

        this.addToGroceryList = (event) => {
            event.preventDefault();
            let xml = new XMLHttpRequest();
            xml.open("POST", `/recipes/${this.state.recipe._id}/add`, true);
            xml.setRequestHeader("Content-Type", "application/json");
            xml.setRequestHeader('Access-Control-Allow-Headers', '*');
            xml.setRequestHeader('Access-Control-Allow-Origin', '*');
            xml.send(JSON.stringify({ingredients: this.state.recipe.ingredients}));
            xml.onreadystatechange = () => {
                if (xml.readyState === 4 && xml.status === 200) {
                    alert('Added to grocery list!')
                    return this.props.showRecipe(false);
                }
                if (xml.readyState === 4 && xml.status !== 200) {
                    return alert(xml.response)
                }
            }
        }
    }

    // componentDidMount() {
    //     // need to get id from url
    //     console.log('recipe: ', this.props.recipe_id)
    //     let xml = new XMLHttpRequest();
    //     xml.open("GET", `/recipes/${this.props.recipe_id}`, true);
    //     xml.setRequestHeader("Content-Type", "application/json");
    //     xml.setRequestHeader('Access-Control-Allow-Headers', '*');
    //     xml.setRequestHeader('Access-Control-Allow-Origin', '*');
    //     xml.send(JSON.stringify({id: this.props.recipe_id}));
    //     xml.onreadystatechange = () => {
    //         if (xml.readyState === 4 && xml.status === 200) {
    //             console.log('recipe: ', this.props.recipe_id)
    //             this.setState({recipe: true, user: res.user});
    //         }
    //         if (xml.readyState === 4 && xml.status !== 200) {
    //             return alert(xml.response)
    //         }
    //     }
    // }

    render() {
        return (
            <div className='show-recipe-container show-recipe-style'>
                <div className='show-recipe-title'>
                    {this.state.recipe && <RecipeTitle
                        name={this.state.recipe.name}
                        author={this.state.recipe.author}
                        url={this.state.recipe.url}
                        tags={this.state.recipe.tags}
                        sortByUser={this.props.sortByUser}
                        showRecipe={this.props.showRecipe}
                    />}
                </div>
                <div className='show-recipe-image'>
                    {this.state.recipe && <img src={this.state.recipe.image}/>}
                </div>
                {this.state.recipe && <div className='show-recipe-ingredients'>
                    <h3>Recipe Notes</h3>
                    <p>{this.state.recipe.notes}</p>
                    <AddIngredients
                        ingredients={this.state.recipe.ingredients}
                        handleAddIngredient={this.handleAddIngredient}
                        handleUpdateIngredient={this.handleUpdateIngredient}
                        handleDeleteIngredient={this.handleDeleteIngredient}
                    />
                    <div className='show-recipe-buttons form-group'>
                        <button className='btn btn-success btn-md' onClick={(event) => this.addToGroceryList(event)}><i
                            className="fas fa-shopping-bag"></i> Add To Grocery List
                        </button>
                    </div>
                </div>}
            </div>
        )
    }
}

export default ShowRecipe;
