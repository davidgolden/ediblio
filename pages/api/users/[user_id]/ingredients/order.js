import {prismaClient} from "../../../../../db/index";
import {getUserIdFromRequest, selectUserGroceries} from "../../../../../utils/serverUtils";

export default async function handler(req, res) {
    if (req.method === "POST") {
        // expects req.body.ingredients to be an ordered list of all grocery IDs
        try {
            await prismaClient.$transaction(async (tx) => {
                const userId = getUserIdFromRequest(req);

                let groceryList = await selectUserGroceries(userId);
                for (let i = 0; i < req.body.ingredients.length; i++) {
                    const groceryIndex = groceryList.findIndex(g => g.id === req.body.ingredients[i]);
                    groceryList[groceryIndex] = await tx.$queryRaw`
                    UPDATE users_ingredients_groceries
                    SET item_index = ${i}
                    WHERE id = ${groceryList[groceryIndex].id}::uuid;`;
                }

                groceryList = await selectUserGroceries(userId);

                return res.status(200).send({groceryList});
            })

        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    }
}