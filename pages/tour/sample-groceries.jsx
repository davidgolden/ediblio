import React from 'react';
import Checkbox from "../../client/components/utilities/Checkbox";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExternalLinkAlt} from "@fortawesome/free-solid-svg-icons";
import Button from "../../client/components/utilities/buttons/Button";
import AddIngredients from "../../client/components/recipes/AddIngredients";
import classNames from "classnames";
import styles from "../styles/GroceryList.module.scss";
import Staple from "../../client/components/Staple";

const groceryListContainerClassName = classNames({
    [styles.groceryListContainer]: true,
});
const ingredientsContainerClassName = classNames({
    [styles.ingredientsContainer]: true,
});
const menuContainerClassName = classNames({
    [styles.menuContainer]: true,
});

const sampleMenu = [{
    id: 1,
    name: "Spaghetti",
}, {
    id: 2,
    name: "Hamburgers"
}];

const sampleGroceries = [{
    name: 'Milk',
    quantity: .5,
    measurement: 'gal',
}, {
    name: "Coffee",
    quantity: 1,
    measurement: '#',
}];

export default function SampleGroceries(props) {

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
        <h2 className={'tour-menu'}>My Menu</h2>
        <ul className={menuContainerClassName}>
            {sampleMenu.map((item) => {
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
        <div className={'tour-staples'}>
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
            storeMode={false}
            dragEnabled={true}
        />
        <Button className={saveListClassName} onClick={() => {}}>Remove Selected</Button>
        <Button className={clearListClassName} onClick={() => {}}>Remove All Ingredients</Button>
        <Button onClick={() => {}} className={'tour-storemode'}>Toggle Store Mode</Button>
    </div>
}
