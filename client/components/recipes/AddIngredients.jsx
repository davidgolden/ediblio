import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Ingredient from './IngredientListItem'
import classNames from 'classnames';
import styles from './styles/AddIngredients.scss';
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

    function addToIngredientsToRemove(id) {
        if (props.ingredientIdsToRemove.includes(id)) {
            props.setIngredientIdsToRemove(props.ingredientIdsToRemove.filter(ingredientId => ingredientId !== id));
        } else {
            props.setIngredientIdsToRemove(props.ingredientIdsToRemove.concat([id]));
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
            <form onSubmit={getIngredient} className={addIngredientFormClassName}>
                <div>
                    <FontAwesomeIcon icon={faQuestion}/>
                    <div>
                        Add an ingredients like "1 cup rice, 1 apple, or 1 1/2 tbsp salt".
                    </div>
                </div>
                <input placeholder={"1.5 cups milk"} value={value} onChange={e => setValue(e.target.value)}/>
                <button role={'submit'}><FontAwesomeIcon icon={faPlus}/></button>
            </form>
            <Sortable
                options={{
                    draggable: '.draggable',
                    disabled: !props.dragEnabled,
                }}
                tag={"ul"}
                onChange={(order, sortable, evt) => {
                    // props.handleUpdateAllIngredients(order.map(m => JSON.parse(m)));
                }}>
                {props.ingredients.map((item, i) => {
                    return <Ingredient
                        key={item.id}
                        value={item}
                        id={item.id}
                        dataId={JSON.stringify(item)}
                        handleUpdateIngredient={handleUpdateIngredient}
                        storeMode={props.storeMode}
                        ingredientToRemove={props.ingredientIdsToRemove.includes(item.id)}
                        addToIngredientsToRemove={addToIngredientsToRemove}
                    />
                })}
            </Sortable>
        </div>
    )
};

AddIngredients.propTypes = {
    handleAddIngredient: PropTypes.func.isRequired,
    handleUpdateIngredient: PropTypes.func.isRequired,
    ingredientIdsToRemove: PropTypes.array.isRequired,
    setIngredientIdsToRemove: PropTypes.func.isRequired,
    ingredients: PropTypes.array.isRequired,
};

export default AddIngredients;
