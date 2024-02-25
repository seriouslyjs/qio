---
title: Usage
---

## Introduction to `@qio/stream`: Simplifying Asynchronous Data Streams in NodeJS

Asynchronous data handling in NodeJS, while powerful, often introduces complexity that can be challenging to manage, especially as applications scale. Traditional approaches, though effective, sometimes leave developers grappling with issues like callback hell, complex error handling, manual stream management, and difficulties with state management across asynchronous operations. `@qio/stream` emerges as a solution to these challenges, offering a functional programming approach to streamline asynchronous data flows, making code more readable, maintainable, and less prone to errors.

### Some examples

#### 1. Streamlining Node Streams with Error Handling

**Traditional NodeJS Approach**: Working with Node's native `stream` module often involves manually setting up readable, writable, and transform streams, handling backpressure, and managing stream events. This not only adds boilerplate code but also increases the risk of bugs and makes the code harder to follow.

  ```typescript
  import { Readable, Transform, Writable } from 'stream';

  // Manual setup of streams
  const readableStream = new Readable({ read() {} });
  const transformStream = new Transform({ transform(chunk, encoding, callback) { callback(null, chunk); } });
  const writableStream = new Writable({ write(chunk, encoding, callback) { callback(); } });

  // Pipe streams together
  readableStream.pipe(transformStream).pipe(writableStream);

  // Error handling
  readableStream.on('error', console.error);
  transformStream.on('error', console.error);
  writableStream.on('error', console.error);

  // Backpressure handling
  writableStream.on('drain', () => console.log('Writable stream drained'));

  // Simulated data manipulation functions
  function getDataFromSource(): string { return 'data'; }
  function transformData(data: string): string { return data.toUpperCase(); }
  function processData(data: string): void { console.log('Processed data:', data); }
  ```

**With `@qio/stream`**: `@qio/stream` elegantly addresses the challenges of working with streams by abstracting away complexities and providing a high-level API. By automating backpressure handling and stream transformations, QStream allows developers to focus on defining data processing logic rather than managing the stream lifecycle.

  ```typescript
  import { QIO } from '@qio/core';
  import { QStream } from '@qio/stream';

  // Function to fetch data asynchronously
  const fetchData = async (): Promise<string> => {
    const data = await getDataFromSource();
    return data;
  };

  // Function to transform data to uppercase
  const transformToUpperCase = (value: string): string => value.toUpperCase();

  // Function to process each transformed value
  const processTransformedData = (processedData: string): void => {
    console.log('Processed data:', processedData);
  };

  // Create a QStream from an effectful operation
  const stream = QStream.fromEffect(QIO.asyncEffect(fetchData));

  // Transform each emitted value to uppercase
  const transformedStream = stream.map(transformToUpperCase);

  // Process each transformed value (log it)
  transformedStream.forEach(processTransformedData).catch(console.error);
  ```

#### Verbose Event Handling

**Traditional NodeJS Approach**: Using `EventEmitter` requires manually attaching event listeners, managing state across events, and ensuring proper cleanup to avoid memory leaks. This imperative style can make the code less intuitive and harder to maintain, especially with multiple event sources.

  ```typescript
 import { EventEmitter } from 'events';

  // Simulated event emitter
  const eventEmitter = new EventEmitter();

  // Manually attaching event listeners
  eventEmitter.on('event', (data) => {
    // Handling event
    console.log('Event data:', data);
  });

  // Managing state across events
  let state = '';

  eventEmitter.on('changeState', (newState) => {
    state = newState;
    console.log('State changed:', state);
  });

  // Ensuring proper cleanup to avoid memory leaks
  const cleanupListener = () => {
    console.log('Cleanup listener executed');
  };

  eventEmitter.on('cleanup', cleanupListener);

  // Removing event listener to prevent memory leaks
  eventEmitter.off('cleanup', cleanupListener);

  // Simulated event emission
  eventEmitter.emit('event', 'EventData');
  eventEmitter.emit('changeState', 'NewState');
  eventEmitter.emit('cleanup');
  ```

