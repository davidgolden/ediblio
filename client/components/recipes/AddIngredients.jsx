import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Ingredient from './IngredientListItem'
import classNames from 'classnames';
import styles from './styles/AddIngredients.module.scss';
import {faQuestion, faPlus} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Sortable from "react-sortablejs";
import {extractIngredient} from "../../utils/ingredients";

const AddIngredients = (props) => {
    const [value, setValue] = useState("");

    function getIngredient(e) {
        e.preventDefault();
        const ingredient = extractIngredient(value);
        setValue("");
        props.handleAddIngredient(ingredient);
    }

    function handleUpdateIngredient (id, update) {
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
    });
    const addIngredientFormClassName = classNames({
        [styles.addIngredientForm]: true,
    });


    return (
        <div className={ingredientsContainerClassName}>
            <h3>Ingredient List</h3>
            {props.canAdd && <form onSubmit={getIngredient} className={addIngredientFormClassName}>
                <div>
                    <FontAwesomeIcon icon={faQuestion}/>
                    <div>
                        Add an ingredients like "1 cup rice, 1 apple, or 1 1/2 tbsp salt".
                    </div>
                </div>
                <input placeholder={"1.5 cups milk"} value={value} onChange={e => setValue(e.target.value)}/>
                <button role={'submit'}><FontAwesomeIcon icon={faPlus}/></button>
            </form>}
            {/*<Sortable*/}
            {/*    options={{*/}
            {/*        draggable: '.draggable',*/}
            {/*        disabled: !props.dragEnabled,*/}
            {/*    }}*/}
            {/*    tag={"ul"}*/}
            {/*    onChange={(order, sortable, evt) => {*/}
                    {/*// props.handleUpdateAllIngredients(order.map(m => JSON.parse(m)));*/}
                {/*}}>*/}
                {props.ingredients.map((item, i) => {
                    return <Ingredient
                        key={item.id || i}
                        value={item}
                        id={item.id || i}
                        handleUpdateIngredient={handleUpdateIngredient}
                        storeMode={props.storeMode}
                        selectedIngredientId={props.selectedIngredientIds.includes(item.id || i)}
                        addToSelectedIngredientIds={addToSelectedIngredientIds}
                    />
                })}
            {/*</Sortable>*/}
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

export default AddIngredients;
