import React from 'react';
import {action, observable, computed, autorun, toJS} from 'mobx';
import axios from 'axios';
import {addIngredient, canBeAdded} from "../utils/conversions";

class ApiStore {
    @observable user = null;
    @observable distanceToBottom = 1;

    constructor() {
        // this.getUserFromStorage();
        autorun(() => {
            // This code will run every time any observable property on the store is updated.
            const user = JSON.stringify(toJS(this.user));
            localStorage.setItem('user', user);
        });

        window.addEventListener('scroll', this.handleWindowScroll)
    }

    @action
    handleWindowScroll = () => {
        const scrollPosition = window.pageYOffset;
        const windowSize = window.innerHeight;
        const bodyHeight = document.body.offsetHeight;
        this.distanceToBottom = Math.max(bodyHeight - (scrollPosition + windowSize), 0)
    };

    @action
    getUserFromStorage = () => {
        const foundUser = localStorage.getItem('user');
        if (foundUser) {
            this.user = JSON.parse(foundUser);
        }
    };

    @observable recipes = [];

    @computed
    get isLoggedIn() {
        return !!(this.user && this.user._id);
    }

    @action
    authenticate = () => {
        axios.post('/api/authenticate')
            .then(response => {
                this.user = response.data.user;
                localStorage.setItem('user', JSON.stringify(response.data.user))
            })
            .catch(err => {
                console.log('error! ', err);
            });
    };

    @action
    userLogin = (email, password) => {
        axios.post('/api/login', {
            email: email,
            password: password,
        })
            .then(response => {
                this.user = response.data.user;
            })
            .catch(err => {
                console.log(err);
            })
    };

    @action
    userLogout = () => {
        axios.get('/api/logout')
            .then(() => {
                this.user = null;
            });
    };

    @action
    getRecipes = params => {
        // accepted params: author, tags, page, page_size
        return new Promise((res, rej) => {
            axios.get('/api/recipes', {
                params: params,
            })
                .then(response => {
                    // if not loading first page, add new recipes. otherwise, replace them.
                    if (params && params.page) {
                        console.log(params.page);
                        this.recipes = this.recipes.concat(response.data.recipes);
                    } else {
                        this.recipes = response.data.recipes;
                    }
                    res();
                })
                .catch(err => {
                    rej(err);
                })
        })
    };

    @action
    getRecipe = id => {
        return new Promise((res, rej) => {
            axios.get(`/api/recipes/${id}`)
                .then(response => {
                    // do something
                    res(response.data.recipe);
                })
                .catch(err => {
                    rej(err);
                })
        })
    };

    @action
    patchUser = partialUserObj => {
        return new Promise((res, rej) => {
            axios.patch(`/api/users/${this.user._id}`, {
                ...partialUserObj
            })
                .then(action(response => {
                    this.user = response.data.user;
                    res();
                }))
                .catch(err => {
                    rej(err);
                })
        });
    };

    @action
    getUserLists = id => {
        return new Promise((res, rej) => {
            axios.get(`/api/users/${id}/list`)
                .then(response => {
                    res(response.data);
                })
                .catch(err => {
                    rej(err);
                })
        })
    };

    @action
    getUser = id => {
        return new Promise((res, rej) => {
            axios.get(`/api/users/${id}`)
                .then(response => {
                    this.user = response.data.user;
                    res(response.data.user);
                })
                .catch(err => {
                    rej(err);
                })
        })
    };

    @action
    addRecipeToGroceryList = recipe => {
        let newGroceryList = [
            ...this.grocery_list,
            recipe,
        ];

        axios.patch(`/api/users/${this.user.id}`, {
            menu: newGroceryList,
        })
            .then(response => {
                // do something
            });
    };

    @action
    createRecipe = recipe => {
        return new Promise((res, rej) => {
            axios.post('/api/recipes', {
                recipe: recipe,
            })
                .then(response => {
                    // do something
                    res();
                })
        })
    };

    @action
    deleteRecipe = id => {
        return new Promise((res, rej) => {
            axios.delete(`/api/recipes/${id}`)
                .then(() => {
                    // do something
                    this.recipes = this.recipes.filter(item => item._id !== id);
                    res();
                })
        });
    };

    @action
    registerUser = user => {
        return new Promise((res, rej) => {
            axios.post('/api/users', {...user})
                .then(response => {
                    this.user = response.data.user;
                    res();
                })
                .catch(err => {
                    console.log(err);
                    rej();
                })
        })
    };

    @action
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

        ingredients.filter(item => item) // filter out ingredients that are undefined??
            .forEach(ingredient => {
                const i = onCurrentList(ingredient.name);
                if (i > -1) {
                    let m = currentGroceryList[i].measurement;
                    let q = currentGroceryList[i].quantity;
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
                    // user.groceryList.push(ingredient);
                }
            });

        this.patchUser({
            menu: currentMenu,
            groceryList: currentGroceryList,
        });
    }
}

const apiStore = new ApiStore();

export default apiStore;
