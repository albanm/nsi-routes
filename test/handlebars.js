var should = require('should');
var routes = require('../');

describe('Handlebars simple templating', function() {
	var routesHelper;
	before(function() {
		routesHelper = routes();
	});
	var route1;
	it('should generate a route function from a template', function() {
		route1 = routesHelper.handlebars('test/resources/template1.hbs');
		should.equal(typeof route1, 'function');
	});
	it('should render the template', function(callback) {
		route1('testBody', {
			test: 'testHeader'
		}, function(err, responseMessage, responseHeaders) {
			should.not.exist(err);
			responseMessage.should.match(/Body: testBody/);
			responseMessage.should.match(/Header: testHeader/);
			callback();
		});
	});
});