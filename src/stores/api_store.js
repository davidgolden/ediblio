import React from 'react';
import {action, observable, computed} from 'mobx';
import axios from 'axios';

class ApiStore {
    @observable recipes = [];
    @observable grocery_list = [];
    @observable menu = [];


    @observable user = {};

    @computed
    get isLoggedIn() {
        return !!(this.user && this.user._id);
    }

    @action
    authenticate = () => {
        axios.post('/api/authenticate')
            .then(response => {
                this.user = response.data.user;
                // localStorage.setItem(user, data.user)
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
                // localStorage.setItem('user', data.user)
            })
            .catch(err => {
                console.log(err);
            })
    };

    @action
    userLogout = () => {
        let xml = new XMLHttpRequest();
        xml.open("GET", "/api/logout", true);
        xml.setRequestHeader('Access-Control-Allow-Headers', '*');
        xml.setRequestHeader('Access-Control-Allow-Origin', '*');
        xml.send();
        xml.onreadystatechange = () => {
            if (xml.readyState === 4 && xml.status === 200) {
                this.user = {};
            }
        }
    };

    @action
    getRecipes = () => {
        axios.get('/api/recipes')
            .then(response => {
                response.data.recipes.forEach(recipe => {
                    this.recipes.push(recipe);
                })
            });
    };

    @action
    getRecipe = id => {
        let xml = new XMLHttpRequest();
        xml.open("GET", `/recipes/${id}`, true);
        xml.setRequestHeader('Access-Control-Allow-Headers', '*');
        xml.setRequestHeader('Access-Control-Allow-Origin', '*');
        xml.send();
        xml.onreadystatechange = () => {
            if (xml.readyState === 4 && xml.status === 200) {
                let response = JSON.parse(xml.response);
                response.forEach(recipe => {
                    this.recipes.push(recipe);
                })
            }
        }
    };

    @action
    addRecipeToGroceryList = recipe => {
        let newGroceryList = [
            ...this.grocery_list,
            recipe,
        ];

        let xml = new XMLHttpRequest();
        xml.open("PUT", `/users/${this.user.id}`, true);
        xml.setRequestHeader('Access-Control-Allow-Headers', '*');
        xml.setRequestHeader('Access-Control-Allow-Origin', '*');
        xml.send(JSON.stringify({user_id: this.user.id, grocery_list: newGroceryList}));
        xml.onreadystatechange = () => {
            if (xml.readyState === 4 && xml.status === 200) {
                let response = JSON.parse(xml.response);
                response.forEach(recipe => {
                    this.recipes.push(recipe);
                })
            }
        }
    }
}

const apiStore = new ApiStore();

export default apiStore;
