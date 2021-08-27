const crypto = require('crypto');

const algorithm = 'aes-256-ctr';
const secret = process.env['ENCRYPT_SECRET'] || 'j0fela9fifo3le9a';
const key = crypto.createHash('sha256').update(String(secret)).digest('base64').slice(0,32);
//const key = 'j0fela9fifo3le9aj0fela9fifo3le9a'
//const iv = crypto.randomBytes(16);
const iv = new Uint8Array(16);
for (let i = 0; i < iv.length; i++) {
    iv[i] = i;
}

exports.encryptScore = (score) => {
    if (typeof score !== 'string') score = score.toString();
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(score), cipher.final()]);
    return encrypted.toString('hex');
}  

exports.decryptScore = (score) => {
    console.log('decrypting: ', score);
    score = score.toString();
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(score, 'hex')), decipher.final()]);
    console.log('decrypted to: ', decrypted.toString())
    return parseInt(decrypted.toString());
}