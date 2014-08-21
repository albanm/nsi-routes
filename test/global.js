var routes = require('../');

before(function() {
	global.routesHelper = routes({
		log: {
			active: false
		},
		monitor: {
			active: false
		}
	});
});