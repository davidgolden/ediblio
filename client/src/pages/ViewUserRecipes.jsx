import React, {useContext} from 'react';
import {ApiStoreContext} from "../stores/api_store";
import {Link} from "@reach/router";

export default function ViewUserRecipes(props) {
    const context = useContext(ApiStoreContext);

    return (
        <div>
            {context.user.collections.map(c => <div>
                <Link to={`/collections/${c._id}`}>
                    {c.name}
                </Link>
            </div>)}
        </div>
    )
}
