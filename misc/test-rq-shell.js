const redis = require('redis');
const { addRequest, pendRequest, getActiveRequests, unpendRequest } = require('../server/endpoints/requests-shell');

const f = async () => {
    const s = await addRequest('ello');
    await addRequest({zink: 0x1f});
    await addRequest('joplin');
    await pendRequest('ello', s);
    await unpendRequest(s);
    //process.exit(0);
}

const g = async () => {
    /*
    for (let i = 0; i < 20; i++) {
        await addRequest(`this is request no. ${20 - i}`);
    }*/

    console.log(await getActiveRequests());
}

setTimeout(f, 1000);
setTimeout(g, 2000);