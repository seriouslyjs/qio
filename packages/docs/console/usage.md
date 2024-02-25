---
title: Usage
---

`@qio/console` provides a list of testable terminal based utilities such as `getStrLn` and `putStrLn` that abstract out the dependency on `stdin` and `stdout` streams.

> Prerequisite reading: [Getting Started](../core/installation).

## Printing on the screen

The following `program` would simply print `Welcome` on the screen.

```typescript
import {putStrLn} from '@qio/console'

const program = putStrLn('Welcome')
```

## Taking user input

User input can be taken using `getStrLn`.

```typescript
import {putStrLn, getStrLn} from '@qio/console'

const program = getStrLn('Enter name: ')
  .chain(name => putStrLn('Welcome', name))
```

## Environment Requirements

By default `getStrLn` and `putStrLn` have a dependency on `ITextTerminalEnv`. Because of this dependency, the `program` is of type: `QIO<void, never, ITextTerminalEnv>`.

The default env is shipped with `@qio/console` as `TTY` and can be used as follows:

```typescript
import {putStrLn, getStrLn, TTY} from '@qio/console'

const program = getStrLn('Enter name: ')
 .chain(name => putStrLn('Welcome', name))
 .provide({tty: TTY})
```

Above `TTY` is of type `ITextTerminalEnv`.

## Running the program

```typescript
import {putStrLn, getStrLn, TTY} from '@qio/console'
import {defaultRuntime} from '@qio/core'

const program = getStrLn('Enter name: ')
 .chain(name => putStrLn('Welcome', name))
 .provide({tty: TTY})

defaultRuntime().unsafeExecute(program)
```

`program` can be executed like any other `QIO` using the `defaultRuntime`.

## Using Test Env

`QIO` allows passing of mock `ITextTerminalEnv`.

```typescript
import {putStrLn, getStrLn, testTTY} from '@qio/console'
import {QIO} from '@qio/core'

const testTTYEnv = testTTY()
const program = getStrLn('Enter name: ')
 .chain(name => putStrLn('Welcome', name))
 .provide({tty: testTTYEnv})
```

Instead of using `TTY` we use `testTTY` function to create a mock `ITextTerminal`.

## Add mock input

Mock responses can be added using `testTTY()` as key value pairs.

```typescript
import {putStrLn, getStrLn, testTTY} from '@qio/console'
import {QIO} from '@qio/core'

const mockInput = {
  'Enter name: ': QIO.resolve('Bob')
}

const testTTYEnv = testTTY(mockInput)
const program = getStrLn('Enter name: ')
 .chain(name => putStrLn('Welcome', name))
 .provide({tty: testTTYEnv})
```

Running the program will automatically input `Bob` when the name is asked.

## Using Test Runtime

Replacing the `defaultRuntime` with `testRuntime` will allow synchronous evaluation of the `program`:

```typescript
import {putStrLn, getStrLn, testTTY} from '@qio/console'
import {QIO, testRuntime} from '@qio/core'
import * as assert from 'assert'

const mockInput = {
  'Enter name: ': QIO.resolve('Bob')
}

const testTTYEnv = testTTY(mockInput)
const program = getStrLn('Enter name: ')
 .chain(name => putStrLn('Welcome', name))
 .provide({tty: testTTYEnv})

testRuntime().unsafeExecuteSync(program)
```

## Asserting the output

```typescript
import {QIO, testRuntime} from '@qio/core'
import * as assert from 'assert'

const mockInput = {
  'Enter name: ': QIO.resolve('Bob')
}

const testTTYEnv = testTTY(mockInput)
const program = getStrLn('Enter name: ')
 .chain(name => putStrLn('Welcome', name))
 .provide({tty: testTTYEnv})

testRuntime().unsafeExecuteSync(program)

const actual = testTTYEnv.stdout
const expected = [
 'Enter name: Bob',
 'Welcome Bob'
]

assert.deepStrictEqual(actual, expected)
```

The `stdout` property is only available in the env created by `testEnv`. This is used mainly to assert what's being outputted on the terminal.
