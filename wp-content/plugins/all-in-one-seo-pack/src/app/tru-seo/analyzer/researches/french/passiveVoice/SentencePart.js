import SentencePart from '../../../values/SentencePart.js'
import getParticiples from '../../passiveVoice/periphrastic/getParticiples.js'

/**
 * Creates a French specific sentence part.
 *
 * @param {string} sentencePartText The text from the sentence part.
 * @param {Array} auxiliaries The list with auxiliaries.
 * @constructor
 */
class FrenchSentencePart extends SentencePart {
	constructor (sentencePartText, auxiliaries) {
		super(sentencePartText, auxiliaries, 'fr_FR')
	}

	/**
	 * Returns the participles found in the sentence part.
	 *
	 * @returns {Array} The array of Participle Objects.
	 */
	getParticiples () {
		return getParticiples(this.getSentencePartText(), this.getAuxiliaries(), 'fr')
	}
}

export default FrenchSentencePart