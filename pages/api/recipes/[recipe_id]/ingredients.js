import db from "../../../../db";
import {checkRecipeOwnership} from "../../../../middleware";

export default async function handler(req, res) {
    if (req.method === "POST") {
        // add ingredient to recipe
        try {
            await checkRecipeOwnership(req, res);

            const response = await db.query({
                text: `
                INSERT INTO recipes_ingredients (recipe_id, name, measurement_id, quantity)
                VALUES ($1,
                    $2,
                    (SELECT id FROM measurements WHERE short_name = $3),
                    $4
                ) RETURNING *`,
                values: [req.query.recipe_id, req.body.name, req.body.measurement, req.body.quantity],
            });

            return res.status(200).send(response.rows[0]);
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    } else if (req.method === "DELETE") {
        // remove list of ingredients from recipe
        try {
            await checkRecipeOwnership(req, res);

            await db.query({
                text: `
                DELETE FROM recipes_ingredients
                WHERE id IN (${req.body.ingredient_ids.map(id => "'" + id + "'").join(", ")})
                `,
            });

            res.status(200);
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    }
}