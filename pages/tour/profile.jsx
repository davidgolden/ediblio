import React from 'react';
import UserBanner from "../../client/components/UserBanner";
import styles from "../styles/BrowseRecipes.module.scss";
import CollectionCard from "../../client/components/CollectionCard";
import RecipeCard from "../../client/components/RecipeCard";
import {sampleRecipes, sampleCollections} from "../../client/components/tour/sampleData";

export default function Profile(props) {
    return (
        <div>
            <UserBanner user={{username: "Johny"}}
                        images={sampleRecipes.filter(r => r.image).slice(0, 4).map(r => r.image)}/>
            <div className={styles.browseRecipesContainer}>
                {sampleCollections.map(c => <CollectionCard
                    key={c.id}
                    unfollowCollection={() => {}}
                    deleteCollection={() => {}}
                    followCollection={() => {}}
                    collection={c}
                />)}
                {sampleRecipes.map(r => <RecipeCard recipe={r} key={r.id} deleteRecipe={() => {
                }}/>)}
            </div>
        </div>
    )
}
