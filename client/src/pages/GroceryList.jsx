import React, { useContext, useState, useEffect } from 'react';
import AddIngredients from '../components/recipes/AddIngredients';
import styles from './styles/GroceryList.scss';
import classNames from 'classnames';
import Button from "../components/utilities/buttons/Button";
import RemoveButton from "../components/utilities/buttons/RemoveButton"
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faExternalLinkAlt} from '@fortawesome/free-solid-svg-icons'
import {ApiStoreContext} from "../stores/api_store";

const GroceryList = props => {
    const context = useContext(ApiStoreContext);

    const [storeMode, setStoreMode] = useState(false);
    const [groceryList, setGroceryList] = useState(context.user ? context.user.groceryList : []);
    const [menu, setMenu] = useState(context.user ? context.user.menu : []);
    const [isCurrent, setIsCurrent] = useState(true);

    const handleUpdateIngredient = (index, ingredient) => {
        let groceryList = groceryList;
        groceryList[index] = {
            ...groceryList[index],
            ...ingredient,
        };
        setGroceryList(groceryList);
        setIsCurrent(false);
    };

    const handleAddIngredient = () => {
        let groceryList = groceryList;
        let ingredient = {quantity: '', measurement: '#', name: ''};
        groceryList.push(ingredient);
        setGroceryList(groceryList);
        setIsCurrent(false);
    };

    const handleDeleteIngredient = index => {
        let groceryList = groceryList;
        groceryList.splice(index, 1);
        setGroceryList(groceryList);
        setIsCurrent(false);
    };

    const handleDeleteMenuItem = id => {
        // use findIndex rather than filter so we only remove 1 if there are duplicates
        const i = menu.findIndex(item => item._id === id);
        let menuList = menu;
        menuList.splice(i, 1);
        setMenu(menuList);
        setIsCurrent(false);
    };

    const toggleStoreMode = () => {
        setStoreMode(!storeMode);
    };

    useEffect(() => {
        context.getUserLists(props.user_id)
            .then(data => {
                setGroceryList(data.groceryList);
                setMenu(data.menu);
            });
    });

    const updateList = () => {
        context.apiStore.patchUser({
            groceryList: groceryList,
            menu: menu,
        })
            .then(() => {
                setIsCurrent(true);
            })
    };

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
        [styles.saveListButtonDisabled]: isCurrent,
    });

    return (
        <div className={groceryListContainerClassName}>
            <h2>My Menu</h2>
            <ul className={menuContainerClassName}>
                {menu && menu.map((item, i) => {
                    return <li key={i}>
                        <RemoveButton onClick={() => handleDeleteMenuItem(item._id)}/>
                        <a target='_blank' href={item.url}>
                            {item.name}
                            <FontAwesomeIcon icon={faExternalLinkAlt}/>
                        </a>
                    </li>
                })}
            </ul>
            <h2>My Grocery List</h2>
            {groceryList && <AddIngredients
                containerClassName={ingredientsContainerClassName}
                ingredients={groceryList}
                handleAddIngredient={handleAddIngredient}
                handleUpdateIngredient={handleUpdateIngredient}
                handleDeleteIngredient={handleDeleteIngredient}
                storeMode={storeMode}
            />}
            <Button className={saveListClassName} onClick={updateList}>Save Grocery List/Menu</Button>
            <Button onClick={toggleStoreMode}>Toggle Store Mode</Button>
        </div>
    )
};

export default GroceryList;
