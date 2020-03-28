import React from 'react';
import UserBanner from "../../client/components/UserBanner";
import styles from "../styles/BrowseRecipes.module.scss";
import CollectionCard from "../../client/components/CollectionCard";
import RecipeCard from "../../client/components/RecipeCard";

const sampleRecipes = [
    {
        name: "Spaghetti",
        image: "/images/tour/spaghetti.jpg",
    }, {
        name: "Mac n Cheese",
        image: "/images/tour/macncheese.jpeg",
    }, {
        name: "Caesar Salad",
        image: "/images/tour/caesarsalad.jpeg",
    }, {
        name: "Black Bean Soup",
        image: "/images/tour/blackbeansoup.jpeg",
    }, {
        name: "Paella",
        image: "/images/tour/paella.jpeg",
    }, {
        name: "Tacos",
        image: "/images/tour/tacos.jpeg",
    }
];

const sampleCollections = [
    {
        name: "Favorites",
        recipes: [
            {
                name: "Black Bean Soup",
                image: "/images/tour/blackbeansoup.jpeg",
            }, {
                name: "Paella",
                image: "/images/tour/paella.jpeg",
            }, {
                name: "Tacos",
                image: "/images/tour/tacos.jpeg",
            }
        ]
    },
    {
        name: "Quick and Esay",
        recipes: [
            {
                name: "Mac n Cheese",
                image: "/images/tour/macncheese.jpeg",
            }, {
                name: "Spaghetti",
                image: "/images/tour/spaghetti.jpg",
            }
        ]
    }
]

export default function SampleProfile(props) {
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
