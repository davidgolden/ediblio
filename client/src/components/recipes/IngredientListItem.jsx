import React from 'react';
import classNames from 'classnames';
import styles from './styles/IngredientListItem.scss';
import RemoveButton from "../utilities/buttons/RemoveButton";

const Ingredient = (props) => {
    const ingredientRowClassName = classNames({
        [styles.ingredientRow]: true,
    });

    if(!props.storeMode) {
        return (
            <div className={ingredientRowClassName}>
                <input
                    type='number'
                    step="0.01"
                    required
                    onChange={(e) => props.handleUpdateIngredient({quantity: e.target.value, measurement: props.value.measurement, name: props.value.name}, props.index)}
                    name='quantity'
                    placeholder='1'
                    value={props.value.quantity}
                />
                <select
                    name='measurement'
                    value={props.value.measurement}
                    onChange={(e) => props.handleUpdateIngredient({quantity: props.value.quantity, measurement: e.target.value, name: props.value.name}, props.index)}
                >
                    <option value='#'>#</option>
                    <option value='tsp'>tsp</option>
                    <option value='tbsp'>tbsp</option>
                    <option value='cup'>cup</option>
                    <option value='lb'>lb</option>
                    <option value='fl oz'>fl oz</option>
                    <option value='oz'>oz</option>
                </select>
                <input
                    type='text'
                    required
                    name='name'
                    placeholder='Carrots'
                    onChange={(e) => props.handleUpdateIngredient({quantity: props.value.quantity, measurement: props.value.measurement, name: e.target.value}, props.index)}
                    value={props.value.name}
                />
                <RemoveButton onClick={(e) => props.handleDeleteIngredient(e, props.index)}/>
            </div>
        )
    } else {
        return (
            <div className={ingredientRowClassName}>
                <RemoveButton onClick={(e) => props.handleDeleteIngredient(e, props.index)}/>
                <p>{props.value.quantity} {props.value.measurement} {props.value.name}</p>
            </div>
        )
    }
}

export default Ingredient;
