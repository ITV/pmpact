const assert = require('chai').assert;
const sinon = require('sinon');
const PactParser = require('../../../../../app/parsers/2.0.0/pact-parser');

const simplePactJson = require('../../../../fixtures/simple-pact.json');
const multipleInteractionPactJson = require('../../../../fixtures/multiple-interaction-pact.json');

describe('pmpact > app > parsers > 2.0.0 > pact-parser', () => {

    let parser;

    const isPostmanCollection = (obj) => {
        return obj.info.schema.indexOf('schema.getpostman.com') !== -1;
    };

    beforeEach(() => {
        parser = new PactParser();
    });

    afterEach(() => {
        parser = undefined;
    });

    it('should parse a pact file', () => {
        const result = parser.parse(simplePactJson);
        assert.ok(isPostmanCollection(result));
    });

    it('should create a collection name', () => {
        const result = parser.parse(simplePactJson);
        assert.equal(result.info.name, 'Pact - consumerName - providerName');
    });

    it('should add a collection schema', () => {
        const result = parser.parse(simplePactJson);
        assert.equal(result.info.schema, 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json');
    });

    it('should create a list of requests', () => {
        var spy = sinon.spy(parser, 'interaction');
        const result = parser.parse(simplePactJson);
        assert.equal(result.item.length, 1);
        assert.ok(spy.calledOnce);
    });

    it('should parse several interactions', () => {
        var spy = sinon.spy(parser, 'interaction');
        const result = parser.parse(simplePactJson);
        assert.equal(result.item.length, 1);
        assert.ok(spy.calledOnce);
    });

    it('should create a request name from the description', () => {
        const result = parser.parse(simplePactJson);
        const firstRequest = result.item[0];
        assert.equal(firstRequest.name, simplePactJson.interactions[0].description);
    });

    it('should create a list of headers', () => {
        const result = parser.parse(simplePactJson);
        assert.deepEqual(result.item[0].request.header, [
            {
                key: 'Accept',
                value: 'application/json'
            }
        ]);
    });

    it('should create a payload', () => {
        const result = parser.parse(multipleInteractionPactJson);
        assert.deepEqual(result.item[0].request.body, {});
        assert.deepEqual(result.item[1].request.body, {
            mode: 'raw',
            raw: '{"payload":"payload"}'
        });
    });

    it('should create a raw url', () => {
        const result = parser.parse(simplePactJson);
        assert.equal(result.item[0].request.url.raw, '{{url}}/path1/path2');
    });

    it('should create a host', () => {
        const result = parser.parse(simplePactJson);
        assert.equal(result.item[0].request.url.host, '{{url}}');
    });

    it('should create a path', () => {
        const result = parser.parse(simplePactJson);
        assert.deepEqual(result.item[0].request.url.path, [
            'path1',
            'path2'
        ]);
    });

    it('should create a query', () => {
        const result = parser.parse(simplePactJson);
        assert.deepEqual(result.item[0].request.url.query, [
            {
                key: 'p1',
                value: 'p1'
            },
            {
                key: 'p2',
                value: 'p2'
            }
        ]);
    });

});