class PactParser {
    interaction(interaction) {
        const item = {
            name: interaction.description,
            request: {
                method: interaction.request.method,
                header: [],
                body: {},
                url: {
                    raw: `{{url}}${interaction.request.path}`,
                    host: [
                        `{{url}}`
                    ],
                    path: interaction.request.path.split('/').filter(x => x !== ''),
                    query: []
                }
            },
            response: []
        }
        // headers
        if (interaction.request.headers) {
            for (const [key, value] of Object.entries(interaction.request.headers)) {
                item.request.header.push({key, value});
            }
        }
        // query
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
        // body
        if (interaction.request.body) {
            item.request.body = {
                mode: 'raw',
                raw: JSON.stringify(interaction.request.body)
            }
        }
        return item;
    }
    parse(source) {
        this.output = {
            info: {
                name: `Pact - ${source.consumer.name} - ${source.provider.name}`,
        		schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
            },
            item: []
        };
        source.interactions.map(item => this.output.item.push(this.interaction(item)));
        return this.output;
    }
}

module.exports = PactParser;
