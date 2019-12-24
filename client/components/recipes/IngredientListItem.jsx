import React from 'react';
import classNames from 'classnames';
import styles from './styles/IngredientListItem.scss';
import RemoveButton from "../utilities/buttons/RemoveButton";

const Ingredient = (props) => {
    const ingredientRowClassName = classNames({
        [styles.ingredientRow]: true,
        "draggable": !props.storeMode,
    });

    if(!props.storeMode) {
        return (
            <li className={ingredientRowClassName} data-id={props.dataId}>
                <input
                    type='number'
                    step="0.01"
                    required
                    onChange={e => props.handleUpdateIngredient(props.id, {quantity: e.target.value})}
                    name='quantity'
                    placeholder='1'
                    value={props.value.quantity}
                />
                <select
                    name='measurement'
                    value={props.value.measurement}
                    onChange={e => props.handleUpdateIngredient(props.id, {measurement: e.target.value})}
                >
                    <option value='#'>#</option>
                    <option value='tsp'>tsp</option>
                    <option value='tbsp'>tbsp</option>
                    <option value='cup'>cup</option>
                    <option value='lb'>lb</option>
                    <option value='fl oz'>fl oz</option>
                    <option value='oz'>oz</option>
                    <option value='pt'>pt</option>
                    <option value='qt'>qt</option>
                    <option value='ml'>ml</option>
                    <option value='l'>l</option>
                    <option value='g'>g</option>
                    <option value='gal'>gal</option>
                </select>
                <input
                    type='text'
                    required
                    name='name'
                    placeholder='Carrots'
                    onChange={e => props.handleUpdateIngredient(props.id, {name: e.target.value})}
                    value={props.value.name}
                />
                <RemoveButton onClick={() => props.handleDeleteIngredient(props.id)}/>
            </li>
        )
    } else {
        return (
            <div className={ingredientRowClassName} data-id={props.dataId}>
                <RemoveButton onClick={() => props.handleDeleteIngredient(props.id)}/>
                <p>{props.value.quantity} {props.value.measurement.replace("#", "")} {props.value.name}</p>
            </div>
        )
    }
}

export default Ingredient;
