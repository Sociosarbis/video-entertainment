const maxLength = 5;
const searchOrderedArr = (arr, start, end, ref) => {
    let indexShouldInsertIn; 
    if (end - start < 2) {
        if (ref <= arr[end]) {
            indexShouldInsertIn = end + 1;
        } else if (ref > end && ref <= start) {
            indexShouldInsertIn = start + 1; 
        } else {
            indexShouldInsertIn = start;
        }
    } else {
        const mid = (start + end) / 2 | 0;
        if (ref > arr[mid]) {
            indexShouldInsertIn = searchOrderedArr(arr, start, mid - 1, ref);
        } else if (ref < arr[mid]) {
            indexShouldInsertIn = searchOrderedArr(arr, mid + 1, end, ref);
        } else {
            indexShouldInsertIn = mid +1;
        }
    }
    return indexShouldInsertIn;
}
const moveArrFromTo = (arr, start, end) => {
    let i = end;
    for (;i >= start;i--) {
        arr[i + 1] = arr[i];
    }
}
const updateArr = (arr, ref) => {
    const refIndex = arr.findIndex(item => item === ref);
    const indexShouldInsertIn = searchOrderedArr(arr, 0, arr.length, ref)
    if (indexShouldInsertIn < arr.length) {
        if (refIndex <0) {
            moveArrFromTo(arr, indexShouldInsertIn, arr.length - 1);
        } else {
            moveArrFromTo(arr, indexShouldInsertIn, refIndex + 1);
        }
    }
    arr[indexShouldInsertIn] = ref;
    if (arr.length > maxLength) {
        arr.splice(maxLength, arr.length - maxLength);
    }
    return arr;
}

const scoreBar = function (openid, index) {
    this.openid = openid;
    this._index = index;
    this.view = ids.scoreBoard.clone(ids.scoreBar, null, {
        x,
        y: idx * ids.scoreBar.height,
    }, false);
    this.propsBinding();
}

scoreBar.prototype = {
    propsBinding: function () {
        Reflect.defineProperty(this, 'index', {
            get:function () {
                return this._index;
            },
            set: function (idx) {
                this._index = idx;
                this.view.tweenTo({
                    'y': idx * this.view.height
                }, 0.1, 'linear');
            }
         });
    }
}

this.__firstClass = Object.keys(this.__userList)
    .slice(0,maxLength)
    .map((oid, index) => new scoreBar(oid, index));