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
    }

    handleUpdateIngredient = (ingredient, i) => {
        let groceryList = this.state.groceryList;
        groceryList.splice(i, 1, ingredient);
        this.setState({groceryList: groceryList});
    };

    handleAddIngredient = () => {
        let groceryList = this.state.groceryList;
        let ingredient = {quantity: '', measurement: '#', name: ''};
        groceryList.push(ingredient);
        this.setState({groceryList: groceryList})
    };

    handleDeleteIngredient = (event, i) => {
        let groceryList = this.state.groceryList;
        groceryList.splice(i, 1);
        this.setState({groceryList: groceryList});
    };

    handleDeleteMenuItem = (event, i) => {
        let menuList = this.state.menu;
        menuList.splice(i, 1);
        this.setState({menu: menuList});
    };

    storeMode = () => {
        this.setState(prevState => {
            return {
                storeMode: !prevState,
            }
        });
    };

    componentDidMount() {
        this.setState({
            groceryList: this.props.apiStore.user && this.props.apiStore.user.groceryList,
            menu: this.props.apiStore.user && this.props.apiStore.user.menu,
        })
    }

    updateList = () => {
        this.props.apiStore.patchUser({
            groceryList: this.state.groceryList,
            menu: this.state.menu,
        });
    };

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

