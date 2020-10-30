<component>
/**
* Component which displays a simple attachment list linked against an API endpoint
* NOTE: Url is expected to return [{url, deleteUrl?, name, icon?, created? (parseable date string), size (bytes)}]
* The created, icon and size columns will optionally show based on whether any item in the server response has these fields
* If deleteUrl is omitted the source URL is used instead along with the HTTP DELETE method
*
* Available "view"s are:
* 	- "table": Tabular layout with an icon, name, created date (optional availability of these fields)
*	- "directory": Use the <directory/> widget to display invidual items
*	- "icons": Plain, icon only view where additional data is displayed in tooltips, accepts class mutator 'attachments-sm'
*
* @param {string} url The backend endpoint to query for file lists and to POST to
* @param {string} [view="table"] How to display the widget, ENUM: "table", "directory", "icons", "gallery"
* @param {boolean} [showControls=false] Whether to show, card like verbs for uploading
* @param {boolean} [allowDelete=false] Whether to allow file deletion (backend must support DELETE method)
* @param {boolean} [allowUpload=false] Whether to allow file uploads (backend must support POST method) - NOTE you must setup an upload button somewhere which calls `$refs.attachments.upload()`
* @param {boolean} [allowUploadMultiple=true] Allow multiple file uploads per upload cycle
* @param {string} [accept] Types of file to accept as a CSV. Can be mime or extensions. e.g. 'image/*,.pdf,.zip'
* @param {string|array} [tableClass] Additonal classes to apply to the table (e.g. 'table-sm')
*
* @slot uploadButton Exposes a custom replacement for the upload button (currently only in icon view). Exposed as {upload(), showControls?}
*
* @example Attachments widget with page level upload button
* <div class="btn-group-float">
*   <a @click="$refs.attachments.upload()" class="btn btn-icon btn-circle btn-primary fa fa-upload" v-tooltip="'Upload files'"></a>
* </div>
* <attachments ref="attachments" url="/api/uploads"/>
*/
module.exports = {
	props: {
		url: {type: String, required: true},
		view: {type: String, default: 'table'},
		showControls: {type: Boolean, default: false},
		allowDelete: {type: Boolean, default: false},
		allowUpload: {type: Boolean, default: false},
		allowUploadMultiple: {type: Boolean, default: true},
		accept: {type: String},
		tableClass: {type: [Array, String], default: ''},
	},
	data() { return {
		attachments: undefined,
		loading: true, // Display a 'Loading' notifier, if false $loader.startBackground() is used instead to indicate action
		loadCount: 0, // Number of times we have refreshed, used to determine whether `loading` should be set >0
		hasStats: { // Attributes to show, determined when we refresh
			created: false,
			icon: false,
			size: false,
		},
	}},
	computed: {
		attachmentsAsDirectory() {
			return (this.attachments || [])
				.map(file => ({
					href: {url: file.url, target: '_blank'},
					icon: file.icon,
					title: file.name,
					subTitle: Vue.filter('fileSize')(file.size),
				}))
		},
	},
	methods: {
		refresh() {
			return Promise.resolve()
				.then(()=> this.loadCount == 0
					? this.loading = true
					: this.$loader.startBackground(`attachment-refresh{attachment.url}`)
				)
				.then(()=> this.$http.get(this.$props.url))
				.then(res => this.attachments = res.data)
				.then(()=> { // Determine which stat columsn to show
					var fields = _.keys(this.hasStats);	
					fields.forEach(f => this.hasStats[f] = false);
					this.attachments.some(attachment => {
						fields.forEach(f => { if (attachment[f]) this.hasStats[f] = true });
						return (fields.map(f => this.hasStats[f]).every(i => i)); // Stop searching if all fields are accounted for
					});
				})
				.catch(this.$toast.catch)
				.finally(()=> this.loadCount++ == 0
					? this.loading = false
					: this.$loader.stop(`attachment-refresh{attachment.url}`)
				)
		},
		upload(options) {
			if (!this.$props.allowUpload) return;
			this.$files.upload({
				url: this.$props.url,
				multiple: this.$props.allowUploadMultiple,
				accept: this.$props.accept,
				...options,
			})
				.then(()=> this.refresh())
		},
		remove(attachment) {
			return Promise.resolve()
				.then(()=> this.$loader.startBackground(`attachment-delete-${attachment.url}`))
				.then(()=> this.$http.delete(attachment.deleteUrl || attachment.url))
				.then(()=> this.refresh())
				.finally(()=> this.$loader.stop(`attachment-delete-${attachment.url}`))
				.catch(this.$toast.catch)
		},
		getAttachmentTooltip(attachment) {
			return attachment.name + '<br/>'
				+ (this.hasStats.size ? `<strong>Size:</strong> ${Vue.filter('fileSize')(attachment.size)}<br/>` : '')
				+ (this.hasStats.created ? `<strong>Created:</strong> ${Vue.filter('date')(attachment.created)}<br/>` : '')
		},
	},
	created() {
		return this.refresh();
	},
};
</component>

