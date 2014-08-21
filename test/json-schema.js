var should = require('should');
var routes = require('../');

describe('JSON schema validator route', function() {
	var route1;
	it('should generate a route function from a schema', function() {
		route1 = routesHelper.jsonSchema('test/resources/schema1.json');
		should.equal(typeof route1, 'function');
	});
	it('should validate an object', function(callback) {
		route1({
			id: 1,
			name: "name1"
		}, function(err, responseMessage, responseHeaders) {
			should.not.exist(err);
			callback();
		});
	});
	it('should validate a string JSON', function(callback) {
		route1('{"id":1, "name":"name1"}', function(err, responseMessage, responseHeaders) {
			should.not.exist(err);
			callback();
		});
	});
	it('should return validation errors', function(callback) {
		route1({
			id: "1",
			name: "name1"
		}, function(err, responseMessage, responseHeaders) {
			err.should.have.lengthOf(1);
			callback();
		});
	});
});