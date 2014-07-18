var should = require('should');
var routes = require('../');

describe('route wrapping', function() {
	var routesHelper;
	before(function() {
		routesHelper = routes();
	});
	var route1;
	it('should wrap an asynchronous function', function() {
		route1 = routesHelper.wrap(function(message, headers, callback) {
			setTimeout(function() {
				callback(null, 'response', headers);
			}, 10);
		}, 'Route 1');
	});
	it('should preserve the original function', function(callback) {
		route1('message', {
			header1: 'header1'
		}, function(err, responseMessage, responseHeaders) {
			responseMessage.should.equal('response');
			responseHeaders.should.have.property('header1', 'header1');
			callback();
		});
	});
	it('should make the headers parameter optional', function(callback) {
		route1('message', function(err, responseMessage) {
			responseMessage.should.equal('response');
			callback();
		});
	});
});