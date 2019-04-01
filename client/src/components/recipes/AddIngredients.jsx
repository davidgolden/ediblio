import React from 'react';
import Ingredient from './IngredientListItem'
import classNames from 'classnames';
import styles from './styles/AddIngredients.scss';

const AddIngredients = (props) => {
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
            <button className={addIngredientButtonClassName} onClick={props.handleAddIngredient}>+
                ingredient
            </button>
            <ul>
            {props.ingredients.map((item, i) => {
                return <Ingredient
                    key={item._id ? `${item._id}${i}` : i}
                    value={item}
                    id={i}
                    handleDeleteIngredient={props.handleDeleteIngredient}
                    handleUpdateIngredient={props.handleUpdateIngredient}
                    storeMode={props.storeMode}
                />
            })}
            </ul>
        </div>
    )
};

export default AddIngredients;
