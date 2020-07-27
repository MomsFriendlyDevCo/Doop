<script repack>
/**
* Chart.js line chart
*/
import {Line} from 'vue-chartjs';

Vue.component('v-chart-timeseries', {
	extends: Line,
	data() { return {
		chartData: undefined,
	}},
	props: {
		data: {type: Object},
		url: {type: String},
		options: {type: Object},
	},
	created() {
		this.refresh();
	},
	mounted() {
		this.$watchAll(['$props.data', '$data.chartData', '$props.options'], ()=> {
			this.renderChart(this.url ? this.chartData : this.data, {
				responsive: true,
				maintainAspectRatio: false,
				...this.options,
			});
		}, {immediate: true, deep: true});
	},
	methods: {
		refresh() {
			if (!this.url) return; // No need to pull in data feed
			return Promise.resolve()
				.then(()=> this.$loader.startBackground())
				.then(()=> this.$http.get(this.url))
				.then(res => this.chartData = res.data)
				.finally(()=> this.$loader.stop())
				.catch(this.$toast.catch)
		},
	},
});
</script>
