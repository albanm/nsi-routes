var _ = require("lodash");
var winston = require('winston');

var jsonSchema = require('./lib/json-schema');

function RoutesManager(options) {
	this.options = _.merge({
		before: null,
		after: null,
		profile: true,
		log: {
			active: true,
			config: {
				console: {
					level: 'info',
					colorize: 'true',
					label: 'NSI - Routes'
				}
			}
		}
	}, options);

	winston.loggers.add('nsi-routes', this.options.log.config);
	this.logger = winston.loggers.get('nsi-routes');
	this.log = function(level, message, metadata) {
		if (this.options.log.active) this.logger.log(level, message, metadata || null);
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

module.exports = function(options) {
	var routesManager = new RoutesManager(options);
	// bind all functions to the routes manager so that they can be passed by reference
	_.bindAll(routesManager);
	return routesManager;
};