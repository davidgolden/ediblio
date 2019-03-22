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
            isCurrent: true,
        };
    }

    handleUpdateIngredient = (ingredient, i) => {
        let groceryList = this.state.groceryList;
        groceryList.splice(i, 1, ingredient);
        this.setState({
            groceryList: groceryList,
            isCurrent: false,
        });
    };

    handleAddIngredient = () => {
        let groceryList = this.state.groceryList;
        let ingredient = {quantity: '', measurement: '#', name: ''};
        groceryList.push(ingredient);
        this.setState({
            groceryList: groceryList,
            isCurrent: false,
        })
    };

    handleDeleteIngredient = id => {
        let groceryList = this.state.groceryList.filter(item => item._id !== id);
        this.setState({
            groceryList: groceryList,
            isCurrent: false,
        });
    };

    handleDeleteMenuItem = id => {
        let menuList = this.state.menu.filter(item => item._id !== id);
        this.setState({
            menu: menuList,
            isCurrent: false,
        });
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
        })
            .then(() => {
                this.setState({
                    isCurrent: true,
                })
            })
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
        const saveListClassName = classNames({
            [styles.saveListButton]: true,
            [styles.saveListButtonDisabled]: this.state.isCurrent,
        });

        return (
            <div className={groceryListContainerClassName}>
                <h2>My Menu</h2>
                <ul className={menuContainerClassName}>
                    {this.state.menu && this.state.menu.map((item, i) => {
                        return <li key={i}>
                            <RemoveButton onClick={() => this.handleDeleteMenuItem(item._id)}/>
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
                <Button className={saveListClassName} onClick={this.updateList}>Save Grocery List/Menu</Button>
                <Button onClick={this.storeMode}>Toggle Store Mode</Button>
            </div>
        )
    }
};

