import {ApiStoreContext} from "../client/stores/api_store";
import React from "react";
import App from 'next/app'
import ErrorPage from "./_error";
import RecipeCloudHead from "../client/components/header/Head";
import Header from "../client/components/header/Header";
import Notification from "../client/components/header/Notification";

class MyDocument extends App {
    render() {
        try {
            const {Component, pageProps} = this.props;

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
