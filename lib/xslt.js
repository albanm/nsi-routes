// A route builder that create routes for applying xsl transformation
// The stylesheet source is fetched from a file and the file's changes are watched automatically

var fs = require('fs');
var path = require('path');
var libxslt = require('libxslt');

module.exports = function xsltRoute(fileName, routeName) {
	var that = this;
	var stylesheet = null;
	routeName = routeName || 'xslt.' + path.basename(fileName, '.xsl');

	that.log('info', routeName + ' - Initialize');

	if (that.options.watch) {
		fs.watch(fileName, {
			persistent: false
		}, function() {
			that.log('info', routeName + ' - Stylesheet changed');
			stylesheet = null;
		});
	}
	
	return that.wrap(function(body, headers, callback) {
		if (!stylesheet) {
			fs.readFile(fileName, 'utf8', function(err, data) {
				if (err) throw err;
				stylesheet = libxslt.parse(data);
				stylesheet.apply(body, headers, function(err, result){
					callback(err, result, headers);
				});
			});
		} else {
			stylesheet.apply(body, headers, function(err, result){
				callback(err, result, headers);
			});
		}
	}, routeName);
};