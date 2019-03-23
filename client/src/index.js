import React from "react";
import apiStore from './stores/api_store';
import {Provider as MobxProvider} from 'mobx-react';
import {render} from "react-dom";
import {Header, UserRecipes, UserSettings, GroceryList, AddRecipe, BrowseRecipes, Landing, ForgotPassword, RecipeContainer} from './registry';
require('./stylesheets/base.scss');
import {
    createHistory,
    LocationProvider,
    Router
} from "@reach/router";
import createHashSource from 'hash-source'
import Notification from "./components/header/Notification";

let source = createHashSource();
let history = createHistory(source);

const Index = () => {
    return (
        <MobxProvider apiStore={apiStore}>
            <LocationProvider history={history}>
                <Header />
                <Notification />
                <Router>
                    <BrowseRecipes path={'/recipes'} />
                    <UserRecipes path={'/users/:user_id/recipes'} />
                    <RecipeContainer path={'/recipes/:recipe_id'} />
                    <GroceryList path={'/users/:user_id/groceries'}/>
                    <AddRecipe path={'/add'} />
                    <UserSettings path={'/users/:user_id/settings'}/>
                    <ForgotPassword path={'/forgot'}/>
                    <Landing path={'/register'}/>
                    <BrowseRecipes default />
                </Router>
            </LocationProvider>
        </MobxProvider>
    )
};

render(<Index/>, document.getElementById("app"));
