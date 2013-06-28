var client = require('redis').createClient();

function Session(id, data) {
	this.id = id;
	this._data = {};
	data = data || {};
	for(var i in data) {
		this._data[i] = JSON.parse(data[i]);
	}
}
Session.prototype = {
	get: function(k) {
		return this._data[k];
	},
	set: function(k, v) {
		this._data[k] = v;
		client.hset('d:' + this.id, k, JSON.stringify(v));
	},
	del: function(k) {
		delete this._data[k];
		client.hdel('d:' + this.id, k);
	},
	clear: function() {
		this._data = {};
		client.del('d:' + this.id);
	}
};

exports.get = function(id, cb) {
	client.exists('s:' + id, function(err, exists) {
		if(exists) {
			client.hgetall('d:' + id, function(err, data) {
				cb(new Session(id, data));
			});
			return;
		}
		cb();
	});
}
exports.create = function(id) {
	client.set('s:' + id, '1');
	return new Session(id);
}
exports.expire = function(id, sec) {
	client.expire('s:' + id, sec);
	client.expire('d:' + id, sec);
}
exports.destroy = function(id) {
	client.del('s:' + id);
	client.del('d:' + id);
}
