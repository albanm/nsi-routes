nsi-routes
==========

[![Build status](https://travis-ci.org/albanm/nsi-routes.svg)](https://travis-ci.org/albanm/nsi-routes)
[![Code Climate](https://codeclimate.com/github/albanm/nsi-routes/badges/gpa.svg)](https://codeclimate.com/github/albanm/nsi-routes)
[![Coverage Status](https://coveralls.io/repos/albanm/nsi-routes/badge.png)](https://coveralls.io/r/albanm/nsi-routes)
[![NPM version](https://badge.fury.io/js/nsi-routes.svg)](http://badge.fury.io/js/nsi-routes)

*Node.js Services Integration - Routes commons*

This project proposes a convention for asynchronous functions used to connect services together.
Using this convention we can build wrappers of functions that will allow us to do some tracing and profiling accross all routes with very little code footprints.

This project also comes with a number of predefined functions or *routes*, that are here purely as shortcuts to improve productivity. They also do a few things like watching resources changes to make your life easier.

Install
-------

    npm install nsi-routes

Basic usage
-----------

Initialize a routes helper with default options.

```js
var nsiRoutes = require('nsi-routes');

var routesHelper = nsiRoutes();
```

Optionaly you can use an *options* object as parameter.

```js
{
	before: null,  // a function to run as a before hook, signature: function(body, headers, callback)
	after: null,   // a function to run as a after hook, signature: function(err, body, headers)
	log: {
		active: true, // activate creation of a logger
		config: {     // see https://github.com/flatiron/winston#working-with-multiple-loggers-in-winston
			console: {
				level: 'info',
				colorize: 'true',
				label: 'NSI - Routes'
			}
		}
	}
}
```

Wrap a *route* to allow profiling, tracing, etc. First parameter of *wrap()* is the function, second parameter is a name.
The wrapping also implicitly render the headers parameter optional, if not defined it will be replaced by an empty object when sent to the original function.

```js
route = routesHelper.wrap(function(body, headers, callback) {
	// do stuff with message before responding
	callback(null, 'response', headers);
}, 'Route 1');

// use the resulting function as you would have used the original
route('body', function(err, responseBody, responseHeaders){
	// do stuff with the response
});
```

Advanced usage
--------------

For recipes with more advanced usage of this module, have a look at its parent project [NSI](https://github.com/albanm/nsi).

Common routes
-------------

### NSI Queues wrappers

Simple wrappers for the already simple message sending functions from [NSI - Queues helpers](https://github.com/albanm/nsi-queues).

```js
var route = routesHelper.to(queuesHelper, 'my.queue');
route('body', function(err){
	if (err) console.log('Message sending failed.');
	else console.log('Message was sent and acknowledged !');
});

var route = routesHelper.inOut(queuesHelper, 'my.queue');
route('body', function(err){
	if (err) console.log('Message sending failed.');
	else console.log('Response received: ' + body);
});
```

### JSON schema validation

Validate messages, either text or object using a [JSON schema](http://json-schema.org/) loaded from a file and reloaded if the file changes. Uses [JaySchema](https://github.com/natesilva/jayschema).

```js
route = routesHelper.jsonSchema('test/resources/schema1.json');

route('{"id":1, "name":"name1"}', function(errs, responseBody, responseHeaders) {
	// errs is either null or an array of validation errors
	// response body and headers are the same as inputs
});
```

### XSD validation

Validate XML messages using a XML Schema Definition loaded from a file and reloaded if the file changes. Uses [libxmljs](https://github.com/polotek/libxmljs).

```js
route = routesHelper.xsd('test/resources/schema1.xsd');

route('<?xml version="1.0"?><product><id>1</id><name>name1</name></product>', function(errs, responseBody, responseHeaders) {
	// errs is either null or an array of validation errors
	// response body and headers are the same as inputs
});
```

### Handlebars templating

Transform your messages using the simple templating engine [Handlebars](http://handlebarsjs.com/).

```js
route = routesHelper.handlebars('test/resources/template1.xsd');

route('my message body', function(err, responseBody, responseHeaders) {
	// response headers are the same as inputs
});
```

The body and headers will be available in the template. For example:

    'This is a template. My body: {{body}}, and a header: {{headers.myHeader}}.'

### HTTP requests

Send any kind of HTTP requests, using [request](https://github.com/mikeal/request).

The url used to initialize the route is a [Handlebars](http://handlebarsjs.com/) template that will be rendered
at each execution of the route using the current body and headers.

If the body of the message if a javascript object, then the content will be sent as JSON and the response parsed as well.

```js
route = routesHelper.http('GET', 'http://localhost:9615/test/{{body}}?q={{headers.query}}');

route('my message body', function(err, responseBody, responseHeaders) {
	// response headers are the same as inputs
});
```

### XSL transformation

**TODO**. Using [https://github.com/bsuh/node_xslt](node_xslt), needs a little bit of configuration.
