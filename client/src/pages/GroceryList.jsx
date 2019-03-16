import React from 'react';
import AddIngredients from '../components/recipes/AddIngredients';
import {inject, observer} from 'mobx-react';
import styles from './styles/GroceryList.scss';
import classNames from 'classnames';
import Button from "../components/utilities/buttons/Button";
import RemoveButton from "../components/utilities/buttons/RemoveButton"
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faExternalLinkAlt} from '@fortawesome/free-solid-svg-icons'

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

    handleDeleteIngredient = i => {
        let groceryList = this.state.groceryList;
        groceryList.splice(i, 1);
        this.setState({groceryList: groceryList});
    };

    handleDeleteMenuItem = i => {
        let menuList = this.state.menu;
        menuList.splice(i, 1);
        this.setState({menu: menuList});
    };

    storeMode = () => {
        this.setState(prevState => {
            return {
                storeMode: !prevState.storeMode,
            }
        });
    };

    componentDidMount() {
        this.props.apiStore.getUserLists(this.props.user_id)
            .then(data => {
                this.setState({
                    groceryList: data.groceryList,
                    menu: data.menu,
                })
            });
    }

    updateList = () => {
        this.props.apiStore.patchUser({
            groceryList: this.state.groceryList,
            menu: this.state.menu,
        });
    };

    render() {
        const groceryListContainerClassName = classNames({
            [styles.groceryListContainer]: true,
        });
        const ingredientsContainerClassName = classNames({
            [styles.ingredientsContainer]: true,
        });
        const menuContainerClassName = classNames({
            [styles.menuContainer]: true,
        });

        return (
            <div className={groceryListContainerClassName}>
                <h2>My Menu</h2>
                <ul className={menuContainerClassName}>
                    {this.state.menu && this.state.menu.map((item, i) => {
                        return <li key={i}>
                            <RemoveButton onClick={() => this.handleDeleteMenuItem(i)}/>
                            <a target='_blank' href={item.url}>
                                {item.name}
                                <FontAwesomeIcon icon={faExternalLinkAlt}/>
                            </a>
                        </li>
                    })}
                </ul>
                <h2>My Grocery List</h2>
                {this.state.groceryList && <AddIngredients
                    containerClassName={ingredientsContainerClassName}
                    ingredients={this.state.groceryList}
                    handleAddIngredient={this.handleAddIngredient}
                    handleUpdateIngredient={this.handleUpdateIngredient}
                    handleDeleteIngredient={this.handleDeleteIngredient}
                    storeMode={this.state.storeMode}
                />}
                <Button onClick={this.updateList}>Save Grocery List/Menu</Button>
                <Button onClick={this.storeMode}>Toggle Store Mode</Button>
            </div>
        )
    }
};

