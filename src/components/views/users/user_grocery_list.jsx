import React from 'react';
import AddIngredients from '../recipes/add_ingredients';
import Menu from '../recipes/menu_list';

class GroceryList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ingredients: {},
      menu: {},
      storeMode: false
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
    this.handleDeleteMenuItem = (event, i) => {
      event.preventDefault();
      let menuList = this.state.menu;
      menuList.splice(i, 1);
      this.setState({menu: menuList});
    }

    this.updateList = () => {
      let xml = new XMLHttpRequest();
      xml.open("POST", '/grocery-list?_method=PUT', true);
      xml.setRequestHeader("Content-Type", "application/json");
      xml.setRequestHeader('Access-Control-Allow-Headers', '*');
      xml.setRequestHeader('Access-Control-Allow-Origin', '*');
      xml.send(JSON.stringify({ingredients: this.state.ingredients, menu: this.state.menu}));
      xml.onreadystatechange = () => {
        if(xml.readyState === 4 && xml.status === 200) {
          let response = JSON.parse(xml.response);
          alert('Updated grocery list!')
          this.setState({ingredients: response.groceryList, menu: response.menu})
        }
        if(xml.readyState === 4 && xml.status !== 200) {
          return alert(xml.response)
        }
      }
    }

    this.storeMode = () => {
      if(this.state.storeMode === true) {
        this.setState({storeMode: false})
      } else {
        this.setState({storeMode: true})
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
        this.setState({ingredients: response.groceryList, menu: response.menu})
      }
  }
}

  render() {
    return (
      <div>
        <h1 className='text-center title'>My Menu</h1>
        <Menu
          menu={this.state.menu}
          handleDeleteMenuItem={this.handleDeleteMenuItem}
        />
        <h1 className='text-center title'>My Grocery List</h1>
        <AddIngredients
          ingredients={this.state.ingredients}
          handleAddIngredient={this.handleAddIngredient}
          handleUpdateIngredient={this.handleUpdateIngredient}
          handleDeleteIngredient={this.handleDeleteIngredient}
          storeMode={this.state.storeMode}
        />
      <button className='btn btn-success btn-md' onClick={() => this.updateList()}>Save Grocery List/Menu</button>&nbsp;
      <button className='btn btn-success btn-md' onClick={() => this.storeMode()}>Toggle Store Mode</button>
      </div>
    )
  }
};

export default GroceryList;
