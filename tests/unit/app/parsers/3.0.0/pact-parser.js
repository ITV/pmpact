const assert = require('chai').assert;
const PactParserV2 = require('../../../../../app/parsers/2.0.0/pact-parser');
const PactParser = require('../../../../../app/parsers/3.0.0/pact-parser');

const simplePactV3Json = require('../../../../fixtures/v3/simple-pact.json');

describe('postman-pact > app > parsers > 3.0.0 > pact-parser', () => {

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

    it('should extends a parser version 2.0.0', () => {
        assert.instanceOf(parser, PactParserV2);
        assert.deepEqual(Object.getOwnPropertyNames(PactParser.prototype), [ 'constructor', 'query' ]);
    });

    it('should parse a pact source', () => {
        const result = parser.parse(simplePactV3Json);
        assert.ok(isPostmanCollection(result));
    });

    it('should create a query', () => {
        const result = parser.parse(simplePactV3Json);
        assert.deepEqual(result.item[0].request.url.query, [
            {
                key: 'p1',
                value: 'p1'
            },
            {
                key: 'p2',
                value: 'p2A'
            },
            {
                key: 'p2',
                value: 'p2B'
            }
        ]);
    });

});