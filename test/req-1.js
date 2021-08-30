const { ClientFunction, Selector, Role } = require('testcafe');

fixture `req-1`
    .page('http://localhost:8080/new-request');

test.meta('role', 'requester')
('create and delete request', async t => {

    const now = new Date(Date.now());
    const init_time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    const getCookies = ClientFunction(() => document.cookie);

    await t
        .typeText('#field-name', 'Gink')
        .typeText('#field-classyear', '2022')
        .typeText('#field-time', init_time)
        .typeText('#field-message', 'Hello, I\'m Gink.')
        .click('#submit-request')
        .expect(getCookies()).contains('smi-request')
        .expect(getCookies()).contains('smi-request-key')
        .click('#delete-request')
        .click(Selector('#delete-request-dialog').child('.confirm'))
        .expect(getCookies()).notContains('smi-request')
        .expect(getCookies()).notContains('smi-request-key');
});

const requester = Role(`http://localhost:8080/new-request`, async t => {
    const now = new Date(Date.now());
    const init_time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    await t
        .typeText('#field-name', 'Gink')
        .typeText('#field-classyear', '2022')
        .typeText('#field-time', init_time)
        .typeText('#field-message', 'Hello, I\'m Gink.')
        .click('#submit-request')
})

const provider = Role(`http://localhost:8080/new-provider`, async t=> {
    await t
        .typeText('#field-name', 'Blemmy')
        .click('#submit-provider')
})

test
.meta('role', 'both')
('simple accept and cancel', async t => {

    const getLocation = ClientFunction(() => document.location.href);

    await t
        .useRole(requester)
        .navigateTo('http://localhost:8080/active-request')
        .expect(getLocation()).contains('active-request')
        .expect(Selector('#request-message').textContent).eql(`Hello, I'm Gink.`);
})