#!/usr/bin/env node

const program = require('commander');
const Application = require('./app/app');

program
    .version('0.0.1', '-v, --version')
    .arguments('<file-or-url>')
    .action(async (source) => {
        try {
            console.log(await new Application().convert(source));
        } catch(err) {
            console.log(err);
            process.exit(1);
        }
    });

// console.log(program);

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
    console.log('      $ pmpact pact.json > postman-collection.json');
    console.log('');
});

program.parse(process.argv);

const NO_COMMAND = program.args.length === 0;

if (NO_COMMAND) {
    program.help();
}
