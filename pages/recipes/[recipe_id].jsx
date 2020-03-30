import React from 'react';
import axios from "axios";
import RecipePage from "../../client/components/recipes/RecipePage";
import {getCookieFromServer} from "../../client/utils/cookies";
import {handleJWT} from "../../client/hooks/handleJWT";

function Recipe_id(props) {
    handleJWT();
    return <RecipePage recipe={props.recipe} />
}

export async function getServerSideProps ({req, query}) {
    const currentFullUrl = req.protocol + "://" + req.headers.host.replace(/\/$/, "");
    const jwt = getCookieFromServer('jwt', req);

    const response = await axios.get(`${currentFullUrl}/api/recipes/${query.recipe_id}`, {
        headers: jwt ? {'x-access-token': jwt} : {},
    });
    return {
        props: {
            recipe: response.data.recipe,
        }
    };
}

export default Recipe_id;
