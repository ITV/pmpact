import { it, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import simplePactV2Json from '../../fixtures/v2/simple-pact.json' with { type: 'json' };
import simplePactV3Json from '../../fixtures/v3/simple-pact.json' with { type: 'json' };

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const proxyquire = require('proxyquire');


describe('pmpact > app', () => {
    let fsStub;
    let originalFetch;

    afterEach(() => {
        global.fetch = originalFetch;
    });

    const SIMPLE_PACT_URL_V2 = 'http://simple-pact-v2';
    const SIMPLE_PACT_URL_V3 = 'http://simple-pact-v3';

    const isPostmanCollection = (json) => {
        return JSON.parse(json).info.schema.indexOf('schema.getpostman.com') !== -1;
    };

    const getApp = async () => {
        originalFetch = global.fetch;
        global.fetch = (url) => {
            let data;
            if (url === SIMPLE_PACT_URL_V2) data = simplePactV2Json;
            if (url === SIMPLE_PACT_URL_V3) data = simplePactV3Json;
            return Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
        };

        fsStub = {
            writeFile: (path, data, opts, cb) => cb()
        };
        const Application = proxyquire('../../../app/app.js', {
            'fs': fsStub
        });
        return new Application();

    };


    it('should parse a pact file version 2.0.0', async () => {
        const app = await getApp();
        const result = await app.parse('./tests/fixtures/v2/simple-pact.json');
        assert.ok(isPostmanCollection(result));
    });

    it('should parse a pact url version 2.0.0', async () => {
        const app = await getApp();
        const result = await app.parse(SIMPLE_PACT_URL_V2);
        assert.ok(isPostmanCollection(result));
    });

    it('should parse a pact file version 3.0.0', async () => {
        const app = await getApp();
        const result = await app.parse('./tests/fixtures/v3/simple-pact.json');
        assert.ok(isPostmanCollection(result));
    });

    it('should parse a pact url version 3.0.0', async () => {
        const app = await getApp();
        const result = await app.parse(SIMPLE_PACT_URL_V3);
        assert.ok(isPostmanCollection(result));
    });

    it('should parse a pact url with headers', async () => {
        const app = await getApp();
        const result = await app.parse(SIMPLE_PACT_URL_V2, '{"Accept":"application/json"}');
        assert.ok(isPostmanCollection(result));
    });

    it('should save a collection to a file', async () => {
        const app = await getApp();
        const result = await app.parse('./tests/fixtures/v2/simple-pact.json', undefined, '~/file-output.json');
        assert.equal(result, 'The collection has been successfully written in ~/file-output.json');
    });

    it('should handle errors when saving to a file', async () => {
        const app = await getApp();
        const error = new Error('Something happened!');
        fsStub.writeFile = (path, data, opts, cb) => {
            cb(error);
        };
        try {
            await app.parse('./tests/fixtures/v2/simple-pact.json', undefined, '~/file-output.json');
            assert.ok(0, 'Should not be successful');
        } catch (err) {
            assert.equal(err, error);
        }
    });

    it('should not parse a bad url or a non-existing file', async () => {
        const app = await getApp();
        try {
            await app.parse('something-wrong-here');
            assert.ok(0, 'Should not resolve');
        } catch (err) {
            assert.ok(err.message.indexOf('Cannot find module') !== -1);
        }
    });

    it('should not parse an unsupported Pact specification', async () => {
        const app = await getApp();
        try {
            await app.parse('./tests/fixtures/unsupported-pact.json');
            assert.ok(0, 'Should not resolve');
        } catch (err) {
            assert.ok(err.message.indexOf('Could not find a parser') !== -1);
        }
    });

    it('should default an unspecified pact specification to 2.0.0', async () => {
        const app = await getApp();
        try {
            const result = await app.parse('./tests/fixtures/unspecified-pact.json');
            assert.ok(isPostmanCollection(result));
        } catch (err) {
            assert.ok(0, 'Should not fail');
        }
    });

    it('should throw an error when pact version is of incorrect format', async () => {
        const app = await getApp();
        try {
            await app.parse('./tests/fixtures/invalid-version-pact.json');
            assert.ok(0, 'Should not resolve');
        } catch (err) {
            assert.ok(err.message.indexOf('Invalid pact-parser version supplied') !== -1);
        }
    });

    it('should throw an error with body message when url request fails with a response body', async () => {
        originalFetch = global.fetch;
        global.fetch = () => Promise.resolve({
            ok: false,
            status: 404,
            statusText: 'Not Found',
            text: () => Promise.resolve('Pact broker not found')
        });
        const Application = proxyquire('../../../app/app.js', { 'fs': fsStub });
        const app = new Application();
        try {
            await app.parse('http://some-pact-broker/pact');
            assert.ok(0, 'Should not resolve');
        } catch (err) {
            assert.ok(err.message.indexOf('Request failed with status 404 Not Found - Pact broker not found') !== -1);
        }
    });

    it('should throw an error without body message when url request fails with an empty response body', async () => {
        originalFetch = global.fetch;
        global.fetch = () => Promise.resolve({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            text: () => Promise.resolve('')
        });
        const Application = proxyquire('../../../app/app.js', { 'fs': fsStub });
        const app = new Application();
        try {
            await app.parse('http://some-pact-broker/pact');
            assert.ok(0, 'Should not resolve');
        } catch (err) {
            assert.ok(err.message.indexOf('Request failed with status 500 Internal Server Error') !== -1);
        }
    });
});
