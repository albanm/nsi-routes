// A route builder that create routes for validating messages against a JSON schema
// The schema is fetched from a file and the file's changes are watched automatically

var fs = require('fs');
var path = require('path');
var JaySchema = require('jayschema');
var js = new JaySchema();

module.exports = function jsonSchema(fileName, routeName) {
	var that = this;
	var schema = null;
	routeName = routeName || 'validate-json.' + path.basename(fileName, '.json');

	that.log('info', routeName + ' - Initialize');

	if (that.options.watch) {
		fs.watch(fileName, {
			persistent: false
		}, function() {
			that.log('info', routeName + ' - Schema changed');
			schema = null;
		});
	}

	return that.wrap(function(message, headers, callback) {
		var objectMessage = message;
		if (typeof message === 'string') objectMessage = JSON.parse(message);
		if (!schema) {
			fs.readFile(fileName, 'utf8', function(err, data) {
				if (err) throw err;
				schema = JSON.parse(data);
				that.log('info', routeName + ' - Schema loaded');
				js.validate(objectMessage, schema, function(errs) {
					callback(errs, message, headers);
				});
			});
		} else {
			js.validate(objectMessage, schema, function(errs) {
				callback(errs, message, headers);
			});
		}
	}, routeName);
};