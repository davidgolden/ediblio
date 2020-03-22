import React, {useContext, useState, useEffect} from 'react';
import AddIngredients from '../../../client/components/recipes/AddIngredients';
import styles from '../../styles/GroceryList.module.scss';
import classNames from 'classnames';
import Button from "../../../client/components/utilities/buttons/Button";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faExternalLinkAlt} from '@fortawesome/free-solid-svg-icons'
import {ApiStoreContext} from "../../../client/stores/api_store";
import axios from "axios";
import Checkbox from "../../../client/components/utilities/Checkbox";
import UserWall from "../../../client/components/utilities/UserWall";
import {getCookieFromServer} from "../../../client/utils/cookies";
import {handleJWT} from "../../../hooks/handleJWT";

const groceryListContainerClassName = classNames({
    [styles.groceryListContainer]: true,
});
const ingredientsContainerClassName = classNames({
    [styles.ingredientsContainer]: true,
});
const menuContainerClassName = classNames({
    [styles.menuContainer]: true,
});

const Groceries = props => {
    handleJWT();
    const context = useContext(ApiStoreContext);

    const [storeMode, setStoreMode] = useState(false);
    const [groceryList, setGroceryList] = useState(props.groceryList || []);
    const [menu, setMenu] = useState(props.menu || []);
    const [ingredientIdsToRemove, setIngredientIdsToRemove] = useState([]);
    const [menuIdsToRemove, setMenuIdsToRemove] = useState([]);

    function toggleMenuIdToRemove(id) {
        if (menuIdsToRemove.includes(id)) {
            setMenuIdsToRemove(menuIdsToRemove.filter(recipeId => recipeId !== id));
        } else {
            setMenuIdsToRemove(menuIdsToRemove.concat([id]));
        }
    }

    async function handleDeleteMenuItems() {
        try {
            await axios.delete(`/api/users/${context.user.id}/recipes`, {
                data: {
                    recipe_ids: menuIdsToRemove,
                }
            });

            setMenu(menu.filter(item => !menuIdsToRemove.includes(item.id)));
            setMenuIdsToRemove([]);
        } catch (error) {
            context.handleError(error)
        }
    };

    const toggleStoreMode = () => {
        setStoreMode(!storeMode);
    };

    async function removeSelectedIngredients() {
        try {
            await axios.delete(`/api/users/${context.user.id}/ingredients`, {
                data: {
                    ingredient_ids: ingredientIdsToRemove,
                }
            });

            setGroceryList(groceryList.filter(ing => !ingredientIdsToRemove.includes(ing.id)));
            setIngredientIdsToRemove([]);
        } catch (error) {
            context.handleError(error)
        }
    }

    async function removeAllIngredients() {
        try {
            if (confirm("Are you sure you want to do that?")) {
                await axios.delete(`/api/users/${context.user.id}/ingredients`, {
                    data: {
                        ingredient_ids: props.groceryList.map(ing => ing.id),
                    }
                });

                setGroceryList([]);
                setIngredientIdsToRemove([]);
            }

        } catch (error) {
            context.handleError(error)
        }
    }

    async function handleAddIngredient(ingredient) {
        try {
            const response = await axios.post(`/api/users/${context.user.id}/ingredients`, ingredient);
            setGroceryList([{...ingredient, id: response.data.id}].concat(groceryList))
        } catch (error) {
            context.handleError(error)
        }
    }

    async function handleUpdateIngredient(ingredient) {
        try {
            const oldIngredient = groceryList.find(ing => ing.id === ingredient.id);
            if (oldIngredient.name !== ingredient.name ||
                oldIngredient.quantity !== ingredient.quantity ||
                oldIngredient.measurement !== ingredient.measurement) {
                await axios.patch(`/api/users/${context.user.id}/ingredients/${ingredient.id}`, ingredient);
            }
            setGroceryList(groceryList.map(ing => {
                if (ing.id === ingredient.id) {
                    return ingredient;
                }
                return ing;
            }))
        } catch (error) {
            context.handleError(error)
        }
    }

    const saveListClassName = classNames({
        [styles.saveListButton]: true,
        [styles.saveListButtonDisabled]: ingredientIdsToRemove.length === 0,
    });

    const clearListClassName = classNames({
        [styles.saveListButton]: true,
        [styles.saveListButtonDisabled]: groceryList.length === 0,
    });

    const saveMenuClassName = classNames({
        [styles.saveListButton]: true,
        [styles.saveListButtonDisabled]: menuIdsToRemove.length === 0,
    });

    return (
        <UserWall>
            <div className={groceryListContainerClassName}>
                <h2>My Menu</h2>
                <ul className={menuContainerClassName}>
                    {menu && menu.map((item) => {
                        return <li key={item.id}>
                            <Checkbox checked={menuIdsToRemove.includes(item.id)}
                                      onChange={() => toggleMenuIdToRemove(item.id)}/>
                            <a target='_blank' href={item.url}>
                                {item.name}
                                <FontAwesomeIcon icon={faExternalLinkAlt}/>
                            </a>
                        </li>
                    })}
                </ul>
                <Button className={saveMenuClassName} onClick={handleDeleteMenuItems}>Remove Selected</Button>
                <h2>My Grocery List</h2>
                <AddIngredients
                    canAdd={true}
                    containerClassName={ingredientsContainerClassName}
                    ingredients={groceryList}
                    handleAddIngredient={handleAddIngredient}
                    handleUpdateIngredient={handleUpdateIngredient}
                    selectedIngredientIds={ingredientIdsToRemove}
                    setSelectedIngredientIds={setIngredientIdsToRemove}
                    storeMode={storeMode}
                    dragEnabled={true}
                />
                <Button className={saveListClassName} onClick={removeSelectedIngredients}>Remove Selected</Button>
                <Button className={clearListClassName} onClick={removeAllIngredients}>Remove All Ingredients</Button>
                <Button onClick={toggleStoreMode}>Toggle Store Mode</Button>
            </div>
        </UserWall>
    )
};



export async function getServerSideProps ({req, query}) {
    const currentFullUrl = req.protocol + "://" + req.headers.host.replace(/\/$/, "");
    const jwt = getCookieFromServer('jwt', req);

    try {
        const response = await Promise.all([
            await axios.get(`${currentFullUrl}/api/users/${query.user_id}/recipes`, {
                headers: jwt ? {'x-access-token': jwt} : {},
            }),
            await axios.get(`${currentFullUrl}/api/users/${query.user_id}/ingredients`, {
                headers: jwt ? {'x-access-token': jwt} : {},
            })
        ]);

        return {
            props: {
                groceryList: response[1].data.groceryList,
                menu: response[0].data.menu,
            }
        };
    } catch (error) {
        return {props: {}};
    }
};

export default Groceries;
