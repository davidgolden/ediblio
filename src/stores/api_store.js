import React from 'react';
import {action, observable} from 'mobx';

export default class ApiStore {
    @observable recipes = [];

    @action
    getRecipes = () => {
        let xml = new XMLHttpRequest();
        xml.open("GET", `/recipes`, true);
        xml.setRequestHeader('Access-Control-Allow-Headers', '*');
        xml.setRequestHeader('Access-Control-Allow-Origin', '*');
        xml.send();
        xml.onreadystatechange = () => {
            if(xml.readyState === 4 && xml.status === 200) {
                let response = JSON.parse(xml.response);
                response.forEach(recipe => {
                    this.recipes.push(recipe);
                })
            }
        }
    }

    @action
    getRecipe = id => {
        let xml = new XMLHttpRequest();
        xml.open("GET", `/recipes/${id}`, true);
        xml.setRequestHeader('Access-Control-Allow-Headers', '*');
        xml.setRequestHeader('Access-Control-Allow-Origin', '*');
        xml.send();
        xml.onreadystatechange = () => {
            if(xml.readyState === 4 && xml.status === 200) {
                let response = JSON.parse(xml.response);
                response.forEach(recipe => {
                    this.recipes.push(recipe);
                })
            }
        }
    }
}
