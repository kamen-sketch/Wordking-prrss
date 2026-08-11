import SentencePart from '../../../values/SentencePart.js'
import getParticiples from '../../passiveVoice/periphrastic/getParticiples.js'

/**
 * Creates a English specific sentence part.
 *
 * @param {string} sentencePartText The text from the sentence part.
 * @param {Array} auxiliaries The list with auxiliaries.
 * @constructor
 */
class EnglishSentencePart extends SentencePart {
	/**
	 * Returns the participles found in the sentence part.
	 *
	 * @returns {Array} The array of Participle Objects.
	 */
	getParticiples () {
		return getParticiples(this.getSentencePartText(), this.getAuxiliaries(), 'en')
	}
}

export default EnglishSentencePart