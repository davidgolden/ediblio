import {getUserIdFromRequest, selectUserMenu} from "../../../../utils/serverUtils";
import {prismaClient} from "../../../../db/index";

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
            await prismaClient.users_recipes_menu.deleteMany({
                where: {
                    id: {
                        in: req.body.recipe_ids,
                    }
                }
            });

            res.status(200).send();
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    }
}