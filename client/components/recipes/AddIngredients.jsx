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
        const {quantity, measurement, name} = extractIngredient(value);
        setValue("");
        handleAddIngredient(quantity, measurement, name);
    }

    function handleUpdateIngredient (index, ingredient) {
        let ingredients = props.ingredients;
        ingredients[index] = {
            ...props.ingredients[index],
            ...ingredient,
        };
        props.handleUpdateAllIngredients([...ingredients]);
    };

    function handleAddIngredient (quantity = 0, measurement = '#', name = '') {
        let ingredients = props.ingredients;
        ingredients.splice(0, 0, {quantity, measurement, name});
        props.handleUpdateAllIngredients([...ingredients]);
    };

    function handleDeleteIngredient(index) {
        let ingredients = props.ingredients;
        ingredients.splice(index, 1);
        props.handleUpdateAllIngredients([...ingredients]);
    };

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
                    props.handleUpdateAllIngredients(order.map(m => JSON.parse(m)));
                }}>
                {props.ingredients.map((item, i) => {
                    return <Ingredient
                        key={item._id ? `${item._id}${i}` : i}
                        value={item}
                        id={i}
                        dataId={JSON.stringify(item)}
                        handleDeleteIngredient={handleDeleteIngredient}
                        handleUpdateIngredient={handleUpdateIngredient}
                        storeMode={props.storeMode}
                    />
                })}
            </Sortable>
        </div>
    )
};

AddIngredients.propTypes = {
    handleUpdateAllIngredients: PropTypes.func.isRequired,
    ingredients: PropTypes.array.isRequired,
};

export default AddIngredients;
