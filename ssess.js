var crypto = require('crypto');
var cookie = require('cookie');
var cache = require('./lib/cache-redis'); // XXX: Make this an option, and pass options to the cache constructor


module.exports = function(opts) {
	opts = opts || {};
	var ttl = opts.ttl || 1209600; // Default: 2 weeks
	var name = opts.name || 'sid';
	var auto = opts.auto || false; // Should we automatically create a session for any visitor?
	
	function middleware(req, res, next) {
		req.cookies = cookie.parse(req.headers.cookie || '');
		var id = req.cookies[name];
		if(id == null && !auto) return next();
		cache.get(id, function(s) {
			if(s == null) {
				if(auto) s = middleware.create(res, opts);
				else return next();
			}
			req.session = s; // Attach the session object to req for easy access
			cache.expire(s.id, ttl);
			next();
		});
	}
	
	middleware.create = function(res) {
		var id = crypto.randomBytes(20).toString('base64').replace(/=+$/, '');
		// Must be called before writeHead or write have been called on `res`
		setCookie(res, name, id, ttl * 1000);
		return cache.create(id);
	}
	middleware.destroy = function(res, session) {
		if(session) cache.destroy(session.id);
		setCookie(res, name, '', -86400);
	}
	
	return middleware;
}

function setCookie(res, name, val, relExp) {
	var h = res.getHeader('Set-Cookie'); // Don't stomp any other cookies
	if(h == null) h = [];
	else if(typeof h == 'string') h = [h];
	h.push(cookie.serialize(name, val, {expires: new Date(Date.now() + relExp), path: '/', httpOnly: true}));
	res.setHeader('Set-Cookie', h);
}