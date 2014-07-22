var _ = require('lodash');
var util = require('util');

module.exports = function wrap(route, name) {
	var that = this;
	var counter = 0;
	name = name || route.name || 'anonymous';
	return _.wrap(route, function(route, message, headers, callback) {
		// keep the current counter so that parallel calls to the route don't cause the IN and OUT logs
		// to display different counters
		var currentCounter = counter;
		counter += 1;

		var logPrefix = name + ' - ' + currentCounter;
		// headers are optional
		if (callback === undefined) {
			callback = headers;
			headers = {};
		}

		var inTimestamp = Date.now();
		that.log('debug', logPrefix + ' - IN message', util.inspect(message));
		that.log('debug', logPrefix + ' - IN headers', headers);

		route(message, headers, function(err, outMessage, outHeaders) {
			that.monitor(name, {
				duration: Date.now() - inTimestamp,
				route: name
			});
			// do not log errors at error level
			// because they might handled cleanly in the callback and not constitute an error of the program
			if (err) that.log('debug', logPrefix + ' - ERROR', util.inspect(err));
			that.log('debug', logPrefix + ' - OUT message', util.inspect(outMessage));
			that.log('debug', logPrefix + ' - OUT headers', outHeaders);
			callback(err, outMessage, outHeaders);
		});
	});
};