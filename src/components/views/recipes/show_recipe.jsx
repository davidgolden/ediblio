import React from 'react';
import AddIngredients from './add_ingredients';

const RecipeTitle = (props) => {
  const RecipeTags = props.tags.map((tag, i) => {
    return <span key={i} className='tag'>{tag}</span>
  })
  return (
    <div>
      <h1>{props.name}</h1>
      <h5>Submitted by {props.author.username}. <a href={props.url} target='_blank'>View Original Recipe</a></h5>
      {RecipeTags}
    </div>
  )
}


class ShowRecipe extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ingredients: props.recipe.ingredients
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

    this.addToGroceryList = (event) => {
      event.preventDefault();
      let xml = new XMLHttpRequest();
      xml.open("POST", `/recipes/${this.props.recipe._id}/add`, true);
      xml.setRequestHeader("Content-Type", "application/json");
      xml.setRequestHeader('Access-Control-Allow-Headers', '*');
      xml.setRequestHeader('Access-Control-Allow-Origin', '*');
      xml.send(JSON.stringify({ingredients: this.state.ingredients}));
      xml.onreadystatechange = () => {
        if(xml.readyState === 4 && xml.status === 200) {
          alert('Added to grocery list!')
          return this.props.showRecipe(false);
        }
        if(xml.readyState === 4 && xml.status !== 200) {
          return alert(xml.response)
        }
      }
    }

    this.deleteRecipe = () => {
      if(confirm('Are you sure you want to do that?')) {
        let xml = new XMLHttpRequest();
        xml.open("POST", `/recipes/${this.props.recipe._id}?_method=DELETE`, true);
        xml.setRequestHeader("Content-Type", "application/json");
        xml.setRequestHeader('Access-Control-Allow-Headers', '*');
        xml.setRequestHeader('Access-Control-Allow-Origin', '*');
        xml.send();
        xml.onreadystatechange = () => {
          if(xml.readyState === 4 && xml.status === 200) {
            return this.props.showRecipe(false);
          }
          if(xml.readyState === 4 && xml.status !== 200) {
            alert('There was a problem with your request!')
          }
        }
      }

    }

  }

  render() {
    return (
      <div className='show-recipe-container'>
        <div className='show-recipe-title'>
          <RecipeTitle
            name={this.props.recipe.name}
            author={this.props.recipe.author}
            url={this.props.recipe.url}
            tags={this.props.recipe.tags}
          />
        </div>
        <div className='show-recipe-image'>
          <img src={this.props.recipe.image} />
        </div>
        <div className='show-recipe-ingredients'>
          <AddIngredients
            ingredients={this.state.ingredients}
            handleAddIngredient={this.handleAddIngredient}
            handleUpdateIngredient={this.handleUpdateIngredient}
            handleDeleteIngredient={this.handleDeleteIngredient}
          />
        <div className='show-recipe-buttons form-group'>
            <button className='btn btn-success btn-md' onClick={(event) => this.addToGroceryList(event)}>Add To Grocery List</button>
            {
              this.props.recipe.author.id === this.props.user._id && (
                <div className='form-group'>
                <button className='btn btn-primary btn-md' onClick={this.deleteRecipe}>Delete Recipe</button>
                </div>
              )
            }
          </div>
        </div>

      </div>
    )
  }
}

export default ShowRecipe;
