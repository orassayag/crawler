/*
Credit to: https://github.com/yetzt/node-typojs
Made some cosmetic changers to fit modern javascript.
Added here special characters implementation.
*/

const settings = require('../../settings/settings');
const { characterUtils, textUtils } = require('../../utils');
const { TestsData } = require('../../core/models/application');

class TyposGeneratorService {

	constructor() {
		// ===TESTS DATA=== //
		this.testsData = null;
	}

	tripleReplace(data) {
		let { word } = data;
		const { i, isPositive } = data;
		word = textUtils.replaceAt({ text: word, position: i, newText: word[isPositive ? i + 2 : i - 2] });
		word = textUtils.replaceAt({ text: word, position: isPositive ? i + 1 : i - 1, newText: word[i] });
		word = textUtils.replaceAt({ text: word, position: isPositive ? i + 2 : i - 2, newText: word[isPositive ? i + 1 : i - 1] });
		return word;
	}

	doubleReplace(data) {
		let { word } = data;
		const { i, advanceCount, isPositive } = data;
		word = textUtils.replaceAt({ text: word, position: i, newText: word[isPositive ? i + advanceCount : i - advanceCount] });
		word = textUtils.replaceAt({ text: word, position: isPositive ? i + advanceCount : i - advanceCount, newText: word[i] });
		return word;
	}

	generateTypos(word, callback) {
		let _word = word.toLocaleLowerCase();
		let _typos = [];
		let _length = _word.length;
		for (let i = 0; i < _length; i++) {
			if (word[i] in characterUtils.keyMap) {
				characterUtils.keyMap[word[i]].forEach((ch) => {
					// Keyboard mishit.
					_typos.push(textUtils.replaceAt({ text: _word, position: i, newText: ch }));
					// Sausagefingers.
					_typos.push(textUtils.replaceAt({ text: _word, position: i, newText: [word[i], ch].join('') }));
					_typos.push(textUtils.replaceAt({ text: _word, position: i, newText: [ch, word[i]].join('') }));
				});
			}
			// Double and missing characters.
			_typos.push(textUtils.replaceAt({ text: _word, position: i, newText: '' }));
			_typos.push(textUtils.replaceAt({ text: _word, position: i, newText: [_word[i], _word[i]].join('') }));
			if (i < (_length - 1)) {
				// Character shiftflips.
				_typos.push(this.tripleReplace({ word: _word, i: i, advanceCount: 1, isPositive: true }));
			}
			if (i < (_length - 2)) {
				// Character shift left.
				_typos.push(this.tripleReplace({ word: _word, i: i, isPositive: true }));
				// Character flip left.
				_typos.push(this.tripleReplace({ word: _word, i: i, advanceCount: 2, isPositive: true }));
			}
			if (i > 1) {
				// Character shift right.
				_typos.push(this.tripleReplace({ word: _word, i: i, isPositive: false }));
				// Character flip right.
				_typos.push(this.tripleReplace({ word: _word, i: i, advanceCount: 2, isPositive: false }));
			}
		}
		const typos = [];
		_typos.forEach((t) => {
			if (typos.indexOf(t) < 0) {
				typos.push(t);
			}
		});

		// Generate typos with special characters.
		const numberOfTypos = textUtils.getRandomNumber(this.testsData.minimumSpecialCharactersTyposEmailAddressesCount,
			this.testsData.maximumSpecialCharactersTyposEmailAddressesCount);
		for (let i = 0; i < numberOfTypos; i++) {
			let typo = word;
			const randomSpecialCharactersNumber = textUtils.getRandomNumber(this.testsData.minimumSpecialCharactersCount,
				this.testsData.maximumSpecialCharactersCount);
			for (let y = 0; y < randomSpecialCharactersNumber; y++) {
				const randomSpecialCharacter = textUtils.getRandomKeyFromArray(characterUtils.allSpecialCharacters);
				const randomPositionIndex = textUtils.getRandomNumber(0, word.length);
				typo = textUtils.replaceAt({ text: typo, position: randomPositionIndex, newText: randomSpecialCharacter });
			}
			typos.push(typo);
		}
		// Act blocking if no callback is given.
		if (typeof callback !== 'function') {
			return typos;
		}
		// Call back.
		callback(typos);
	}

	generateTyposAsync(text) {
		return new Promise(resolve => {
			// ===TESTS DATA=== //
			this.testsData = new TestsData(settings);
			this.generateTypos(text, (typos) => {
				resolve(typos.join().split(','));
			});
		});
	}
}

const typosGeneratorService = new TyposGeneratorService();
module.exports = typosGeneratorService;