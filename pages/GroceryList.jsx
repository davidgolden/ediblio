import React, {useContext, useState, useEffect} from 'react';
import AddIngredients from '../client/components/recipes/AddIngredients';
import styles from './styles/GroceryList.scss';
import classNames from 'classnames';
import Button from "../client/components/utilities/buttons/Button";
import RemoveButton from "../client/components/utilities/buttons/RemoveButton"
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faExternalLinkAlt} from '@fortawesome/free-solid-svg-icons'
import {ApiStoreContext} from "../client/stores/api_store";
import axios from "axios";
// import fetch from "isomorphic-unfetch";

const GroceryList = props => {
    const context = useContext(ApiStoreContext);

    const [storeMode, setStoreMode] = useState(false);
    const [groceryList, setGroceryList] = useState(props.groceryList || []);
    const [menu, setMenu] = useState(props.menu || []);
    const [isCurrent, setIsCurrent] = useState(true);

    const handleUpdateIngredient = (index, ingredient) => {
        let newGroceryList = groceryList;
        newGroceryList[index] = {
            ...newGroceryList[index],
            ...ingredient,
        };
        setGroceryList([...newGroceryList]);
        setIsCurrent(false);
    };

    const handleAddIngredient = () => {
        setGroceryList([
            ...groceryList,
            {quantity: '', measurement: '#', name: ''}
        ]);
        setIsCurrent(false);
    };

    const handleDeleteIngredient = index => {
        let newGroceryList = groceryList;
        newGroceryList.splice(index, 1);
        setGroceryList([...newGroceryList]);
        setIsCurrent(false);
    };

    const handleDeleteMenuItem = id => {
        // use findIndex rather than filter so we only remove 1 if there are duplicates
        const i = menu.findIndex(item => item._id === id);
        let menuList = menu;
        menuList.splice(i, 1);
        setMenu([...menuList]);
        setIsCurrent(false);
    };

    const toggleStoreMode = () => {
        setStoreMode(!storeMode);
    };

    const updateList = () => {
        context.patchUser({
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
            <AddIngredients
                containerClassName={ingredientsContainerClassName}
                ingredients={groceryList}
                handleAddIngredient={handleAddIngredient}
                handleUpdateIngredient={handleUpdateIngredient}
                handleDeleteIngredient={handleDeleteIngredient}
                storeMode={storeMode}
            />
            <Button className={saveListClassName} onClick={updateList}>Save Grocery List/Menu</Button>
            <Button onClick={toggleStoreMode}>Toggle Store Mode</Button>
        </div>
    )
};

GroceryList.getInitialProps = async ({req, query}) => {
    const response = await axios.get(`${req.protocol}://${req.headers.host}/api/users/${query.user_id}/list`, {
        headers: {
            cookie: req.headers.cookie,
        }
    });
    return {
        groceryList: response.data.groceryList,
        menu: response.data.menu,
    };
};

export default GroceryList;
