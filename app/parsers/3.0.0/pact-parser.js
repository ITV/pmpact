const PactParserV2 = require('../2.0.0/pact-parser');

class PactParser extends PactParserV2 {
    query(interaction, item) {
        if (interaction.request.query) {
            for (var [key, value] of Object.entries(interaction.request.query)) {
                value.map(val => {
                    item.request.url.query.push({
                        key,
                        value: val.replace(/\s/g, '+')
                    });
                });
            }
        }
    }
}

module.exports = PactParser;
