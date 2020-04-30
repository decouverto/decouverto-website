var mcache = require('memory-cache');

module.exports = (duration) => {
    return (req, res, next) => {
        res.setHeader('Access-Control-Allow-Headers', 'cache-control,expires');
        res.setHeader("Cache-Control", "public, max-age=259200");
        res.setHeader("Expires", new Date(Date.now() + 259200000).toUTCString());
        let key = '__express__' + req.originalUrl || req.url
        let cachedBody = mcache.get(key);
        if (cachedBody) {
            res.send(cachedBody);
            return
        } else {
            res.sendResponse = res.send;
            res.send = (body) => {
                mcache.put(key, body, duration * 1000);
                res.sendResponse(body);
            }
            next()
        }
    }
}