<script lang="js" frontend>
/**
* This is the top level Vue component which handles all other child components
*/
app.component('layoutRoot', {
	data() { return {
		sidebarExpanded: true,
	}},
	methods: {
		toggleSidebar() {
			$('#wrapper').toggleClass('enlarged');
			this.sidebarExpanded = ! $('#wrapper').hasClass('enlarged');
			app.service.$session.settings.set('theme.sidebarExpanded', this.sidebarExpanded, 'session');
		},
	},
	mounted() {
		$('body').removeClass('bootstrapping');
		$('body > .splash').removeAttr('style'); // Remove {display: none} overrides for early-load, root level elements allowing CSS precidence to take over now Vue has loaded

		app.service.$session.settings.get('theme.sidebarExpanded', true)
			.then(res => !res && this.$screen.size != 'xs' && this.toggleSidebar()) // Do initial toggle if the user left it that way
	},
});
</script>

<template>
	<div id="app">
		<!-- Topbar {{{ -->
		<div class="topbar">
			<div class="topbar-left" v-tooltip.bottom="`${$config.title}<br/>v${$config.version}`">
				<div class="text-center">
					<a v-href="'/'" class="logo">
						<span class="logo-inner-sm">
							<img src="/assets/logo/logo.svg"/>
						</span>
						<span class="logo-inner-lg">
							<img src="/assets/logo/logo.svg"/>
						</span>
					</a>
				</div>
			</div>

			<nav class="navbar-custom">
				<ul class="list-inline float-right mb-0">
					<user-dropdown></user-dropdown>
				</ul>

				<ul class="list-inline menu-left mb-0">
					<li class="float-left">
						<button class="button-menu-mobile open-left far fa-bars waves-effect" @click="toggleSidebar()">
							<i class="mdi mdi-menu"></i>
						</button>
					</li>
				</ul>
			</nav>
		</div>
		<!-- }}} -->

		<!-- Sidebar {{{ -->
		<div class="left side-menu">
			<div id="sidebar-menu">
				<sitemap-sidebar/>
				<div class="clearfix"></div>
			</div>
			<div class="clearfix"></div>
		</div>
		<!-- }}} -->

		<!-- Content area {{{ -->
		<div class="content-page">
			<div class="content">
				<div class="container-fluid">
					<sitemap-breadcrumbs/>
					<!-- Page transitions are managed by $transitions service -->
					<transition
						:name="$transitions.current.class"
						:duration="$transitions.current.maxKeepAlive"
						:css="$transitions.current.class != 'page-transition-none'"
					>
						<div class="content-area">
							<router-view></router-view>
						</div>
					</transition>
				</div>
			</div>
		</div>
		<!-- }}} -->

		<!-- Helpers / Plugins {{{ -->
		<vue-snotify/>
		<prompt-injector/>
		<!-- }}} -->
	</div>
</template>
