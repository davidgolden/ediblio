import React, {useContext, useState, useEffect} from 'react';
import AddIngredients from '../../../client/components/ingredients/AddIngredients';
import styles from '../../styles/GroceryList.module.scss';
import classNames from 'classnames';
import Button from "../../../client/components/utilities/buttons/Button";
import {ApiStoreContext} from "../../../client/stores/api_store";
import axios from "axios";
import UserWall from "../../../client/components/users/UserWall";
import {clientFetch, getUrlParts} from "../../../client/utils/cookies";
import StaplesMenu from "../../../client/components/ingredients/StaplesMenu";
import {observer} from "mobx-react";
import {AddIngredientForm} from "../../../client/components/ingredients/AddIngredientForm";
import {MenuItem} from "../../../client/components/recipes/MenuItem";
import {AddMenuItemForm} from "../../../client/components/ingredients/AddMenuItemForm";

const groceryListContainerClassName = classNames({
    [styles.groceryListContainer]: true,
});
const ingredientsContainerClassName = classNames({
    [styles.ingredientsContainer]: true,
});
const menuContainerClassName = classNames({
    [styles.menuContainer]: true,
});

const Groceries = observer(props => {
    const context = useContext(ApiStoreContext);

    const [storeMode, setStoreMode] = useState(false);
    const [ingredientIdsToRemove, setIngredientIdsToRemove] = useState([]);
    const [menuIdsToRemove, setMenuIdsToRemove] = useState([]);
    const [staples, setStaples] = useState(props.staples);
    const [addingStaples, setAddingStaples] = useState(false);

    useEffect(() => {
        context.setGroceryList(props.groceryList || []);
        context.setMenu(props.menu || []);
    }, []);

    function toggleMenuIdToRemove(id) {
        if (menuIdsToRemove.includes(id)) {
            setMenuIdsToRemove(menuIdsToRemove.filter(recipeId => recipeId !== id));
        } else {
            setMenuIdsToRemove(menuIdsToRemove.concat([id]));
        }
    }

    async function handleDeleteMenuItems() {
        try {
            await clientFetch.delete(`/api/users/${context.user.id}/recipes`, {
                data: {
                    recipe_ids: menuIdsToRemove,
                }
            });

            context.setMenu(context.menu.filter(item => !menuIdsToRemove.includes(item.menu_id)));
            setMenuIdsToRemove([]);
        } catch (error) {
            context.handleError(error)
        }
    }

    const toggleStoreMode = () => {
        setStoreMode(!storeMode);
    }

    async function removeSelectedIngredients() {
        try {
            const response = await clientFetch.delete(`/api/users/${context.user.id}/ingredients`, {
                data: {
                    ingredient_ids: ingredientIdsToRemove,
                }
            });

            context.setGroceryList(response.data.groceryList);
            setIngredientIdsToRemove([]);
        } catch (error) {
            context.handleError(error)
        }
    }

    async function removeAllIngredients() {
        try {
            if (confirm("Are you sure you want to do that?")) {
                const response = await clientFetch.delete(`/api/users/${context.user.id}/ingredients`, {
                    data: {
                        ingredient_ids: context.groceryList.map(ing => ing.id),
                    }
                });

                context.setGroceryList(response.data.groceryList);
                setIngredientIdsToRemove([]);
            }

        } catch (error) {
            context.handleError(error)
        }
    }

    async function handleAddIngredient(ingredient) {
        try {
            const response = await clientFetch.post(`/api/users/${context.user.id}/ingredients`, ingredient);
            context.setGroceryList(response.data.groceryList);
        } catch (error) {
            context.handleError(error)
        }
    }

    async function handleAddStaple(staple) {
        try {
            const response = await clientFetch.post(`/api/users/${context.user.id}/staples`, staple);
            setStaples(v => [...v, response.data[0]]);
        } catch (error) {
            context.handleError(error)
        }
    }

    async function handleDeleteStaple(stapleId) {
        try {
            await clientFetch.delete(`/api/users/${context.user.id}/staples/${stapleId}`);
            setStaples(v => v.filter(s => s.id !== stapleId));
        } catch (error) {
            context.handleError(error);
        }
    }

    async function handleUpdateIngredient(ingredient) {
        try {
            const oldIngredient = context.groceryList.find(ing => ing.id === ingredient.id);
            if (oldIngredient.name !== ingredient.name ||
                oldIngredient.quantity !== ingredient.quantity ||
                oldIngredient.measurement !== ingredient.measurement) {
                await clientFetch.patch(`/api/users/${context.user.id}/ingredients/${ingredient.id}`, ingredient);
            }
            context.setGroceryList(context.groceryList.map(ing => {
                if (ing.id === ingredient.id) {
                    return ingredient;
                }
                return ing;
            }))
        } catch (error) {
            context.handleError(error)
        }
    }

    async function handleReorderIngredients(ingredients) {
        try {
            const response = await clientFetch.post(`/api/users/${context.user.id}/ingredients/order`, {
                ingredients,
            });
            context.setGroceryList(response.data.groceryList);
        } catch (error) {
            context.handleError(error);
        }
    }

    async function handleAddNewMenuItem(newItem) {
        const response = await clientFetch.post(`/api/users/${context.user.id}/menu`, {
            name: newItem,
        });
        context.menu.push({
            ...response.data,
            menu_id: response.data.id,
            menu_name: response.data.name,
        });
    }

    const saveListClassName = classNames({
        [styles.saveListButton]: true,
        [styles.saveListButtonDisabled]: ingredientIdsToRemove.length === 0,
    });

    const clearListClassName = classNames({
        [styles.saveListButton]: true,
        [styles.saveListButtonDisabled]: context.groceryList.length === 0,
    });

    const saveMenuClassName = classNames({
        [styles.saveListButton]: true,
        [styles.saveListButtonDisabled]: menuIdsToRemove.length === 0,
    });

    return (
        <UserWall>
            <div className={groceryListContainerClassName}>
                <h2>Menu</h2>
                {storeMode || <AddMenuItemForm handleAddMenuItem={handleAddNewMenuItem}/>}
                <ul className={menuContainerClassName}>
                    {context.menu.map((item) => {
                        return <MenuItem
                            checked={menuIdsToRemove.includes(item.menu_id)}
                            onCheck={() => toggleMenuIdToRemove(item.menu_id)}
                            item={item}
                        />
                    })}
                </ul>
                {storeMode || <Button className={saveMenuClassName} onClick={handleDeleteMenuItems}>Remove Selected</Button>}
                <h2>Grocery List</h2>
                {storeMode || <div className={styles.addStaplesContainer}>
                    <button onClick={() => setAddingStaples(v => !v)}>Toggle Add Staples Menu</button>
                    {addingStaples && <>
                        <h2>Staples</h2>
                        <AddIngredientForm handleAddIngredient={handleAddStaple}/>
                    </>}
                </div>}
                {storeMode || <StaplesMenu staples={staples} handleDeleteStaple={handleDeleteStaple}
                                           handleAddIngredient={handleAddIngredient}/>}
                <AddIngredients
                    canAdd={true}
                    containerClassName={ingredientsContainerClassName}
                    ingredients={context.groceryList}
                    handleAddIngredient={handleAddIngredient}
                    handleUpdateIngredient={handleUpdateIngredient}
                    handleReorderIngredients={handleReorderIngredients}
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
});


export async function getServerSideProps({req, query}) {
    const {currentBaseUrl, currentFullUrl, jwt} = getUrlParts(req);

    try {
        const response = await Promise.all([
            await axios.get(`${currentBaseUrl}/api/users/${query.user_id}/recipes`, {
                headers: jwt ? {'x-access-token': jwt} : {},
            }),
            await axios.get(`${currentBaseUrl}/api/users/${query.user_id}/ingredients`, {
                headers: jwt ? {'x-access-token': jwt} : {},
            }),
            await axios.get(`${currentBaseUrl}/api/users/${query.user_id}/staples`, {
                headers: jwt ? {'x-access-token': jwt} : {},
            })
        ]);

        return {
            props: {
                staples: response[2].data.staples,
                groceryList: response[1].data.groceryList,
                menu: response[0].data.menu,
                currentFullUrl
            }
        };
    } catch (error) {
        return {props: {currentFullUrl}};
    }
}

export default Groceries;
