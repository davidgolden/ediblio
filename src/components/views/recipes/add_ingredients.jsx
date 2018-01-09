import React from 'react';

const Ingredient = (props) => {
  return (
    <div className='ingredient-row'>
      <input
        type='number'
        step="0.01"
        required
        onChange={(e) => props.handleUpdateIngredient({quantity: e.target.value, measurement: props.value.measurement, name: props.value.name}, props.index)}
        name='quantity'
        placeholder='1'
        className='form-control form-control-sm ingredient-quantity'
        value={props.value.quantity}
      />
      <select
        className='form-control form-control-sm ingredient-measurement'
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
        className='form-control form-control-sm ingredient-name'
        onChange={(e) => props.handleUpdateIngredient({quantity: props.value.quantity, measurement: props.value.measurement, name: e.target.value}, props.index)}
        value={props.value.name}
      />
    <button className='btn btn-md btn-danger delete-ingredient-button' onClick={(e) => props.handleDeleteIngredient(e, props.index)}><i className="fa fa-minus" aria-hidden="true"></i></button>
    </div>
  )
}

class AddIngredients extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ingredients: props.ingredients
    }
  }

  render() {
    const IngredientList = [];

      for(let i=0; i<this.props.ingredients.length; i++) {
        IngredientList.push(<Ingredient
          key={i}
          index={i}
          value={this.props.ingredients[i]}
          handleDeleteIngredient={this.props.handleDeleteIngredient}
          handleUpdateIngredient={this.props.handleUpdateIngredient}
        />);
      }


    var style = {
      display: 'inline'
    }

       return (
        <div>
          <h3 style={style}>Ingredient List</h3>
          <button className='add-ingredient-button' onClick={(event) => this.props.handleAddIngredient(event)}>+ ingredient</button>
          {IngredientList}
        </div>
      )
  }

}


export default AddIngredients;
