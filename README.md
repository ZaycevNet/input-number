# Simple number input

## Install

```
npm install @za-utils/input-number
```

## Usage

```js
import InputNumber from '@za-utils/input-number';

const input = document.querySelector('input'); // your input node

const instance = new InputNumber(input); // creating instance

instance.setFixed(8); // can set max decimals precision
instance.setMin(0); // can set min amount value
instance.setMax(1000000000); // can set max amount value

// '12345' => amount (string or number)
// null => caret position (array of 2 items: [0, 1])
// true => save caret position (if current value 1234567890 and your set caret after 5, you can set value 1234567.890 caret will be seted after 5 )
instance.setValue('12345', null, true);

// graceful down
instance.destroy();
```
