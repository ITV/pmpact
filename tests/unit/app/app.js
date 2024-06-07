const assert = require('chai').assert;
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();
const simplePactV2Json = require('../../fixtures/v2/simple-pact.json');
const simplePactV3Json = require('../../fixtures/v3/simple-pact.json');

describe('pmpact > app', () => {

    const SIMPLE_PACT_URL_V2 = 'http://simple-pact-v2';
    const SIMPLE_PACT_URL_V3 = 'http://simple-pact-v3';

    let app
    let Application;
    let axiosStub;
    let fsStub;

    const isPostmanCollection = (json) => {
        return JSON.parse(json).info.schema.indexOf('schema.getpostman.com') !== -1;
    };

    beforeEach(() => {
        axiosStub = sinon.stub({
            get: () => {}
        });
        axiosStub.get.withArgs(SIMPLE_PACT_URL_V2).returns({ data: simplePactV2Json });
        axiosStub.get.withArgs(SIMPLE_PACT_URL_V3).returns({ data: simplePactV3Json });
        fsStub = {
            writeFile: (path, data, opts, cb) => {
                cb();
            }
        }
        Application = proxyquire('../../../app/app', {
            'axios': axiosStub,
            'fs': fsStub
        });
        app = new Application();
    });

    afterEach(() => {
        Application = undefined;
        axiosStub = undefined;
        fsStub = undefined;
        app = undefined;
    });

    it('should parse a pact file version 2.0.0', async () => {
        const result = await app.parse('./tests/fixtures/v2/simple-pact.json');
        assert.ok(isPostmanCollection(result));
    });

    it('should parse a pact url version 2.0.0', async () => {
        const result = await app.parse(SIMPLE_PACT_URL_V2);
        assert.ok(isPostmanCollection(result));
    });

    it('should parse a pact file version 3.0.0', async () => {
        const result = await app.parse('./tests/fixtures/v3/simple-pact.json');
        assert.ok(isPostmanCollection(result));
    });

    it('should parse a pact url version 3.0.0', async () => {
        const result = await app.parse(SIMPLE_PACT_URL_V3);
        assert.ok(isPostmanCollection(result));
    });

    it('should parse a pact url with headers', async () => {
        const result = await app.parse(SIMPLE_PACT_URL_V2, '{"Accept":"application/json"}');
        assert.ok(axiosStub.get.withArgs(SIMPLE_PACT_URL_V2, {
            headers: {
                Accept: 'application/json'
            }
        }));
        assert.ok(isPostmanCollection(result));
    });

    it('should save a collection to a file', async () => {
        const result = await app.parse('./tests/fixtures/v2/simple-pact.json', undefined, '~/file-output.json');
        assert.equal(result, 'The collection has been successfully written in ~/file-output.json');
    });

    it('should handle errors when saving to a file', async () => {
        const error = new Error('Something happened!');
        fsStub.writeFile = (path, data, opts, cb) => {
            cb(error);
        };
        try {
            await app.parse('./tests/fixtures/v2/simple-pact.json', undefined, '~/file-output.json');
            assert.ok(0, 'Should not be successful');
        } catch(err) {
            assert.equal(err, error);
        }
    });

    it('should not parse a bad url or a non-existing file', async () => {
        try {
            await app.parse('something-wrong-here');
            assert.ok(0, 'Should not resolve');
        } catch(err) {
            assert.ok(err.message.indexOf('Cannot find module') !== -1);
        }
    });

    it('should not parse an unsupported Pact specification', async () => {
        try {
            await app.parse('./tests/fixtures/unsupported-pact.json');
            assert.ok(0, 'Should not resolve');
        } catch(err) {
            assert.ok(err.message.indexOf('Could not find a parser') !== -1);
        }
    });

    it('should default an unspecified pact specification to 2.0.0', async () => {
        try {
            const result = await app.parse('./tests/fixtures/unspecified-pact.json');
            assert.ok(isPostmanCollection(result));
        } catch(err) {
            assert.ok(0, 'Should not fail');
        }
    });

    it('should throw an error when pact version is of incorrect format', async () => {
        try {
            await app.parse('./tests/fixtures/invalid-version-pact.json');
            assert.ok(0, 'Should not resolve');
        } catch(err) {
            assert.ok(err.message.indexOf('Invalid pact-parser version supplied') !== -1);
        }
    });
});