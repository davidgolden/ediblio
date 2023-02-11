import {getRecipe} from "../../../utils/serverUtils";

export default async function handler(req, res) {
    if (req.method === "GET") {
        const recipe = await getRecipe(req.query.recipe_id, req.user && req.user.id);

        return res.status(200).json({
            recipe
        })
    }
}