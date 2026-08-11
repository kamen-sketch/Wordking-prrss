import TruSeoAnalyzer from './analyze'

addEventListener('message', async e => {
	if ('tru-seo-analysis' === e.data.event) {
		const analyze  = new TruSeoAnalyzer()
		const analysis = await analyze.runAnalysis(e.data.analysisData)

		postMessage({
			event : 'tru-seo-analysis-complete',
			analysis
		})
	}
})