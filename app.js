const http = require('https');
const url = require("url");
const fs = require("fs");

const hostname = "192.168.178.43";
const port = 5000;

var options = {
    key: fs.readFileSync('./httpsCert/key.pem'),
    cert: fs.readFileSync('./httpsCert/cert.pem')
};

const server = http.createServer(options,(req, res) => {
    res.statusCode = 200;
    let qo = url.parse(req.url, true).query;

    console.log(req.url);
    if (req.method == "GET") // handle GET requests
    {
        if (req.url == "/") {
            fs.readFile('./index.html', null, function (error, data) {
                res.setHeader('Content-Type', 'text/html');
                res.write(data.toString());
                res.end();
            });
        }
        else if (req.url == "/index.js"
            || req.url == "/sw.js") {
            fs.readFile("." + req.url, null, function (error, data) {
                let mimetype = "text/javascript";
                res.setHeader('Content-Type', mimetype);
                res.write(data.toString());
                res.end();
            });
        }
        else if (req.url == "/index.css"){
            fs.readFile("." + req.url, null, function (error, data) {
                let mimetype = "test/plain";
                res.setHeader('Content-Type', mimetype);
                res.write(data.toString());
                res.end();
            });
        }
        else if (req.url == "/manifest.json") {
            fs.readFile("." + req.url, null, function (error, data) {
                let mimetype = "application/manifest+json";
                res.setHeader('Content-Type', mimetype);
                res.write(data.toString());
                res.end();
            });
        }
        else {
            handleGetRequest(req, res, qo);
        }
    }
    else if (req.method == "POST") // handle POST requests
    {
        handlePostRequest(req, res, qo);
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at https://${hostname}:${port}/`);
});

function handleGetRequest(req, res, qo) {
    if (req.url == "/folder.png"
        || req.url == "/icon2.png"
        || req.url == "/icon.png") {
        fs.readFile("./images/" + req.url, null, function (error, data) {
            res.setHeader('Content-Type', 'image/png');
            res.write(data);
            res.end();
        });
    }
}