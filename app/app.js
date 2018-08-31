const path = require('path');
const axios = require('axios');
const debug = require('debug')('pmpact:app');

const isUrl = (value) => /^(?:\w+:)?\/\/(\S+)$/.test(value);

const DEFAULT_PACT_SPECIFICATION = '2.0.0';

const getContent = async (source) => {
    if (isUrl(source)) {
        return (await axios.get(source)).data;
    }
    else {
        return require(path.resolve(process.cwd(), source));
    }
};

const getPactVersion = (json) => {
    const metadata = json.metadata;
    if (!metadata) {
        return DEFAULT_PACT_SPECIFICATION;
    }
    else if (metadata.pactSpecification) {
        return metadata.pactSpecification.version;
    }
    else if (metadata['pact-specification']) {
        return metadata['pact-specification'].version;
    }
    else {
        return DEFAULT_PACT_SPECIFICATION;
    }
}

const getParser = (version) => {
    try {
        return require(`./parsers/${version}/pact-parser`);
    } catch(err) {
        throw new Error(`Could not find a parser for the pact specification version: ${version}`);
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
