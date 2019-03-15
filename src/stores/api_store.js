import React from 'react';
import {action, observable, computed, autorun, toJS} from 'mobx';
import axios from 'axios';

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
        axios.post('/api/logout')
            .then(() => {
                this.user = null;
            });
    };

    @action
    getRecipes = () => {
        axios.get('/api/recipes')
            .then(response => {
                // response.data.recipes.forEach(recipe => {
                //     this.recipes.push(recipe);
                // })
                this.recipes = response.data.recipes;
            });
    };

    @action
    getUserRecipes = () => {
        axios.get(`/api/users/${this.user._id}/recipes`)
            .then(response => {
                this.recipes = response.data.recipes;
            })
    };

    @action
    getRecipe = id => {
        axios.get(`/recipes/${id}`)
            .then(response => {
                // do something
            });
    };

    @action
    patchUser = partialUserObj => {
        axios.patch(`/api/users/${this.user._id}`, {
            ...partialUserObj
        })
            .then(response => {
                this.user = response.data.user;
            })
    };

    @action
    addRecipeToGroceryList = recipe => {
        let newGroceryList = [
            ...this.grocery_list,
            recipe,
        ];

        axios.patch(`/users/${this.user.id}`, {
            menu: newGroceryList,
        })
            .then(response => {
                // do something
            });
    }
}

const apiStore = new ApiStore();

export default apiStore;
