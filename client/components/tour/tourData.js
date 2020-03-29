export const tour = [
    {
        url: "/tour/index",
        popups: [
            {
                elementClass: 'tour-card',
                elementIndex: 1,
                highlightClass: 'tour-card-highlight',
                highlightIndex: 1,
                marginLeft: 150,
                marginTop: 50,
                message: "On the home page you can browse all of the recipes on Ediblio. Once you've created an account, hovering your mouse over a recipe will open a toolbar for saving it and adding it to your grocery list."
            }
        ]
    },
    {
        url: '/tour/recipe',
        popups: [
            {
                message: "A recipe in Ediblio houses a recipe description and cooking instructions, as well as a list of ingredients you can use to populate your grocery list with one click (You can even link to recipes housed elsewhere on the web)! A recipe in Ediblio can either serve as a full ingredient list and description, or just a list of ingredients for adding to your grocery list.",
                elementClass: 'tour-recipe',
                highlightClass: 'tour-recipe-highlight',
                marginLeft: 25,
            }, {
                elementClass: 'tour-ingredients',
                highlightClass: 'tour-ingredients-highlight',
                message: "You can either add all of the recipe's ingredients to your grocery list, or uncheck items to only add some. You can also edit items in the recipe, for example if you already have some or you prefer something different.",
                marginLeft: -450,
            }
        ]
    },
    {
        url: '/tour/groceries',
        popups: [
            {
                elementClass: 'tour-menu',
                message: "When you add recipes to your grocery list, they'll appear in your menu here.",
                marginLeft: 200,
            },
            {
                elementClass: 'tour-staples',
                message: "Once you've made a few grocery lists, the groceries that you add frequently will start appearing here so you can add them quickly.",
                marginLeft: 250,
                marginTop: -50,
            },
            {
                elementClass: 'tour-ingredients',
                message: "Here you can add new ingredients to your grocery list. Simply type in what you want to add, like '1 gallon milk' or '1/2 tsp cumin', and press enter to add an ingredient. " +
                    "You can drag and drop groceries to reorder your list, or click the pen to edit them.",
                marginLeft: 350,
                marginTop: 100,
            },
            {
                elementClass: 'tour-storemode',
                message: "Toggle store mode for a simplified view that works best on your phone. Check off items as you go, and remove them from your list as needed.",
                marginTop: 150,
                marginLeft: 300,
            }
        ]
    },
    // {
    //     url: '/tour/profile',
    //     popups: [
    //         {
    //             elementClass: 'tour-banner',
    //             message: "This is what yours or others' recipe pages look like. It's all of the recipes you've submitted, as well as all your collections and all the collections you follow.",
    //             marginLeft: 700,
    //         },
    //         {
    //             elementClass: 'tour-collection',
    //             elementIndex: 1,
    //             message: "Collections provide an easy way to group common recipes however way you'd like. You can create your own collections or follow others'. Every user starts out with a 'Favorites' collection to get them started.",
    //             marginTop: -220,
    //         }
    //     ]
    // },
    // {
    //     url: '/add',
    //     popups: [
    //         {
    //             elementClass: 'tour-submit',
    //             message: "Here you can add new recipes, either from online, a cookbook, or your own creations. When you add a link, we'll search that website for a suitable picture. If we can't find one, you may need to upload your own.",
    //             marginLeft: 200,
    //         },
    //         {
    //             elementClass: 'tour-ingredients',
    //             message: "This ingredients form functions just like your grocery list and provides an easy way to enter or copy ingredients for your recipe.",
    //             marginLeft: 170,
    //             marginTop: 100,
    //         }
    //     ]
    // },
    // {
    //     url: '/',
    //     popups: [
    //         {
    //             elementClass: 'recipe-card',
    //             elementIndex: 1,
    //             marginLeft: 50,
    //             marginTop: 50,
    //             message: "That about sums it up! There's lots of new features added regularly, and lots we weren't able to cover, but we hope you are excited to get started!"
    //         }
    //     ]
    // }
];
