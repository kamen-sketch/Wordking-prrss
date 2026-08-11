import Participle from '../../../values/Participle.js'
import checkException from '../../passiveVoice/periphrastic/checkException.js'
import directPrecedenceException from '../../stringProcessing/directPrecedenceExceptionWithoutRegex'
import nonDirectPrecedenceException from '../../passiveVoice/periphrastic/freeAuxiliaryParticipleOrder/nonDirectParticiplePrecedenceException'

/**
 * Creates a Participle object for the Polish language.
 *
 * @param {string} participle The participle.
 * @param {string} sentencePart The sentence part that contains the participle.
 * @param {Object} attributes  The attributes object.
 *
 * @constructor
 */
class PolishParticiple extends Participle {
	constructor (participle, sentencePart, attributes) {
		super(participle, sentencePart, attributes)

		this.directPrecedenceException    = directPrecedenceException
		this.nonDirectPrecedenceException = nonDirectPrecedenceException

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
		const auxiliaries = this.getAuxiliaries()
		const language = this.getLanguage()

		return !this.directPrecedenceException(sentencePart, participle, language) &&
			!this.nonDirectPrecedenceException(sentencePart, participle, auxiliaries, language)
	}
}

export default PolishParticiple