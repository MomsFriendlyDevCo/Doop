<component>
module.exports = {
	route: '/profile',
	data() { return {
		data: {
			username: undefined,
			email: undefined,
			name: undefined,
		},
		spec: {
			type: 'mgContainer',
			layout: 'card',
			items: [
				{
					type: 'mgText',
					id: 'username',
					title: 'Username',
					disabled: true,
					showIf: () => !this.$config.session.signup.emailAsUsername
				},
				{
					type: 'mgEmail',
					id: 'email',
					title: 'Email',
					disabled: true,
				},
				{
					type: 'mgText',
					id: 'name',
					title: 'Name',
				},
				{
					type: 'mgCode',
					id: 'settings',
					title: 'Settings',
				},
			]
		},
	}},
	methods: {
		refresh() {
			return Promise.resolve()
				.then(()=> this.$loader.start())
				.then(()=> this.$http.get(`/api/session`))
				.then(res => this.data = res.data)
				.then(()=> this.$sitemap.setTitle(this.data.name || this.data.username || this.data.email))
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop());
		},
		save(notification = false, redirect = false) {
			return Promise.resolve()
				// Sanity checks {{{
				.then(()=> {
					//if (!this.data.username) throw new Error('No username provided');
					if (!this.data.name) throw new Error('No name provided');
				})
				// }}}
				.then(()=> this.$loader.startBackground())
				.then(()=> this.$http.post(`/api/session`, this.data))
				.then(()=> notification && this.$toast.success('Saved'))
				.then(()=> redirect && this.$router.push('/'))
				.then(()=> !redirect && this.refresh())
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop())
		},
	},
	created() {
		this.$debugging = true;

		return this.refresh();
	},
};
</component>

