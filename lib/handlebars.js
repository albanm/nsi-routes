// A route builder that create routes for rendering handlebars templates
// The template source is fetched from a file and the file's changes are watched automatically

var fs = require('fs');
var path = require('path');
var handlebars = require('handlebars');

module.exports = function handlebarsRoute(fileName, routeName) {
	var that = this;
	var template = null;
	routeName = routeName || 'handlebars.' + path.basename(fileName, '.hbs');

	that.log('info', routeName + ' - Initialize');

	if (that.options.watch) {
		fs.watch(fileName, {
			persistent: false
		}, function() {
			that.log('info', routeName + ' - Template changed');
			template = null;
		});
	}

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
			// use nextTick to make the route asynchronous
			process.nextTick(function() {
				callback(null, responseBody, headers);
			});
		}
	}, routeName);
};