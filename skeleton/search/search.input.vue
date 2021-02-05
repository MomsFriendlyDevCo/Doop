<script lang="js" frontend>
/**
* Search widget that supports custom definable widgets that compose into a complex, tagged, search query compatible with the Doop search backend
*
* @param {string} [value] Initial value to decode and display, if omitted `readQuery` is used instead
* @param {string} [placeholder="Search..."] Placeholder text to display
* @param {string|boolean} [readQuery='q'] If non-falsy, try to read the query from $router.query into the current state
*
* @param {string} [redirect] Front end URL to redirect to on submission (rather than just emitting)
* @param {string} [redirectQuery='q'] Query element to set to the new search parameter when redirecting
*
* @param {Array<Object>} tags Collection of search tags to configure
* @param {string} tag.title The human readable title of the tag
* @param {string} tag.tag The name of the tag being defined
* @param {string} tag.type Internal search tag type. ENUM: 'hidden', 'date', 'dateRange', 'digest', 'checkboxes', 'radios'
* @param {Object} [tag.dateFormat='DD/MM/YYYY'] (type==date|dateRange) Moment compatible date format to input/output in tags
* @param {Object} [tag.seperator='-'] (type==dateRange) Seperator string between start + end
* @param {Object} [tag.startOnlyTag] (type==dateRange) Change tag to this value if only the start date is specified instead of using `${start}${seperator}${end}` format
* @param {Object} [tag.endOnlyTag] (type==dateRange) Change tag to this value if only the end date is specified instead of using `${start}${seperator}${end}` format
* @param {Object} [tag.digest] (type==digest) Digest options (some suitable search defaults are assumed but can be overriden)
* @param {array<String>|array<Object>} [tag.options] (type==checkboxes|radios) An array of string options (titles calculated via startCase) or options in the form `{id, title}`
* @param {string} [tag.clearValue] (type==radios) ID of the value assumed to clear the query, first options value is assumed if omitted
* @param {*} [tag.default] Default value for the tag if any
* @param {function} [tag.toQuery] Function called as `(tag)` to convert tag into a search string (a default is specified that approximates to `tag => ${tag.tag}:${tag.value}`)
*
* @emits preRedirect Emitted as `(queryString)` before redirecting to new destination, if the result is `false` the redirect is aborted
* @emits change Emitted as `(queryString)` with any newly computed search query when a search has been submitted
*/
app.component('searchInput', {
	data() { return {
		searchQuery: '',
		fuzzyQuery: '',
		searchHasFocus: false,
		showHelper: false, // Whether the helper area is visible, use setHelperVisibility() to change
		tagValues: {}, // Lookup values for each tag
		computedTags: [], // Cleaned up version of $props.tags via compileTags()
	}},
	computed: {
		hasContent() {
			return !!this.searchQuery;
		},
	},
	props: {
		value: {type: String},
		placeholder: {type: String, default: 'Search...'},
		readQuery: {type: [String, Boolean], default: 'q'},
		redirect: {type: String},
		redirectQuery: {type: String, default: 'q'},
		tags: {type: Array, required: true},
	},
	methods: {
		/**
		* Submit the search form
		*/
		submit() {
			if (this.redirect) { // Perform router redirect + we have a non-blank query
				this.setHelperVisibility(false);

				if (this.$emit('preRedirect', this.searchQuery) === false) return; // Abort redirect if preRedirect returns false

				this.$router.push({
					path: this.redirect,
					...(this.searchQuery ? {query: {[this.redirectQuery]: this.searchQuery}} : {}),
				})
					.catch(_.noop);
			}

			this.$emit('change', this.searchQuery);
		},


		/**
		* Set the visiblity of the helper
		* @param {boolean|string} [state='toggle'] Either the visibility boolean or 'toggle' to switch
		*/
		setHelperVisibility(state = 'toggle') {
			this.showHelper = state == 'toggle' ? !this.showHelper : !!state;

			if (this.showHelper) {
				// Hook into global body click handler
				this.$timeout(()=> $('body').on('click', '*', this.handleBodyClick), 250); // Let DOM settle then bind to clicking outside the area to close
				app.vue.$on('$beforeRoute', this.handleRoute);
			} else {
				// Destroy global body click handler
				$('body').off('click', '*', this.handleBodyClick);
				app.vue.$off('$beforeRoute', this.handleRoute);
			}
		},


		/**
		* Set the value of a search tag
		* @param {string|array} Path Path relative to tagValues to set within
		* @param {*} value The value to set
		*/
		setTagValue(path, value) {
			this.$setPath(this.tagValues, path, value);
			this.encodeQuery();
		},


		/**
		* Detect and handle top level body clicks
		* Close the dialog if the click is detected anywhere outside the DOM element tree
		*/
		handleBodyClick(e) {
			if (!this.showHelper) return; // Helper is invisible anyway - disguard
			if (!$(e.target).parents('.search-input-helper').toArray().length) { // Helper is not in DOM tree upwards - user clicked outside open search helper area
				e.stopPropagation();
				this.setHelperVisibility(false);
			}
		},

		/**
		* Detect and handle routing while the search helper is open
		*/
		handleRoute(data) {
			if (!this.showHelper) return; // Helper is invisible anyway - disguard
			this.setHelperVisibility(false);
		},


		/**
		* Compile tag spec + populate tagValue defaults
		* This function mutates computedTags + tagValues to suitable defaults
		*/
		compileTags() {
			var tagValues = {}; // Holder for new tagValues (default values of widgets)

			this.computedTags = this.$props.tags.map((tag, tagIndex) => {
				if (!tag.tag) throw new Error(`No tag property specified for search tag index #${tagIndex}`);
				if (!tag.title) throw new Error(`No title property specified for search tag "${tag.tag}"`);
				if (!tag.type) throw new Error(`No type property specified for search tag "${tag.tag}"`);

				switch (tag.type) {
					case 'hidden':
						tagValues[tag.tag] = tag.default;
						break;
					case 'date':
						tagValues[tag.tag] = tag.default;
						if (!tag.dateFormat) tag.dateFormat = 'DD/MM/YYYY';
						break;
					case 'dateRange':
						tagValues[tag.tag] = [undefined, undefined];
						if (!tag.dateFormat) tag.dateFormat = 'DD/MM/YYYY';
						if (!tag.seperator) tag.seperator = '-';
						if (!tag.toQuery) tag.toQuery = tag => // Special dataRange default output function
							_.isEmpty(tag.value) ? null // Uninitalized dates
							: !tag.value[0] && !tag.value[1] ? null // No dates
							: tag.value[0] && tag.value[1] ? // Has both start + end
								tag.tag + ':'
								+ moment(tag.value[0]).format(tag.dateFormat)
								+ tag.seperator
								+ moment(tag.value[1]).format(tag.dateFormat)
							: tag.value[0] && tag.startOnlyTag ? // Only has start + alternate starting tag
								tag.startOnlyTag + ':' + moment(tag.value[0]).format(tag.dateFormat)
							: tag.value[0] ? // Only has start
								tag.tag + ':' + moment(tag.value[0]).format(tag.dateFormat) + tag.seperator
							: tag.value[1] && tag.endOnlyTag ? // Only has end + alternate ending tag
								tag.endOnlyTag + ':' + moment(tag.value[1]).format(tag.dateFormat)
							: tag.value[1] ? // Only has end
								tag.tag + ':' + tag.seperator + moment(tag.value[1]).format(tag.dateFormat)
							: null; // All other cases
						break;
					case 'digest':
						if (!tag.digest || !_.isPlainObject(tag.digest)) throw new Error(`No digest config specified for digest search tag "${tag.tag}"`);
						tag.digest = { // Set suitable digest values
							allowRemove: true,
							class: 'col-sm-9 form-control-plaintext',
							classValid: 'badge badge-primary',
							classInvalid: 'badge badge-danger',
							lazy: false,
							...tag.digest,
						};
						tagValues[tag.tag] = tag.default;
						break;
					case 'checkboxes':
					case 'radios':
						if (!tag.options || !_.isArray(tag.options)) throw new Error(`No options config specified for checkboxes / radio search tag "${tag.tag}"`);
						tag.options = tag.options.map(option => {
							if (_.isString(option)) {
								return {id: option, title: _.startCase(option)}; // Transform string into iterable {id, title}
							} else if (_.isObject(option)) {
								if (!option.id || !option.title) throw new Error(`Search tag "${tag.tag}" options must be of the form {id: String, title: String} if specifying object values`);
								return option;
							} else {
								throw new Error(`Unknown option type for checkbox / radio search tag "${tag.tag}"`);
							}
						});

						if (tag.type == 'radios') {
							if (!tag.clearValue) tag.clearValue = tag.options[0].id; // Allocate clearValue if its a radio
							if (!tag.default) tag.default = tag.options[0].id;
							tagValues[tag.tag] = tag.default;
						} else if (tag.type == 'checkboxes') {
							tagValues[tag.tag] = _(tag.options).mapKeys(v => v.id).mapValues(v => false).value();
						}
						break;
					default:
						throw new Error(`Unknown search tag type tag "${tag.tag}"`);
				}

				if (!tag.toQuery) tag.toQuery = tag => tag.value ? `${tag.tag}:${tag.value}` : false;

				return tag;
			});

			_.forEach(tagValues, (v, k) => this.$set(this.tagValues, k, v)); // Assign Vue managed tagValues to the defaults we allocated above
		},


		/**
		* Compute local state into a search query (also set the search query display)
		*/
		encodeQuery() {
			this.searchQuery =
				(this.fuzzyQuery ? this.fuzzyQuery + ' ' : '') // Human fuzzy query
				+ this.computedTags // Computed tag entries
					.map(tag => ({...tag})) // Clone tag so further mutations don't effect source
					.map(tag => { // Add tag.value, if any
						switch (tag.type) {
							case 'digest': // Simple key=val setters
								tag.value = this.tagValues[tag.tag];
								break;
							case 'hidden':
								tag.value = undefined;
								break;
							case 'radios':
								tag.value = this.tagValues[tag.tag] && this.tagValues[tag.tag] != tag.clearValue && this.tagValues[tag.tag];
								break;
							case 'date':
								tag.rawValue = this.tagValues[tag.tag]; // Add raw full date in case its needed
								tag.value = this.tagValues[tag.tag] && moment(this.tagValues[tag.tag]).format(tag.dateFormat);
								break;
							case 'dateRange':
								tag.value = this.tagValues[tag.tag];
								break;
							case 'checkboxes':
								var values = _.chain(this.tagValues[tag.tag])
									.pickBy() // Choose only truthy values
									.keys()
									.value();

								tag.value = values.length ? values.join(',') : false;
								break;
							default:
								tag.value = false;
								console.warn(`Cant convert unknown tag type "${tag.type}" to query string - skipping`);
						}

						return tag;
					})
					.map(tag => tag.toQuery(tag)) // Call toQuery on each object expcting either a value or falsy
					.filter(Boolean)
					.join(' ')
				|> _.trim
		},


		/**
		* Decode a string query into local settings
		* This function mutates `tagValues` to match the incomming queryString + `fuzzyQuery` with human specified parts
		* @param {string} query String query to decode back into its component parts
		*/
		decodeQuery(query) {
			var queryHash = this.$search.parseTags(query);
			this.fuzzyQuery = queryHash.$fuzzy;

			this.computedTags.forEach(tag => {
				switch (tag.type) {
					case 'hidden': // Simple key / values
					case 'digest':
						this.tagValues[tag.tag] = queryHash[tag.tag];
						break;
					case 'date':
						this.tagValues[tag.tag] = queryHash[tag.tag] ? moment(queryHash[tag.tag], tag.dateFormat).toDate() : undefined;
						break;
					case 'dateRange':
						if (_.isEmpty(queryHash[tag.tag])) {
							this.tagValues[tag.tag] = [undefined, undefined];
						} else {
							var dateSplit = queryHash[tag.tag].split(/\s*-\s*/, 2);
							this.tagValues[tag.tag] = [
								dateSplit[0] ? moment(dateSplit[0], tag.dateFormat).toDate() : undefined,
								dateSplit[1] ? moment(dateSplit[1], tag.dateFormat).toDate() : undefined,
							];
						}
						break;
					case 'checkboxes':
						var setValues = new Set((queryHash[tag.tag] || '').split(/\s*,\s*/).filter(Boolean));
						this.tagValues[tag.tag] = _(tag.options)
							.mapKeys(option => option.id)
							.mapValues(option => setValues.has(option.id))
							.value()
						break;
					case 'radios':
						this.tagValues[tag.tag] = queryHash[tag.tag];
						break;
				}
			});
		},


		/**
		* Compute and return the properties of a digest component
		* @param {Object} tag The tag being exmined
		* @returns {Object} The computed digestSelect widget properties
		*/
		widgetDigestProps(tag) {
			return {
				selected: this.tagValues[tag.tag],
				...tag.digest, // Merge in remainder of tag.digest options
			};
		},
	},

	created() {
		this.$watchAll(['$route.query', 'value'], ()=> { // React to query changes (if $props.readQuery is enabled), NOTE: Must fire after tags
			var inputQuery; // Query to process
			if (this.value) { // Have an input value
				inputQuery = this.value;
			} else if (this.readQuery) {
				if (this.redirect && this.$route.path != this.redirect) return; // Path portion redirect does not match this page - ignore (allows `?q=search` to be reused on other pages other than global search redirect destination)
				inputQuery = this.$route.query[this.readQuery];
			} else { // Take no input
				return;
			}

			this.decodeQuery(inputQuery);
			this.encodeQuery();

		}, {deep: true, immediate: true});
	},

	beforeDestroy() {
		this.setHelperVisibility(false); // Clean up body click handlers
	},

	created() {
		this.$debugging = false;
	},

	watch: {
		tags: { // React to tag definition changes
			immediate: true,
			handler(newVal, oldVal) {
				if (JSON.stringify(newVal) == JSON.stringify(oldVal)) return; // Horrible kludge to detect if tag composition is identical - if so skip rebuild
				this.compileTags();
			},
		},
		'$route.query': { // React to query changes (if $props.readQuery is enabled), NOTE: Must fire after tags
			immediate: true,
			deep: true,
			handler() {
				if (!this.readQuery) return; // Route query monitoring behaviour disabled
				if (this.redirect && this.$route.path != this.redirect) return; // Path portion redirect does not match this page - ignore (allows `?q=search` to be reused on other pages other than global search redirect destination)

				this.searchQuery = this.$route.query[this.readQuery];
				this.decodeQuery(this.searchQuery);
				// FIXME: Why?
				//this.encodeQuery();
				//this.$emit('change', this.searchQuery);
			},
		},
	},
});
</script>

