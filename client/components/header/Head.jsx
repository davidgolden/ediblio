import Head from "next/head";
import React from "react";

export default function RecipeCloudHead(props) {
    return <Head>
        <title>Ediblio</title>
        <link rel="icon" type="image/png" href='/images/ediblio_icon_32.png'/>
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
        <link href="https://fonts.googleapis.com/css?family=EB+Garamond|Quicksand" rel="stylesheet"/>
        <meta name="viewport" content="width=device-width,initial-scale=1, user-scalable=no"/>
        <meta property="og:description" content="Add, Manage, and Share Recipes and Create Grocery Lists."/>
        <meta property="og:image" content="/images/addrecipe.png"/>
        <meta name="theme-color" content={"#164E57"}/>
        <link rel="apple-touch-icon" href="/images/ediblio_icon_192.png"/>
        <link href="https://fonts.googleapis.com/css?family=Markazi+Text" rel="stylesheet"/>
        <link rel={"stylesheet"} href={"https://use.fontawesome.com/releases/v5.2.0/css/all.css"}/>
        <link rel={"manifest"} href={"/manifest.webmanifest"}/>
        <script src={"/installPrompt.js"} />
        <meta charSet="utf-8"/>
    </Head>
}
