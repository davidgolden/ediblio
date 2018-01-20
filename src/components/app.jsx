import React, { Component } from "react";
import Header from './views/partials/header';
import UserRecipes from './views/users/user_recipes';
import UserProfile from './views/users/user_profile';
import GroceryList from './views/users/user_grocery_list';
import RecipeForm from './views/recipes/recipe_form';
import BrowseRecipes from './views/recipes/browse_recipes';
import Landing from './views/landing';
import ForgotPassword from './views/forgot';

class App extends Component {
  constructor(props) {
    super(props);

    const blankRecipe = {
      name: '',
      url: '',
      image: '',
      notes: '',
      ingredients: [],
      tags: [],
      id: ''
    }

    this.state= {
      view: 'recipecloud',
      loggedIn: false,
      user: {},
      tags: ['Dinner', 'Breakfast', 'Dessert', 'Quick/Easy', 'Vegetarian', 'Vegan', 'Dairy-Free', 'Gluten-Free']

    }

    this.setLoginState = (state, user) => {
      if(state === false) {
        this.setState({view: 'landing'})
        this.setState({loggedIn: state});
        this.setState({user: user})
      } else {
        this.setState({loggedIn: state});
        this.setState({user: user})
        this.setState({view: 'recipecloud'})
      }
    }

    this.setView = (event, view) => {
      event.preventDefault();
      this.setState({view: view})
    }

    this.changeView = () => {
        if(this.state.view === 'landing') {
          return <Landing setLoginState={this.setLoginState} />
        }
        else if(this.state.view === 'recipecloud') {
          return <UserRecipes user={this.state.user} setView={this.setView} tags={this.state.tags} />
        }
        else if(this.state.view === 'grocerylist') {
          return <GroceryList user={this.state.user} />
        }
        else if(this.state.view === 'addrecipe') {
          return <RecipeForm user={this.state.user} setView={this.setView} tags={this.state.tags} recipe={blankRecipe} view={this.state.view} />
        }
        else if(this.state.view === 'browserecipes') {
          return <BrowseRecipes user={this.state.user} setView={this.setView} tags={this.state.tags} />
        }
        else if(this.state.view === 'userprofile') {
          return <UserProfile setView={this.setView} user={this.state.user} />
        }
        else if(this.state.view === 'forgot') {
          return <ForgotPassword setView={this.setView} setLoginState={this.setLoginState} />
        }
      }

  }

  componentWillMount() {
    let xml = new XMLHttpRequest();
    xml.open("GET", "/authenticate", true);
    xml.setRequestHeader('Access-Control-Allow-Headers', '*');
    xml.setRequestHeader('Access-Control-Allow-Origin', '*');
    xml.send();
    xml.onreadystatechange = () => {
      if(xml.readyState === 4 && xml.status === 200) {
        let res = JSON.parse(xml.response);
        this.setState({loggedIn: true, user: res.user});
      }
      else {
        this.setState({loggedIn: false, user: {}})
      }
    }
  }

  componentDidMount(){
    const ele = document.getElementById('ipl-progress-indicator')
    if(ele){
      setTimeout(() => {
        ele.classList.add('available')
        setTimeout(() => {
          ele.outerHTML = ''
        }, 2000)
      }, 1000)
    }
  }

  render() {
    return (
          <div>
            <Header
              setView={this.setView}
              setLoginState={this.setLoginState}
              loggedIn={this.state.loggedIn}
              user={this.state.user}
            />
            <div className='container'>
              {this.state.loggedIn ? this.changeView() : (this.state.view === 'forgot' ? <ForgotPassword setView={this.setView} setLoginState={this.setLoginState} /> : <Landing /> ) }
            </div>
          </div>
    )
  }
};

export default App;
