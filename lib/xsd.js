// A route builder that create routes for validating XML messages against a XSD schema
// The schema is fetched from a file and the file's changes are watched automatically

var fs = require('fs');
libxml = require('libxmljs');

module.exports = function xsd(fileName) {
	var that = this;
	var schema = null;
	var routeName = 'XSD schema validation - ' + fileName;

	that.log('info', routeName + ' - Initialize');

	fs.watch(fileName, {
		persistent: false
	}, function() {
		that.log('info', routeName + ' - Schema changed');
		schema = null;
	});

	return that.wrap(function(message, headers, callback) {
		var xmlMessage = libxml.parseXmlString(message);
		if (!schema) {
			fs.readFile(fileName, 'utf8', function(err, data) {
				if (err) throw err;
				schema = libxml.parseXmlString(data);
				that.log('info', routeName + ' - Schema loaded');

				var valid = xmlMessage.validate(schema);
				if (!valid) callback(xmlMessage.validationErrors, message, headers);
				else callback(null, message, headers);
			});
		} else {
			var valid = xmlMessage.validate(schema);
			if (!valid) callback(xmlMessage.validationErrors, message, headers);
			else callback(null, message, headers);
		}
	}, routeName);
};