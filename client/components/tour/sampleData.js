export const sampleRecipes = [
    {
        id: 'r1',
        name: "Spaghetti",
        image: "/images/tour/spaghetti.jpg",
    }, {
        id: 'r2',
        name: "Mac n Cheese",
        image: "/images/tour/macncheese.jpeg",
    }, {
        id: 'r3',
        name: "Caesar Salad",
        image: "/images/tour/caesarsalad.jpeg",
    }, {
        id: 'r4',
        name: "Black Bean Soup",
        image: "/images/tour/blackbeansoup.jpeg",
    }, {
        id: 'r5',
        name: "Paella",
        image: "/images/tour/paella.jpeg",
    }, {
        id: 'r6',
        name: "Tacos",
        image: "/images/tour/tacos.jpeg",
    }
];

export const sampleCollections = [
    {
        id: 'c1',
        name: "Favorites",
        author_id: "touring",
        recipes: [
            {
                id: 'c1r1',
                name: "Black Bean Soup",
                image: "/images/tour/blackbeansoup.jpeg",
            }, {
                id: 'c1r2',
                name: "Paella",
                image: "/images/tour/paella.jpeg",
            }, {
                id: 'c1r3',
                name: "Tacos",
                image: "/images/tour/tacos.jpeg",
            }
        ]
    },
    {
        id: 'c2',
        name: "Quick and Easy",
        author_id: "touring",
        recipes: [
            {
                id: 'c2r1',
                name: "Mac n Cheese",
                image: "/images/tour/macncheese.jpeg",
            }, {
                id: 'c2r2',
                name: "Spaghetti",
                image: "/images/tour/spaghetti.jpg",
            }
        ]
    }
];

export const sampleGroceries = [{
    id: 'i1',
    name: 'Milk',
    quantity: .5,
    measurement: 'gal',
}, {
    id: 'i2',
    name: "Coffee",
    quantity: 1,
    measurement: '#',
}];

export const sampleUser = {
    username: "Johny",
    id: "touring",
    collections: sampleCollections,
};
