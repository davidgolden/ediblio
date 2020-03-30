import React from 'react';
import {storiesOf} from "@storybook/react";
import RecipeCard from "../RecipeCard";

const sampleRecipe = {
    name: "Spaghetti",
    id: 1,
    image: "/images/tour/spaghetti.jpg",
};

storiesOf('Recipes', module)
    .add('Card', () => <RecipeCard recipe={sampleRecipe} deleteRecipe={() => {}}/>)