<template>
	<form
		@submit.prevent="submit"
		@keydown.tab="setHelperVisibility('toggle')"
		@keydown.enter="submit"
		role="search"
		class="app-search search-input"
		:class="{
			'input-search-focused': searchHasFocus,
			'open': showHelper,
			'has-content': hasContent,
		}"
	>
		<div class="app-search-box">
			<div class="input-group">
				<input
					v-model="searchQuery"
					type="search"
					:placeholder="placeholder"
					class="form-control search-input-fuzzy"
					@focus="searchHasFocus = true"
					@blur="searchHasFocus = false"
					autocomplete="off"
				/>
				<div class="input-group-append search-input-verbs">
					<button class="btn btn-outline-secondary" type="submit">
						<i class="far fa-search"/>
					</button>
					<button class="btn btn-outline-secondary" @click.prevent="setHelperVisibility('toggle')">
						<i class="far fa-chevron-down"/>
					</button>
				</div>
			</div>
			<div class="search-input-helper form-horizontal container pt-1">
				<div class="form-group row">
					<label class="col-sm-3 col-form-label">Search</label>
					<div class="col-sm-9">
						<input
							v-model="fuzzyQuery"
							type="search"
							class="form-control"
							@input="encodeQuery"
							autocomplete="off" 
						/>
					</div>
				</div>
				<div v-for="tag in computedTags" :key="tag.tag" class="form-group row">
					<label class="col-sm-3 col-form-label">{{tag.title}}</label>
					<div class="col-9 mt-2">
						<!-- type='digest' {{{ -->
						<dynamic-component
							v-if="tag.type == 'digest'"
							component="digestSelect"
							:props="widgetDigestProps(tag)"
							:events="{change: setTagValue.bind(null, tag.tag)}"
						/>
						<!-- }}} -->
						<!-- type='date' {{{ -->
						<v-date
							v-else-if="tag.type == 'date'"
							:value="tagValues[tag.tag]"
							@selected="setTagValue(tag.tag, $event)"
							:clear-button="true"
						/>
						<!-- }}} -->
						<!-- type='dateRange' {{{ -->
						<div v-else-if="tag.type == 'dateRange'" class="row">
							<div class="col-5">
								<v-date
									:value="tagValues[tag.tag][0]"
									@selected="setTagValue([tag.tag, 0], $event)"
									:clear-button="true"
								/>
							</div>
							<div class="col-2 text-center">to</div>
							<div class="col-5">
								<v-date
									:value="tagValues[tag.tag][1]"
									@selected="setTagValue([tag.tag, 1], $event)"
									:clear-button="true"
								/>
							</div>
						</div>
						<!-- }}} -->
						<!-- type='checkboxes' {{{ -->
						<div v-else-if="tag.type == 'checkboxes'">
							<div v-for="option in tag.options" :key="option.id" class="form-check mr-3">
								<input
									class="form-check-input"
									type="checkbox"
									:id="`${tag.tag}-${option.id}`"
									:checked="!!tagValues[tag.tag][option.id]"
									@change="setTagValue([tag.tag, option.id], $event.target.checked)"
								/>
								<label
									class="form-check-label"
									:for="`${tag.tag}-${option.id}`"
								>
									{{option.title}}
								</label>
							</div>
						</div>
						<!-- }}} -->
						<!-- type='radios' {{{ -->
						<div v-else-if="tag.type == 'radios'">
							<div v-for="option in tag.options" :key="option.id" class="form-check mr-3">
								<input
									class="form-check-input"
									type="radio"
									:id="`${tag.tag}-${option.id}`"
									:name="tag.tag"
									:checked="tagValues[tag.tag] == option.id"
									@change="setTagValue(tag.tag, option.id)"
								/>
								<label
									class="form-check-label"
									:for="`${tag.tag}-${option.id}`"
								>
									{{option.title}}
								</label>
							</div>
						</div>
						<!-- }}} -->
						<!-- type unknown {{{ -->
						<div v-else class="alert alert-danger">
							Unknown search tag type "{{tag.type}}"
						</div>
						<!-- }}} -->
					</div>
				</div>
				<div class="form-group row d-flex justify-content-end px-2">
					<button type="submit" class="btn btn-primary">Search</button>
				</div>
			</div>
		</div>
	</form>
