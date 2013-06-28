# ssess

Simple session middleware

**Now less of an incoherent mess! Call today!**

**Install** `npm install ssess`

## Example
```javascript
var ssess = require('ssess');
var manager = ssess(); // Create a session manager

middlewareStack.push(manager); // Use in your middleware stack

function login(req, res, user) {
	var userSession = manager.create(res); // Pass res to allow cookie setting
	userSession.set('user', user);
}

function userPage(req, res) {
	var user = req.session.get('user');
	// Display something using the user data
	req.session.set('ticketNumber', Math.random());
}

function logout(req, res) {
	req.session.destroy(res); // Needs res to delete cookies
}
```

## API

### ssess([options])

```javascript
{
	ttl: 500, // Seconds to keep session alive without a refresh, defaults to 2 weeks
	name: 'deadbeef', // The cookie name, defaults to 'sid'
	auto: true // Automatically create a session for every visitor, defaults to false
}
```
* Returns a new session manager, shown below

### manager.create(res)

* `res` is the response object, used to send the cookie to the client
* Returns an individual visitor session, shown below

### manager.destroy(res, session)
	* Need `res` to kill the cookie on the client
	* Delete contents of session and remove it from the manager

### session
* **get(key)**

* **set(key, value)**

* **del(key)**

* **clear()**
	* Clear all data in the session

* **id**
	* Just in case the session is passed to something that needs to know it's id
	* This is the value of the cookie sent to the client, and the key used to lookup this session in the manager


Note: Adds `cookies` and `session` properties to `req`
