import {ApiStoreContext} from "../client/stores/api_store";
import React from "react";
import App from 'next/app'
import ErrorPage from "./_error";
import RecipeCloudHead from "../client/components/header/Head";
import Header from "../client/components/header/Header";
import Notification from "../client/components/header/Notification";

class MyDocument extends App {

    static contextType = ApiStoreContext;

    static async getInitialProps(appContext) {
        // calls page's `getInitialProps` and fills `appProps.pageProps`
        const appProps = await App.getInitialProps(appContext);

        return {
            ...appProps,
            user: appContext.ctx.req?.user,
        }
    }

    render() {
        try {
            const {Component, pageProps, user} = this.props;

            this.context.user = user;

            return (
                <>
                    <RecipeCloudHead/>
                        <Header {...pageProps} />
                        <Notification/>
                        <Component {...pageProps} />
                </>
            )
        } catch (error) {
            return <ErrorPage error={error}/>
        }
    }
}

export default MyDocument
