// tslint:disable:object-literal-sort-keys

import {
  bindTo,
  cleanState,
  getLevelState,
  getLogger,
  Level,
  setDefaultLevel,
  state,
} from './index';

import { spy } from 'sinon';

import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

describe('NsLogger', () => {
  beforeEach(() => {
    setDefaultLevel(Level.Warn);
    cleanState();
  });

  it('should always return the same logger instance', () => {
    const a1 = getLogger('ModuleA');
    const b1 = getLogger('ModuleB');

    // Check logger namespace
    expect(a1.namespace).to.equal('ModuleA');
    expect(b1.namespace).to.equal('ModuleB');

    expect(a1).not.to.equal(b1);

    // Ask for the same loggers again ...
    const a2 = getLogger('ModuleA');
    const b2 = getLogger('ModuleB');

    // ... and you get the same logger instances
    expect(a2).to.equal(a1);
    expect(b2).to.equal(b1);
  });

  it('should check enabled logger', () => {
    const a = getLogger('ModuleA');

    // a.level = Level.Warn; // This is the default level
    expect(a.trace.enabled).to.equal(false);
    expect(a.log.enabled).to.equal(false);
    expect(a.warn.enabled).to.equal(true);
    expect(a.error.enabled).to.equal(true);

    a.level = Level.Trace;
    expect(a.trace.enabled).to.equal(true);
    expect(a.log.enabled).to.equal(true);
    expect(a.warn.enabled).to.equal(true);
    expect(a.error.enabled).to.equal(true);

    a.level = Level.Log;
    expect(a.trace.enabled).to.equal(false);
    expect(a.log.enabled).to.equal(true);
    expect(a.warn.enabled).to.equal(true);
    expect(a.error.enabled).to.equal(true);

    a.level = Level.Error;
    expect(a.trace.enabled).to.equal(false);
    expect(a.log.enabled).to.equal(false);
    expect(a.warn.enabled).to.equal(false);
    expect(a.error.enabled).to.equal(true);

    a.level = Level.Silent;
    expect(a.trace.enabled).to.equal(false);
    expect(a.log.enabled).to.equal(false);
    expect(a.warn.enabled).to.equal(false);
    expect(a.error.enabled).to.equal(false);
  });

  it('should change the default level', () => {
    const a = getLogger('ModuleA');

    setDefaultLevel(Level.Log);
    const b = getLogger('ModuleB');

    expect(a.level).to.equal(2); // = Level.Warn
    expect(b.level).to.equal(1); // = Level.Log

    setDefaultLevel(Level.Error);
    const aAlias = getLogger('ModuleA');
    const bAlias = getLogger('ModuleB');
    const c = getLogger('ModuleC');

    // Loggers that already exists are NOT affected by the new default level settings.
    expect(aAlias.level).to.equal(2); // = Level.Warn
    expect(bAlias.level).to.equal(1); // = Level.Log

    // Only newly created loggers are affected by the new default level settings.
    expect(c.level).to.equal(3); // = Level.Error
  });

  it ('should change level programmatically', () => {
    const consoleSpy = spy(bindTo, 'consoleFactory');

    // By default the logger only output "warn" and "error".
    const a = getLogger('ModuleA');

    expect(a.trace).to.equal(bindTo.noop);
    expect(a.log).to.equal(bindTo.noop);
    expect(a.warn).not.to.equal(bindTo.noop); // = 1
    expect(a.error).not.to.equal(bindTo.noop); // = 2

    // Total count of `*.not.to.equal(bindTo.noop);`
    expect(consoleSpy.callCount).to.equal(2);

    a.level = 0;
    expect(a.trace).not.to.equal(bindTo.noop); // = 3
    expect(a.log).not.to.equal(bindTo.noop); // = 4
    expect(a.warn).not.to.equal(bindTo.noop); // = 5
    expect(a.error).not.to.equal(bindTo.noop); // = 6
    expect(consoleSpy.callCount).to.equal(6);

    a.level = 1;
    expect(a.trace).to.equal(bindTo.noop);
    expect(a.log).not.to.equal(bindTo.noop); // = 7
    expect(a.warn).not.to.equal(bindTo.noop); // = 8
    expect(a.error).not.to.equal(bindTo.noop); // = 9
    expect(consoleSpy.callCount).to.equal(9);

    a.level = 2;
    expect(a.trace).to.equal(bindTo.noop);
    expect(a.log).to.equal(bindTo.noop);
    expect(a.warn).not.to.equal(bindTo.noop); // = 10
    expect(a.error).not.to.equal(bindTo.noop); // = 11
    expect(consoleSpy.callCount).to.equal(11);

    a.level = 3;
    expect(a.trace).to.equal(bindTo.noop);
    expect(a.log).to.equal(bindTo.noop);
    expect(a.warn).to.equal(bindTo.noop);
    expect(a.error).not.to.equal(bindTo.noop); // = 12
    expect(consoleSpy.callCount).to.equal(12);

    a.level = 4;
    expect(a.trace).to.equal(bindTo.noop);
    expect(a.log).to.equal(bindTo.noop);
    expect(a.warn).to.equal(bindTo.noop);
    expect(a.error).to.equal(bindTo.noop);
    expect(consoleSpy.callCount).to.equal(12);
  });

  it('should parse level state from string', () => {
    expect(getLevelState(
      'ModuleA:Feature1= 0;' +
      'ModuleA:Feature2 =1;' +
      'ModuleA:* = 2;' +
      ' ModuleB = 3 ; ' +
      '* = 4;' +
      'ModuleC = 5', // Invalid level!
    )).to.eql({
      'ModuleA:Feature1': 0,
      'ModuleA:Feature2': 1,
      'ModuleA:*': 2,
      'ModuleB': 3,
      '*': 4,
    });
  });

  it('should use level state to set logger level', () => {
    state.level = {
      'ModuleA:Feature1': 0,
      'ModuleA:Feature2': 1,
      'ModuleA:*': 2,
      'ModuleB': 3,
      '*': 4,
    };

    expect(getLogger('ModuleA:Feature1').level).to.equal(0);
    expect(getLogger('ModuleA:Feature2').level).to.equal(1);
    expect(getLogger('ModuleA:Feature3').level).to.equal(2);
    expect(getLogger('ModuleB').level).to.equal(3);
    expect(getLogger('ModuleC').level).to.equal(4);
  });
});
