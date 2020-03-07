module.exports = {
	users: [
		{
			_ref: "users.mc",
			username: "mc",
			password: "qwaszx",
			name: "Matt Carter",
			email: "matt@mfdc.biz",
			role: "root",
			status: "active",
			address: {
				street: "27 Burleigh Street",
				city: "Burleigh Heads",
				state: "Queensland",
				country: "Australia",
				postcode: "4220"
			},
			permissions: {
				companiesEdit: true,
				debug: true,
				usersEdit: true,
			},
		},
		{
			_ref: "users.admin",
			username: "admin",
			password: "qwaszx",
			name: "Joe Admin",
			email: "null+admin@mfdc.biz",
			role: "admin",
			status: "active",
			address: {
				street: "27 Burleigh Street",
				city: "Burleigh Heads",
				state: "Queensland",
				country: "Australia",
				postcode: "4220",
			},
			permissions: {
				companiesEdit: true,
				debug: true,
				usersEdit: true,
			},
		}
	]
}
