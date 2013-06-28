var http = require('http');
var ssess = require('./ssess');
var moka = require('moka');
var describe = moka.describe;


function createServer(cb) {
	var app = http.createServer(function(req, res) {
		session(req, res, function() {
			cb(req, res);
		});
	});
	return app;
}

var req, res, sid, session;
function newDummies() {
	var req = {
		headers: {}
	};
	var res = {
		headers: {},
		setHeader: function(name, value) {
			res.headers[name.toLowerCase()] = value;
		},
		getHeader: function(name) {
			return res.headers[name.toLowerCase()];
		}
	}
	return {req: req, res: res};
}

describe('default session', function(it, beforeEach, before) {
	before(function() {
		manager = ssess();
	});
	beforeEach(function() {
		var d = newDummies();
		req = d.req;
		res = d.res;
	});
	it('creates a session', function(done) {
		var s = manager.create(res);
		manager(req, res, function() {
			sid = s.id;
			if(res.getHeader('set-cookie')[0].indexOf('sid=') != 0) throw new Error();
			done();
		});
	});
	it('gets the session by sid', function(done) {
		req.headers.cookie = 'sid=' + sid;
		manager(req, res, function() {
			if(req.session == null) throw new Error();
			done();
		});
	});
	it('adds data to the session', function(done) {
		req.headers.cookie = 'sid=' + sid;
		manager(req, res, function() {
			req.session.set('somethin', 'testy');
			done();
		});
	});
	it('reads data back out of the session', function(done) {
		req.headers.cookie = 'sid=' + sid;
		manager(req, res, function() {
			var t = req.session.get('somethin');
			if(t != 'testy') throw new Error();
			done();
		});
	});
	it('clears the session', function(done) {
		req.headers.cookie = 'sid=' + sid;
		manager(req, res, function() {
			req.session.clear();
			done();
		});
	});
	it('finds no data in the session', function(done) {
		req.headers.cookie = 'sid=' + sid;
		manager(req, res, function() {
			var t = req.session.get('somethin');
			if(t != null) throw new Error();
			done();
		});
	});
	it('destroys the session', function(done) {
		req.headers.cookie = 'sid=' + sid;
		manager(req, res, function() {
			manager.destroy(res, req.session);
			if(res.getHeader('set-cookie')[0].indexOf('sid=') != 0) throw new Error();
			done();
		});
	});
	it('has no session', function(done) {
		req.headers.cookie = 'sid=' + sid;
		manager(req, res, function() {
			if(req.session != null) throw new Error();
			if(res.getHeader('set-cookie') != null) throw new Error();
			done();
		});
	});
});

describe('auto session with custom name', function(it, beforeEach, before, after) {
	before(function() {
		manager = ssess({name: 'troutslap', auto: true});
	});
	beforeEach(function() {
		var d = newDummies();
		req = d.req;
		res = d.res;
	});
	it('creates a session automatically', function(done) {
		manager(req, res, function() {
			sid = req.session.id;
			if(res.getHeader('set-cookie')[0].indexOf('troutslap=') != 0) throw new Error();
			done();
		});
	});
	it('adds data to the session', function(done) {
		req.headers.cookie = 'troutslap=' + sid;
		manager(req, res, function() {
			req.session.set('somethin', 'testy');
			done();
		});
	});
	it('reads data back out of the session', function(done) {
		req.headers.cookie = 'troutslap=' + sid;
		manager(req, res, function() {
			var t = req.session.get('somethin');
			if(t != 'testy') throw new Error();
			done();
		});
	});
	it('destroys the session', function(done) {
		req.headers.cookie = 'troutslap=' + sid;
		manager(req, res, function() {
			manager.destroy(res, req.session);
			if(res.getHeader('set-cookie')[0].indexOf('troutslap=') != 0) throw new Error();
			done();
		});
	});
	it('automatically creates a new session', function(done) {
		req.headers.cookie = 'troutslap=' + sid;
		manager(req, res, function() {
			if(res.getHeader('set-cookie')[0].indexOf('troutslap=') != 0) throw new Error();
			done();
		});
	});
	after(function() {
		manager.destroy(res, req.session);
	});
});

describe('session with short expiration', function(it, beforeEach, before) {
	before(function() {
		manager = ssess({ttl: 2});
	});
	beforeEach(function() {
		var d = newDummies();
		req = d.req;
		res = d.res;
	});
	it('creates a session', function(done) {
		var s = manager.create(res);
		manager(req, res, function() {
			sid = s.id;
			if(res.getHeader('set-cookie')[0].indexOf('sid=') != 0) throw new Error();
			done();
		});
	});
	it('adds data to the session', function(done) {
		req.headers.cookie = 'sid=' + sid;
		manager(req, res, function() {
			req.session.set('somethin', 'testy');
			done();
		});
	});
	it('reads data back out of the session', function(done) {
		req.headers.cookie = 'sid=' + sid;
		manager(req, res, function() {
			var t = req.session.get('somethin');
			if(t != 'testy') throw new Error();
			done();
		});
	});
	it('waits for session to expire', function(done) {
		setTimeout(function() {
			done();
		}, 3000);
	});
	it('has no session', function(done) {
		req.headers.cookie = 'sid=' + sid;
		manager(req, res, function() {
			if(req.session != null) throw new Error();
			if(res.getHeader('set-cookie') != null) throw new Error();
			done();
		});
	});
});

moka.run({parallel: false});