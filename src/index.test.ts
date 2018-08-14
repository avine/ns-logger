// tslint:disable:object-literal-sort-keys

import { bindTo, cleanState, getLogger, getSeverityState, setDefaultSeverity, Severity, state } from './index';

import { spy } from 'sinon';

import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

describe('NsLogger', () => {
  beforeEach(() => {
    setDefaultSeverity(Severity.Warn);
    cleanState();
  });

  it('should always return the same logger instance', () => {
    const a1 = getLogger('NamespaceA');
    const b1 = getLogger('NamespaceB');

    // Check logger name
    expect(a1.name).to.equal('NamespaceA');
    expect(b1.name).to.equal('NamespaceB');

    expect(a1).not.to.equal(b1);

    // Ask for the same loggers again ...
    const a2 = getLogger('NamespaceA');
    const b2 = getLogger('NamespaceB');

    // ... and you get the same logger instances ...
    expect(a2).to.equal(a1);
    expect(b2).to.equal(b1);
  });

  it('should change the default severity', () => {
    const a = getLogger('NamespaceA');

    setDefaultSeverity(Severity.Log);
    const b = getLogger('NamespaceB');

    expect(a.level).to.equal(2); // = Severity.Warn
    expect(b.level).to.equal(1); // = Severity.Log

    setDefaultSeverity(Severity.Error);
    const aCopy = getLogger('NamespaceA');
    const bCopy = getLogger('NamespaceB');
    const c = getLogger('NamespaceC');

    // Loggers that already exists are NOT affected by the new default severity settings.
    expect(aCopy.level).to.equal(2); // = Severity.Warn
    expect(bCopy.level).to.equal(1); // = Severity.Log

    // Only newly created loggers are affected by the new default severity settings.
    expect(c.level).to.equal(3); // = Severity.Error
  });

  it ('should change severity programmatically', () => {
    const consoleSpy = spy(bindTo, 'console');

    // By default the logger only output "warn" and "error".
    const a = getLogger('NamespaceA');

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

  it('should parse severity state from string', () => {
    expect(getSeverityState(
      'ModuleA:Feature1= 0;' +
      'ModuleA:Feature2 =1;' +
      'ModuleA:* = 2;' +
      ' ModuleB = 3 ; ' +
      '* = 4;' +
      'ModuleC = 5', // Invalid severity level!
    )).to.eql({
      'ModuleA:Feature1': 0,
      'ModuleA:Feature2': 1,
      'ModuleA:*': 2,
      'ModuleB': 3,
      '*': 4,
    });
  });

  it('should use severity state to set logger level', () => {
    state.severity = {
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
