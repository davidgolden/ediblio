const express = require('express');
const compression = require('compression');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV === 'development';
const app = next({dev, port: Number(process.env.PORT)});
const handle = app.getRequestHandler();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const userRoutes = require('./routes/users'),
    recipeRoutes = require('./routes/recipes'),
    collectionRoutes = require('./routes/collections'),
    ratingRoutes = require('./routes/ratings');

const {verifyJWT} = require("./utils");

app.prepare().then(() => {
    const server = express();

    server.enable('trust proxy');
    server.use(compression());

    server.use(bodyParser.urlencoded({extended: false}));
    server.use(bodyParser.json());
    server.use(cookieParser());

    server.use(function (req, res, next) {
        let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase

        if (token) {
            try {
                const verified = verifyJWT(token);
                if (verified) {
                    req.user = {id: verified.user.id};
                }
            } catch (e) {
                console.log(e);
            }
        }

        next();
    });

    server.use('/api/', userRoutes);
    server.use('/api/', recipeRoutes);
    server.use('/api/', collectionRoutes);
    server.use('/api/', ratingRoutes);

    server.get('/service-worker.js', (req, res) => {
        const filePath = path.join(__dirname, '.next/service-worker.js');
        app.serveStatic(req, res, filePath)
    });

    server.all('*', (req, res) => {
        return handle(req, res)
    });

    const port = process.env.PORT || 5000;
    server.listen(port, err => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${port}`)
    })
});
