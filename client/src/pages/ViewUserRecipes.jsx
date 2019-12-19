import React, {useContext, useState, useEffect} from 'react';
import axios from 'axios';
import {Link} from "@reach/router";
import CollectionCard from "../components/CollectionCard";
import styles from './styles/BrowseRecipes.scss';
import {ApiStoreContext} from "../stores/api_store";
import DeleteButton from "../components/utilities/buttons/DeleteButton";

export default function ViewUserRecipes(props) {
    const [collections, setCollections] = useState([]);
    const context = useContext(ApiStoreContext);

    useEffect(() => {
        axios.get(`api/users/${props.user_id}/collections`)
            .then(response => {
                setCollections(response.data.collections);
            })
    }, []);

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
                <Link to={`/collections/${c._id}`}>
                    <CollectionCard images={c.recipes}/>
                </Link>
            </div>)}
        </div>
    )
}
