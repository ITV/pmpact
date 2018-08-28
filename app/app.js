const path = require('path');
const PactParser = require('./parsers/pact-parser');
const axios = require('axios');

const isUrl = (value) => /^(?:\w+:)?\/\/(\S+)$/.test(value);

const getContent = async (source) => {
    if (isUrl(source)) {
        return (await axios.get(source)).data;
    }
    else {
        return require(path.resolve(process.cwd(), source));
    }
};

class Application {
    async convert(source) {
        const collection = new PactParser().convert(await getContent(source));
        return JSON.stringify(collection, undefined, 2);
    }
}

module.exports = Application;
