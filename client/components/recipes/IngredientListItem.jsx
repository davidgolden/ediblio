import React, {useContext} from 'react';
import classNames from 'classnames';
import styles from './styles/IngredientListItem.scss';
import RemoveButton from "../utilities/buttons/RemoveButton";
import {ApiStoreContext} from "../../stores/api_store";
import {observer} from "mobx-react";

const Ingredient = observer((props) => {
    const context = useContext(ApiStoreContext);

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
                    {context.measurements.map(m => <option value={m.short_name}>{m.short_name}</option>)}
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
});

export default Ingredient;