**With `@qio/stream`**: Converting event emitters into streams with `@qio/stream` allows for a declarative and composable approach to event handling. It simplifies event management, making code cleaner and reducing the likelihood of errors or memory leaks.

  ```typescript
  import { EventEmitter } from 'events';
  import { fromEvent } from '@qio/stream';

  // Simulated event emitter
  const eventEmitter = new EventEmitter();

  // Convert event emitter into a stream
  const stream = fromEvent(eventEmitter, 'eventName');

  // Subscribe to the stream
  stream.forEach(event => {
    console.log('Received event:', event);
  }).catch(console.error);

  ```

#### Complex Asynchronous Patterns

**Traditional NodeJS Approach**: Implementing patterns like polling or serial execution of asynchronous tasks often leads to nested callbacks or complex promise chains. These patterns can be hard to read and maintain, and they increase the cognitive load on developers.

```typescript
// Simulated asynchronous task with callback
const asyncTask = (data: string, callback: (result: string) => void) => {
  setTimeout(() => {
    const result = `Processed data: ${data}`;
    callback(result);
  }, 1000);
};

// Simulated serial execution of asynchronous tasks using nested callbacks
const performSerialExecution = () => {
  asyncTask('task1', (result1) => {
    console.log(result1);
    asyncTask('task2', (result2) => {
      console.log(result2);
      asyncTask('task3', (result3) => {
        console.log(result3);
        // Continue with more tasks...
      });
    });
  });
};

// Simulated polling pattern using setInterval
const performPolling = () => {
  let counter = 0;
  const interval = setInterval(() => {
    asyncTask(`pollingTask${counter}`, (result) => {
      console.log(result);
      counter++;
      if (counter === 3) {
        clearInterval(interval);
      }
    });
  }, 1000);
};

```

**With `@qio/stream`**: `@qio/stream` offers a more elegant solution by representing asynchronous operations as streams that can be easily composed, retried, and transformed. This functional approach reduces boilerplate and makes asynchronous logic more straightforward and declarative.

  ```typescript
  // Simulated asynchronous task with callback
  const asyncTask = (data: string, callback: (result: string) => void) => {
    setTimeout(() => {
      const result = `Processed data: ${data}`;
      callback(result);
    }, 1000);
  };

  // Simulated serial execution of asynchronous tasks using nested callbacks
  const performSerialExecution = () => {
    asyncTask('task1', (result1) => {
      console.log(result1);
      asyncTask('task2', (result2) => {
        console.log(result2);
        asyncTask('task3', (result3) => {
          console.log(result3);
          // Continue with more tasks...
        });
      });
    });
  };

  // Simulated polling pattern using setInterval
  const performPolling = () => {
    let counter = 0;
    const interval = setInterval(() => {
      asyncTask(`pollingTask${counter}`, (result) => {
        console.log(result);
        counter++;
        if (counter === 3) {
          clearInterval(interval);
        }
      });
    }, 1000);
  };

  // Uncomment to test serial execution or polling pattern
  // performSerialExecution();
  // performPolling();

  ```

## Conclusion

`@qio/stream` is not just a library; it's a paradigm shift for NodeJS developers used to imperative programming patterns. By addressing common pain points head-on, `@qio/stream` invites developers into the world of functional programming, where data flows are managed more naturally, and asynchronous operations become more predictable and easier to reason about. Whether you're transforming data streams, handling events, or implementing complex asynchronous patterns, `@qio/stream` provides the tools to make your code more expressive, concise, and reliable.

This introduction aims to not only showcase the benefits and features of `@qio/stream` but also to inspire developers to rethink how they handle asynchronous data in NodeJS. By adopting `@qio/stream`, developers can elevate their code, reduce complexity, and ultimately build more robust and maintainable NodeJS applications.

# API Documentation

## Type Parameters

- **ValueType**: The data type of values within the stream.
- **ErrorType**: Specifies types of errors that might be encountered. Default is `never` if the stream is expected to be error-free.
- **EnvironmentType**: Defines the execution context required by the stream's operations, defaulting to `unknown`.

## Constructor

### `new QStream(fold)`

Initializes `QStream` with a custom fold function, allowing for detailed control over how stream values are processed.

## Static Methods

- **Description**: Designed for creating new `QStream` instances from various sources or conditions.

### `.const(value: ValueType): QStream`

Creates a new `QStream` instance that endlessly emits the specified value. This static method is ideal for initializing streams with a constant value.

