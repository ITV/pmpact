const http = require('http');
const simplePactJson = require('./tests/fixtures/simple-pact.json');

const server = http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(simplePactJson));
});
server.listen(9012);