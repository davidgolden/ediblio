import {getUserIdFromRequest, insertUserGroceries, selectUserGroceries} from "../../../../utils/serverUtils";
import {prismaClient} from "../../../../db/index";

export default async function handler(req, res) {
    if (req.method === "POST") {
        // add ingredient to grocery list
        try {
            const userId = getUserIdFromRequest(req);

            const {name, measurement, quantity} = req.body;
            const newGroceryList = await insertUserGroceries(userId, [{name, measurement, quantity}]);

            return res.status(200).send({groceryList: newGroceryList});
        } catch (error) {
            console.error(error);
            res.status(404).send({detail: error.message});
        }
    } else if (req.method === "GET") {
        // get grocery list
        try {
            const userId = getUserIdFromRequest(req);

            const groceryList = await selectUserGroceries(userId);

            res.status(200).send({groceryList});
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    } else if (req.method === "DELETE") {
        // remove list of ingredients from grocery list
        try {
            const userId = getUserIdFromRequest(req);

            await prismaClient.users_ingredients_groceries.updateMany({
                where: {
                    id: {
                        in: req.body.ingredient_ids
                    },
                },
                data: {
                    deleted: true,
                }
            });

            const groceryList = await selectUserGroceries(userId);

            res.status(200).send({groceryList});
        } catch (error) {
            console.error(error);
            res.status(404).send({detail: error.message});
        }
    }
}