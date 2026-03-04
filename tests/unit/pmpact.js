import { it, beforeEach, afterEach, describe, mock } from 'node:test';
import assert from 'node:assert/strict';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const proxyquire = require('proxyquire');
import packageJson from '../../package.json' with { type: 'json' };

describe('pmpact', () => {
    let pmpact;
    let commanderStub;
    let applicationStub;
    let source;
    let actionHandler;

    const requirePmpact = () => {
        pmpact = proxyquire('../../pmpact.js', {
            'commander': commanderStub,
            './app/app': applicationStub
        });
    };

    beforeEach(() => {
        source = 'pact.json';

        commanderStub = {
            version: mock.fn(() => commanderStub),
            option: mock.fn(() => commanderStub),
            arguments: mock.fn(() => commanderStub),
            on: mock.fn(() => commanderStub),
            parse: mock.fn(() => commanderStub),
            help: mock.fn(() => commanderStub),
            action: (fn) => { actionHandler = fn; },
            rawArgs: []
        }
        applicationStub = function () { };
        applicationStub.prototype.parse = mock.fn(() => Promise.resolve());
    });


    afterEach(() => {
        mock.reset();
        if (typeof process.exit.restore === 'function') {
            process.exit.restore();
        }
        if (typeof console.log.restore === 'function') {
            console.log.restore();
        }
        if (typeof console.error.restore === 'function') {
            console.error.restore();
        }
        commanderStub = undefined;
        applicationStub = undefined;
        source = undefined;
        actionHandler = undefined;
    });

    it('should set a version', () => {
        requirePmpact();
        assert.strictEqual(commanderStub.version.mock.calls.length, 1);
        assert.strictEqual(commanderStub.version.mock.calls[0].arguments[0], packageJson.version);
    });

    it('should set an argument', () => {
        requirePmpact();
        assert.strictEqual(commanderStub.arguments.mock.calls.length, 1);
        assert.strictEqual(commanderStub.arguments.mock.calls[0].arguments[0], '<file-or-url>');
    });

    it('should set a headers option', () => {
        requirePmpact();
        assert.strictEqual(commanderStub.option.mock.calls[0].arguments[0], '-H, --headers <headers>');

    });

    it('should set an output option', () => {
        requirePmpact();
        assert.strictEqual(commanderStub.option.mock.calls[1].arguments[0], '-o, --output <file>');
    });

    it('should display examples', () => {
        console.log = mock.fn();
        requirePmpact();
        const helpCall = commanderStub.on.mock.calls.find(call => call.arguments[0] === '--help');
        assert.ok(helpCall, 'on should be called with --help');
        const helpHandler = helpCall.arguments[1];
        helpHandler();
        assert.ok(console.log.mock.calls.some(call => call.arguments[0].indexOf('Examples') !== -1), 'Help should display examples');
    });

    it('should parse arguments', () => {
        requirePmpact();
        assert.strictEqual(commanderStub.parse.mock.calls[0].arguments[0], process.argv);
    });

    it('should display help if called with no arguments', () => {
        requirePmpact();
        assert.strictEqual(commanderStub.help.mock.calls.length, 1);
    });

    it('should parse a source', () => {
        proxyquire('../../pmpact', {
            'commander': commanderStub,
            './app/app': applicationStub
        });
        commanderStub.headers = 'user headers';
        commanderStub.output = 'user output';
        actionHandler(source, commanderStub);
        assert.strictEqual(applicationStub.prototype.parse.mock.calls[0].arguments[0], source);
        assert.strictEqual(applicationStub.prototype.parse.mock.calls[0].arguments[1], 'user headers');
        assert.strictEqual(applicationStub.prototype.parse.mock.calls[0].arguments[2], 'user output');
    });

    it('should handle errors', () => {
        console.error = mock.fn();
        process.exit = mock.fn();

        const error = new Error('Something happened');
        applicationStub.prototype.parse = function () {
            throw error;
        };
        proxyquire('../../pmpact', {
            'commander': commanderStub,
            './app/app': applicationStub
        });
        actionHandler(source, commanderStub);
        assert.strictEqual(console.error.mock.calls[0].arguments[0], error);
        assert.strictEqual(process.exit.mock.calls[0].arguments[0], 1);
    });

});
