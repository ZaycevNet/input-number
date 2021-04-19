module.exports = class InputNumber {
    constructor(element) {
        this.el = element;

        this.options = {
            fixed: undefined,
            min: undefined,
            max: undefined,
        };

        this.metaKey = false;
        this.metaKeys = {
            ctrlKey: 17,
            cmdKey: 91,
            vKey: 86,
            cKey: 67,
        };

        this.firstDelete = false;

        this.changeHandler = () => {};

        this.initInput();
    }

    setFixed(fixed) {
        this.options.fixed = fixed;
    }
    setMin(min) {
        this.options.min = min;
    }
    setMax(max) {
        this.options.max = max;
    }

    getNewCaretPos(prevNumbers, newNumbers, caret) {
        /**
         * сначала узнаем где была каретка до ввода нового значения
         * потом надо посмотреть можем ли мы поставить каретку в
         * тоже место с новым значением
         */

        if(prevNumbers[0].length >= caret) {
            // каретка в целых

            // проверяем можем ли мы поставить ее в то же место
            if(newNumbers[0].length >= caret) {
                // можем

                return caret;
            }

            // мы не можем поставить ее в то же место
            // поставим ее в конец целых

            return newNumbers[0].length;
        } else {
            // каретка была либо в дробной части, либо число сильно изменилось

            if(prevNumbers[1]) {
                // есть дробная часть
                // надо узнать в как отличается новая и стараю дробные части

                if(prevNumbers[1].length >= newNumbers[1].length) {
                    // предыдущая дробная часть была больше или равна новой

                    // проверим можем ли мы вставить каретку в новую дробную часть
                    if(newNumbers[1].length >= caret) {
                        // можем

                        return caret;
                    }

                    // не можем, надо узнать на сколько символов разнятся части

                    const delta = prevNumbers[1].length - newNumbers[1].length;
                    // заполним пустоту нулями
                    this.el.value = this.el.value + (new Array(delta).fill('0').join(''));

                    // и можем вставлять каретку обратно
                    return caret;
                }

                // новая дробная часть больше предыдущей
                // можем просто вставить каретку
                return caret;
            }

            return caret;
        }
    }
    setCaretInPreviousPlace(prevNumbers, newNumbers, caret) {
        const caretStart = this.getNewCaretPos(prevNumbers, newNumbers, caret[0]);
        const caretEnd = this.getNewCaretPos(prevNumbers, newNumbers, caret[1]);

        this.el.setSelectionRange(caretStart, caretEnd);
    }

    setValue(value, caret = undefined, saveCaret = false) {
        const currentValue = this.getValue();
        const currentNumbers = this.getNumbers(currentValue);

        if(Number(value || 0) === Number(currentValue || '0'))
            return;

        caret = caret || [0, this.el.value.length];

        const future = this.getFutureValue(caret, value, false);
        const numbers = this.getNumbers(future);

        const validate = this.validateNumbers(numbers);

        if (validate) {
            const [newValue, newCaret] = this.getNormalValue(numbers.join('.'), saveCaret ? this.getCaret() : caret);

            this.el.value = newValue;

            if(saveCaret) {
                this.setCaretInPreviousPlace(currentNumbers, numbers, newCaret);
            } else {
                this.el.setSelectionRange(newCaret[0] + value.length, newCaret[0] + value.length);
            }
        }
    }

    getValue() {
        return this.el.value;
    }
    getCaret() {
        return [
            this.el.selectionStart,
            this.el.selectionEnd,
        ];
    }
    getFutureValue(caret, key, singleKey = true) {
        const [startPos, endPos] = caret;
        const value = this.getValue().split('');

        if(key === 'Backspace' && singleKey) {
            if(startPos === 1)
                this.firstDelete = true;

            if(!!value) {
                if(startPos !== endPos) {
                    if(startPos === 0) {
                        value.splice(0, endPos);
                    } else {
                        value.splice(startPos, endPos - startPos);
                    }
                } else if (startPos === endPos) {
                    if(startPos !== 0) {
                        value.splice(startPos - 1, 1);
                    }
                }
            }
        } else if(startPos === endPos && startPos === 0) {
            value.unshift(key);
        } else if(startPos === endPos && startPos === value.length) {
            value.push(key);
        } else {
            value.splice(startPos, endPos - startPos, key);
        }

        return value.join('').replace(',', '.');
    }
    getNormalValue(value, caret) {
        let newValue = '0';

        if(value.length >= 1) {
            const [l, r] = value.split('.');
            const ln = Number(l);

            if(this.firstDelete) {
                this.firstDelete = false;

                newValue = `${l}`;
            } else {
                newValue = `${ln}`;
            }

            if(typeof r !== 'undefined') {
                if(typeof this.options.fixed === 'number') {
                    if(this.options.fixed > 0) {
                        newValue += '.';
                        newValue += r.replace(new RegExp(`^([0-9]{0,${this.options.fixed}})(.*)`, 'g'), '$1');
                    }
                } else {
                    newValue += '.';
                    newValue += r;
                }
            }
        }

        const numberValue = Number(value);

        if(typeof this.options.min === 'number' && numberValue < this.options.min) {
            newValue = `${this.options.min}`;
        }

        if(typeof this.options.max === 'number' && numberValue > this.options.max) {
            newValue = `${this.options.max}`;
        }

        return [newValue, caret];
    }
    getNumbers(value) {
        return `${value}`.split('.').map((n, i) => i === 0 ? n || '0' : n);
    }

    validateNumbers(numbers) {
        if(numbers.length > 2)
            return false;

        const [ln, rn] = numbers.map(n => Number(n));

        if(!isFinite(ln))
            return false;

        if(typeof rn === 'number') {
            if(!isFinite(rn))
                return false;
        }

        return true;
    }

    exArrow(caret, key) {
        if(key === 'ArrowRight') {
            this.el.setSelectionRange(caret[0] + 1, caret[0] + 1);
            return true;
        }
        if(key === 'ArrowLeft') {
            if(caret[0] !== 0) {
                this.el.setSelectionRange(caret[0] - 1, caret[0] - 1);
            }
            return true;
        }
    }

    onPaste(e) {
        const caret = this.getCaret();
        const addedValue = e.clipboardData.getData('text') || '';

        this.setValue(addedValue, caret);

        this.changeHandler(addedValue);

        e.preventDefault();
        e.stopPropagation();

        this.firstDelete = false;

        return false;
    }
    onKeyDownMeta(e) {
        if(e.keyCode === this.metaKeys.ctrlKey || e.keyCode === this.metaKeys.cmdKey)
            this.metaKey = true;
    }
    onKeyUpMeta(e) {
        if(e.keyCode === this.metaKeys.ctrlKey || e.keyCode === this.metaKeys.cmdKey)
            this.metaKey = false;

        this.firstDelete = false;
    }
    onKeyDown(e) {
        if(this.metaKey)
            return;

        const caret = this.getCaret();

        if(!this.exArrow(caret, e.key)) {
            const future = this.getFutureValue(caret, e.key);
            const numbers = this.getNumbers(future);

            const validate = this.validateNumbers(numbers);

            if (validate) {
                const [newValue, newCaret] = this.getNormalValue(numbers.join('.'), caret);

                this.el.value = newValue;

                if(e.key === 'Backspace') {
                    if(newCaret[0] !== 0) {
                        if(newCaret[0] === newCaret[1]) {
                            this.el.setSelectionRange(newCaret[0] - 1, newCaret[0] - 1);
                        } else {
                            this.el.setSelectionRange(newCaret[0], newCaret[0]);
                        }
                    }
                } else {
                    this.el.setSelectionRange(newCaret[0] + 1, newCaret[0] + 1);
                }

                this.changeHandler(newValue);
            }
        }

        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    onBlur() {
        const value = this.getValue();
        const numbers = this.getNumbers(value)
            .map((n, i) => i === 0 ? Number(n) : n);

        this.el.value = numbers.join('.');

        this.changeHandler(numbers.join('.'));

        this.firstDelete = false;
    }

    onChange(handler) {
        this.changeHandler = handler;
    }

    initInput() {
        this.el.addEventListener('keydown', this.onKeyDownMeta.bind(this));
        this.el.addEventListener('keyup', this.onKeyUpMeta.bind(this));
        this.el.addEventListener('keydown', this.onKeyDown.bind(this));
        this.el.addEventListener('paste', this.onPaste.bind(this));
        this.el.addEventListener('blur', this.onBlur.bind(this));
    }
    destroy() {
        this.el.removeEventListener('keydown', this.onKeyDownMeta.bind(this));
        this.el.removeEventListener('keyup', this.onKeyUpMeta.bind(this));
        this.el.removeEventListener('keydown', this.onKeyDown.bind(this));
        this.el.removeEventListener('paste', this.onPaste.bind(this));
        this.el.removeEventListener('blur', this.onBlur.bind(this));
    }
};
