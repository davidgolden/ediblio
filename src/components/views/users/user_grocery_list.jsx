import React from 'react';
import AddIngredients from '../recipes/add_ingredients';

class GroceryList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ingredients: {}
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
      console.log(this.state.ingredients)
    }

    this.updateList = () => {
      let xml = new XMLHttpRequest();
      xml.open("POST", '/grocery-list?_method=PUT', true);
      xml.setRequestHeader("Content-Type", "application/json");
      xml.setRequestHeader('Access-Control-Allow-Headers', '*');
      xml.setRequestHeader('Access-Control-Allow-Origin', '*');
      xml.send(JSON.stringify({ingredients: this.state.ingredients}));
      xml.onreadystatechange = () => {
        if(xml.readyState === 4 && xml.status === 200) {
          let response = JSON.parse(xml.response);
          alert('Updated grocery list!')
          this.setState({ingredients: response.groceryList})
        }
        if(xml.readyState === 4 && xml.status !== 200) {
          return alert(xml.response)
        }
      }
    }
  }

  componentWillMount() {
    let xml = new XMLHttpRequest();
    xml.open("GET", '/grocery-list', true);
    xml.setRequestHeader("Content-Type", "application/json");
    xml.setRequestHeader('Access-Control-Allow-Headers', '*');
    xml.setRequestHeader('Access-Control-Allow-Origin', '*');
    xml.send(JSON.stringify({user: this.props.user}));
    xml.onreadystatechange = () => {
      if(xml.readyState === 4 && xml.status === 200) {
        let response = JSON.parse(xml.response);
        this.setState({ingredients: response.groceryList})
      }
  }
}

  render() {
    return (
      <div>
        <h1 className='text-center title'>My Grocery List</h1>
        <AddIngredients
          ingredients={this.state.ingredients}
          handleAddIngredient={this.handleAddIngredient}
          handleUpdateIngredient={this.handleUpdateIngredient}
          handleDeleteIngredient={this.handleDeleteIngredient}
        />
      <button className='btn btn-success btn-md' onClick={() => this.updateList()}>Save Grocery List</button>
      </div>
    )
  }
};

export default GroceryList;
