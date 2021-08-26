const redis = require('redis');
const crypto = require('crypto');

const client = redis.createClient(6379);

const { promisify } = require('util');

// your commands here!
// e.g. client.set('hello', 'world');

const parseScoredZRange = (range) => {
    let i;

    let out = [];

    for (i = 0; i < range.length; i++) {
        if (i % 2 == 0) {
            out.push([range[i]])
        } else {
            out[out.length-1].push(parseInt(range[i]));
        }
    }

    return out;
}

const doAsync = async () => {

    const zrangeAsync = promisify(client.zrange).bind(client);

    console.log('doing some async stuff!');
    try {
        const range = await zrangeAsync('test:zset', range_start, range_end, 'WITHSCORES');
        console.log(parseScoredZRange(range).length);
    } catch (e) {
        console.error(e);
    }
}

const inc = () => {
    client.get('hello', (e, s) => {
        console.log(s);
    });
}

const multiExec = async () => {
    const p = new Promise((resolve, reject) => {
        client.multi()
        .set('hello', 'there')
        .get('hello')
        .set('hello', 'sing')
        .get('hello')
        .exec((err, replies) => {

            if (err)
                reject(err)

            resolve(replies)
        })
    })

    

    const replies = await p;
    console.log(replies);
    console.log('promise finished');
    return;
}

//inc();
multiExec();

//client.quit();