import {prismaClient} from "../../../../db";
import {checkRecipeOwnership} from "../../../../utils/serverUtils";

export default async function handler(req, res) {
    if (req.method === "POST") {
        // add ingredient to recipe
        try {
            await checkRecipeOwnership(req, res);

            const recipes = await prismaClient.$queryRaw`
                INSERT INTO recipes_ingredients (recipe_id, name, measurement_id, quantity)
                VALUES (${req.query.recipe_id}::uuid,
                    ${req.body.name},
                    (SELECT id FROM measurements WHERE short_name = ${req.body.measurement}),
                    ${req.body.quantity}
                ) RETURNING *;`;

            return res.status(200).send(recipes[0]);
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    } else if (req.method === "DELETE") {
        // remove list of ingredients from recipe
        try {
            await checkRecipeOwnership(req, res);

            await prismaClient.recipes_ingredients.deleteMany({
                where: {
                    id: {
                        in: req.body.ingredient_ids,
                    }
                }
            });

            res.status(200).send();
        } catch (error) {
            console.error(error);
            res.status(404).send({detail: error.message});
        }
    }
}