- **Params**:
  - `value: ValueType` - The value to be emitted continuously.
- **Example**:

  ```typescript
  const constantStream = QStream.const(42);
  constantStream.forEach(console.log); // Logs 42 indefinitely
  ```

### `.fromArray(array: ValueType[]): QStream`

Generates a stream from an array of values, emitting each value sequentially.

- **Params**:
  - `array: ValueType[]` - An array of values to be turned into a stream.
- **Example**:

  ```typescript
  const arrayStream = QStream.fromArray([1, 2, 3]);
  arrayStream.forEach(console.log); // Logs 1, 2, 3 sequentially
  ```

### `.fromEffect(effect: QIO<ValueType, ErrorType, EnvironmentType>): QStream`

Constructs a stream from a single effectful operation, emitting the effect's result.

- **Params**:
  - `effect: QIO<ValueType, ErrorType, EnvironmentType>` - An effectful operation to be executed.
- **Example**:

  ```typescript
  const effectStream = QStream.fromEffect(QIO.resolve("Hello, World!"));
  effectStream.forEach(console.log); // Logs "Hello, World!"
  ```

### `.fromEventEmitter(emitter: EventEmitter, eventName: string): QStream`

Creates a stream that emits events of a specified type from an `EventEmitter`.

- **Params**:
  - `emitter: EventEmitter` - The event emitter source.
  - `eventName: string` - Name of the event to listen for.
- **Example**:

  ```typescript
  const clickStream = QStream.fromEventEmitter(document, 'click');
  clickStream.forEach(() => console.log('Clicked!')); // Logs 'Clicked!' on each click event
  ```

### `.fromQueue(queue: Queue<ValueType>): QStream`

Generates a stream from a queue, emitting dequeued values.

- **Params**:
  - `queue: Queue<ValueType>` - A queue from which values are emitted.
- **Example**: Assume `queue` is a queue with some values enqueued.

### `.interval(value: ValueType, duration: number): QStream`

Generates a stream that emits a value at regular intervals specified by duration.

- **Params**:
  - `value: ValueType` - The value to emit.
  - `duration: number` - Interval duration in milliseconds.
- **Example**:

  ```typescript
  const intervalStream = QStream.interval("tick", 1000);
  intervalStream.forEach(console.log); // Logs "tick" every 1000ms
  ```

### `.of(...values: ValueType[]): QStream`

Creates a stream from a list of values, emitting each value in sequence.

- **Params**:
  - `...values: ValueType[]` - A spread of values to emit.
- **Example**:

  ```typescript
  const ofStream = QStream.of(1, 2, 3);
  ofStream.forEach(console.log); // Logs 1, 2, 3 sequentially
  ```

### `.produce(io: QIO<ValueType, ErrorType, EnvironmentType>): QStream`

Creates a stream that continuously executes an IO effect, emitting its results.

- **Params**:
  - `io: QIO<ValueType, ErrorType, EnvironmentType>` - The IO operation to execute.
- **Example**: Assume `io` is an IO operation that fetches data from an API.

### `.range(min: number, max: number): QStream<number>`

Generates a stream that emits a sequence of numbers within a specified range.

- **Params**:
  - `min: number` - The starting number of the range.
  - `max: number` - The ending number of the range.
- **Example**:

  ```typescript
  const rangeStream = QStream.range(1, 3);
  rangeStream.forEach(console.log); // Logs 1, 2, 3
  ```

### `.reject(error: ErrorType): QStream<never>`

Creates a stream that immediately emits a specified error and terminates.

- **Params**:
  - `error: ErrorType` - The error to emit.
- **Example**:

  ```typescript
  const errorStream = QStream.reject(new Error("Oops"));
  errorStream.forEach(console.log, console.error); // Triggers error handling with "Oops"
  ```

## Instance Methods

- **Description**: Focused on transforming, manipulating, or consuming the current stream instance.

### Transformation and Utility Methods

### `.asArray()`

Collects all emitted values into an array, useful for when you need to aggregate stream results.

- **Example**:

  ```typescript
  QStream.of(1, 2, 3).asArray().then(console.log); // Outputs: [1, 2, 3]
  ```

### `.drain()`

Consumes all values from the stream, performing their effects without producing a final result. Ideal for effects-only streams.

