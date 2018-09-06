const assert = require('chai').assert;
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('pmpact', () => {

    let commanderStub;
    let applicationStub;
    let source;
    let actionHandler;

    const requirePmpact = () => {
        pmpact = proxyquire('../../pmpact', {
            'commander': commanderStub,
            './app/app': applicationStub
        });
    };

    beforeEach(() => {
        source = 'pact.json';
        commanderStub = sinon.stub({
            version: () => {},
            arguments: () => {},
            option: () => {},
            on: () => {},
            parse: () => {},
            help: () => {}
        });
        commanderStub.version.returns(commanderStub);
        commanderStub.arguments.returns(commanderStub);
        commanderStub.option.returns(commanderStub);
        commanderStub.action = (handler) => {
            actionHandler = handler;
        }
        commanderStub.args = [];
        applicationStub = function(){};
        applicationStub.prototype.parse = sinon.spy();
    });

    afterEach(() => {
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
        originalConsole = undefined;
        actionHandler = undefined;
    });

    it('should set a version', () => {
        requirePmpact();
        assert.ok(commanderStub.version.withArgs(require('../../package.json').version).calledOnce);
    });

    it('should set an argument', () => {
        requirePmpact();
        assert.ok(commanderStub.arguments.withArgs('<file-or-url>').calledOnce);
    });

    it('should set a headers option', () => {
        requirePmpact();
        assert.ok(commanderStub.option.withArgs('-H, --headers <headers>', sinon.match.string).calledOnce);
    });

    it('should set an output option', () => {
        requirePmpact();
        assert.ok(commanderStub.option.withArgs('-o, --output <file>', sinon.match.string).calledOnce);
    });

    it('should display examples', () => {
        sinon.stub(console, 'log').callsFake(() => {});
        requirePmpact();
        assert.ok(commanderStub.on.withArgs('--help', sinon.match.func).calledOnce);
        const helpHandler = commanderStub.on.withArgs('--help', sinon.match.func).firstCall.args[1];
        helpHandler();
        assert.ok(console.log.withArgs('  Examples').calledOnce);
    });

    it('should parse arguments', () => {
        requirePmpact();
        assert.ok(commanderStub.parse.withArgs(sinon.match.array).calledOnce);
    });

    it('should display help if called with no arguments', () => {
        requirePmpact();
        assert.ok(commanderStub.help.calledOnce);
    });

    it('should parse a source', () => {
        sinon.stub(console, 'log').callsFake(() => {});
        proxyquire('../../pmpact', {
            'commander': commanderStub,
            './app/app': applicationStub
        });
        commanderStub.headers = 'user headers';
        commanderStub.output = 'user output';
        actionHandler(source, commanderStub);
        assert.ok(applicationStub.prototype.parse.withArgs(source, 'user headers', 'user output').calledOnce);
    });

    it('should handle errors', () => {
        sinon.stub(console, 'error');
        sinon.stub(process, 'exit');
        const error = new Error('Something happened');
        applicationStub.prototype.parse = function() {
            throw error;
        };
        proxyquire('../../pmpact', {
            'commander': commanderStub,
            './app/app': applicationStub
        });
        actionHandler(source, commanderStub);
        assert.ok(process.exit.withArgs(1).calledOnce);
        assert.ok(console.error.withArgs(error).calledOnce);
    });

});