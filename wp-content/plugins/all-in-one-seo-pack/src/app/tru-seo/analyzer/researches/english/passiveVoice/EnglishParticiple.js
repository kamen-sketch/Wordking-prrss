import Participle from '../../../values/Participle.js'
import checkException from '../../passiveVoice/periphrastic/checkException.js'
import nonVerbsEndingEdFactory from './non-verb-ending-ed.js'
import directPrecedenceException from '../../stringProcessing/directPrecedenceExceptionWithoutRegex'
import precedenceException from '../../stringProcessing/precedenceExceptionWithoutRegex'

import { includes, isEmpty, intersection } from 'lodash-es'

const nonVerbsEndingEd = nonVerbsEndingEdFactory()

const irregularExclusionArray = [ 'get', 'gets', 'getting', 'got', 'gotten' ]

/**
 * Creates a Participle object for the English language.
 *
 * @param {string} participle The participle.
 * @param {string} sentencePart The sentence part that contains the participle.
 * @param {Object} attributes  The attributes object.
 *
 * @constructor
 */
class EnglishParticiple extends Participle {
	constructor (participle, sentencePart, attributes) {
		super(participle, sentencePart, attributes)

		this.directPrecedenceException = directPrecedenceException
		this.precedenceException       = precedenceException

		checkException(this)
	}

	/**
	 * Checks if any exceptions are applicable to this participle that would result in the sentence part not being passive.
	 * If no exceptions are found, the sentence part is passive.
	 *
	 * @returns {boolean} Returns true if no exception is found.
	 */
	isPassive () {
		const sentencePart = this.getSentencePart()
		const participle = this.getParticiple()
		const language = this.getLanguage()

		return !this.isNonVerbEndingEd() &&
			!this.hasRidException() &&
			!this.directPrecedenceException(sentencePart, participle, language) &&
			!this.precedenceException(sentencePart, participle, language)
	}

	/**
	 * Checks whether a found participle is in the nonVerbsEndingEd list.
	 * If a word is in the nonVerbsEndingEd list, it isn't a participle.
	 * Irregular participles do not end in -ed, and therefore cannot be in the nonVerbsEndingEd list.
	 *
	 * @returns {boolean} Returns true if it is in the nonVerbsEndingEd list, otherwise returns false.
	 */
	isNonVerbEndingEd () {
		if ('irregular' === this.getType()) {
			return false
		}
		return includes(nonVerbsEndingEd, this.getParticiple())
	}

	/**
	 * Checks whether the participle is 'rid' in combination with 'get', 'gets', 'getting', 'got' or 'gotten'.
	 * If this is true, the participle is not passive.
	 *
	 * @returns {boolean} Returns true if 'rid' is found in combination with a form of 'get'
	 * otherwise returns false.
	 */
	hasRidException () {
		if ('rid' === this.getParticiple()) {
			const auxiliaries = this.getAuxiliaries()
			return !isEmpty(intersection(irregularExclusionArray, auxiliaries))
		}
		return false
	}
}

export default EnglishParticiple