</template>

<style>
/* Search input widget {{{ */
/*
.search-input .search-input-fuzzy {
	width: 100% !important;
}
*/
/* }}} */

/* Search input verbs (right aligned buttons) {{{ */
/*
.search-input .search-input-verbs {
	position: absolute;
	right: 24px;
	top: 16px;
}

.search-input .search-input-verbs > a {
	width: 30px;
	height: 30px;
	place-content: center;
	place-items: center;
	display: inline-flex;
}

.search-input.open .search-input-verbs > a.fa-chevron-down {
	background: var(--main-darker);
	border-radius: 50%;
	color: var(--white);
}
*/
/* }}} */

/* Search helper {{{ */
/*
.navbar-custom .menu-left {
	overflow: visible;
}
*/
.search-input .search-input-helper {
	display: none;
	z-index: 1000;
	background: #FFF;
	position: absolute;
	border: 1px solid var(--secondary);
	border-bottom-left-radius: 5px;
	border-bottom-right-radius: 5px;
	min-width: 400px;
	max-height: calc(100vh - 100px);
	overflow-y: auto;
	overflow-x: hidden;
}

.search-input .search-input-helper .form-control,
.search-input .search-input-helper .form-control:focus {
	color: var(--gray-dark);
	border-bottom: 1px solid var(--secondary);
	border-radius: 0px;
	width: 100%;
	padding: 0;
}

