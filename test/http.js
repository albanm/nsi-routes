var should = require('should');
var http = require('http');

var routes = require('../');

describe('HTTP requests', function() {

	var httpServer;
	var httpCallback;
	before(function(callback) {
		httpServer = http.createServer(function(req, res){
			httpCallback(req, res);
		}).listen(9615, callback);
	});
	after(function(){
		httpServer.close();
	});

	var route1;
	it('should generate a route function from HTTP method and a URL template', function() {
		route1 = routesHelper.http('GET', 'http://localhost:9615/test/{{body}}?q={{headers.query}}');
		should.equal(typeof route1, 'function');
	});

	it('should send a request', function(callback) {
		httpCallback = function(req, res) {
			req.method.should.equal('GET');
			req.url.should.equal('/test/testBody?q=testHeader');
			res.writeHead(200);
			res.end('response');
		};

		route1('testBody', {
			query: 'testHeader'
		}, function(err, responseMessage, responseHeaders) {
			should.not.exist(err);
			responseMessage.should.equal('response');
			callback();
		});
	});
});