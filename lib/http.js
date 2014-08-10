// A set of route builders that create routes for HTTP requests

var request = require('request');
var handlebars = require('handlebars');
require('simple-errors');

module.exports = function(method, urlTemplateSource, routeName) {
	var that = this;

	that.log('info', routeName + ' - Initialize');

	var urlTemplate = handlebars.compile(urlTemplateSource);

	return that.wrap(function(body, headers, callback) {
		var options = {
			method: method
		};
		options.url = urlTemplate({
			body: body,
			headers: headers
		});

		that.log('debug', routeName + ' - URL resolved to %s', options.url);

		// if the message is an object, request will set content-type as JSON
		if (typeof body === 'object') {
			options.json = body;
		} else {
			options.body = body;
		}

		request(options, function(err, response, responseBody){
			if (err) return callback(err);
			if (response.statusCode < 200 || response.statusCode >= 300) return callback(Error.http(response.statusCode, responseBody));
			callback(null, responseBody, response.headers);
		});

	}, routeName);
};
