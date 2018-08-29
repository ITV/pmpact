const assert = require('chai').assert;
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();
const simplePactJson = require('../../fixtures/simple-pact.json');

describe('pmpact > app', () => {

    const SIMPLE_PACT_URL = 'http://simple-pact';

    let app
    let Application;
    let axiosStub;

    const isPostmanCollection = (json) => {
        return JSON.parse(json).info.schema.indexOf('schema.getpostman.com') !== -1;
    };

    beforeEach(() => {
        axiosStub = sinon.stub({
            get: () => {}
        });
        axiosStub.get.withArgs(SIMPLE_PACT_URL).returns({ data: simplePactJson });
        Application = proxyquire('../../../app/app', {
            'axios': axiosStub
        });
        app = new Application();
    });

    afterEach(() => {
        Application = undefined;
        axiosStub = undefined;
        app = undefined;
    });

    it('should parse a pact file', async () => {
        const result = await app.parse('./tests/fixtures/simple-pact.json');
        assert.ok(isPostmanCollection(result));
    });

    it('should parse a pact url', async () => {
        const result = await app.parse(SIMPLE_PACT_URL);
        assert.ok(isPostmanCollection(result));
    });

    it('should not parse an unsupported Pact specification', async () => {
        try {
            await app.parse('./tests/fixtures/unsupported-pact.json');
            assert.ok(0, 'Should not resolve');
        } catch(err) {
            assert.ok(err.message.indexOf('Could not find a parser') !== -1);
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

});