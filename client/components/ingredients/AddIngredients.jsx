import React from 'react';
import PropTypes from 'prop-types';
import Ingredient from './IngredientListItem'
import classNames from 'classnames';
import styles from './styles/AddIngredients.module.scss';
import {ReactSortable} from "react-sortablejs";
import {toJS} from "mobx";
import {AddIngredientForm} from "./AddIngredientForm";

const AddIngredients = (props) => {

    function handleUpdateIngredient(id, update) {
        props.handleUpdateIngredient({
            ...props.ingredients.find(ing => ing.id === id),
            ...update,
        });
    }

    function addToSelectedIngredientIds(id) {
        if (props.selectedIngredientIds.includes(id)) {
            props.setSelectedIngredientIds(props.selectedIngredientIds.filter(ingredientId => ingredientId !== id));
        } else {
            props.setSelectedIngredientIds(props.selectedIngredientIds.concat([id]));
        }
    }

    const ingredientsContainerClassName = classNames({
        [styles.ingredientsContainer]: true,
        [props.containerClassName]: props.containerClassName,
    })

    return (
        <div className={ingredientsContainerClassName}>
            <h3>Ingredient List</h3>
            {props.canAdd && !props.storeMode && <AddIngredientForm handleAddIngredient={props.handleAddIngredient} />}
            <ReactSortable
                tag={"ul"}
                handle={'.drag-handler'}
                draggable={'.draggable'}
                disabled={!props.dragEnabled}
                list={toJS(props.ingredients)}
                setList={list => props.handleReorderIngredients(list.map(l => l.id))}
            >
                {props.ingredients.map((item, i) => {
                    return <Ingredient
                        key={item.id}
                        value={item}
                        id={item.id}
                        dragEnabled={props.dragEnabled}
                        handleUpdateIngredient={handleUpdateIngredient}
                        storeMode={props.storeMode}
                        selectedIngredientId={props.selectedIngredientIds.includes(item.id)}
                        addToSelectedIngredientIds={addToSelectedIngredientIds}
                    />
                })}
            </ReactSortable>
        </div>
    )
};

AddIngredients.propTypes = {
    canAdd: PropTypes.bool,
    storeMode: PropTypes.bool,
    handleAddIngredient: PropTypes.func,
    handleUpdateIngredient: PropTypes.func.isRequired,
    selectedIngredientIds: PropTypes.array.isRequired,
    setSelectedIngredientIds: PropTypes.func.isRequired,
    ingredients: PropTypes.array.isRequired,
};

AddIngredients.defaultProps = {
    handleReorderIngredients: () => {},
};

export default AddIngredients;
