<script lang="js" frontend>
/**
* Display a permission setting UI
* The current permissions are specified with `selected` and their spec available with `spec`
* @param {Object} selected The currently selected permissions
* @param {Object} spec The specification (retrieved via /api/widgets/meta)
* @param {string} [specPerfix=""] How to filter the flat `spec` object to the permissions list
* @param {boolean} searchable Enable search feature
* @emits change Event emitted as `(permissions)` when the user changes the permissions
*/
app.component('permissionsList', {
	data() { return {
		searchValue: '',
	}},
	props: {
		selected: {type: Object, required: true},
		spec: {type: Object, required: true},
		specPrefix: {type: String, default: ''},
		searchable: {type: Boolean, default: true},
	},
	computed: {
		/**
		* Convert known user permissions into an iterable collection
		* @returns {array<Object>} A permission collection
		* @property {string} key The camelCased ID of the permission
		* @property {string} title Human readbale title of the permission
		* @property {boolean} selected Whether the permission is active
		* @property {boolean} show Whether the permission matches the search query
		*/
		permissions() {
			var searchRe = new RegExp(this.searchValue // Prepare search string by splitting words into OR groups
				? this.searchValue.split(/\s+/).map(RegExp.escape).join('|')
				: '.'
			, 'i')

			return Object.keys(this.spec)
				.filter(k => k.startsWith(this.$props.specPrefix)) // Matches prefix
				.map(k => ({
					...this.spec[k],
					key: k.substr(this.$props.specPrefix.length),
					title: _.startCase(k.substr(this.$props.specPrefix.length))
						.split(' ')
						.map(word => `${word} >`)
						.join(' ')
						.replace(/ >$/, ''),
					selected: this.selected[k.substr(this.$props.specPrefix.length)],
					show: searchRe.test(k),
				}))
		},


		/**
		* Compute a lookup object from permissions where each key is the permission.key
		* @returns {Object} A lookup object for permissions()
		*/
		permissionsByKey() {
			return _.mapKeys(this.permissions, 'key');
		},


		/**
		* Extract usable groups from the permissions spec
		* @returns {array<Object>} A permissionGroup colleciton of the form `{key, title, permissions[]}`
		* @property {string} key The camelCase identifier of the group
		* @property {string} title The human readable title of the group
		* @property {array<string>} permissions Member permissions of this group
		* @property {boolean} selected Whether this group is active
		* @property {boolean} show Whether the permission matches the search query
		*/
		permissionGroups() {
			var searchRe = new RegExp(this.searchValue // Prepare search string by splitting words into OR groups
				? this.searchValue.split(/\s+/).map(RegExp.escape).join('|')
				: '.'
			, 'i')

			return _.chain(this.permissions)
				.reduce((groups, permission, permissionPath) => {
					_.isArray(permission.permissionGroups) && permission.permissionGroups.forEach(pg => {
						if (!groups[pg]) groups[pg] = {
							key: pg,
							title: pg,
							permissions: [],
							selected: false, // Calculated when all permissionGroups have been populated with permissions
							show: searchRe.test(pg),
						};

						// Append this permission to the group
						groups[pg].permissions.push(permission.key);
					});

					return groups;
				}, {})
				.map(permissionGroup => _.set(permissionGroup, 'selected', permissionGroup.permissions.every(p => this.permissionsByKey[p].selected)))
				.sortBy('title')
				.value()
		},
	},
	methods: {
		/**
		* Populate a change of a permission
		* @param {string} key The permission key to accept the change of
		* @param {boolean} [newValue] Forced value to set to, if omitted the inverse value is assumed
		* @emits change Emitted as (PermissionObject) where the object is the individual collection item
		*/
		togglePermission(key, newValue) {
			this.$emit('change', _(this.permissions)
				.mapKeys(p => p.key)
				.mapValues(p => p.key == key ? newValue ?? ! p.selected : p.selected)
				.value()
			);
		},


		/**
		* Set a permission group
		* @param {string} key The permission key to accept the change of
		* @param {boolean} [newValue] Forced value to set to, if omitted the inverse value is assumed
		* @emits changeGroup Emitted as (permissionGroupName)
		*/
		togglePermissionGroup(key, newValue) {
			var group = this.permissionGroups.find(pg => pg.key == key);
			var groupValue = newValue ?? !group.selected;

			this.$emit('change', _(this.permissions)
				.mapKeys(p => p.key)
				.mapValues(p => group.permissions.includes(p.key) ? groupValue : p?.selected)
				.value()
			);
		},


		/**
		* Focus the search box, if there is one
		* This is just general UX when changing tabs to the permission area
		*/
		focusSearch() {
			if (!this.searchable) return; // Search not enabled anyway
			this.$timeout(()=> $(this.$refs.searchBox).focus(), 500);
		},


		/**
		* Perform a meta operation like selecting all permissions
		* @param {string} option The option to select. See code for supported items
		*/
		select(option) {
			switch (option) {
				case 'all':
					this.$emit('change', _(this.permissions)
						.mapKeys(p => p.key)
						.mapValues(()=> true)
						.value()
					);
					break;
				case 'none':
					this.$emit('change', _(this.permissions)
						.mapKeys(p => p.key)
						.mapValues(()=> false)
						.value()
					);
					break;
				case 'invert':
					this.$emit('change', _(this.permissions)
						.mapKeys(p => p.key)
						.mapValues(p => ! p.selected)
						.value()
					);
					break;
				default:
					throw new Error(`Unknown select type "${option}"`);
			}
		},
	},
	created() {
		this.$debug.enable(false);
	},
});
</script>

