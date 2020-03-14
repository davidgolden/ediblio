import React from "react";
import App from 'next/app'
import ErrorPage from "./_error";
import RecipeCloudHead from "../client/components/header/Head";
import Header from "../client/components/header/Header";
import Notification from "../client/components/header/Notification";
import AllModals from "../client/components/modals/styles/AllModals";
import {ApiStoreContext, initialStore} from "../client/stores/api_store";
import LogRocket from 'logrocket';
import "../client/stylesheets/base.scss";

class MyDocument extends App {
    render() {
        try {
            const {Component, pageProps} = this.props;

            if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'development') {
                LogRocket.init('gajlpv/recipe-cloud');
            }

            if (typeof window === 'undefined' && pageProps.user) {
                // if user is returned from getInitialProps, we can set the user on the server and then render the page knowing the user
                initialStore.setUser(pageProps.user);
            }

            return (
                <ApiStoreContext.Provider value={initialStore}>
                    <RecipeCloudHead/>
                    <AllModals />
                    <Header {...pageProps} />
                    <Notification {...pageProps}/>
                    <Component {...pageProps} />
                </ApiStoreContext.Provider>
            )
        } catch (error) {
            return <ErrorPage error={error}/>
        }
    }
}

export default MyDocument
