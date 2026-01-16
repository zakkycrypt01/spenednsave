/// <reference types="mocha" />

declare global {
  function describe(name: string, fn: () => void): void;
  function it(name: string, fn: () => void | Promise<void>): void;
  function beforeEach(fn: () => void | Promise<void>): void;
  function afterEach(fn: () => void | Promise<void>): void;
  function before(fn: () => void | Promise<void>): void;
  function after(fn: () => void | Promise<void>): void;
}

export {};
