const jwt = require('jsonwebtoken');

const SECRET_KEY = 'SECRET';

const token = jwt.sign({
    'smi-request': 'a93408aef',
    'smi-request-key': 'jef9aefhWerju23488',
    'role': 'req'
}, SECRET_KEY)

console.log(token);

const payload = jwt.decode(token);
const verified = jwt.verify(token, SECRET_KEY);

console.log(verified);