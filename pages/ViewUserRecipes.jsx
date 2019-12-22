import React, {useContext, useState, useEffect} from 'react';
import axios from 'axios';
import CollectionCard from "../client/components/CollectionCard";
import styles from './styles/BrowseRecipes.scss';
import {ApiStoreContext} from "../client/stores/api_store";
import DeleteButton from "../client/components/utilities/buttons/DeleteButton";
import Link from 'next/link';

export default function ViewUserRecipes(props) {
    const [collections, setCollections] = useState(props.collections || []);
    const context = useContext(ApiStoreContext);

    function removeFromCollection(id) {
        context.removeCollection(id)
            .then(() => {
                setCollections(c => c.filter(c => c._id !== id));
            })
    }

    return (
        <div className={styles.userRecipesContainer}>
            {collections.map(c => <div key={c._id}>
                <div>
                    <h3>{c.name}</h3><DeleteButton onClick={() => removeFromCollection(c._id)}/>
                </div>
                <Link href={`/collections/${c._id}`}>
                    <a>
                        <CollectionCard images={c.recipes}/>
                    </a>
                </Link>
            </div>)}
        </div>
    )
}

ViewUserRecipes.getInitialProps = async ({req, query}) => {
    const response = await axios.get(`${req.protocol}://${req.headers.host}/api/users/${query.user_id}/collections`, {
        headers: {
            cookie: req.headers.cookie,
        },
    });
    return {
        collections: response.data.collections,
        user_id: query.user_id,
    }
};
