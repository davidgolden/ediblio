import React from 'react';
import ShowRecipe from './show_recipe';
import RecipeCards from './recipe_cards';

const TagFilter = (props) => {
  const TagButtonList = props.tags.map((tag) => {
    return <button onClick={() => props.sortByTag(tag)} className='tag btn btn-md btn-success' key={tag}>{tag}</button>
  })
  return (
    <div className='text-center'>
      <h2>Filter Recipes By Tag</h2>
      <button onClick={() => props.sortByTag('all')} className='tag btn btn-md btn-success'>All</button>
      {TagButtonList}
    </div>
  )
}


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

    this.sortByTag = (tag) => {
      event.preventDefault();
      let allRecipes = Array.from(document.getElementsByName('tags'));
      let unmatchedRecipes = allRecipes.filter(recipe => recipe.value.includes(tag) === false);
      let matchedRecipes = allRecipes.filter(recipe => recipe.value.includes(tag) === true);

      if(tag === 'all') {
        allRecipes.forEach(recipe => {
        recipe.parentElement.style.display = 'inline-block';

        setTimeout(function() {
          recipe.parentElement.style.opacity = '1';
        }, 500);
      });

      } else {
        unmatchedRecipes.forEach(recipe => {
          recipe.parentElement.style.opacity = '0';
          setTimeout(function() {
            recipe.parentElement.style.display = 'none';
          }, 500);
        });

        matchedRecipes.forEach(recipe => {
          recipe.parentElement.style.display = 'inline-block';

          setTimeout(function() {
            recipe.parentElement.style.opacity = '1';
          }, 500);
        });
      };
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
        ) : (
        <div>
          <TagFilter tags={this.props.tags} sortByTag={this.sortByTag} />
            <RecipeCards
              showRecipe={this.showRecipe}
              recipes={this.props.recipes}
              user={this.props.user}
            />
        </div> )}
      </div>
    )
  }


}

export default RecipeContainer;
