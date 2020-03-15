import React from 'react';
import axios from "axios";
import RecipePage from "../../client/components/recipes/RecipePage";

function Recipe_id(props) {
    return <RecipePage recipe={props.recipe} />
}

Recipe_id.getInitialProps = async ({req, query}) => {
    const currentFullUrl = typeof window !== 'undefined' ? window.location.origin : req.protocol + "://" + req.headers.host.replace(/\/$/, "");

    const response = await axios.get(`${currentFullUrl}/api/recipes/${query.recipe_id}`, {
        headers: req?.headers?.cookie && {
            cookie: req.headers.cookie,
        },
    });
    return {
        recipe: response.data.recipe,
        user: req?.user,
    };
};

export default Recipe_id;
