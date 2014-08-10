nsi-routes
==========

[![Build status](https://travis-ci.org/albanm/nsi-routes.svg)](https://travis-ci.org/albanm/nsi-routes)
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
	before: null,  // a function to run as a before hook, signature: function(message, headers, callback)
	after: null,   // a function to run as a after hook, signature: function(err, message, headers)
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
route = routesHelper.wrap(function(message, headers, callback) {
	// do stuff with message before responding
	callback(null, 'response', headers);
}, 'Route 1');

// use the resulting function as you would have used the original
route('message', function(err, responseMessage, responseHeaders){
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
route('message', function(err){
	if (err) console.log('Message sending failed.');
	else console.log('Message was sent and acknowledged !');
});

var route = routesHelper.inOut(queuesHelper, 'my.queue');
route('message', function(err){
	if (err) console.log('Message sending failed.');
	else console.log('Response received: ' + message);
});
```

### JSON schema validation

Validate messages, either text or object using a [JSON schema](http://json-schema.org/) loaded from a file and reloaded if the file changes. Uses [JaySchema](https://github.com/natesilva/jayschema).

```js
route = routesHelper.jsonSchema('test/resources/schema1.json');

route('{"id":1, "name":"name1"}', function(errs, responseMessage, responseHeaders) {
	// errs is either null or an array of validation errors
	// response message and headers are the same as inputs
});
```

### XSD validation

Validate XML messages using a XML Schema Definition loaded from a file and reloaded if the file changes. Uses [libxmljs](https://github.com/polotek/libxmljs).

```js
route = routesHelper.xsd('test/resources/schema1.xsd');

route('<?xml version="1.0"?><product><id>1</id><name>name1</name></product>', function(errs, responseMessage, responseHeaders) {
	// errs is either null or an array of validation errors
	// response message and headers are the same as inputs
});
```

### Handlebars templating

Useful for easy as pie rendering of textual templates base on messages and headers.

**TODO**

### XSL transformation

**TODO**. Using [https://github.com/bsuh/node_xslt](node_xslt), needs a little bit of configuration.
