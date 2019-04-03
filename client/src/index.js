import React from "react";
import {ApiStoreContext, apiStore} from './stores/api_store';
import {render} from "react-dom";
import {
    Header,
    UserRecipes,
    UserSettings,
    GroceryList,
    AddRecipe,
    BrowseRecipes,
    Landing,
    ForgotPassword,
    RecipeContainer
} from './registry';

require('./stylesheets/base.scss');
import {
    createHistory,
    LocationProvider,
    Router
} from "@reach/router";
import createHashSource from 'hash-source'
import Notification from "./components/header/Notification";
import axios from "axios";
import {addIngredient, canBeAdded} from "./utils/conversions";

let source = createHashSource();
let history = createHistory(source);

export default class App extends React.Component {
    constructor(props) {
        super(props);
        // this.getUserFromStorage();
        // autorun(() => {
        // This code will run every time any observable property on the store is updated.
        const user = JSON.stringify(this.user);
        localStorage.setItem('user', user);
        // });

        window.addEventListener('scroll', this.handleWindowScroll)

        this.state = {
            recipes: [],
            user: null,
            distanceToBottom: 1,
            notificationMessage: '',
            notificationType: '',
        }
    }

    handleError = error => {
        this.notificationMessage = 'Oops! ' + error;
        this.notificationType = 'error';

        setTimeout(() => {
            this.notificationMessage = '';
            this.notificationType = '';
        }, 4000);
    };

    handleWindowScroll = () => {
        const scrollPosition = window.pageYOffset;
        const windowSize = window.innerHeight;
        const bodyHeight = document.body.offsetHeight;
        this.distanceToBottom = Math.max(bodyHeight - (scrollPosition + windowSize), 0)
    };

    getUserFromStorage = () => {
        const foundUser = localStorage.getItem('user');
        if (foundUser) {
            this.setState({
                user: JSON.parse(foundUser),
            });
        }
    };

    authenticate = () => {
        axios.post('/api/authenticate')
            .then(response => {
                this.setState({
                    user: response.data.user,
                });
                localStorage.setItem('user', JSON.stringify(response.data.user))
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
        return new Promise((res, rej) => {
            axios.get('/api/recipes', {
                params: params,
            })
                .then(response => {
                    // if not loading first page, add new recipes. otherwise, replace them.
                    if (params && params.page) {
                        this.setState(prevState => {
                            return {
                                recipes: prevState.recipes.concat(response.data.recipes),
                            }
                        })
                    } else {
                        this.setState({
                            recipes: response.data.recipes,
                        });
                    }
                    res(response.data.recipes);
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
            axios.patch(`/api/users/${this.user._id}`, {
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
                    this.setState({
                        recipes: this.state.recipes.filter(item => item._id !== id)
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

    addToGroceryList = (recipe_id, ingredients) => {
        // add current recipe to menu
        // add all ingredients to grocery list
        const currentMenu = this.user.menu;
        currentMenu.push(recipe_id);

        const currentGroceryList = this.user.groceryList;

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
        this.getRecipes();
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
                    <Notification />
                    <Router>
                        <BrowseRecipes path={'/recipes'}/>
                        <UserRecipes path={'/users/:user_id/recipes'}/>
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
