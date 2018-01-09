import React from 'react';
import RecipeContainer from '../recipes/recipes_container';

class UserRecipes extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      recipes: [],
      user: props.user
    }

    this.updateRecipes = () => {
      let xml = new XMLHttpRequest();
      xml.open("GET", `/users/${this.props.user._id}`, true);
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
    if(this.state.recipes.length === 0) {
      return (
        <div className='text-center'>
          <h2>There doesn't seem to be anything here...</h2><br />
          <h2 style={buttonStyle}>Get started by </h2><button style={buttonStyle} className='btn btn-md btn-success' onClick={(e) => this.props.setView(e, 'browserecipes')}>browsing existing recipes</button><h2 style={buttonStyle}> or </h2><button style={buttonStyle} className='btn btn-success btn-md' onClick={(e) => this.props.setView(e, 'addrecipe')}>adding a recipe.</button>
        </div>
      )
    } else {
      return (
        <div>
          <RecipeContainer recipes={this.state.recipes} user={this.state.user} tags={this.props.tags} />
        </div>
      )
    }

  }
};

export default UserRecipes;
