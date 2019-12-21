import Head from "next/head";
import React from "react";

export default function RecipeCloudHead(props) {
    return <Head>
        <title>Recipe Cloud</title>
        <link rel="icon" type="image/png" href='/src/images/recipecloud.png'/>
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
        <link href="https://fonts.googleapis.com/css?family=EB+Garamond|Quicksand" rel="stylesheet"/>
        <meta name="viewport" content="width=device-width,initial-scale=1, user-scalable=no"/>
        <meta property="og:description" content="Add, Manage, and Share Recipes and Create Grocery Lists."/>
        <meta property="og:image" content="http://www.recipe-cloud.com/images/addrecipe.png"/>
        <link href="https://fonts.googleapis.com/css?family=Markazi+Text" rel="stylesheet"/>
    </Head>
}
