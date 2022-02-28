<script lang="js" frontend>
import VueMacgyver from '@momsfriendlydevco/macgyver';
//console.log('VueMacgyver', VueMacgyver);
app.use(VueMacgyver);

// TODO: Export an endpoint which is all components 
import {
	mgAlert,
	mgButton,
	mgCheckBox,
	mgChoiceButtons,
	mgChoiceCheckbox,
	mgChoiceDropdown,
	mgChoiceList,
	mgChoicePopup,
	mgChoiceRadio,
	mgChoiceTags,
	mgChoiceTree,
	mgCode,
	mgColor,
	mgComponent,
	mgContainer,
	mgDate,
	mgDatetime,
	mgEmail,
	mgError,
	mgForm,
	mgFormEditor,
	mgGrid,
	//mgGridDashboard
	mgHeading,
	mgHtml,
	mgIcon,
	mgInfoBlock,
	//mgInfoChart
	mgLabel,
	mgList,
	mgNumber,
	mgPassword,
	//mgPermissions
	mgPlaceholder,
	mgQuery,
	mgRestQuery,
	mgSeperator,
	mgTable,
	mgTextArea,
	mgText,
	mgTime,
	mgToggle,
	mgUrl,
	mgVideo,
	mgWysiwyg
} from '@momsfriendlydevco/macgyver';

app.ready.then(()=> {
	app.vue.$macgyver.$http = app.service.$http;
	app.vue.$macgyver.$prompt = app.service.$prompt;
});
</script>

<style>
.control-label {
	padding-top: calc(.375rem + 1px);
	padding-bottom: calc(.375rem + 1px);
	margin-bottom: 0;
	font-size: inherit;
	line-height: 1.5;
}
</style>
