#!/usr/bin/env node

const program = require('commander');
const version = require('./package.json').version;
const Application = require('./app/app');
const debug = require('debug')('pmpact:main');

program
    .version(version, '-v, --version')
    .arguments('<file-or-url>')
    .option('-H, --headers <headers>', 'HTTP Headers when the first argument is a url (json format)')
    .option('-o, --output <file>', 'Save the Postman Collection to a file')
    .action(async (source, cmd) => {
        try {
            debug('Execute command with:', source, cmd.headers);
            console.log(await new Application().parse(source, cmd.headers, cmd.output));
        } catch(err) {
            console.error(err);
            process.exit(1);
        }
    });

program.on('--help', () => {
    console.log('');
    console.log('  Examples');
    console.log('');
    console.log('    Convert a Pact file to a Postman collection:');
    console.log('');
    console.log('      $ pmpact pact.json');
    console.log('');
    console.log('    Convert a hosted Pact file to a Postman collection:');
    console.log('');
    console.log('      $ pmpact http://pact-broker/pact/latest');
    console.log('');
    console.log('    Save to a file:');
    console.log('');
    console.log('      $ pmpact pact.json -o postman-collection.json');
    console.log('');
    console.log('    Convert a hosted Pact file that requires headers to a Postman collection:');
    console.log('');
    console.log('      $ pmpact http://pact-broker/pact/latest -H \'{"Authorization":"Basic ZFhmbHR5Rk1n..."}\'');
    console.log('');
});

program.parse(process.argv);

const NO_COMMAND = program.rawArgs.length < 3;

if (NO_COMMAND) {
    program.help();
}
