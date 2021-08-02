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
    client.set('test:k', '0');
    client.multi()
        .incr('test:k')
        .incr('test:k')
        .incr('test:k')
        .exec();
    client.get('test:k', (e, val) => {
        console.log(val);
    })
}

inc();

client.quit();