import {prismaClient} from "../../../../../db/index";
import {getUserIdFromRequest, insertUserGroceries} from "../../../../../utils/serverUtils";
import {selectUserMenu} from "../../../../../utils/serverUtils";

export default async function handler(req, res) {
    if (req.method === "POST") {
        // add full recipe to grocery list
        const userId = getUserIdFromRequest(req);

        try {
            // insert recipe into menu
            await prismaClient.$transaction(async (tx) => {
                await tx.$queryRaw`INSERT INTO users_recipes_menu (user_id, recipe_id) VALUES (${userId}::uuid, ${req.query.recipe_id}::uuid);`

                const recipeIngredients = await tx.$queryRaw`SELECT name, quantity, (SELECT short_name as measurement FROM measurements m WHERE m.id = r.measurement_id) FROM recipes_ingredients r WHERE r.recipe_id = ${req.query.recipe_id}::uuid;`

                const newGroceryList = await insertUserGroceries(userId, recipeIngredients);
                const menu = await selectUserMenu(userId);
                res.status(200).send({groceryList: newGroceryList, menu});
            })

        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    } else if (req.method === "PATCH") {
        // add partial recipe to grocery list
        try {
            const userId = getUserIdFromRequest(req);
            // insert recipe into menu

            await prismaClient.$queryRaw`INSERT INTO users_recipes_menu (user_id, recipe_id) VALUES (${userId}::uuid, ${req.query.recipe_id}::uuid);`

            const newGroceryList = await insertUserGroceries(userId, req.body.ingredients);
            const menu = await selectUserMenu(userId);

            res.status(200).send({groceryList: newGroceryList, menu});

        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    }
}