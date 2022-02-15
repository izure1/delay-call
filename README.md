# delay-call

[![delay-call](https://data.jsdelivr.com/v1/package/npm/delay-call/badge)](https://www.jsdelivr.com/package/npm/delay-call)

If the task overlaps, wait and run only once.

For example, suppose that when a file is changed, it automatically calls the build command.
And if `1000` files are modified at the same time, the build command is called `1000` times.

This is not good for performance.
It would be nice to ignore duplicate calls and only respond to the last call.

This library helps you implement those functions easily.

## Install

```bash
npm i delay-call
```

### Node.js

```javascript
import { DelayCall } from 'delay-call'
```

### Browser (umd)

```html
<script src="https://cdn.jsdelivr.net/npm/delay-call@latest/build/main/index.min.js"></script>
```

### Browser (module)

```javascript
import { DelayCall } from 'https://cdn.jsdelivr.net/npm/delay-call@latest/build/module/index.min.js'
```

## How to use

```javascript
import { DelayCall } from 'delay-call';

const delay = new DelayCall();

function build() {
  // ...
}

function onChangeFile() {
  delay
    .request('build-file', build)
    .done('build-file')
    .then(() => {
      console.log('built done!');
    });
}
```

## Methods

### request(id: `string|number|symbol`, callback: `() => void`, delay: `number` = 25): `this`

Request to execute the callback function. The function is not called immediately and waits as much as the `delay` parameter. The default value of the `delay` is `this.__delay`.

### cancel(id: `string|number|symbol`): `boolean`

Cancel the requested task with the `id` parameter.

### cancelAll(): `boolean`

Cancel all requested tasks.

### done(id: `string|number|symbol`): `Promise<void>`

Wait until the requested task of the 'id' parameter is actually called.

## Use for globally

Sometimes build commands can be called from multiple files. It would be nice if we could delay the work globally.

You can use the `DelayCallGlobally` class. The method of use is the same.

```javascript
// file A
import { DelayCallGlobally } from 'delay-call';

const delay = new DelayCallGlobally();

function build() {
  // ...
}

function onChangeFile() {
  delay
    .request('build-file', build)
    .done('build-file')
    .then(() => {
      console.log('built done!');
    });
}

// file B
import { DelayCallGlobally } from 'delay-call';

const delay = new DelayCallGlobally();

function build() {
  // ...
}

function onChangeFile() {
  delay
    .request('build-file', build)
    .done('build-file')
    .then(() => {
      console.log('built done!');
    });
}
```

## Docs

https://izure1.github.io/delay-call/

## License

This library follows the `MIT` license.
