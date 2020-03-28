import React from 'react';
import RecipePage from "../../client/components/recipes/RecipePage";

export default function SampleRecipe(props) {
    return <RecipePage recipe={{
        name: "Caesar Salad",
        ingredients: [{
            name: 'Caesar Dressing',
            quantity: 1,
            measurement: "#",
        }, {
            name: "Chicken Cutlets",
            quantity: 12,
            measurement: "oz",
        }, {
            name: "Lettuce",
            quantity: 10,
            measurement: "oz",
        }, {
            name: "Tomatoes",
            quantity: 2,
            measurement: "#",
        }, {
            name: "Parmesan Cheese",
            quantity: .25,
            measurement: 'cup',
        }],
        author_username: "Johny",
        image: "/images/tour/caesarsalad.jpeg",
        url: "#",
        notes: "1. Prepare grill to medium-high heat.\n2. While grill heats, prepare Caesar Dressing. Reserve 1/3 cup dressing in a separate bowl; set aside.\n3. Place chicken on grill rack coated with cooking spray over medium-high heat. Grill 2 to 3 minutes on each side or until done, basting frequently with remaining dressing. Remove from grill. Cool slightly; slice.\n4. Combine chicken, reserved 1/3 cup dressing, lettuce, and tomato in a large bowl; toss gently to coat. Divide salad evenly among each of 4 bowls. Sprinkle each serving with 1 tablespoon cheese.\""
    }}/>
}
