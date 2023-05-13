import {prismaClient} from "../../../../../db/index";
import {checkIngredientOwnership} from "../../../../../utils/serverUtils";

export default async function handler(req, res) {
    if (req.method === "PATCH") {
        try {
            await checkIngredientOwnership(req, res);

            const response = await prismaClient.$queryRaw`
            UPDATE users_ingredients_groceries
            SET name = ${req.body.name}, quantity = ${req.body.quantity}::numeric, measurement_id = (SELECT id FROM measurements WHERE short_name = ${req.body.measurement})
            WHERE id = ${req.query.ingredient_id}::uuid RETURNING *;
            `

            res.status(200).send(response[0]);
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    }
}