- **Example**:

  ```typescript
  QStream.fromArray([1, 2, 3]).forEach(console.log).drain();
  // Logs each number, but `drain` itself does not produce a value.
  ```

### `.zipWithIndex()`

Transforms each value in the stream to a tuple containing the value and its index, adding positional information to stream values.

- **Example**:

  ```typescript
  QStream.of('a', 'b', 'c').zipWithIndex().forEach(console.log);
  // Logs: ['a', 0], ['b', 1], ['c', 2]
  ```

### `.chain(transform)`

Applies a transformation function to each value in the stream, flattening the result. Useful for chaining asynchronous operations.

- **Params**:
  - `transform: (value: ValueType) => QStream<NewValueType>` - Function returning a new stream per value.
- **Example**:

  ```typescript
  QStream.of(1, 2, 3)
    .chain(num => QStream.of(num * 2))
    .forEach(console.log); // Logs: 2, 4, 6
  ```

### `.const(value: NewValueType)`

Overrides each value in the stream with a specified new value, transforming the entire stream to emit this constant value.

- **Params**:
  - `value: NewValueType` - The new constant value to emit.
- **Example**:

  ```typescript
  QStream.of(1, 2, 3).const(0).forEach(console.log); // Logs: 0, 0, 0
  ```

### `.filter(predicate)`

Filters values in the stream, only emitting those that satisfy the given predicate function.

- **Params**:
  - `predicate: (value: ValueType) => boolean` - Function to test each value.
- **Example**:

  ```typescript
  QStream.of(1, 2, 3, 4)
    .filter(num => num % 2 === 0)
    .forEach(console.log); // Logs: 2, 4
  ```

### Folding and Accumulation

### `.foldLeft(seed, accumulator)`

Reduces the stream to a single value, accumulating results starting with a seed value and applying an accumulator function.

- **Params**:
  - `seed: AccumulatorType` - Initial value for the accumulation.
  - `accumulator: (acc: AccumulatorType, value: ValueType) => AccumulatorType` - Function to accumulate results.
- **Example**:

  ```typescript
  QStream.of(1, 2, 3)
    .foldLeft(0, (acc, num) => acc + num)
    .then(console.log); // Outputs: 6
  ```

### `.foldUntil(state, continuePredicate, next, awaitable)`

Similar to `.foldLeft`, but halts folding based on an `Await` condition, allowing for premature stream termination.

- **Params**:
  - `state: AccumulatorType` - Initial state for folding.
  - `continuePredicate: (state: AccumulatorType) => boolean` - Determines if folding should continue.
  - `next: (state: AccumulatorType, value: ValueType) => QIO<AccumulatorType>` - Processes each value and updates the state.
  - `awaitable: Await` - Condition that when satisfied, halts the fold.
- **Example**: Assume `awaitable` is set when an external event occurs.

### Effectful Iteration

### `.forEach(effect)`

Executes an effectful function for each value in the stream, ideal for performing side effects.

- **Params**:
  - `effect: (value: ValueType) => QIO<NewValueType>` - Side-effect to apply to each value.
- **Example**:

  ```typescript
  QStream.of("Hello", "World")
    .forEach(value => QIO.lift(() => console.log(value)))
    .drain(); // Logs: "Hello", "World"
  ```

### `.forEachWhile(predicate)`

Continues to execute an effectful function for each stream value as long as the predicate returns `true`.

- **Params**:
  - `predicate: (value: ValueType) => QIO<boolean>` - Determines whether to continue processing.
- **Example**: Useful for processing until a certain condition is met, like an error or a limit.

### Stream Interruption

### `.haltWhen(awaitable)`

Halts the stream once the provided `Await` condition is met, useful for interrupting stream processing based on external signals.

- **Params**:
  - `awaitable: Await` - The condition that triggers halting the stream.
- **Example**: Use in scenarios where stream processing must be stopped gracefully upon certain events.

### `.haltWhenM(effect)`

Immediately halts the stream upon the completion of the specified effect, allowing for dynamic control over stream lifecycle.

- **Params**:
  - `effect: QIO` - The effect whose completion triggers halting of the stream.
- **Example**: Effective in cases where an asynchronous operation outside the stream dictates the end of the stream's life.

