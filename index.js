var _ = require("lodash");
var winston = require('winston');
var Elasticsearch = require( 'winston-elasticsearch' );

function RoutesManager(options) {
	var that = this;

	that.options = _.merge({
		before: null, // a function to run as a before hook, signature: function(body, headers, callback)
		after: null,  // a function to run as a after hook, signature: function(err, body, headers),
		watch: false, // set to true to enable watching file resources (schemas, templates, etc)
		log: {        // main logger configuration. info=routes initialization, debug=all messages contents
			active: true,
			config: { // winston configuration, see https://github.com/flatiron/winston#working-with-multiple-loggers-in-winston
				console: {
					level: 'info',
					colorize: 'true',
					label: 'nsi.routes'
				}
			},
			metadata: {} // add metadata to all logs
		},
		monitor: {    // monitoring logger. Used to profile all routes durations.
			active: true,
			config: { // winston configuration, see https://github.com/flatiron/winston#working-with-multiple-loggers-in-winston
				console: {
					level: 'info',
					colorize: 'true',
					label: 'nsi.monitor'
				},
				elasticsearch: { // send monitoring logs to elasticsearch to maybe use kibana, see https://github.com/jackdbernier/winston-elasticsearch
					level: 'error', // error by default = disabling it, just set level to 'info' and here we go
					indexName: 'nsi-routes',
					source: 'NSI - Routes',
					disable_fields: true,
					typeName: 'log'
				}
			},
			metadata: {}  // add metadata to all logs
		}
	}, options);

	winston.loggers.add('nsi-routes', that.options.log.config);
	that.logger = winston.loggers.get('nsi-routes');

	that.log = function(level, message, metadata) {
		if (that.options.log.active) that.logger.log(level, message, _.extend(metadata || {}, that.options.log.metadata));
	};

	winston.loggers.add('nsi-monitor', that.options.monitor.config);
	that.monitorLogger = winston.loggers.get('nsi-monitor');

	that.monitor = function(message, metadata) {
		if (that.options.monitor.active) {
			that.monitorLogger.info(message, _.extend(metadata, that.options.monitor.metadata), function(err) {
				// log failure of the monitor logger in the log logger. This is quite arbitratyr but
				// the monitor logger is more susceptible to fail as it can use elasticsearch
				if (err) that.logger.error('Monitoring failure', {
					originalMessage: message,
					originalMetadata: metadata,
					error: err
				});
			});
		}
	};
}

// For commons routes use getters that use require.
// This prevents loading all routes and their dependancies even if they are not needed.
RoutesManager.prototype.__defineGetter__('wrap', function() {
	return require('./lib/wrap');
});
RoutesManager.prototype.__defineGetter__('jsonSchema', function() {
	return require('./lib/json-schema');
});
RoutesManager.prototype.__defineGetter__('xsd', function() {
	return require('./lib/xsd');
});
RoutesManager.prototype.__defineGetter__('to', function() {
	return require('./lib/queues').to;
});
RoutesManager.prototype.__defineGetter__('inOut', function() {
	return require('./lib/queues').inOut;
});
RoutesManager.prototype.__defineGetter__('http', function() {
	return require('./lib/http');
});
RoutesManager.prototype.__defineGetter__('handlebars', function() {
	return require('./lib/handlebars');
});
RoutesManager.prototype.__defineGetter__('xslt', function() {
	return require('./lib/xslt');
});

module.exports = function(options) {
	var routesManager = new RoutesManager(options);
	// bind all functions to the routes manager so that they can be passed by reference
	_.bindAll(routesManager);
	return routesManager;
};