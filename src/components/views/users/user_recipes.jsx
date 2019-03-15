import React from 'react';
import RecipeContainer from '../recipes/recipes_container';
import { Link } from '@reach/router';
import RecipeCards from "../recipes/recipe_cards";

const TagFilter = (props) => {
    const TagButtonList = props.tags.map((tag) => {
        return <button onClick={() => props.sortByTag(tag)} className='tag btn btn-md btn-success'
                       key={tag}>{tag}</button>
    })
    return (
        <div className='text-center'>
            <button onClick={() => props.sortByTag('all')} className='tag btn btn-md btn-success'>All</button>
            {TagButtonList}
        </div>
    )
}

class UserRecipes extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      recipes: [],
      user: props.user,
      loading: true
    }

    this.changeUser = (id) => {
      let xml = new XMLHttpRequest();
      xml.open("GET", `/users/${id}`, true);
      xml.setRequestHeader('Access-Control-Allow-Headers', '*');
      xml.setRequestHeader('Access-Control-Allow-Origin', '*');
      xml.send();
      xml.onreadystatechange = () => {
        if(xml.readyState === 4 && xml.status === 200) {
          let response = JSON.parse(xml.response);
          this.setState({recipes: response.recipes, user: response.user});
        }
      }
    }

    this.updateRecipes = () => {
      let xml = new XMLHttpRequest();
      xml.open("GET", `/users/${this.state.user._id}`, true);
      xml.setRequestHeader('Access-Control-Allow-Headers', '*');
      xml.setRequestHeader('Access-Control-Allow-Origin', '*');
      xml.send();
      xml.onreadystatechange = () => {
        if(xml.readyState === 4 && xml.status === 200) {
          let response = JSON.parse(xml.response);
          this.setState({recipes: response.recipes, user: response.user, loading: false});
        }
      }
    }
  }

  componentDidMount() {
    this.updateRecipes();
  }

  componentDidUpdate() {
    this.updateRecipes();
  }

  render() {
    var buttonStyle = {
      display: "inline",
      verticalAlign: "top"
    }
    return (
      <div>
        {(this.state.loading === false && this.state.recipes.length === 0) ? (
            <div className='text-center'>
              <h2>There doesn't seem to be anything here...</h2><br />
              <h2 style={buttonStyle}>Get started by </h2>
                <Link to={'/browse'} style={buttonStyle} className='btn btn-md btn-success'>browsing existing recipes</Link>
                <h2 style={buttonStyle}> or </h2>
                <Link style={buttonStyle} className='btn btn-success btn-md' to={'/add'}>adding a recipe.</Link>
            </div>
          ) : (
          <div>
              <h1 className='text-center title'>My Recipe Cloud <i className="fas fa-cloud" /></h1>
              <div>
                  <TagFilter tags={this.props.tags} sortByTag={this.sortByTag}/>
                  <RecipeCards
                      recipes={this.props.recipes}
                      user={this.props.user}
                      sortByUser={this.sortByUser}
                  />
              </div>
            </div>
          )
        }
      </div>
    )
};
}

export default UserRecipes;
