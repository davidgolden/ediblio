import React from 'react';
import RecipeInformation from '../components/views/recipes/recipe_information';
import AddIngredients from '../components/views/recipes/add_ingredients';
import {inject, observer} from 'mobx-react';

const allTags = ['Dinner', 'Breakfast', 'Dessert', 'Quick/Easy', 'Vegetarian', 'Vegan', 'Dairy-Free', 'Gluten-Free'];

const AddTags = (props) => {
    const TagList = props.tags.map((tag, i) => {
        let check = false;
        if (props.selectedTags.includes(tag)) {
            check = true;
        }
        return (
            <div className='tag' key={i}>
                <label className="form-check-label">
                    <input
                        checked={check}
                        className="form-check-input"
                        type="checkbox"
                        name="recipe[tags]"
                        value={tag}
                        onChange={(e) => props.toggleTag(tag)}
                    />
                    {tag}
                </label>
            </div>
        )
    })


    return (
        <div className="form-check">
            <h3>Add Tags</h3>
            {TagList}
        </div>
    )
}

inject('apiStore')
@observer
export default class RecipeForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: '',
            url: '',
            image: '',
            notes: '',
            ingredients: [],
            tags: [],
        };
    }

    toggleTag = tag => {
        if (this.state.tags.includes(tag)) {
            // remove it
            let i = this.state.tags.indexOf(tag);
            let newTags = this.state.tags;
            newTags.splice(i, 1);
            this.setState({tags: newTags})
        } else {
            // add it
            let newTags = this.state.tags;
            newTags.push(tag);
            this.setState({tags: newTags});
        }
    };

    handleUpdateIngredient = (ingredient, i) => {
        let ingredientList = this.state.ingredients;
        ingredientList.splice(i, 1, ingredient);
        this.setState({ingredients: ingredientList});
    };

    handleAddIngredient = () => {
        let ingredientList = this.state.ingredients;
        let ingredient = {quantity: '', measurement: '#', name: ''};
        ingredientList.push(ingredient);
        this.setState({ingredients: ingredientList})
    };

    handleDeleteIngredient = (event, i) => {
        let ingredientList = this.state.ingredients;
        ingredientList.splice(i, 1);
        this.setState({ingredients: ingredientList});
    };

    handleRecipeNameChange = e => {
        this.setState({name: e.target.value});
    };

    handleRecipeLinkChange = e => {
        this.setState({url: e.target.value});
    };

    handleRecipeImageChange = image => {
        this.setState({image: image});
    };

    handleRecipeNotesChange = e => {
        this.setState({notes: e.target.value});
    };

    handleSubmit = () => {
        this.props.apiStore.createRecipe({...this.state})
    };

    render() {
        return (
            <form>
                {this.props.view === 'addrecipe' && <h1 className='text-center title'>Submit a Recipe</h1>}
                <RecipeInformation
                    name={this.state.name}
                    url={this.state.url}
                    image={this.state.image}
                    notes={this.state.notes}
                    handleRecipeLinkChange={this.handleRecipeLinkChange}
                    handleRecipeNameChange={this.handleRecipeNameChange}
                    handleRecipeImageChange={this.handleRecipeImageChange}
                    handleRecipeNotesChange={this.handleRecipeNotesChange}
                />
                <AddIngredients
                    ingredients={this.state.ingredients}
                    handleAddIngredient={this.handleAddIngredient}
                    handleUpdateIngredient={this.handleUpdateIngredient}
                    handleDeleteIngredient={this.handleDeleteIngredient}
                />
                {/*<AddTags toggleTag={this.toggleTag} tags={this.props.tags} selectedTags={this.state.tags} />*/}
                <div className='form-group'>
                    <button className='btn btn-lg btn-success' onClick={this.handleSubmit}>Submit!</button>
                </div>
            </form>
        )
    }
}
