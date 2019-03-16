import React from 'react';
import AddIngredients from '../components/recipes/AddIngredients';
import Menu from '../components/recipes/MenuList';
import {inject, observer} from 'mobx-react';

@inject('apiStore')
@observer
export default class GroceryList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            storeMode: false,
            groceryList: this.props.apiStore.user ? this.props.apiStore.user.groceryList : [],
            menu: this.props.apiStore.user ? this.props.apiStore.user.menu : [],
        };

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

        this.storeMode = () => {
            if (this.state.storeMode === true) {
                this.setState({storeMode: false})
            } else {
                this.setState({storeMode: true})
            }
        }
    }

    componentDidMount() {
        this.setState({
            groceryList: this.props.apiStore.user && this.props.apiStore.user.groceryList,
            menu: this.props.apiStore.user && this.props.apiStore.user.menu,
        })
    }

    updateList = () => {


        let xml = new XMLHttpRequest();
        xml.open("POST", '/grocery-list?_method=PUT', true);
        xml.setRequestHeader("Content-Type", "application/json");
        xml.setRequestHeader('Access-Control-Allow-Headers', '*');
        xml.setRequestHeader('Access-Control-Allow-Origin', '*');
        xml.send(JSON.stringify({ingredients: this.state.ingredients, menu: this.state.menu}));
        xml.onreadystatechange = () => {
            if (xml.readyState === 4 && xml.status === 200) {
                let response = JSON.parse(xml.response);
                alert('Updated grocery list!')
                this.setState({ingredients: response.groceryList, menu: response.menu})
            }
            if (xml.readyState === 4 && xml.status !== 200) {
                return alert(xml.response)
            }
        }
    }

//   componentWillMount() {
//     let xml = new XMLHttpRequest();
//     xml.open("GET", '/grocery-list', true);
//     xml.setRequestHeader("Content-Type", "application/json");
//     xml.setRequestHeader('Access-Control-Allow-Headers', '*');
//     xml.setRequestHeader('Access-Control-Allow-Origin', '*');
//     xml.send(JSON.stringify({user: this.props.user}));
//     xml.onreadystatechange = () => {
//       if(xml.readyState === 4 && xml.status === 200) {
//         let response = JSON.parse(xml.response);
//         this.setState({ingredients: response.groceryList, menu: response.menu})
//       }
//   }
// }

    render() {
        return (
            <div>
                <h1>My Menu</h1>
                {this.state.menu && <Menu
                    menu={this.state.menu}
                    handleDeleteMenuItem={this.handleDeleteMenuItem}
                />}
                <h1>My Grocery List</h1>
                {this.state.groceryList && <AddIngredients
                    ingredients={this.state.groceryList}
                    handleAddIngredient={this.handleAddIngredient}
                    handleUpdateIngredient={this.handleUpdateIngredient}
                    handleDeleteIngredient={this.handleDeleteIngredient}
                    storeMode={this.state.storeMode}
                />}
                <button onClick={this.updateList}>Save Grocery List/Menu
                </button>
                &nbsp;
                <button onClick={this.storeMode}>Toggle Store Mode</button>
            </div>
        )
    }
};

