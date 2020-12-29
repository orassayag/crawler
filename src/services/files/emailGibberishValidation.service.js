/*
Credit to:
https://stackoverflow.com/questions/65393659/javascript-script-to-detect-gibberish
*/
const gibberish = require('gibberish-detector');
const { regexUtils } = require('../../utils');

class EmailGibberishValidationService {

	constructor() { }

	// Shannon Entropy test.
	entropy(str) {
		return Object.values(Array.from(str).reduce((freq, c) =>
			(freq[c] = (freq[c] || 0) + 1) && freq, {})
		).reduce((sum, f) => sum - f / str.length * Math.log2(f / str.length), 0);
	}

	// Count Vowel test.
	countVowels(word) {
		const matchs = word.match(regexUtils.countVowels);
		return matchs === null ? 0 : matchs.length;
	}

	// Dummy function.
	isTrue(value) {
		return value;
	}

	// Validate string by multiple tests.
	isGibberish(part) {
		const partWithoutPunctuation = part.replace(regexUtils.punctuation, '');
		const entropyValue = this.entropy(part) < 3.5;
		const gibberishValue = gibberish.detect(part) < 50;
		const vovelValue = 25 < 100 / partWithoutPunctuation.length * this.countVowels(partWithoutPunctuation) &&
			100 / partWithoutPunctuation.length * this.countVowels(part) < 35;
		return [entropyValue, gibberishValue, vovelValue].filter(this.isTrue).length === 0;
	}
}

module.exports = new EmailGibberishValidationService();