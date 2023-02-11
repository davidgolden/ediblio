import {getUserIdFromRequest, selectUserMenu} from "../../../../utils/serverUtils";
import db from "../../../../db/index";

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
            const userId = getUserIdFromRequest(req);

            const menu = await selectUserMenu(userId);

            res.status(200).send({menu});

        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    } else if (req.method === "DELETE") {
        // remove list of recipes from menu
        try {
            await db.query({
                text: `
                DELETE FROM users_recipes_menu
                WHERE recipe_id IN (${req.body.recipe_ids.map(id => "'" + id + "'").join(", ")})
                `,
            });

            res.status(200);
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    }
}