.search-input .search-input-helper input[type=text].form-control {
	border-top: none;
	border-left: none;
	border-right: none;
}

/*
.search-input .search-input-helper label {
	user-select: none;
}
*/

.search-input .search-input-helper .vdp-datepicker {
	border-bottom: 1px solid var(--secondary);
}

.search-input .search-input-helper .vdp-datepicker input {
	border: none;
	width: 100%;
}

.search-input .search-input-helper .vdp-datepicker .vdp-datepicker__clear-button {
	position: absolute;
	right: 0px;
}

.search-input.open .search-input-helper {
	display: block;
}
/* }}} */

/* Button placement {{{ */
/*
.search-input .form-control, .search-input .form-control:focus {
	width: 400px;
}

.search-input a.fa-search {
	left: auto;
	right: 30px;
}

.search-input a.fa-chevron-down {
	left: auto;
	right: 5px;
}
*/
/* }}} */

/* Theme fixes {{{ */
/*
.search-input .digest-select a {
	position: inherit;
	top: initial;
	left: initial;
	height: auto;
	line-height: 1;
	width: auto;
}
.search-input .digest-select a.btn-hover-danger {
	flex-grow: 0;
	color: inherit;
	border-radius: 0;
	width: 31px;
}
*/
/* }}} */

/* Expand search area when search has content or helper is expanded {{{ */
.search-input.has-content .input-group {
	width: calc(100vw - 500px);
}

.search-input.open .input-group {
	width: calc(100vw - 500px);
}
/* }}} */
</style>
