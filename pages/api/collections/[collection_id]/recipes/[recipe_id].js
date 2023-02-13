import {prismaClient} from "../../../../../db";
import {checkCollectionOwnership} from "../../../../../utils/serverUtils";

export default async function handler(req, res) {
    if (req.method === "POST") {
        // add recipe to collection
        try {
            await checkCollectionOwnership(req, res);

            await prismaClient.$queryRaw`INSERT INTO recipes_collections (recipe_id, collection_id) VALUES (${req.query.recipe_id}::uuid, ${req.query.collection_id}::uuid);`

            return res.status(200).send();
        } catch (error) {
            return res.status(404).send({detail: error.message});
        }
    } else if (req.method === "DELETE") {
        // remove recipe from collection
        try {
            await checkCollectionOwnership(req, res);

            await prismaClient.$queryRaw`DELETE FROM recipes_collections WHERE recipe_id = ${req.query.recipe_id}::uuid AND collection_id = ${req.query.collection_id}::uuid;`

            return res.status(200).send();
        } catch (error) {
            return res.status(404).send({detail: error.message});
        }
    }
}