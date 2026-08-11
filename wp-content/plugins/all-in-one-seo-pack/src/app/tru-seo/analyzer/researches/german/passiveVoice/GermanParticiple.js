import Participle from '../../../values/Participle.js'
import { getIndicesByWord as getIndices, getIndicesByWordList as getIndicesOfList } from '../../stringProcessing/indices.js'

import exceptionsParticiplesActiveFactory from './exceptionsParticiplesActive.js'

import auxiliariesFactory from './auxiliaries.js'

import { includes, map } from 'lodash-es'

const exceptionsParticiplesActive = exceptionsParticiplesActiveFactory()
const auxiliaries = auxiliariesFactory().participleLike

const exceptionsRegex =
	/\S+(apparat|arbeit|dienst|haft|halt|keit|kraft|not|pflicht|schaft|schrift|tät|wert|zeit)($|[ \n\r\t.,'()"+-;!?:/»«‹›<>])/ig

/**
 * Creates a Participle object for the German language.
 *
 * @param {string} participle The participle.
 * @param {string} sentencePart The sentence part that contains the participle.
 * @param {Object} attributes  The attributes object.
 *
 * @constructor
 */
class GermanParticiple extends Participle {
	/**
	 * Checks if the text is passive based on the participle exceptions.
	 *
	 * @returns {boolean} Returns true if there is no exception, and the sentence is passive.
	 */
	isPassive () {
		return 	!this.hasNounSuffix() &&
					!this.isInExceptionList() &&
					!this.hasHabenSeinException() &&
					!this.isAuxiliary()
	}

	/**
	 * Checks whether a found participle is in the exception list.
	 * If a word is in the exceptionsParticiplesActive list, it isn't a participle.
	 *
	 * @returns {boolean} Returns true if it is in the exception list, otherwise returns false.
	 */
	isInExceptionList () {
		return includes(exceptionsParticiplesActive, this.getParticiple())
	}

	/**
	 * Checks whether a found participle ends in a noun suffix.
	 * If a word ends in a noun suffix from the exceptionsRegex, it isn't a participle.
	 *
	 * @returns {boolean} Returns true if it ends in a noun suffix, otherwise returns false.
	 */
	hasNounSuffix () {
		return null !== this.getParticiple().match(exceptionsRegex)
	}

	/**
	 * Checks whether a participle is followed by 'haben' or 'sein'.
	 * If a participle is followed by one of these, the sentence is not passive.
	 *
	 * @returns {boolean} Returns true if it is an exception, otherwise returns false.
	 */
	hasHabenSeinException () {
		const participleIndices = getIndices(this.getParticiple(), this.getSentencePart())
		let habenSeinIndices = getIndicesOfList([ 'haben', 'sein' ], this.getSentencePart())
		if (0 < participleIndices.length && 0 === habenSeinIndices.length) {
			return false
		}
		habenSeinIndices = map(habenSeinIndices, 'index')
		const currentParticiple = participleIndices[0]
		return includes(habenSeinIndices, currentParticiple.index + currentParticiple.match.length + 1)
	}

	/**
	 * Checks whether a found participle is an auxiliary.
	 * If a word is an auxiliary, it isn't a participle.
	 *
	 * @returns {boolean} Returns true if it is an auxiliary, otherwise returns false.
	 */
	isAuxiliary () {
		return includes(auxiliaries, this.getParticiple())
	}
}

export default GermanParticiple