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
        for (const [key, value] of Object.entries(interaction.request.headers)) {
            item.request.header.push({key, value});
        }
        // query
        if (interaction.request.query) {
            item.request.url.query = interaction.request.query.split('&').map(x => {
                var val = x.split('=');
                return {
                    key: val[0],
                    value: val[1]
                }
            });
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
