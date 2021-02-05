module.exports = {
	users: [
		{
			$: 'users.admin',
			username: 'admin',
			password: 'qwaszx',
			name: 'Admin',
			email: 'admin@mfdc.biz',
			role: 'root',
			status: 'active',
			permissions: {
				debug: true,
				usersDelete: true,
				usersEdit: true,
				usersInvite: true,
			},
		},
		{
			$: 'users.mc',
			username: 'mc',
			password: 'qwaszx',
			name: 'MC',
			email: 'matt@mfdc.biz',
			role: 'user',
			status: 'active',
			permissions: {
				debug: true,
				usersDelete: true,
				usersEdit: true,
				usersInvite: true,
			},
		},
	]
}
