import React from 'react';
import Ingredient from './IngredientListItem'
import classNames from 'classnames';
import styles from './styles/AddIngredients.scss';

const AddIngredients = (props) => {
    const IngredientList = [];
    for (let i = 0; i < props.ingredients.length; i++) {
        IngredientList.push(<Ingredient
            key={i}
            index={i}
            value={props.ingredients[i]}
            handleDeleteIngredient={props.handleDeleteIngredient}
            handleUpdateIngredient={props.handleUpdateIngredient}
            storeMode={props.storeMode}
        />);
    }

    const ingredientsContainerClassName = classNames({
        [styles.ingredientsContainer]: true,
        [props.containerClassName]: props.containerClassName,
    });
    const addIngredientButtonClassName = classNames({
        [styles.addIngredientButton]: true,
    });

    return (
        <div className={ingredientsContainerClassName}>
            <h3>Ingredient List</h3>
            <button className={addIngredientButtonClassName} onClick={(event) => props.handleAddIngredient(event)}>+
                ingredient
            </button>
            {IngredientList}
        </div>
    )
};

export default AddIngredients;
