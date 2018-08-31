const assert = require('chai').assert;
const execa = require('execa');
const http = require('http');
const simplePactJson = require('../fixtures/v2/simple-pact.json');

describe('pmpact integration', () => {

    let server;

    const isPostmanCollection = (json) => {
        return JSON.parse(json).info.schema.indexOf('schema.getpostman.com') !== -1;
    };

    afterEach((done) => {
        if (server) {
            try {
                server.close(done);
            } catch(err) {
                done();
            }
        }
        else {
            done();
        }
        server = undefined;
    });

    it('should parse a file', async () => {
        try {
            const { stdout, stderr } = await execa.shell('node pmpact.js tests/fixtures/v2/simple-pact.json');
            assert.ok(isPostmanCollection(stdout));
            assert.equal(stderr, '');
        } catch(err) {
            console.log(err);
            assert.ok(0, 'Should not fail');
        }
    });

    it('should parse a url', async () => {
        try {
            server = http.createServer(function (req, res) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(simplePactJson));
            });
            server.listen(9012);
            const { stdout, stderr } = await execa.shell('node pmpact.js http://localhost:9012');
            assert.ok(isPostmanCollection(stdout));
            assert.equal(stderr, '');
        } catch(err) {
            console.log(err);
            assert.ok(0, 'Should not fail');
        }
    });

    it('should exit with a proper exit code', async () => {
        try {
            await execa.shell('node pmpact.js non-existing-file.json');
            assert.ok(0, 'Should not be successful');
        } catch(err) {
            assert.ok(err.code > 0);
        }
    });

});