const context = require('./context')

const axeTypes = ['passes', 'incomplete', 'inapplicable', 'violations']

const outcomeMap = {
	passes: 'passed',
	violations: 'failed',
	incomplete: 'cantTell',
}

function earlAssertion({ source, version, ruleId, mode = 'automatic', outcome = 'untested' }) {
	const assertion = {
		'@type': 'Assertion',
		mode: `earl:${mode}`,
		subject: { '@type': ['earl:TestSubject', 'sch:WebPage'], source },
		assertedBy: `https://github.com/dequelabs/axe-core/releases/tag/${version}`,
		result: {
			'@type': 'TestResult',
			outcome: `earl:${outcome}`,
		},
	}

	if (ruleId) {
		const minor = version.match(/[0-9]+\.[0-9]+/)[0]
		assertion.test = {
			'@type': 'TestCase',
			title: ruleId,
			'@id': `https://dequeuniversity.com/rules/axe/${minor}/${ruleId}?application=axeAPI`,
		}
	}
	return assertion
}

function axeReporterEarl({ raw: ruleResults = [], env = {} }) {
	const { url, version } = env
	const graph = []

	ruleResults.forEach(ruleResult => {
		if (ruleResult.result === 'inapplicable') {
			graph.push(
				earlAssertion({
					outcome: 'inapplicable',
					ruleId: ruleResult.id,
					source: url,
					version,
				})
			)
			return
		}

		axeTypes.forEach(axeType => {
			ruleResult[axeType].forEach(() => {
				graph.push(
					earlAssertion({
						outcome: outcomeMap[axeType] || axeType,
						ruleId: ruleResult.id,
						source: url,
						version,
					})
				)
			})
		})
	})

	return {
		'@context': context,
		'@graph': graph,
	}
}

function earlUntested({ url, version }) {
	const untestedAssertion = earlAssertion({
		source: url,
		version,
	})
	return {
		'@context': context,
		'@graph': [untestedAssertion],
	}
}

function earlInapplicable({ url, version }) {
	const inapplicableAssertion = earlAssertion({
		outcome: 'inapplicable',
		// ruleId: ruleResult.id,
		source: url,
		version,
	})

	return {
		'@context': context,
		'@graph': [inapplicableAssertion],
	}
}

function concatReport(testResults) {
	// Flatten the graphs into a single array
	const graphs = testResults.reduce((graph, result) => {
		return graph.concat(result['@graph'])
	}, [])

	return {
		'@context': context,
		'@graph': graphs,
	}
}

module.exports = {
	axeReporterEarl,
	earlUntested,
	earlInapplicable,
	concatReport,
}
