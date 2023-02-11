import db from "../../../../../db/index";
import {getUserIdFromRequest, insertUserGroceries} from "../../../../../utils/serverUtils";
import {selectUserMenu} from "../../../../../utils/serverUtils";

export default async function handler(req, res) {
    if (req.method === "POST") {
        // add full recipe to grocery list
        const userId = getUserIdFromRequest(req);

        const client = await db.connect();

        try {
            // insert recipe into menu
            await client.query("BEGIN");
            await db.query({
                text: `INSERT INTO users_recipes_menu (user_id, recipe_id) VALUES ($1, $2)`,
                values: [userId, req.query.recipe_id]
            });

            const recipeIngredients = await db.query({
                text: `SELECT name, quantity, (SELECT short_name as measurement FROM measurements m WHERE m.id = r.measurement_id) FROM recipes_ingredients r WHERE r.recipe_id = $1`,
                values: [req.query.recipe_id],
            });

            const newGroceryList = await insertUserGroceries(userId, recipeIngredients.rows);
            const menu = await selectUserMenu(userId);
            await client.query("COMMIT");
            res.status(200).send({groceryList: newGroceryList, menu});

        } catch (error) {
            await client.query("ROLLBACK");
            res.status(404).send({detail: error.message});
        } finally {
            client.release();
        }
    } else if (req.method === "PATCH") {
        // add partial recipe to grocery list
        try {
            const userId = getUserIdFromRequest(req);
            // insert recipe into menu
            await db.query({
                text: `INSERT INTO users_recipes_menu (user_id, recipe_id) VALUES ($1, $2)`,
                values: [userId, req.query.recipe_id]
            });

            const newGroceryList = await insertUserGroceries(userId, req.body.ingredients);
            const menu = await selectUserMenu(userId);

            res.status(200).send({groceryList: newGroceryList, menu});

        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    }
}