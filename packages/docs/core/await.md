---
title: Await
---

The `Await` class provides a special data structure that can be set only once. It behaves somewhat like a Promise, as any attempt to get a value from it will "wait" for a value to be set first. Below is an overview of its usage:

1. **Creating an Await instance**: You can create an instance of `Await` using the `of` static method.

```typescript
import { Await } from 'path/to/Await'

const createAwait = async () => {
  const awaitInstance = await Await.of()
  return awaitInstance
}
```

2. **Setting and getting values**: You can set a value to the `Await` instance using the `set` method, and get the value using the `get` method. 

```typescript
import { Await } from 'path/to/Await'
import { QIO } from 'path/to/QIO'

const setAndGetValues = async () => {
  const awaitInstance = await Await.of()

  // Set a value
  await awaitInstance.set(QIO.resolve(42))

  // Get the value
  const value = await awaitInstance.get
  console.log(value) // Output: 42
}
```

3. **Checking if value is set**: You can check if a value has been set using the `isSet` method.

```typescript
import { Await } from 'path/to/Await'

const checkIfSet = async () => {
  const awaitInstance = await Await.of()

  // Check if value is set
  const isSet = await awaitInstance.isSet
  console.log(isSet) // Output: false
}
```

4. **Setting a value directly**: You can also directly set a value using the `setTo` method.

```typescript
import { Await } from 'path/to/Await'

const setDirectly = async () => {
  const awaitInstance = await Await.of()

  // Set a value directly
  await awaitInstance.setTo(42)
}
```

The `Await` class simplifies asynchronous programming by providing a convenient way to manage awaiting values, ensuring they are set only once.
