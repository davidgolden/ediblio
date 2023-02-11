import {getRecipe, getUserIdFromRequest} from "../../../utils/serverUtils";

export default async function handler(req, res) {
    if (req.method === "GET") {
        const userId = getUserIdFromRequest(req);
        const recipe = await getRecipe(req.query.recipe_id, userId);

        return res.status(200).json({
            recipe
        })
    }
}