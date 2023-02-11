import db from "../../../../../db/index";
import {getUserIdFromRequest, selectUserGroceries} from "../../../../../utils/serverUtils";

export default async function handler(req, res) {
    if (req.method === "POST") {
        // expects req.body.ingredients to be an ordered list of all grocery IDs
        const client = await db.connect();
        try {
            const userId = getUserIdFromRequest(req);

            await client.query('BEGIN');

            let groceryList = await selectUserGroceries(userId);
            for (let i = 0; i < req.body.ingredients.length; i++) {
                const groceryIndex = groceryList.findIndex(g => g.id === req.body.ingredients[i]);
                const updatedItem = await client.query({
                    text: `
                    UPDATE users_ingredients_groceries
                    SET item_index = $1
                    WHERE id = $2`,
                    values: [i, groceryList[groceryIndex].id],
                });
                groceryList[groceryIndex] = updatedItem;
            }

            await client.query('COMMIT');

            groceryList = await selectUserGroceries(userId);

            return res.status(200).send({groceryList});

        } catch (error) {
            await client.query("ROLLBACK");
            res.status(404).send({detail: error.message});
        } finally {
            client.release();
        }
    }
}