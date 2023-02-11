export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            res.setHeader('x-access-token', null);
            return res.redirect('/');
        } catch (err) {
            console.log(err);
            res.status(422).send({message: err});
        }
    }
}