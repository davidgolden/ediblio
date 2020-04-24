import React from 'react';
import axios from "axios";
import RecipePage from "../../client/components/recipes/RecipePage";
import {getCookieFromServer, getUrlParts} from "../../client/utils/cookies";
import {handleJWT} from "../../client/hooks/handleJWT";

function Recipe_id(props) {
    handleJWT(props.currentFullUrl);
    return <RecipePage recipe={props.recipe} />
}

export async function getServerSideProps ({req, query}) {
    const {currentBaseUrl, currentFullUrl, jwt} = getUrlParts(req);

    const response = await axios.get(`${currentBaseUrl}/api/recipes/${query.recipe_id}`, {
        headers: jwt ? {'x-access-token': jwt} : {},
    });
    return {
        props: {
            recipe: response.data.recipe,
            currentFullUrl,
        }
    };
}

export default Recipe_id;
