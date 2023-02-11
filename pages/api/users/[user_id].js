import db from "../../../db/index";
import {usersSelector} from "../../../utils";

export default async function handler(req, res) {
    if (req.method === "GET") {
        let response;
        if (req.user && req.user.id && req.user.id.toString() === req.query.user_id) {

            response = await db.query({
                text: `${usersSelector}
where users.id = $1
group by users.id;`,
                values: [req.query.user_id]
            });
        } else {
            response = await db.query({
                text: `SELECT username, profile_image FROM users
                WHERE users.id = $1`,
                values: [req.query.user_id]
            })
        }
        return res.status(200).json({
            user: response.rows[0]
        });
    }
}