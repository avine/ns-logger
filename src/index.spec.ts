// tslint:disable:object-literal-sort-keys
import { bindTo, cleanStates, getLogger, getSeverityState, severityState } from './index';

describe('utils.logger', () => {
  beforeEach(() => {
    cleanStates();
  });

  it('should always return the same logger instance', () => {
    const a1 = getLogger('NamespaceA');
    const b1 = getLogger('NamespaceB');

    expect(a1).not.toBe(b1);

    const a2 = getLogger('NamespaceA');
    const b2 = getLogger('NamespaceB');

    expect(a2).toBe(a1);
    expect(b2).toBe(b1);
  });

  it ('should change severity programmatically', () => {
    spyOn(bindTo, 'console').and.callThrough();

    // By default the logger only output "warn" and "error".
    const a = getLogger('NamespaceA');

    // Total count of `*.not.toBe(bindTo.noop);`
    expect(bindTo.console).toHaveBeenCalledTimes(2);
    expect(a.trace).toBe(bindTo.noop);
    expect(a.log).toBe(bindTo.noop);
    expect(a.warn).not.toBe(bindTo.noop); // = 1
    expect(a.error).not.toBe(bindTo.noop); // = 2

    a.level = 0;
    expect(bindTo.console).toHaveBeenCalledTimes(6);
    expect(a.trace).not.toBe(bindTo.noop); // = 3
    expect(a.log).not.toBe(bindTo.noop); // = 4
    expect(a.warn).not.toBe(bindTo.noop); // = 5
    expect(a.error).not.toBe(bindTo.noop); // = 6

    a.level = 1;
    expect(bindTo.console).toHaveBeenCalledTimes(9);
    expect(a.trace).toBe(bindTo.noop);
    expect(a.log).not.toBe(bindTo.noop); // = 7
    expect(a.warn).not.toBe(bindTo.noop); // = 8
    expect(a.error).not.toBe(bindTo.noop); // = 9

    a.level = 2;
    expect(bindTo.console).toHaveBeenCalledTimes(11);
    expect(a.trace).toBe(bindTo.noop);
    expect(a.log).toBe(bindTo.noop);
    expect(a.warn).not.toBe(bindTo.noop); // = 10
    expect(a.error).not.toBe(bindTo.noop); // = 11

    a.level = 3;
    expect(bindTo.console).toHaveBeenCalledTimes(12);
    expect(a.trace).toBe(bindTo.noop);
    expect(a.log).toBe(bindTo.noop);
    expect(a.warn).toBe(bindTo.noop);
    expect(a.error).not.toBe(bindTo.noop); // = 12

    a.level = 4;
    expect(a.trace).toBe(bindTo.noop);
    expect(a.log).toBe(bindTo.noop);
    expect(a.warn).toBe(bindTo.noop);
    expect(a.error).toBe(bindTo.noop);
    expect(bindTo.console).toHaveBeenCalledTimes(12);
  });

  it('should parse severity state from string', () => {
    expect(getSeverityState(
      'ModuleA:Feature1= 0;' +
      'ModuleA:Feature2 =1;' +
      'ModuleA:* = 2;' +
      ' ModuleB = 3 ; ' +
      '* = 4;' +
      'ModuleC = 5', // Invalid severity level!
    )).toEqual({
      'ModuleA:Feature1': 0,
      'ModuleA:Feature2': 1,
      'ModuleA:*': 2,
      'ModuleB': 3,
      '*': 4,
    });
  });

  it('should use severity state to set logger level', () => {
    Object.assign(severityState, {
      'ModuleA:Feature1': 0,
      'ModuleA:Feature2': 1,
      'ModuleA:*': 2,
      'ModuleB': 3,
      '*': 4,
    });

    expect(getLogger('ModuleA:Feature1').level).toBe(0);
    expect(getLogger('ModuleA:Feature2').level).toBe(1);
    expect(getLogger('ModuleA:Feature3').level).toBe(2);
    expect(getLogger('ModuleB').level).toBe(3);
    expect(getLogger('ModuleC').level).toBe(4);
  });
});
