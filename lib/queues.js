// A set of route builders that create routes from a queues helper, cf nsi-queues

exports.to = function(queuesHelper, queue, routeName) {
	var that = this;
	routeName = routeName || 'to.' + queue;

	that.log('info', routeName + ' - Initialize');

	return that.wrap(function(message, headers, callback) {
		queuesHelper.to(queue, message, headers, callback);
	}, routeName);
};

exports.inOut = function(queuesHelper, queue, routeName) {
	var that = this;
	routeName = routeName || 'in-out.' + queue;

	that.log('info', routeName + ' - Initialize');

	return that.wrap(function(message, headers, callback) {
		queuesHelper.inOut(queue, message, headers, callback);
	}, routeName);
};