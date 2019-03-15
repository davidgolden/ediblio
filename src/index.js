import React from "react";
import {Router} from "@reach/router"
import apiStore from './stores/api_store';
import {Provider as MobxProvider} from 'mobx-react';
import {render} from "react-dom";
import {Header, UserRecipes, UserProfile, GroceryList, RecipeForm, BrowseRecipes, Landing, ForgotPassword, RecipeContainer} from './registry';
require('./stylesheets/base.scss');
require('./stylesheets/bem.scss');
require('./stylesheets/grid.scss');

// class App2 extends Component {
//     constructor(props) {
//         super(props);
//
//         this.blankRecipe = {
//             name: '',
//             url: '',
//             image: '',
//             notes: '',
//             ingredients: [],
//             tags: [],
//             id: ''
//         }
//
//         this.state = {
//             view: 'recipecloud',
//             loggedIn: false,
//             user: {},
//             tags: ['Dinner', 'Breakfast', 'Dessert', 'Quick/Easy', 'Vegetarian', 'Vegan', 'Dairy-Free', 'Gluten-Free']
//
//         }
//
//         this.setLoginState = (state, user) => {
//             if (state === false) {
//                 this.setState({loggedIn: state});
//                 this.setState({user: user})
//             } else {
//                 this.setState({loggedIn: state});
//                 this.setState({user: user})
//             }
//         }
//     }
//
//     // componentWillMount() {
//     //     let xml = new XMLHttpRequest();
//     //     xml.open("POST", "/authenticate", true);
//     //     xml.setRequestHeader('Access-Control-Allow-Headers', '*');
//     //     xml.setRequestHeader('Access-Control-Allow-Origin', '*');
//     //     xml.send();
//     //     xml.onreadystatechange = () => {
//     //         if (xml.readyState === 4 && xml.status === 200) {
//     //             let res = JSON.parse(xml.response);
//     //             this.setState({loggedIn: true, user: res.user});
//     //         }
//     //         else {
//     //             this.setState({loggedIn: false, user: {}})
//     //         }
//     //     }
//     // }
//
//     componentDidMount() {
//         const ele = document.getElementById('ipl-progress-indicator')
//         if (ele) {
//             setTimeout(() => {
//                 ele.classList.add('available')
//                 setTimeout(() => {
//                     ele.outerHTML = ''
//                 }, 2000)
//             }, 1000)
//         }
//     }
//
//     render() {
//         return (
//             <MobxProvider apiStore={apiStore}>
//                 <React.Fragment>
//                     <Header
//                         loggedIn={this.state.loggedIn}
//                         user={this.state.user}
//                         setLoginState={this.setLoginState}
//                     />
//                     <Router>
//                         <Landing path={'/'}/>
//                         <UserRecipes path={'/recipes'} user={this.state.user} tags={this.state.tags}/>
//                         <RecipeContainer path={'/recipes/:recipe_id'}
//                             // recipe={this.state.recipe}
//                                          user={this.state.user}
//                             // showRecipe={this.showRecipe}
//                             // sortByUser={this.sortByUser}
//                         />
//                         <GroceryList path={'/groceries'} user={this.state.user}/>
//                         <RecipeForm path={'/add'} user={this.state.user} tags={this.state.tags}
//                                     recipe={this.blankRecipe}
//                                     view={this.state.view}/>
//                         <BrowseRecipes path={'/browse'} user={this.state.user} tags={this.state.tags}/>
//                         <UserProfile path={'/user/:user_id'} user={this.state.user}/>
//                         <ForgotPassword path={'forgot'}/>
//                     </Router>
//                 </React.Fragment>
//             </MobxProvider>
//         )
//     }
// }

const Index = () => {
    return (
        <MobxProvider apiStore={apiStore}>
            <React.Fragment>
                <Header />
                <Router>
                    {/*<Landing path={'/'}/>*/}
                    <BrowseRecipes path={'/'} />
                    <UserRecipes path={'/users/:user_id/recipes'} />
                    <RecipeContainer path={'/recipes/:recipe_id'} />
                    <GroceryList path={'/groceries'}/>
                    <RecipeForm path={'/add'} />
                    <UserProfile path={'/user/:user_id'}/>
                    <ForgotPassword path={'forgot'}/>
                </Router>
            </React.Fragment>
        </MobxProvider>
    )
};

render(<Index/>, document.getElementById("app"));
