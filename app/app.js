const fs = require('fs');
const path = require('path');
const axios = require('axios');
const debug = require('debug')('pmpact:app');

const isUrl = (value) => /^(?:\w+:)?\/\/(\S+)$/.test(value);

const DEFAULT_PACT_SPECIFICATION = '2.0.0';

const getContent = async (source, headers) => {
    if (isUrl(source)) {
        debug(`Make request to: ${source}`);
        debug(`Make request with: ${headers}`);
        const options = {
            headers: headers || {}
        };
        return (await axios.get(source, options)).data;
    }
    else {
        debug(`Require file: ${source}`);
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

const writeFile = (path, data, opts = 'utf8') =>
    new Promise((res, rej) => {
        fs.writeFile(path, data, opts, (err) => {
            if (err) rej(err)
            else res()
        });
    });

class Application {
    async parse(source, headers, output) {
        const content = await getContent(source, headers);
        const version = getPactVersion(content);
        debug(`Pact parser version found: ${version}`);
        const Parser = getParser(version);
        const collection = new Parser().parse(content);
        const stringOutput = JSON.stringify(collection, undefined, 2);
        if (output) {
            debug(`Write file in: ${output}`);
            await writeFile(path.resolve(process.cwd(), output), stringOutput);
            return `The collection has been successfully written in ${output}`;
        }
        return stringOutput;
    }
}

module.exports = Application;
