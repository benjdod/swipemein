const minarray = () => {
    const arr = [6,5,2,9,10,4]

    let c = Number.MAX_VALUE;
    let a = 0;

    for (let i = 0; i < arr.length; i++) {
        if (arr[i] < c) {c = arr[i]; a = i;}
    }

    console.log(a);
}

const incAndWrap = () => {
    const radix = 4;

    let i = 0;

    const inc = () => {
        const ret = i;
        i += 1;
        if (i >= radix) i = 0;
        return ret;
    }

    for (let g = 0; g < 10; g++) console.log(inc());
}

incAndWrap();