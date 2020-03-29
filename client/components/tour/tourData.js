export const tour = [
    {
        url: "/tour/index",
        popups: [
            {
                elementClass: 'tour-card',
                elementIndex: 1,
                highlightClass: 'tour-card-highlight',
                highlightIndex: 1,
                marginLeft: 250,
                marginTop: 50,
                message: `On the home page you can browse all of the recipes on Ediblio. While logged in, hovering your mouse over 
                a recipe will open its toolbar. Here you can add the recipe to your grocery list or add it to one of your collections. 
                Clicking on a recipe here will take you to that recipe's page and show you more details.`
            },
        ]
    },
    {
        url: '/tour/recipe',
        popups: [
            {
                message: `A recipe in Ediblio houses among other details a description, ingredients, and a rating. A recipe in Ediblio can
                either serve as a full ingredient list and description, or just a list of ingredients for adding to your grocery list.`,
                elementClass: 'tour-recipe',
                marginLeft: 25,
            }, {
                elementClass: 'tour-notes',
                highlightClass: 'tour-notes-highlight',
                message: `The notes section can be for anything from full instructions to something to remember about the recipe.`,
                marginTop: 100,
            }, {
                elementClass: 'tour-ingredients',
                highlightClass: 'tour-ingredients-highlight',
                message: `You can either add all of the recipe's ingredients to your grocery list, or uncheck items to only add some.
                You can also edit items in the recipe, for example if you already have some or you prefer something different.`,
                marginLeft: -450,
                noEdit: true,
            },
            {
                elementClass: 'tour-nav',
                highlightClass: 'tour-nav-highlight',
                message: `In the top navigation bar, you'll find a search feature that lets you quickly navigate between recipes.
                You'll also find a navigation dropdown. Next we'll take a look at your grocery list page.`,
                marginLeft: -800,
                marginTop: 50,
            }
        ]
    },
    {
        url: '/tour/groceries',
        popups: [
            {
                elementClass: 'tour-menu',
                highlightClass: 'tour-menu-highlight',
                message: "When you add recipes to your grocery list, they'll appear in your menu here.",
                marginLeft: 250,
                marginTop: 0,
                noEdit: true,
            },
            {
                elementClass: 'tour-ingredients',
                highlightClass: 'tour-ingredients-highlight',
                message: `Here you can add new ingredients to your grocery list. Simply type in what you want to add, like '1 gallon milk' or '1/2 tsp cumin', 
                and press enter to add an ingredient. You can drag and drop groceries to reorder your list, or click the pen to edit them.`,
                marginLeft: 350,
                marginTop: 100,
                noEdit: true,
            },
            {
                elementClass: 'tour-staples',
                highlightClass: 'tour-staples-highlight',
                message: `Once you've made a few grocery lists, the groceries that you add frequently will start appearing here so you can add them quickly.`,
                marginLeft: 250,
                marginTop: -50,
                noEdit: true,
            },
            {
                elementClass: 'tour-storemode',
                highlightClass: 'tour-storemode-highlight',
                message: `Toggle store mode for a simplified view that works best on your phone. Check off items as you go, and remove them from your list as needed.`,
                marginTop: -200,
                marginLeft: -200,
            }
        ]
    },
    {
        url: '/tour/profile',
        popups: [
            {
                elementClass: 'tour-banner',
                message: `This is what your recipes pages looks like. It's all of the recipes you've added, your collections, and all the collections you follow.`,
                marginLeft: 500,
            },
            {
                elementClass: 'tour-collection',
                highlightClass: 'tour-collection-highlight',
                elementIndex: 1,
                highlightIndex: 1,
                message: `Collections provide an easy way to group common recipes however way you'd like. You can create your own collections or 
                follow others' collections. Every user starts out with a 'Favorites' collection to get them started.`,
                marginTop: -50,
                marginLeft: 150,
            }
        ]
    },
    {
        url: '/add',
        popups: [
            {
                elementClass: 'tour-submit',
                highlightClass: 'tour-submit-highlight',
                message: `This is the page you can add new recipes, either from online, a cookbook, or your own creations. When you add a link,
                we'll search that website for a suitable picture. If we can't find one, you may need to upload your own.`,
                marginLeft: 200,
            },
            {
                elementClass: 'tour-ingredients',
                highlightClass: 'tour-ingredients-highlight',
                message: `This ingredients form functions just like your grocery list and provides an easy way to enter or
                copy ingredients for your recipe. Here you can play around and try adding ingredients.`,
                marginLeft: 170,
                marginTop: -200,
            }
        ]
    },
    {
        url: '/',
        popups: [
            {
                elementClass: 'tour-card',
                elementIndex: 1,
                marginLeft: 50,
                marginTop: 0,
                message: `That about sums it up! There's lots of new features added regularly, and lots we weren't able to cover, but we hope you are excited to get started!`,
                finish: true,
            }
        ]
    }
];
