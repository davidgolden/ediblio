import {prismaClient} from "../../../../../db/index";
import {getUserIdFromRequest} from "../../../../../utils/serverUtils";

export default async function handler(req, res) {
    if (req.method === "DELETE") {
        try {
            const userId = getUserIdFromRequest(req);

            await prismaClient.$queryRaw`DELETE FROM users_staples WHERE id = ${req.query.staple_id}::uuid AND user_id = ${userId}::uuid;`

            res.status(200).send();
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    }
}