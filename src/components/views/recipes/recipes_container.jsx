import React from 'react';
import ShowRecipe from './show_recipe';
import RecipeCards from './recipe_cards';


class RecipeContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
      recipe: {}
    }


    this.showRecipe = (show, i) => {
      this.setState({show: show, recipe: this.props.recipes[i]})
    }
  }

  render() {
    return (
      <div>
        {this.state.show ? (
          <div className='show-recipe-state'>
            <button className='btn-success btn btn-md' onClick={() => this.showRecipe(false)}><i className="fas fa-arrow-left"></i> Back to Recipes</button>
            <ShowRecipe recipe={this.state.recipe} user={this.props.user} showRecipe={this.showRecipe} />
          </div>
        ) : <RecipeCards
              showRecipe={this.showRecipe}
              recipes={this.props.recipes}
              user={this.props.user}
            />}
      </div>
    )
  }


}

export default RecipeContainer;
