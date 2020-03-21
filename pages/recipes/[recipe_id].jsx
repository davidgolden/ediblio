import React from 'react';
import axios from "axios";
import RecipePage from "../../client/components/recipes/RecipePage";
import {getCookieFromServer} from "../../client/utils/cookies";

function Recipe_id(props) {
    return <RecipePage recipe={props.recipe} />
}

export async function getServerSideProps ({req, query}) {
    const currentFullUrl = req.protocol + "://" + req.headers.host.replace(/\/$/, "");

    const response = await axios.get(`${currentFullUrl}/api/recipes/${query.recipe_id}`, {
        headers: {
            'x-access-token': getCookieFromServer('jwt', req),
        },
    });
    return {
        props: {
            recipe: response.data.recipe,
        }
    };
}

export default Recipe_id;