<template>
	<div class="attachments" :class="!attachments || !attachments.length ? 'empty' : ''">
		<div v-if="loading">
			<i class="far fa-spinner fa-spin"/>
			Loading attachments...
		</div>
		<div v-else>
			<!-- Table view {{{ -->
			<div v-if="$props.view == 'table'">
				<table v-if="attachments.length" class="table table-hover" :class="$props.tableClass">
					<thead>
						<tr>
							<th v-if="hasStats.icon" class="col-icon">&nbsp;</th>
							<th>File name</th>
							<th v-if="!$screen.isMobile && hasStats.created" class="col-date">Created</th>
							<th v-if="hasStats.size" class="col-filesize">Size</th>
							<th v-if="$props.allowDelete" class="col-button">&nbsp;</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="attachment in attachments" :key="attachment.url" v-href="{href: attachment.url, target: '_blank'}">
							<td v-if="hasStats.icon">
								<i v-if="attachment.icon" :class="[attachment.icon, $screen.isMobile && 'fa-2x']"/>
							</td>
							<td>
								{{attachment.name}}
								<date v-if="$screen.isMobile && hasStats.created" class="text-muted" :date="attachment.created"/>
							</td>
							<td v-if="!$screen.isMobile && hasStats.created">
								<date :date="attachment.created"/>
							</td>
							<td v-if="hasStats.size">
								{{attachment.size | fileSize}}
							</td>
							<td v-if="$props.allowDelete">
								<a @click="remove(attachment)" class="btn btn-danger far fa-trash"/>
							</td>
						</tr>
					</tbody>
				</table>
				<div v-if="!attachments.length" class="text-muted">
					No attachments
				</div>
				<div v-if="showControls" class="mt-2 text-center">
					<a @click="upload()" class="btn btn-success btn-sm">
						<i class="far fa-upload"/>
						Upload files...
					</a>
				</div>
			</div>
			<!-- }}} -->
			<!-- Directory view {{{ -->
			<div v-else-if="$props.view == 'directory'">
				<directory :root="{children: attachmentsAsDirectory}"/>
				<div v-if="!attachments.length" class="text-muted">
					No attachments
				</div>
				<div v-if="showControls" class="mt-2 text-center">
					<a @click="upload()" class="btn btn-success btn-sm">
						<i class="far fa-upload"/>
						Upload files...
					</a>
				</div>
			</div>
			<!-- }}} -->
			<!-- Icons view {{{ -->
			<div v-else-if="$props.view == 'icons'" class="attachments-view-icons">
				<a
					v-for="attachment in attachments"
					:key="attachment.url"
					v-href="{href: attachment.url, target: '_blank'}"
					class="attachment-item"
					:class="attachment.icon"
					v-tooltip="getAttachmentTooltip(attachment)"
				>
					<a @click.stop.prevent="remove(attachment)" class="attachment-item-btn btn btn-danger btn-sm far fa-times"/>
				</a>
				<slot name="uploadButton" :upload="upload">
					<a
						v-if="showControls"
						@click.stop="upload()"
						class="attachment-item-upload fas fa-plus"
						v-tooltip="'Upload a new file'"
					/>
				</slot>
			</div>
			<!-- }}} -->
			<!-- Gallery view {{{ -->
			<div v-else-if="$props.view == 'gallery'" class="attachments-view-gallery">
				<a
					v-for="attachment in attachments"
					:key="attachment.url"
					v-href="{href: attachment.url, target: '_blank'}"
					v-tooltip="getAttachmentTooltip(attachment)"
					class="attachment-item"
					:style="{'background-image': `url('${attachment.url}')`}"
				>
					<a @click.stop.prevent="remove(attachment)" class="attachment-item-btn btn btn-danger btn-sm far fa-times"/>
				</a>
				<slot name="uploadButton" :upload="upload">
					<a
						v-if="showControls"
						@click.stop="upload()"
						class="attachment-item-upload"
						v-tooltip="'Upload a new file'"
					>
						<i class="fas fa-plus"/>
					</a>
				</slot>
			</div>
			<!-- }}} -->
			<!-- Unknown view {{{ -->
			<div v-else class="text-danger">
				Unknown attachment view "{{view}}"
			</div>
			<!-- }}} -->
		</div>
	</div>
