import db from "../../db/index";

export default async function handler(req, res) {
    if (req.method === "GET") {
        const response = await db.query({
            text: `SELECT profile_image, username FROM users`
        });
        return res.status(200).send({users: response.rows});
    }
}