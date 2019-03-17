import React from 'react';
import {action, observable, computed, autorun, toJS} from 'mobx';
import axios from 'axios';
import {navigate} from '@reach/router';

class ApiStore {
    @observable user = null;

    constructor() {
        this.getUserFromStorage();
        autorun(() => {
            // This code will run every time any observable property on the store is updated.
            const user = JSON.stringify(toJS(this.user));
            localStorage.setItem('user', user);
        });
    }

    @action
    getUserFromStorage = () => {
        const foundUser = localStorage.getItem('user');
        if (foundUser) {
            this.user = foundUser;
        }
    };

    @observable recipes = [];
    @observable grocery_list = [];
    @observable menu = [];

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
        axios.get('/api/recipes', {
            params: params,
        })
            .then(response => {
                this.recipes = response.data.recipes;
            });
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
        axios.patch(`/api/users/${this.user._id}`, {
            ...partialUserObj
        })
            .then(response => {
                console.log(response);
                this.user = response.data.user;
            })
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
        axios.post('/api/recipes', {
            recipe: recipe,
        })
            .then(response => {
                // do something
            })
    };

    @action
    deleteRecipe = id => {
        axios.delete(`/api/recipes/${id}`)
            .then(() => {
                // do something
                this.recipes = this.recipes.filter(item => item._id !== id);
            })
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
    }
}

const apiStore = new ApiStore();

export default apiStore;
