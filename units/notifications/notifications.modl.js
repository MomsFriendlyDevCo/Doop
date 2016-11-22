angular
	.module('app')
	.factory('Notifications', function($resource) {
		return $resource('/api/notifications/:id',{}, {
			count: {method: 'GET', url: '/api/notifications/count'},
			markAsRead: {method: 'GET', url: '/api/notifications/markAsRead'},
		});
	});
