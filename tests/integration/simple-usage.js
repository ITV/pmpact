const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const assert = require('chai').assert;
const execa = require('execa');
const http = require('http');
const simplePactJson = require('../fixtures/v2/simple-pact.json');

describe('pmpact integration', () => {

    const FILE_OUTPUT_TEST = 'integration-test-output.json';
    let server;

    const isPostmanCollection = (json) => {
        return JSON.parse(json).info.schema.indexOf('schema.getpostman.com') !== -1;
    };

    const createServerClosePromise = (server) => {
        return new Promise((resolve) => {
            try {
                server.close(() => {
                    resolve();
                });
            } catch(err) {
                resolve();
            }
        });
    }

    afterEach(async () => {
        try {
            await execa(`rm -f ${FILE_OUTPUT_TEST}`, undefined, { shell: true })
            if (server) {
                await createServerClosePromise(server);
                server = undefined;
            }
        } catch(err) {

        }
    });

    it('should parse a file', async () => {
        try {
            const { stdout, stderr } = await execa('node pmpact.js tests/fixtures/v2/simple-pact.json', undefined, { shell: true });
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
            const { stdout, stderr } = await execa('node pmpact.js http://localhost:9012', undefined, { shell: true });
            assert.ok(isPostmanCollection(stdout));
            assert.equal(stderr, '');
        } catch(err) {
            console.log(err);
            assert.ok(0, 'Should not fail');
        }
    });

    it('should send headers', async () => {
        try {
            let headerAuth;
            server = http.createServer(function (req, res) {
                headerAuth = req.headers.authorization;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(simplePactJson));
            });
            server.listen(9012);
            const { stdout, stderr } = await execa('node pmpact.js http://localhost:9012 -H \'{"Authorization":"Basic ZFhmbHR5Rk1n..."}\'', undefined, { shell: true });
            assert.ok(isPostmanCollection(stdout));
            assert.equal(headerAuth, 'Basic ZFhmbHR5Rk1n...');
            assert.equal(stderr, '');
        } catch(err) {
            console.log(err);
            assert.ok(0, 'Should not fail');
        }
    });

    it('should save to an output', async () => {
        try {
            const { stdout, stderr } = await execa(`node pmpact.js tests/fixtures/v2/simple-pact.json -o ${FILE_OUTPUT_TEST}`, undefined, { shell: true });
            assert.ok(stdout.indexOf('The collection has been successfully written') !== -1);
            const contentJson = (await readFile(FILE_OUTPUT_TEST)).toString('utf8');
            assert.ok(isPostmanCollection(contentJson));
            assert.equal(stderr, '');
        } catch(err) {
            console.log(err);
            assert.ok(0, 'Should not fail');
        }
    });

    it('should exit with a proper exit code', async () => {
        try {
            await execa('node pmpact.js non-existing-file.json', undefined, { shell: true });
            assert.ok(0, 'Should not be successful');
        } catch(err) {
            assert.ok(err.exitCode > 0);
        }
    });

});
