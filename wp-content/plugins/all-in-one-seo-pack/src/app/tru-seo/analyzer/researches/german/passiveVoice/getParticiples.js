import getWords from '../../stringProcessing/getWords.js'
import regexFunctionFactory from './regex.js'
import irregularParticiplesFactory from './irregulars.js'
import GermanParticiple from './GermanParticiple.js'

import { forEach, includes } from 'lodash-es'

const regexFunction = regexFunctionFactory()
const verbsBeginningWithErVerEntBeZerHerUber = regexFunction.verbsBeginningWithErVerEntBeZerHerUber
const verbsBeginningWithGe = regexFunction.verbsBeginningWithGe
const verbsWithGeInMiddle = regexFunction.verbsWithGeInMiddle
const verbsWithErVerEntBeZerHerUberInMiddle = regexFunction.verbsWithErVerEntBeZerHerUberInMiddle
const verbsEndingWithIert = regexFunction.verbsEndingWithIert
const irregularParticiples = irregularParticiplesFactory()

/**
 * Creates GermanParticiple Objects for the participles found in a sentence.
 *
 * @param {string} sentencePartText The sentence to finds participles in.
 * @param {Array} auxiliaries The list of auxiliaries from the sentence part.
 * @param {string} language The language.
 *
 * @returns {Array} The array with GermanParticiple Objects.
 */
export default function (sentencePartText, auxiliaries, language) {
	const words = getWords(sentencePartText)

	const foundParticiples = []

	forEach(words, function (word) {
		if (0 !== verbsBeginningWithGe(word).length) {
			foundParticiples.push(
				new GermanParticiple(word, sentencePartText, { auxiliaries: auxiliaries, type: 'ge at beginning', language: language })
			)
			return
		}
		if (0 !== verbsWithGeInMiddle(word).length) {
			foundParticiples.push(
				new GermanParticiple(word, sentencePartText, { auxiliaries: auxiliaries, type: 'ge in the middle', language: language })
			)
			return
		}
		if (0 !== verbsBeginningWithErVerEntBeZerHerUber(word).length) {
			foundParticiples.push(
				new GermanParticiple(word, sentencePartText,
					{ auxiliaries: auxiliaries, type: 'er/ver/ent/be/zer/her at beginning', language: language })
			)
			return
		}
		if (0 !== verbsWithErVerEntBeZerHerUberInMiddle(word).length) {
			foundParticiples.push(
				new GermanParticiple(word, sentencePartText,
					{ auxiliaries: auxiliaries, type: 'er/ver/ent/be/zer/her in the middle', language: language })
			)
			return
		}
		if (0 !== verbsEndingWithIert(word).length) {
			foundParticiples.push(
				new GermanParticiple(word, sentencePartText, { auxiliaries: auxiliaries, type: 'iert at the end', language: language })
			)
		}
		if (includes(irregularParticiples, word)) {
			foundParticiples.push(
				new GermanParticiple(word, sentencePartText, { auxiliaries: auxiliaries, type: 'irregular', language: language })
			)
		}
	})
	return foundParticiples
}