angular
	.module('app')
	.factory('Notifications', function($resource) {
		return $resource('/api/notifications/:id',{}, {
			markAsRead: {method: 'GET', url: '/api/notifications/markAsRead'},
		});
	});
