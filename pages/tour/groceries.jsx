import React, {useState} from 'react';
import Checkbox from "../../client/components/utilities/Checkbox";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExternalLinkAlt} from "@fortawesome/free-solid-svg-icons";
import Button from "../../client/components/utilities/buttons/Button";
import AddIngredients from "../../client/components/recipes/AddIngredients";
import classNames from "classnames";
import styles from "../styles/GroceryList.module.scss";
import Staple from "../../client/components/Staple";
import {sampleRecipes, sampleGroceries} from "../../client/components/tour/sampleData";

const groceryListContainerClassName = classNames({
    [styles.groceryListContainer]: true,
});
const ingredientsContainerClassName = classNames({
    [styles.ingredientsContainer]: true,
});
const menuContainerClassName = classNames({
    [styles.menuContainer]: true,
    ['tour-menu']: true,
    ['tour-menu-highlight']: true,
});


export default function Groceries(props) {
    const [storeMode, setStoreMode] = useState(false);

    const saveListClassName = classNames({
        [styles.saveListButton]: true,
    });

    const clearListClassName = classNames({
        [styles.saveListButton]: true,
    });

    const saveMenuClassName = classNames({
        [styles.saveListButton]: true,
    });

    return <div className={groceryListContainerClassName}>
        <h2>My Menu</h2>
        <ul className={menuContainerClassName}>
            {sampleRecipes.splice(0, 2).map((item) => {
                return <li key={item.id}>
                    <Checkbox checked={false}
                              onChange={() => {}}/>
                    <button onClick={() => {}}>{item.name}</button>
                    <a target='_blank' href={'#'}>
                        <FontAwesomeIcon icon={faExternalLinkAlt}/>
                    </a>
                </li>
            })}
        </ul>
        <Button className={saveMenuClassName} onClick={() => {}}>Remove Selected</Button>
        <h2>My Grocery List</h2>
        <div className={'tour-staples tour-staples-highlight'}>
            <Staple staple={'milk'} handleAddIngredient={() => {}}/>
            <Staple staple={'eggs'} handleAddIngredient={() => {}}/>
        </div>
        <AddIngredients
            canAdd={true}
            containerClassName={ingredientsContainerClassName}
            ingredients={sampleGroceries}
            handleAddIngredient={() => {}}
            handleUpdateIngredient={() => {}}
            handleReorderIngredients={() => {}}
            selectedIngredientIds={[]}
            setSelectedIngredientIds={() => {}}
            storeMode={storeMode}
            dragEnabled={true}
        />
        <Button className={saveListClassName} onClick={() => {}}>Remove Selected</Button>
        <Button className={clearListClassName} onClick={() => {}}>Remove All Ingredients</Button>
        <Button onClick={() => setStoreMode(v => !v)} className={'tour-storemode tour-storemode-highlight'}>Toggle Store Mode</Button>
    </div>
}
