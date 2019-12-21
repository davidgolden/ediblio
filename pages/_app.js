import {store} from "../client/src/store";
import {ApiStoreContext} from "../client/src/stores/api_store";
import React from "react";
import App from 'next/app'
import ErrorPage from "./_error";
import RecipeCloudHead from "../client/src/components/header/Head";
import Header from "../client/src/components/header/Header";
import Notification from "../client/src/components/header/Notification";

class MyDocument extends App {

    static async getInitialProps(appContext) {
        // calls page's `getInitialProps` and fills `appProps.pageProps`
        const appProps = await App.getInitialProps(appContext);

        return {
            ...appProps,
            user: appContext.ctx.req.user,
        }
    }

    render() {
        try {
            const {Component, pageProps, user} = this.props;

            store.user = user;

            return (
                <>
                    <RecipeCloudHead/>
                    <ApiStoreContext.Provider value={store}>
                        <Header {...pageProps} />
                        <Notification />
                        <Component {...pageProps} />
                    </ApiStoreContext.Provider>
                </>
            )
        } catch (error) {
            return <ErrorPage/>
        }
    }
}

export default MyDocument
