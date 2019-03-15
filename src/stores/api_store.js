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
        return !!this.user._id;
    }

    @action
    authenticate = () => {
        axios.post('/api/authenticate')
            .then(res => {
                let data = JSON.parse(res);
                this.user = data.user;
            })
            .catch(err => {
                console.log('error! ', err);
            });
    };

    @action
    userLogin = (email, password) => {
        let xml = new XMLHttpRequest();
        xml.open("POST", "/api/login");
        xml.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        xml.setRequestHeader('Access-Control-Allow-Headers', '*');
        xml.setRequestHeader('Access-Control-Allow-Origin', '*');
        xml.send(JSON.stringify({email: email, password: password}));
        xml.onreadystatechange = () => {
            if(xml.readyState === 4 && xml.status === 200) {
                let res = JSON.parse(xml.response);
                this.user = res.user;
            }
            else if(xml.readyState === 4 && xml.status !== 200) {
                return alert(xml.response)
            }
        }
    };

    @action
    userLogout = () => {
        let xml = new XMLHttpRequest();
        xml.open("GET", "/logout", true);
        xml.setRequestHeader('Access-Control-Allow-Headers', '*');
        xml.setRequestHeader('Access-Control-Allow-Origin', '*');
        xml.send();
        xml.onreadystatechange = () => {
            if(xml.readyState === 4 && xml.status === 200) {
                this.user = {};
            }
        }
    };

    @action
    getRecipes = () => {
        let xml = new XMLHttpRequest();
        xml.open("GET", `/recipes`, true);
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
