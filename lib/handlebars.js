// A route builder that create routes for rendering handlebars templates
// The template source is fetched from a file and the file's changes are watched automatically

var fs = require('fs');
var path = require('path');
var handlebars = require('handlebars');

module.exports = function jsonSchema(fileName, routeName) {
	var that = this;
	var template = null;
	routeName = routeName || 'handlebars.' + path.basename(fileName, '.hbs');

	that.log('info', routeName + ' - Initialize');

	fs.watch(fileName, {
		persistent: false
	}, function() {
		that.log('info', routeName + ' - Schema changed');
		template = null;
	});

	return that.wrap(function(body, headers, callback) {
		if (!template) {
			fs.readFile(fileName, 'utf8', function(err, data) {
				if (err) throw err;
				template = handlebars.compile(data);
				var responseBody = template({
					body: body,
					headers: headers
				});
				callback(null, responseBody, headers);
			});
		} else {
			var responseBody = template({
				body: body,
				headers: headers
			});
			callback(null, responseBody, headers);
		}
	}, routeName);
};