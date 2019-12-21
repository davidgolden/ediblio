
const path = require('path');


const express = require('express');

const app = express();

const compression = require('compression');






app.use(compression());








// this is needed in order to send static files like index.html... DO NOT GET RID OF IT!!!
app.use(express.static(path.join(__dirname, "client")));

app.get('*', function (req, res) {
    res.sendFile(path.resolve(__dirname, 'client', 'index.html'));
});

const port = process.env.PORT || 5000;

app.listen(port, function (err) {
    if (err) {
        console.log(err);
        return;
    }
    console.log('Listening at http://localhost:5000');
});
