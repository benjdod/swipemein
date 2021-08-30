exports.listRoutes = (router) => {

    const routes = router.stack
        .filter((middleware) => middleware.route)
        .filter(middleware => middleware.route.path !== '*')
        .map((middleware) => `${Object.keys(middleware.route.methods).join(', ').toUpperCase()} -> ${middleware.route.path}`)

    let out = '';

    routes.forEach(route => {
        out += `${route}\r\n`;
    })

    return `<pre>${out}</pre>`;
}