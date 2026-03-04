import { it, describe } from 'node:test';
import assert from 'node:assert/strict';
import simplePactV2Json from '../../fixtures/v2/simple-pact.json' with { type: 'json' };
import simplePactV3Json from '../../fixtures/v3/simple-pact.json' with { type: 'json' };

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const proxyquire = require('proxyquire');


describe('pmpact > app', () => {

    let axiosStub;
    let fsStub;

    const SIMPLE_PACT_URL_V2 = 'http://simple-pact-v2';
    const SIMPLE_PACT_URL_V3 = 'http://simple-pact-v3';

    const isPostmanCollection = (json) => {
        return JSON.parse(json).info.schema.indexOf('schema.getpostman.com') !== -1;
    };

    const getApp = async () => {
        axiosStub = {
            get: (url) => {
                if (url === SIMPLE_PACT_URL_V2) return { data: simplePactV2Json };
                if (url === SIMPLE_PACT_URL_V3) return { data: simplePactV3Json };
            }
        };

        fsStub = {
            writeFile: (path, data, opts, cb) => cb()
        };
        const Application = proxyquire('../../../app/app.js', {
            'axios': axiosStub,
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
});
