import {getUserIdFromRequest, selectUserMenu} from "../../../../utils/serverUtils";

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
            const userId = getUserIdFromRequest(req);
            const menu = await selectUserMenu(userId);

            res.status(200).send({menu});

        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    }
}