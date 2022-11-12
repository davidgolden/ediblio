import Head from "next/head";
import Script from 'next/script'
import React from "react";

export default function RecipeCloudHead(props) {
    return <Head>
        <title>Ediblio</title>
        <link rel="icon" type="image/png" href='/images/ediblio_icon_32.png'/>
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
        <meta name="viewport" content="width=device-width,initial-scale=1, user-scalable=no"/>
        <meta property="og:description" content="Add, Manage, and Share Recipes and Create Grocery Lists."/>
        <meta property="og:image" content="/images/addrecipe.png"/>
        <meta name="theme-color" content={"#164E57"}/>
        <link rel="apple-touch-icon" href="/images/ediblio_icon_192.png"/>
        <Script src={"/installPrompt.js"}/>
        <meta charSet="utf-8"/>
    </Head>
}
