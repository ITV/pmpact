const httpStatus = require('http-status')

class PactParser {
    createBaseCollection(consumerName, providerName) {
        return {
            info: {
                name: `Pact - ${consumerName} - ${providerName}`,
        		schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
            },
            item: []
        };
    }
    createBaseItem(interaction) {
        return {
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
        };
    }
    interaction(interaction) {
        const item = this.createBaseItem(interaction);
        this.headers(interaction, item);
        this.query(interaction, item);
        this.body(interaction, item);
        this.response(interaction, item);
        return item;
    }
    headers(interaction, item) {
        if (interaction.request.headers) {
            for (const [key, value] of Object.entries(interaction.request.headers)) {
                item.request.header.push({key, value});
            }
        }
    }
    query(interaction, item) {
        if (interaction.request.query) {
            item.request.url.query = interaction.request.query.split('&').map(x => {
                var val = x.split('=');
                return {
                    key: val[0],
                    value: val[1]
                }
            });
        }
    }
    body(interaction, item) {
        if (interaction.request.body) {
            item.request.body = {
                mode: 'raw',
                raw: JSON.stringify(interaction.request.body)
            }
        }
    }
    response(interaction, item) {
        const response = {
            "name": interaction.description,
            "originalRequest": interaction.request,
            "_postman_previewlanguage": "json",
            "header": null,
            "cookie": [],
        }
        response.code = interaction.response.status
        response.status = httpStatus[interaction.response.status]
        response.header = this.responseHeaders(item)
        if (item.response.body) {
            response.body = JSON.stringify(item.response.body)
        }
        item.response.push(response)
    }

    responseHeaders(item) {
        const headers = []
        for (const key in item.response.headers) {
            headers.push({
                key,
                value: item.response.headers[key],
                type: "text",
            })
        }
        return headers
    }
    parse(source) {
        this.output = this.createBaseCollection(source.consumer.name, source.provider.name);
        source.interactions.map(item => this.output.item.push(this.interaction(item)));
        return this.output;
    }
}

module.exports = PactParser;