<template>
	<div>
		<ul class="nav nav-tabs">
			<li class="nav-item">
				<a @click="focusSearch" class="nav-link active" data-toggle="tab" data-target="#permissions-roles">
					Basic roles
					<span class="badge badge-info">
						{{this.permissionGroups.filter(pg => pg.selected).length | number}}
						/
						{{this.permissionGroups.length | number}}
					</span>
				</a>
			</li>
			<li class="nav-item">
				<a @click="focusSearch" class="nav-link" data-toggle="tab" data-target="#permissions-permissions">
					Custom permissions
					<span class="badge badge-info">
						{{this.permissions.filter(p => p.selected).length | number}}
						/
						{{this.permissions.length | number}}
					</span>
				</a>
			</li>
			<li class="nav-item" style="margin-left: auto">
				<div class="btn-group">
					<a class="btn btn-default fas fa-ellipsis-v" data-toggle="dropdown"/>
					<ul class="dropdown-menu">
						<a @click="select('all')" class="dropdown-item">Select all</a>
						<a @click="select('none')" class="dropdown-item">Clear all</a>
						<a @click="select('invert')" class="dropdown-item">Invert selection</a>
					</ul>
				</div>
			</li>
		</ul>
		<div class="row">
			<div v-if="searchable" class="col-12 mt-2">
				<input ref="searchBox" v-model="searchValue" type="search" class="form-control" placeholder="Search permissions..."/>
			</div>
		</div>
		<div class="tab-content">
			<div class="tab-pane fade show active" id="permissions-roles" role="tabpanel">
				<div v-for="permissionGroup in permissionGroups" :key="permissionGroup.key" class="form-group row m-b-0">
					<div v-show="permissionGroup.show" class="col-11 col-form-label">
						<v-toggle
							:value="permissionGroup.selected"
							:sync="true"
							@change="togglePermissionGroup(permissionGroup.key, $event.value)"
						/>
						<span v-highlight="searchValue">
							{{permissionGroup.title}}
						</span>
					</div>
				</div>
				<div v-if="!permissionGroups.filter(pg => pg.show).length" class="text-center mb-3">
					<i class="fas fa-exclamation-triangle"/>
					No matching permission groups
				</div>
			</div>
			<div class="tab-pane fade show" id="permissions-permissions" role="tabpanel">
				<div v-for="permission in permissions" :key="permission.key" class="form-group row m-b-0">
					<div v-show="permission.show" class="col-11 col-form-label">
						<v-toggle
							:value="permission.selected"
							:sync="true"
							@change="togglePermission(permission.key, $event.value)"
						/>
						<span v-highlight="searchValue">
							{{permission.title}}
						</span>
					</div>
				</div>
				<div v-if="!permissions.filter(p => p.show).length" class="text-center mb-3">
					<i class="fas fa-exclamation-triangle"/>
					No matching permissions
				</div>
			</div>
		</div>

		<div v-if="$debug.$enable" v-permissions="'debug'" class="card">
			<div class="card-header">
				Raw data
				<i class="float-right fas fa-debug fa-lg" v-tooltip="'Only visible to users with the Debug permission'"/>
			</div>
			<div class="card-body">
				<pre>{{$data}}</pre>
			</div>
		</div>
	</div>
</template>
