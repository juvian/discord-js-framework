class WordIterator {
    constructor(str) {
        this.str = str;
        this.indexes = [];
        this.currentIndex = 0;

        for (let i = 1; i < str.length; i++) {
            if (str[i] !== ' ' && (str[i] === ' ' || i + 1 == str.length)) {
                this.indexes.push(i);
            }
        }
    }

    *[Symbol.iterator]() {
        for (let i = this.currentIndex; i < this.indexes.length; i++) {
            yield [this.currentIndex - i + 1, this.str.substring(0, this.indexes[i])];
        }
    }

    forward(qty) {
        this.currentIndex += qty;
    }

    backward(qty) {
        this.currentIndex -= qty;
    }
    
}

module.exports = WordIterator;