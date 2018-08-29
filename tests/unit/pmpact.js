const assert = require('chai').assert;
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('pmpact', () => {

    let commanderStub;
    let applicationStub;
    let source;
    let originalConsole;
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
            on: () => {},
            parse: () => {},
            help: () => {}
        });
        commanderStub.version.returns(commanderStub);
        commanderStub.arguments.returns(commanderStub);
        commanderStub.action = (handler) => {
            actionHandler = handler;
        }
        commanderStub.args = [];
        applicationStub = function(){};
        applicationStub.prototype.parse = sinon.spy();
        originalConsole = console.log;
        console.log = sinon.spy();
        sinon.stub(process, 'exit');
    });

    afterEach(() => {
        process.exit.restore();
        console.log = originalConsole;
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

    it('should display examples', () => {
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
        proxyquire('../../pmpact', {
            'commander': commanderStub,
            './app/app': applicationStub
        });
        actionHandler(source);
        assert.ok(applicationStub.prototype.parse.withArgs(source).calledOnce);
    });

    it('should handle errors', () => {
        applicationStub.prototype.parse = function() {
            throw new Error('Something happened');
        };
        proxyquire('../../pmpact', {
            'commander': commanderStub,
            './app/app': applicationStub
        });
        actionHandler(source);
        assert.ok(process.exit.withArgs(1).calledOnce);
        // assert.ok(applicationStub.prototype.parse.withArgs(source).calledOnce);
    });

});