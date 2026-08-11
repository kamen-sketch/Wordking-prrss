import arrayToRegex from '../../../stringProcessing/createRegexFromArray.js'
import auxiliariesGermanFactory from '../../german/passiveVoice/auxiliaries.js'
import getParticiples from './getParticiples.js'
import determineSentencePartIsPassive from '../../passiveVoice/periphrastic/determineSentencePartIsPassive.js'
const germanAuxiliaries = auxiliariesGermanFactory().allAuxiliaries

const auxiliaryRegex = arrayToRegex(germanAuxiliaries)

/**
 * Determines whether a sentence part is passive.
 *
 * @param {string} sentencePartText The sentence part to determine voice for.
 * @param {Array} auxiliaries A list with auxiliaries in this sentence part.
 * @param {string} language The language of the sentence part.

 * @returns {boolean} Returns true if passive, otherwise returns false.
 */
export default function (sentencePartText, auxiliaries, language) {
	const passive = false
	const auxiliaryMatches = sentencePartText.match(auxiliaryRegex)
	if (null === auxiliaryMatches) {
		return passive
	}
	const participles = getParticiples(sentencePartText, auxiliaries, language)
	return determineSentencePartIsPassive(participles)
}