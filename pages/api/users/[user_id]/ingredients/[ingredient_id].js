import db from "../../../../../db/index";
import {checkIngredientOwnership} from "../../../../../utils/serverUtils";

export default async function handler(req, res) {
    if (req.method === "PATCH") {
        try {
            await checkIngredientOwnership(req, res);

            const response = await db.query({
                text: `
            UPDATE users_ingredients_groceries
            SET name = $1, quantity = $2, measurement_id = (SELECT id FROM measurements WHERE short_name = $3)
            WHERE id = $4 RETURNING *
            `,
                values: [req.body.name, req.body.quantity, req.body.measurement, req.query.ingredient_id],
            });

            res.status(200).send(response.rows[0]);
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    }
}