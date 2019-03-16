import React from "react";
import apiStore from './stores/api_store';
import {Provider as MobxProvider} from 'mobx-react';
import {render} from "react-dom";
import {Header, UserRecipes, UserSettings, GroceryList, AddRecipe, BrowseRecipes, Landing, ForgotPassword, RecipeContainer} from './registry';
require('./stylesheets/base.scss');
require('./stylesheets/bem.scss');
require('./stylesheets/grid.scss');
import {
    createHistory,
    LocationProvider,
    Router
} from "@reach/router";
import createHashSource from 'hash-source'

let source = createHashSource();
let history = createHistory(source);

const Index = () => {
    return (
        <MobxProvider apiStore={apiStore}>
            <LocationProvider history={history}>
                <Header />
                <Router>
                    <BrowseRecipes path={'/recipes'} />
                    <UserRecipes path={'/users/:user_id/recipes'} />
                    <RecipeContainer path={'/recipes/:recipe_id'} />
                    <GroceryList path={'/groceries'}/>
                    <AddRecipe path={'/add'} />
                    <UserSettings path={'/settings'}/>
                    <ForgotPassword path={'/forgot'}/>
                    <Landing path={'/register'}/>
                    <BrowseRecipes default />
                </Router>
            </LocationProvider>
        </MobxProvider>
    )
};

render(<Index/>, document.getElementById("app"));
