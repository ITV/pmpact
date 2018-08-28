const path = require('path');
const axios = require('axios');
const debug = require('debug')('pmpact:app');

const isUrl = (value) => /^(?:\w+:)?\/\/(\S+)$/.test(value);

const getContent = async (source) => {
    if (isUrl(source)) {
        return (await axios.get(source)).data;
    }
    else {
        return require(path.resolve(process.cwd(), source));
    }
};

const getPactVersion = (json) => {
    return json.metadata.pactSpecification.version;
}

const getParser = (version) => {
    try {
        return require(`./parsers/${version}/pact-parser`);
    } catch(err) {
        console.log(`Could not find a parser for the pact specification version: ${version}`);
    }
}

class Application {
    async parse(source) {
        const content = await getContent(source);
        const version = getPactVersion(content);
        debug(`Pact parser version found: ${version}`);
        const Parser = getParser(version);
        const collection = new Parser().parse(content);
        return JSON.stringify(collection, undefined, 2);
    }
}

module.exports = Application;
