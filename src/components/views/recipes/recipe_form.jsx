import React from 'react';
import RecipeInformation from './recipe_information';
import AddIngredients from './add_ingredients';

const allTags = ['Dinner', 'Breakfast', 'Dessert', 'Quick/Easy', 'Vegetarian', 'Vegan', 'Dairy-Free', 'Gluten-Free'];

const AddTags = (props) => {
  const TagList = allTags.map((tag, i) => {
    return (
      <div className='tag'>
      <label key={i} className="form-check-label">
        <input
          className="form-check-input"
          type="checkbox"
          name="recipe[tags]"
          value={tag}
          onClick={(e) => props.toggleTag(tag)}
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

class RecipeForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      link: '',
      image: '',
      notes: '',
      ingredients: [],
      tags: []
    }

    this.toggleTag = (tag) => {
      if(this.state.tags.includes(tag)) {
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
      console.log(this.state.tags)
    }
    this.handleRecipeNameChange = name => {
      this.setState({name: name});
    }
    this.handleRecipeLinkChange = link => {
      this.setState({link: link});
    }
    this.handleRecipeImageChange = image => {
      this.setState({image: image});
    }
    this.handleRecipeNotesChange = notes => {
      this.setState({notes: notes});
    }

    this.handleUpdateIngredient = (ingredient, i) => {
      let ingredientList = this.state.ingredients;
      ingredientList.splice(i, 1, ingredient);
      this.setState({ingredients: ingredientList});
    }
    this.handleAddIngredient = event => {
      event.preventDefault();
      let ingredientList = this.state.ingredients;
      let ingredient = {quantity: '', measurement: '#', name: ''};
      ingredientList.push(ingredient);
      this.setState({ingredients: ingredientList})
    }
    this.handleDeleteIngredient = (event, i) => {
      event.preventDefault();
      let ingredientList = this.state.ingredients;
      ingredientList.splice(i, 1);
      this.setState({ingredients: ingredientList});
    }

    this.handleSubmit = (event) => {
      event.preventDefault();

      let recipe = {
        name: this.state.name,
        url: this.state.link,
        notes: this.state.notes,
        image: this.state.image,
        tags: this.state.tags,
        ingredients: this.state.ingredients
      }
      let xml = new XMLHttpRequest();
      xml.open("POST", "/recipes", true);
      xml.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
      xml.setRequestHeader('Access-Control-Allow-Headers', '*');
      xml.setRequestHeader('Access-Control-Allow-Origin', '*');
      xml.send(JSON.stringify({recipe: recipe}));
      console.log(xml.statusText)
      xml.onreadystatechange = () => {
        if(xml.readyState === 4 && xml.status === 200) {
          alert('Recipe submitted!')
          return this.props.setView(event, 'recipecloud')
        }
        else if(xml.readyState === 4 && xml.status !== 200) {
          return alert(xml.response)
        }
      }
    }
  }

  render() {
    return (
      <form>
        <RecipeInformation
          name={this.state.name}
          link={this.state.link}
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
      <AddTags toggleTag={this.toggleTag} />
      <div className='form-group'>
        <button className='btn btn-lg btn-success' onClick={(e) => this.handleSubmit(e)}>Submit Recipe!</button>
      </div>
      </form>
    )
  }
}


export default RecipeForm;
