import db from "../../../../../db";
import {checkCollectionOwnership} from "../../../../../middleware";

export default async function handler(req, res) {
    if (req.method === "POST") {
        // add recipe to collection
        try {
            await checkCollectionOwnership(req, res);

            await db.query({
                text: `INSERT INTO recipes_collections (recipe_id, collection_id) VALUES ($1, $2)`,
                values: [req.query.recipe_id, req.query.collection_id],
            });

            return res.status(200);
        } catch (error) {
            return res.status(404).send({detail: error.message});
        }
    } else if (req.method === "DELETE") {
        // remove recipe from collection
        try {
            await checkCollectionOwnership(req, res);

            await db.query({
                text: `DELETE FROM recipes_collections WHERE recipe_id = $1 AND collection_id = $2`,
                values: [req.query.recipe_id, req.query.collection_id],
            });

            return res.status(200);
        } catch (error) {
            return res.status(404).send({detail: error.message});
        }
    }
}