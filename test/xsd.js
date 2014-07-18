var should = require('should');
var routes = require('../');

describe('XSD schema validator route', function() {
	var routesHelper;
	before(function() {
		routesHelper = routes();
	});
	var route1;
	it('should generate a route function from a schema', function() {
		route1 = routesHelper.xsd('test/resources/schema1.xsd');
		should.equal(typeof route1, 'function');
	});
	it('should validate a xml string', function(callback) {
		route1('<?xml version="1.0"?><product><id>1</id><name>name1</name></product>', function(err, responseMessage, responseHeaders) {
			should.not.exist(err);
			callback();
		});
	});
	it('should return validation errors', function(callback) {
		route1('<?xml version="1.0"?><product><id>1</id></product>', function(err, responseMessage, responseHeaders) {
			err.should.have.lengthOf(1);
			callback();
		});
	});
});