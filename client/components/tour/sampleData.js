export const sampleRecipes = [
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

export const sampleCollections = [
    {
        name: "Favorites",
        author_id: "touring",
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
        name: "Quick and Easy",
        author_id: "touring",
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
];

export const sampleGroceries = [{
    id: 1,
    name: 'Milk',
    quantity: .5,
    measurement: 'gal',
}, {
    id: 2,
    name: "Coffee",
    quantity: 1,
    measurement: '#',
}];

export const sampleUser = {
    username: "Johny",
    id: "touring",
    collections: sampleCollections,
};
