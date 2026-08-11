import SentencePart from '../../../values/SentencePart.js'
import getParticiples from './getParticiples.js'

/**
 * Creates a German specific sentence part.
 *
 * @param {string} sentencePartText The text from the sentence part.
 * @param {Array} auxiliaries The list with auxiliaries.
 * @constructor
 */
class GermanSentencePart extends SentencePart {
	constructor (sentencePartText, auxiliaries) {
		super(sentencePartText, auxiliaries, 'de_DE')
	}

	/**
	 * Returns the participles found in the sentence part.
	 *
	 * @returns {Array} The array of Participle Objects.
	 */
	getParticiples () {
		return getParticiples(this.getSentencePartText(), this.getAuxiliaries())
	}
}

export default GermanSentencePart