</template>

<style>
/* icons view {{{ */
.attachments .attachments-view-icons .attachment-item,
.attachments .attachments-view-icons .attachment-item-upload {
	width: 70px;
	height: 100px;
	font-size: 80px;
	border-radius: 5px;
	margin: 0 5px;
	display: inline-flex;
	justify-content: center;
	align-items: center;
	color: var(--main);
}

.attachments .attachments-view-icons .attachment-item {
	border: 2px solid transparent;
}

.attachments .attachments-view-icons .attachment-item-upload {
	border: 2px dashed var(--main);
	opacity: 0.5;
	transition: opacity 0.4s;
}

.attachments .attachments-view-icons .attachment-item-upload:before {
	transform: scale(0.5);
	transition: transform 0.2s;
}

.attachments .attachments-view-icons .attachment-item-upload:hover:before {
	transform: scale(0.8);
}

.attachments .attachments-view-icons .attachment-item:hover {
	border: 2px solid var(--main);
	background: var(--main-highlight);
	color: var(--dark);
}

.attachments .attachments-view-icons .attachment-item-upload:hover {
	border: 2px dashed var(--main);
	opacity: 1;
	color: var(--main);
}

.attachments .attachments-view-icons .attachment-item .attachment-item-btn {
	display: none;
	position: absolute;
	margin-top: 38px;
	margin-left: 22px;
	opacity: 0.5;
	transition: opacity 0.2s;
}

.attachments .attachments-view-icons .attachment-item:hover .attachment-item-btn {
	display: block;
}

.attachments .attachments-view-icons .attachment-item .attachment-item-btn:hover {
	opacity: 1;
}

/* Mutator .attachments-sm {{{ */
.attachments.attachments-sm .attachments-view-icons .attachment-item,
.attachments.attachments-sm .attachments-view-icons .attachment-item-upload {
	width: 30px;
	height: 30px;
	font-size: 20px;
	margin: 0 1px;
}

.attachments.attachments-sm .attachments-view-icons .attachment-item .attachment-item-btn {
	margin-top: 12px;
	margin-left: 10px;
	transform: scale(0.8);
}
/* }}} */
/* }}} */
/* gallery view {{{ */
.attachments .attachments-view-gallery .attachment-item,
.attachments .attachments-view-gallery .attachment-item-upload {
	width: 140px;
	height: 140px;
	font-size: 80px;
	border-radius: 5px;
	margin: 5px;
	display: inline-flex;
	justify-content: center;
	align-items: center;
	color: var(--light);
	background-repeat: no-repeat;
	background-position: center;
	background-size: contain;
	border: 1px solid var(--light);
	vertical-align: bottom;
}

.attachments .attachments-view-gallery .attachment-item:hover,
.attachments .attachments-view-gallery .attachment-item-upload:hover {
	border: 1px solid var(--primary);
	color: var(--primary);
}

.attachments .attachments-view-gallery .attachment-item:hover .attachment-item-btn {
	display: block;
}

.attachments .attachments-view-gallery .attachment-item .attachment-item-btn {
	display: none;
	position: absolute;
	margin-top: 50px;
	margin-left: 50px;
	opacity: 0.5;
	transition: opacity 0.2s;
}

.attachments .attachments-view-gallery .attachment-item .attachment-item-btn:hover {
	opacity: 1;
}
/* }}} */
</style>
