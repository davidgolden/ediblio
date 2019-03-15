import React from 'react';
import { Link } from '@reach/router';

const RecipeCardButtons = (props) => {
  return(
    <div className='recipe-card-buttons'>
      { props.user.recipes.includes(props.recipe._id) ? (
        props.user._id === props.recipe.author.id ? <button className='btn btn-sm btn-success disabled'><i className="fas fa-book"></i></button> : (
          <div>
            <button className='btn btn-sm btn-success disabled'><i className="fas fa-book"></i></button>
            <button className='btn btn-sm btn-danger' onClick={(e) => props.removeFromCloud(e.currentTarget, props.recipe)}><i className="fas fa-minus"></i></button>
          </div>
        )
      ) : (
        <button className='btn btn-sm btn-warning' onClick={(e) => props.addToCloud(e.currentTarget, props.recipe)}><i className="fas fa-plus"></i></button>
      )}
    </div>
  )
}

class RecipeCards extends React.Component {
  constructor(props) {
    super(props);

    this.addToCloud = (target, recipe) => {
      target.parentElement.parentElement.classList.add('recipe-card-disabled');
      setTimeout(function() {
        target.parentElement.parentElement.style.display = 'none';
      }, 500);
      let xml = new XMLHttpRequest();
      xml.open("POST", "/recipes/add", true);
      xml.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
      xml.setRequestHeader('Access-Control-Allow-Headers', '*');
      xml.setRequestHeader('Access-Control-Allow-Origin', '*');
      xml.send(JSON.stringify({recipe: recipe}));
      xml.onreadystatechange = () => {
        if(xml.readyState === 4 && xml.status === 200) {
          console.log('success')
        }
      }
    }

    this.removeFromCloud = (target, recipe) => {
      target.parentElement.parentElement.parentElement.classList.add('recipe-card-disabled');
      setTimeout(function() {
        target.parentElement.parentElement.parentElement.style.display = 'none';
      }, 500);
      let xml = new XMLHttpRequest();
      xml.open("POST", "/recipes/remove", true);
      xml.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
      xml.setRequestHeader('Access-Control-Allow-Headers', '*');
      xml.setRequestHeader('Access-Control-Allow-Origin', '*');
      xml.send(JSON.stringify({recipe: recipe}));
      xml.onreadystatechange = () => {
        if(xml.readyState === 4 && xml.status === 200) {
          console.log('success')
        }
      }
    }
  }

  render() {
      const RecipeList = this.props.recipes && this.props.recipes.map((recipe, i) => {
        return (
          <div key={recipe._id} className='recipe-card'>
          <input type='hidden' name='tags' value={recipe.tags} />
          <input type='hidden' name='author' value={recipe.author.id} />
          <Link to={`/recipes/${recipe._id}`}>
            <div>
              <img src={recipe.image} className='recipe-card-image'/>
            </div>
            <div className='recipe-card-text'>
              <h3>{recipe.name}</h3>
              <p>{recipe.notes}</p>
            </div>
          </Link>
          <button className='author-text' onClick={() => this.props.sortByUser(recipe.author.id)}><h6>Submitted by {recipe.author.username}</h6></button>
          <RecipeCardButtons
            recipe={recipe}
            user={this.props.user}
            addToCloud={this.addToCloud}
            removeFromCloud={this.removeFromCloud}
          />
          </div>
        )
      })

      return (
        <div className='recipes-container'>
          {RecipeList}
        </div>

      )
  }
}

export default RecipeCards;
