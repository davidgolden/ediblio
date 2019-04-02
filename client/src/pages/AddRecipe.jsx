import React from 'react';
import RecipeInformation from '../components/recipes/RecipeInformation';
import AddIngredients from '../components/recipes/AddIngredients';
import {inject, observer} from 'mobx-react';
import PropTypes from 'prop-types';
import Button from "../components/utilities/buttons/Button";
import {recipeTags} from "../stores/Setings";
import styles from './styles/AddRecipe.scss';
import classNames from 'classnames';

const AddTags = (props) => {
    const tagClassName = classNames({
        [styles.tag]: true,
    });

    const TagList = recipeTags.map((tag, i) => {
        return (
            <div className={tagClassName} key={i}>
                <label>
                    <input
                        checked={props.selectedTags.includes(tag)}
                        type="checkbox"
                        name="recipe[tags]"
                        value={tag}
                        onChange={(e) => props.toggleTag(tag)}
                    />
                    {tag}
                </label>
            </div>
        )
    });

    return (
        <div>
            <h3>Add Tags</h3>
            {TagList}
        </div>
    )
};

@inject('apiStore')
@observer
export default class RecipeForm extends React.Component {
    static defaultProps = {
        editMode: false,
    };

    constructor(props) {
        super(props);

        this.state = {
            name: props.editMode ? props.recipe.name : '',
            url: props.editMode ? props.recipe.url : '',
            image: props.editMode ? props.recipe.image : '',
            notes: props.editMode ? props.recipe.notes : '',
            ingredients: props.editMode ? props.recipe.ingredients : [],
            tags: props.editMode ? props.recipe.tags : [],
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

    handleUpdateIngredient = (index, ingredient) => {
        let ingredientList = this.state.ingredients;
        ingredientList[index] = {
            ...ingredientList[index],
            ...ingredient,
        };
        this.setState({ingredients: ingredientList});
    };

    handleAddIngredient = () => {
        let ingredientList = this.state.ingredients;
        ingredientList.push({quantity: '', measurement: '#', name: ''});
        this.setState({ingredients: ingredientList})
    };

    handleDeleteIngredient = index => {
        let ingredientList = this.state.ingredients;
        ingredientList.splice(index, 1);
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
        if (this.props.editMode) {
            this.props.apiStore.patchRecipe(this.props.recipe._id, {...this.state})
                .then(recipe => {
                    this.props.updateRecipe(recipe);
                    this.props.toggleEdit();
                })
        } else {
            this.props.apiStore.createRecipe({...this.state})
                .then(() => {
                    this.props.navigate("/");
                })
        }
    };

    render() {
        const recipeFormClassName = classNames({
            [styles.recipeForm]: true,
        });
        const submitButtonClassName = classNames({
            [styles.submitButton]: true,
            [styles.submitButtonDisabled]: !(this.state.name && this.state.image)
        });

        return (
            <div className={recipeFormClassName}>
                <h2>Submit a Recipe</h2>
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
                <AddTags toggleTag={this.toggleTag} selectedTags={this.state.tags}/>
                <div>
                    {this.props.apiStore.isLoggedIn ?
                        <Button className={submitButtonClassName} onClick={this.handleSubmit}>Submit!</Button> :
                        <p>You must be logged in to add a recipe!</p>}
                </div>
            </div>
        )
    }
}
