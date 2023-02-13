import {prismaClient} from "../../db/index";

export default async function handler(req, res) {
    if (req.method === "GET") {
        const response = await prismaClient.$queryRaw`SELECT profile_image, username FROM users;`;

        return res.status(200).send({users: response});
    }
}