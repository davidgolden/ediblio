import React from 'react';
import RecipeContainer from './recipes_container';

class BrowseRecipes extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      recipes: []
    }

    this.updateRecipes = () => {
      let xml = new XMLHttpRequest();
      xml.open("GET", '/recipes', true);
      xml.setRequestHeader('Access-Control-Allow-Headers', '*');
      xml.setRequestHeader('Access-Control-Allow-Origin', '*');
      xml.send({user: this.props.user});
      xml.onreadystatechange = () => {
        if(xml.readyState === 4 && xml.status === 200) {
          let response = JSON.parse(xml.response);
          this.setState({recipes: response.recipes});
        }
        // if(xml.readyState === 4 && xml.status !== 200) {
        //   return alert(xml.response)
        // }
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
        <RecipeContainer recipes={this.state.recipes} user={this.props.user} />
      </div>
    )
  }
};

export default BrowseRecipes;
