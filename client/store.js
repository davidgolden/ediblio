import React from "react";
import axios from "axios";
import {addIngredient, canBeAdded} from "./utils/conversions";
import './stylesheets/base.scss';
import {observable, action} from "mobx";
import Router from 'next/router';

export default class Store {
    @observable user = null;
    @observable notificationMessage = '';
    @observable notificationType = '';

    handleError = error => {
        this.notificationMessage = 'Oops! ' + error;
        this.notificationType = 'error';
        setTimeout(() => {
            this.notificationMessage = '';
            this.notificationType = '';
        }, 4000);
    };

    @action
    userLogin = (email, password) => {
        axios.post('/api/login', {
            email: email,
            password: password,
        }, {
            withCredentials: true,
        })
            .then(response => {
                this.user = response.data.user;
            })
            .catch(err => {
                this.handleError(err.response.data.detail);
            })
    };

    @action
    userLogout = () => {
        axios.get('/api/logout')
            .then(() => {
                this.user = null;
                // localStorage.setItem('jwt', null);
            });
    };

    getCollectionRecipes = async (collectionId, query) => {
        const response = await axios.get(`/api/collections/${collectionId}`, query);
        return response.data.collection;
    };

    getRecipes = params => {
        // accepted params: author, tags, page, page_size
        const requestParams = params;
        return new Promise((res, rej) => {
            axios.get('/api/recipes', {
                params: requestParams,
            })
                .then(response => {
                    return res(response.data.recipes);
                })
                .catch(err => {
                    this.handleError(err.response.data.detail);
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
                .then(response => {
                    this.user = response.data.user;
                    res();
                })
                .catch(err => {
                    this.handleError(err.response.data.detail);
                    rej(err);
                })
        });
    };

    @action
    putCollection = collectionObj => {
        return new Promise((res, rej) => {
            axios.patch(`/api/collections/${collectionObj._id}`, {
                ...collectionObj
            })
                .then(response => {
                    this.user = {
                        ...this.user,
                        collections: this.user.collections.map(c => {
                            if (c._id === collectionObj._id) {
                                return response.data.collection;
                            }
                            return c;
                        })
                    };
                    res();
                })
                .catch(err => {
                    this.handleError(err.response.data.detail);
                    rej(err);
                })
        });
    };

    @action
    createCollection = name => {
        return new Promise((res, rej) => {
            axios.post(`/api/collections`, {name})
                .then(response => {
                    this.user = response.data.user;
                    res();
                })
                .catch(err => {
                    this.handleError(err.response.data.detail);
                    rej(err);
                })
        });
    };

    @action
    deleteCollection = async id => {
        return new Promise((res, rej) => {
            axios.delete(`/api/collections/${id}`)
                .then(response => {
                    this.user = response.data.user;
                    res();
                })
                .catch(rej)
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
                    res();
                })
                .catch(err => {
                    this.handleError(err.response.data.detail);
                })
        });
    };

    @action
    registerUser = user => {
        return new Promise((res, rej) => {
            axios.post('/api/users', {...user})
                .then(response => {
                    this.user = response.data.user;
                    Router.push("/");
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
                let q = Number(currentGroceryList[i].quantity);
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
}
