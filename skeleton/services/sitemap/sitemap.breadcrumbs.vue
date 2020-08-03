<script>
app.component('sitemapBreadcrumbs', {
});
</script>

<template>
	<!-- Only show breadcrumb area if we have a valid node AND not mobile -->
	<div v-if="$sitemap.selected.node" class="page-header">
		<h4 class="page-title">
			<span v-if="$sitemap.selected.node.options" class="dropdown">
				<a class="dropdown-toggle" data-toggle="dropdown">{{$sitemap.selected.node.title}}</a>
				<div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
					<a v-for="option in $sitemap.selected.node.options" :key="option.title" class="dropdown-item" v-href="option.href">{{option.title}}</a>
				</div>
			</span>
			<a v-else v-href="{href: $sitemap.selected.node.href, transition: 'slide-left'}">
				{{$sitemap.selected.node.titleLong || $sitemap.selected.node.title}}
			</a>
			<span v-if="$sitemap.selected.node.verbs" class="btn-group">
				<a v-for="verb in $sitemap.selected.node.verbs" :key="verb.title" :class="verb.classTitle || verb.class" v-tooltip="verb.tooltip || verb.title" v-href="{href: verb.href}"/>
			</span>
		</h4>
		<ol class="breadcrumb">
			<li class="breadcrumb-item">
				<a v-href="{href: '/', transition: 'slide-left'}">
					<i class="far fa-home"/>
				</a>
			</li>
			<li v-for="node in $sitemap.selected.path" class="breadcrumb-item" :class="node == $sitemap.selected.node && 'active'">
				<span v-if="node.options" class="dropdown">
					<a class="dropdown-toggle link" data-toggle="dropdown">{{node.title}}</a>
					<div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
						<a v-for="option in node.options" :key="option.title" class="dropdown-item" v-href="option.href">{{option.title}}</a>
					</div>
				</span>
				<a v-else v-href="{href: node.href, transition: 'slide-left'}">
					{{node.title}}
				</a>
				<span v-if="node.verbs" class="btn-group">
					<a v-for="verb in node.verbs" :key="verb.title" :class="verb.classBreadcrumb || verb.class" v-tooltip="verb.tooltip || verb.title" v-href="verb.href"/>
				</span>
			</li>
		</ol>
	</div>
</template>

<style>
.title-breadcrumbs {
	z-index: 100;
}

.page-title-box .breadcrumb-item {
	color: var(--main);
}

.page-title-box .breadcrumb-item.active {
	font-weight: 700;
}
</style>
