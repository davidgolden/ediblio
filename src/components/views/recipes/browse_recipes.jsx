import React from 'react';
import RecipeContainer from './recipes_container';

class BrowseRecipes extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      recipes: [],
      user: props.user
    }

    this.updateRecipes = () => {
      let xml = new XMLHttpRequest();
      xml.open("GET", '/recipes', true);
      xml.setRequestHeader('Access-Control-Allow-Headers', '*');
      xml.setRequestHeader('Access-Control-Allow-Origin', '*');
      xml.send({user: this.state.user._id});
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
    return (
      <div>
        <h1 className='text-center title'>Browse All Recipes</h1>
        <RecipeContainer
          recipes={this.state.recipes}
          user={this.props.user}
          tags={this.props.tags}
          setView={this.props.setView}
        />
      </div>
    )
  }
};

export default BrowseRecipes;
