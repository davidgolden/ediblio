import React from "react";
import {ApiStoreContext} from './stores/api_store';
import {render} from "react-dom";
import Header from './components/header/Header';
import GroceryList from './pages/GroceryList';
import AddRecipe from './pages/AddRecipe';
import BrowseRecipes from './pages/BrowseRecipes';
import Landing from './pages/Landing';
import ForgotPassword from './pages/Forgot';
import RecipeContainer from "./pages/RecipeContainer";
import {createHistory, LocationProvider, Router} from "@reach/router";
import createHashSource from 'hash-source'
import Notification from "./components/header/Notification";
import axios from "axios";
import {addIngredient, canBeAdded} from "./utils/conversions";
import './stylesheets/base.scss';
import UserSettings from "./pages/UserSettings";

let source = createHashSource();
let history = createHistory(source);

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            recipes: new Map(),
            user: null,
            distanceToBottom: 1,
            notificationMessage: '',
            notificationType: '',
            lastRequestParams: {},
        }
    }

    handleError = error => {
        this.setState({
            notificationMessage: 'Oops! ' + error,
            notificationType: 'error',
        });
        setTimeout(() => {
            this.setState({
                notificationMessage: '',
                notificationType: '',
            });
        }, 4000);
    };

    authenticate = () => {
        axios.post('/api/authenticate')
            .then(response => {
                this.setState({
                    user: response.data.user,
                });
            })
            .catch(err => {
                this.handleError(err.response.data.detail);
            });
    };

    userLogin = (email, password) => {
        axios.post('/api/login', {
            email: email,
            password: password,
        })
            .then(response => {
                this.setState({
                    user: response.data.user,
                });
            })
            .catch(err => {
                this.handleError(err.response.data.detail);
            })
    };

    userLogout = () => {
        axios.get('/api/logout')
            .then(() => {
                this.setState({
                    user: null,
                });
            });
    };

    getRecipes = params => {
        // accepted params: author, tags, page, page_size
        const requestParams = params;
        return new Promise((res, rej) => {
            axios.get('/api/recipes', {
                params: requestParams,
            })
                .then(response => {
                    // if not loading first page, add new recipes. otherwise, replace them.
                    let recipes = this.state.recipes;

                    if (requestParams.page !== 'undefined' && requestParams.page === 0) {
                        recipes.clear();
                    }

                    response.data.recipes.forEach(item => {
                        recipes.set(item._id, item);
                    });

                    this.setState({
                        recipes: recipes,
                    });

                    return res(response.data.recipes);
                })
                .catch(err => {
                    this.handleError(err.response.data.detail);
                    rej(err);
                })
        })
    };

    getRecipe = id => {
        return new Promise((res, rej) => {
            axios.get(`/api/recipes/${id}`)
                .then(response => {
                    // do something
                    res(response.data.recipe);
                })
                .catch(err => {
                    this.handleError(err.response.data.detail);
                    rej(err);
                })
        })
    };

    patchUser = partialUserObj => {
        return new Promise((res, rej) => {
            axios.patch(`/api/users/${this.state.user._id}`, {
                ...partialUserObj
            })
                .then(response => {
                    this.setState({
                        user: response.data.user,
                    });
                    res();
                })
                .catch(err => {
                    this.handleError(err.response.data.detail);
                    rej(err);
                })
        });
    };

    getUserLists = id => {
        return new Promise((res, rej) => {
            axios.get(`/api/users/${id}/list`)
                .then(response => {
                    res(response.data);
                })
                .catch(err => {
                    this.handleError(err.response.data.detail);
                    rej(err);
                })
        })
    };

    getUser = id => {
        return new Promise((res, rej) => {
            axios.get(`/api/users/${id}`)
                .then(response => {
                    this.setState({
                        user: response.data.user,
                    });
                    res(response.data.user);
                })
                .catch(err => {
                    this.handleError(err.response.data.detail);
                    rej(err);
                })
        })
    };

    createRecipe = recipe => {
        return new Promise((res, rej) => {
            axios.post('/api/recipes', {
                recipe: recipe,
            })
                .then(response => {
                    // do something
                    res();
                })
                .catch(err => {
                    this.handleError(err.response.data.detail);
                })
        })
    };

    deleteRecipe = id => {
        return new Promise((res, rej) => {
            axios.delete(`/api/recipes/${id}`)
                .then(() => {
                    // do something
                    let recipes = this.state.recipes;
                    recipes.delete(id);
                    this.setState({
                        recipes: recipes,
                    });
                    res();
                })
                .catch(err => {
                    this.handleError(err.response.data.detail);
                })
        });
    };

    registerUser = user => {
        return new Promise((res, rej) => {
            axios.post('/api/users', {...user})
                .then(response => {
                    this.setState({
                        user: response.data.user,
                    }, () => {
                        localStorage.setItem('user', JSON.stringify(this.state.user));
                    });
                    res();
                })
                .catch(err => {
                    this.handleError(err.response.data.detail);
                    rej();
                })
        })
    };

    patchRecipe = (id, partialRecipeObj) => {
        return new Promise((res, rej) => {
            axios.patch(`/api/recipes/${id}`, {
                ...partialRecipeObj
            })
                .then(response => {
                    res(response.data.recipe);
                })
                .catch(err => {
                    this.handleError(err.response.data.detail);
                    rej(err);
                })
        });
    };

    resetPassword = (token, newPassword) => {
        return new Promise((res, rej) => {
            axios.post('/api/reset', {
                token: token,
                newPassword: newPassword,
            })
                .then(response => {
                    return res(response.data);
                })
                .catch(err => {
                    this.handleError(err.response.data.detail);
                })
        })
    };

    forgotPassword = email => {
        return new Promise((res, rej) => {
            axios.post('/api/forgot', {
                email: email,
            })
                .then(response => {
                    res();
                })
                .catch(err => {
                    this.handleError(err.response.data.detail);
                    rej(err);
                })
        })
    };

    addToGroceryList = (recipe_id, ingredients) => {
        // add current recipe to menu
        // add all ingredients to grocery list
        const currentMenu = this.state.user.menu;
        currentMenu.push(recipe_id);

        const currentGroceryList = this.state.user.groceryList;

        const onCurrentList = ingredient => {
            return currentGroceryList.findIndex(item => {
                return item.name === ingredient ||
                    item.name === ingredient + 's' ||
                    item.name === ingredient + 'es' ||
                    item.name === ingredient.slice(0, -1) ||
                    item.name === ingredient.slice(0, -2);
            })
        };

        ingredients.forEach(ingredient => {
            const i = onCurrentList(ingredient.name);
            if (i > -1) {
                let m = currentGroceryList[i].measurement;
                let q = parseInt(currentGroceryList[i].quantity);
                // check if item can be added
                if (canBeAdded(m, ingredient.measurement)) {
                    // if it can be added, add it
                    let newQM = addIngredient(q, m, Number(ingredient.quantity), ingredient.measurement);
                    currentGroceryList[i].quantity = newQM.quantity;
                    currentGroceryList[i].measurement = newQM.measurement;
                } else {
                    // if it can't be added, push it to grocery list
                    currentGroceryList.splice(currentGroceryList.length, 0, ingredient);
                }
            } else {
                // here if ingredient is not on current list
                currentGroceryList.splice(currentGroceryList.length, 0, ingredient);
            }
        });

        this.patchUser({
            menu: currentMenu,
            groceryList: currentGroceryList,
        });
    };

    componentDidMount() {
        this.authenticate();
    }

    render() {

        const isLoggedIn = !!(this.state.user && this.state.user._id);

        return (
            <ApiStoreContext.Provider value={{
                ...this.state,
                ...this,
                isLoggedIn,
            }}>
                <LocationProvider history={history}>
                    <Header/>
                    <Notification/>
                    <Router>
                        <BrowseRecipes path={'/recipes'}/>
                        <BrowseRecipes path={'/users/:user_id/recipes'}/>
                        <RecipeContainer path={'/recipes/:recipe_id'}/>
                        <GroceryList path={'/users/:user_id/groceries'}/>
                        <AddRecipe path={'/add'}/>
                        <UserSettings path={'/users/:user_id/settings'}/>
                        <ForgotPassword path={'/forgot'}/>
                        <Landing path={'/register'}/>
                        <BrowseRecipes default/>
                    </Router>
                </LocationProvider>
            </ApiStoreContext.Provider>
        )
    }
}

render(<App/>, document.getElementById("app"));
