export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            res.append('x-access-token', null);
            return res.redirect('/');
        } catch (err) {
            res.status(422).send({message: err});
        }
    }
}