<template>
	<form class="form-horizontal" @submit.prevent="save(true, false)">
		<div class="btn-group-float">
			<button
				v-tooltip="'Save'"
				type="submit"
				class="btn btn-icon btn-lg btn-circle btn-success"
				><i class="fa fa-check" /></button>
		</div>

		<div class="row">
			<div class="col-lg-4 col-xl-4">
				<div class="card text-center">
					<div class="card-body">
						<img :src="$session.data.avatarUrl" class="rounded-circle avatar-xl img-thumbnail"
						alt="profile-image">

						<h4 class="mt-3 mb-0">{{data.name}}</h4>
						<p class="text-muted">{{data.email}}</p>

						<!--button type="button" class="btn btn-success btn-xs waves-effect mb-2 waves-light">Follow</button>
						<button type="button" class="btn btn-danger btn-xs waves-effect mb-2 waves-light">Message</button-->

						<!--div class="text-left mt-3">
							<h4 class="font-13 text-uppercase">About Me :</h4>
							<p class="text-muted font-13 mb-3">
								Hi I'm Johnathn Deo,has been the industry's standard dummy text ever since the
								1500s, when an unknown printer took a galley of type.
							</p>

							<div class="table-responsive">
								<table class="table table-borderless table-sm">
									<tbody>
										<tr>
											<th scope="row">Full Name :</th>
											<td class="text-muted">{{data.name}}</td>
										</tr>
										<tr>
											<th scope="row">Mobile :</th>
											<td class="text-muted">(123) 123 1234</td>
										</tr>
										<tr>
											<th scope="row">Email :</th>
											<td class="text-muted">{{data.email}}</td>
										</tr>
										<tr>
											<th scope="row">Location :</th>
											<td class="text-muted">USA</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div-->

						<!--ul class="social-list list-inline mb-0">
							<li class="list-inline-item">
								<a href="javascript: void(0);" class="social-list-item border-purple text-purple"><i
										class="mdi mdi-facebook"></i></a>
							</li>
							<li class="list-inline-item">
								<a href="javascript: void(0);" class="social-list-item border-danger text-danger"><i
										class="mdi mdi-google"></i></a>
							</li>
							<li class="list-inline-item">
								<a href="javascript: void(0);" class="social-list-item border-info text-info"><i
										class="mdi mdi-twitter"></i></a>
							</li>
							<li class="list-inline-item">
								<a href="javascript: void(0);" class="social-list-item border-secondary text-secondary"><i
										class="mdi mdi-github"></i></a>
							</li>
						</ul-->
					</div>
				</div> <!-- end card-box -->

				<!--div class="card">
					<div class="card-body">
						<h4 class="header-title">Skills</h4>
						<p class="sub-header mb-3">Everyone realizes why a new common language would be desirable</p>

						<div class="pt-1">
							<h6 class="text-uppercase mt-0">HTML5 <span class="float-right">90%</span></h6>
							<div class="progress progress-sm m-0">
								<div class="progress-bar bg-purple" role="progressbar" aria-valuenow="90" aria-valuemin="0" aria-valuemax="100" style="width: 90%">
									<span class="sr-only">90% Complete</span>
								</div>
							</div>
						</div>

						<div class="mt-2 pt-1">
							<h6 class="text-uppercase">PHP <span class="float-right">67%</span></h6>
							<div class="progress progress-sm m-0">
								<div class="progress-bar bg-purple" role="progressbar" aria-valuenow="67" aria-valuemin="0" aria-valuemax="100" style="width: 67%">
									<span class="sr-only">67% Complete</span>
								</div>
							</div>
						</div>

						<div class="mt-2 pt-1">
							<h6 class="text-uppercase">WordPress <span class="float-right">48%</span></h6>
							<div class="progress progress-sm m-0">
								<div class="progress-bar bg-purple" role="progressbar" aria-valuenow="48" aria-valuemin="0" aria-valuemax="100" style="width: 48%">
									<span class="sr-only">48% Complete</span>
								</div>
							</div>
						</div>

						<div class="mt-2 pt-1">
							<h6 class="text-uppercase">Laravel <span class="float-right">95%</span></h6>
							<div class="progress progress-sm m-0">
								<div class="progress-bar bg-purple" role="progressbar" aria-valuenow="95" aria-valuemin="0" aria-valuemax="100" style="width: 95%">
									<span class="sr-only">95% Complete</span>
								</div>
							</div>
						</div>

						<div class="mt-2 pt-1">
							<h6 class="text-uppercase">ReactJs <span class="float-right">72%</span></h6>
							<div class="progress progress-sm m-0">
								<div class="progress-bar bg-purple" role="progressbar" aria-valuenow="72" aria-valuemin="0" aria-valuemax="100" style="width: 72%">
									<span class="sr-only">72% Complete</span>
								</div>
							</div>
						</div>
					</div>
				</div--> <!-- end card-box-->

			</div> <!-- end col-->

			<div class="col-lg-8 col-xl-8">
				<div class="card">
					<div class="card-body">
						<ul class="nav nav-pills navtab-bg">
							<li class="nav-item">
								<a href="#changes" data-toggle="tab" aria-expanded="true" class="nav-link active ml-0">
									<i class="fa fa-history mr-1"></i>Changes
								</a>
							</li>
							<li class="nav-item">
								<a href="#settings" data-toggle="tab" aria-expanded="false" class="nav-link">
									<i class="fa fa-cog mr-1"></i>Settings
								</a>
							</li>
						</ul>

						<div class="tab-content">
							
							<div class="tab-pane show active" id="changes">

								<h5 class="mb-3 text-uppercase bg-light p-2"><i class="fa fa-history mr-1"></i> Changes</h5>

								<!--ul class="list-unstyled timeline-sm">
									<li class="timeline-sm-item">
										<span class="timeline-sm-date">2015 - 19</span>
										<h5 class="mt-0 mb-1">Lead designer / Developer</h5>
										<p>websitename.com</p>
										<p class="text-muted mt-2">Everyone realizes why a new common language
											would be desirable: one could refuse to pay expensive translators.
											To achieve this, it would be necessary to have uniform grammar,
											pronunciation and more common words.</p>

									</li>
									<li class="timeline-sm-item">
										<span class="timeline-sm-date">2012 - 15</span>
										<h5 class="mt-0 mb-1">Senior Graphic Designer</h5>
										<p>Software Inc.</p>
										<p class="text-muted mt-2">If several languages coalesce, the grammar
											of the resulting language is more simple and regular than that of
											the individual languages. The new common language will be more
											simple and regular than the existing European languages.</p>
									</li>
									<li class="timeline-sm-item">
										<span class="timeline-sm-date">2010 - 12</span>
										<h5 class="mt-0 mb-1">Graphic Designer</h5>
										<p>Coderthemes LLP</p>
										<p class="text-muted mt-2 mb-0">The European languages are members of
											the same family. Their separate existence is a myth. For science
											music sport etc, Europe uses the same vocabulary. The languages
											only differ in their grammar their pronunciation.</p>
									</li>
								</ul-->

								<!--h5 class="mb-3 mt-5 text-uppercase">Projects</h5>
								<div class="table-responsive">
									<table class="table table-borderless table-nowrap mb-0">
										<thead class="thead-light">
											<tr>
												<th>#</th>
												<th>Project Name</th>
												<th>Start Date</th>
												<th>Due Date</th>
												<th>Status</th>
												<th>Clients</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td>1</td>
												<td>App design and development</td>
												<td>01/01/2015</td>
												<td>10/15/2018</td>
												<td><span class="badge badge-info">Work in Progress</span></td>
												<td>Halette Boivin</td>
											</tr>
											<tr>
												<td>2</td>
												<td>Coffee detail page - Main Page</td>
												<td>21/07/2016</td>
												<td>12/05/2018</td>
												<td><span class="badge badge-success">Pending</span></td>
												<td>Durandana Jolicoeur</td>
											</tr>
											<tr>
												<td>3</td>
												<td>Poster illustation design</td>
												<td>18/03/2018</td>
												<td>28/09/2018</td>
												<td><span class="badge badge-pink">Done</span></td>
												<td>Lucas Sabourin</td>
											</tr>
											<tr>
												<td>4</td>
												<td>Drinking bottle graphics</td>
												<td>02/10/2017</td>
												<td>07/05/2018</td>
												<td><span class="badge badge-danger">On Hold</span></td>
												<td>Donatien Brunelle</td>
											</tr>
											<tr>
												<td>5</td>
												<td>Landing page design - Home</td>
												<td>17/01/2017</td>
												<td>25/05/2021</td>
												<td><span class="badge badge-warning">Coming soon</span></td>
												<td>Karel Auberjo</td>
											</tr>

										</tbody>
									</table>
								</div-->

							</div>
							<!-- end timeline content-->

							<div class="tab-pane" id="settings">

								<h5 class="mb-3 text-uppercase bg-light p-2"><i class="fa fa-cog mr-1"></i> Settings</h5>

								<div class="row">
									<div class="col-md-12">
										<mg-form
											:config="$data.spec"
											:data="$data.data"
											@changeItem="$setPath($data.data, $event.path, $event.value)"
										/>
									</div>
								</div>

								<!--div class="text-right">
									<button type="submit" class="btn btn-success waves-effect waves-light mt-2"><i class="mdi mdi-content-save"></i> Save</button>
								</div-->
							</div>
							<!-- end settings content-->

						</div> <!-- end tab-content -->
					</div>
				</div> <!-- end card-->

			</div> <!-- end col -->
		</div>
		<!-- end row-->

		<div v-if="this.$debugging" v-permissions="'debug'" class="card">
			<div class="card-header">
				Raw data
				<i class="float-right fas fa-debug fa-lg" v-tooltip="'Only visible to users with the Debug permission'"/>
			</div>
			<div class="card-body">
				<pre>{{$data}}</pre>
			</div>
		</div>
	</form>
</template>

