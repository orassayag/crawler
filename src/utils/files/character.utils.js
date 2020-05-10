/* cSpell:disable */
class CharacterUtils {
	constructor() {
		this.keyMap = {
			'1': ['2', 'q'],
			'2': ['1', 'q', 'w', '3'],
			'3': ['2', 'w', 'e', '4'],
			'4': ['3', 'e', 'r', '5'],
			'5': ['4', 'r', 't', '6'],
			'6': ['5', 't', 'y', 'z', '7'],
			'7': ['6', 'y', 'z', 'u', '8'],
			'8': ['7', 'u', 'i', '9'],
			'9': ['8', 'i', 'o', '0'],
			'0': ['9', 'o', 'p'],
			'q': ['1', '2', 'w', 'a'],
			'w': ['q', 'a', 's', 'e', '3', '2'],
			'e': ['w', 's', 'd', 'r', '4', '3'],
			'r': ['e', 'd', 'f', 't', '5', '4'],
			't': ['r', 'f', 'g', 'y', 'z', '6', '5'],
			'y': ['t', 'g', 'h', 'u', '7', '6', 'x', 's', 'a'],
			'u': ['y', 'z', 'h', 'j', 'i', '8', '7'],
			'i': ['u', 'j', 'k', 'o', '9', '8'],
			'o': ['i', 'k', 'l', 'p', '0', '9'],
			'p': ['o', 'l', '0'],
			'a': ['y', 'z', 's', 'w', 'q'],
			's': ['a', 'y', 'z', 'x', 'd', 'e', 'w'],
			'd': ['s', 'x', 'c', 'f', 'r', 'e'],
			'f': ['d', 'c', 'v', 'g', 't', 'r'],
			'g': ['f', 'v', 'b', 'h', 'y', 'z', 't'],
			'h': ['g', 'b', 'n', 'j', 'u', 'y', 'z'],
			'j': ['h', 'n', 'm', 'k', 'i', 'u'],
			'k': ['j', 'm', 'l', 'o', 'i'],
			'l': ['k', 'p', 'o'],
			'z': ['x', 's', 'a', 't', 'g', 'h', 'u', '7', '6'],
			'x': ['y', 'z', 'c', 'd', 's'],
			'c': ['x', 'v', 'f', 'd'],
			'v': ['c', 'b', 'g', 'f'],
			'b': ['v', 'n', 'h', 'g'],
			'n': ['b', 'm', 'j', 'h'],
			'm': ['n', 'k', 'j'],
			'ö': ['l', 'p', 'ü', 'ä', '-', '.'],
			'ä': ['-', 'ö', 'ü', '+', '#'],
			'ü': ['p', 'ö', 'ä', '+', '´', 'ß'],
			'ß': ['ü', 'p', '0']
		};
		this.separatorsCharacters = '_-';
		this.commonInvalidCharacters = '\',.-_';
		this.simpleCharacters = 'abcdefg12345';
		this.numbersCharacters = '0123456789';
		this.alphaCharacters = 'abcdefghijklmnopqrstuvwxyzABCEDEFGHIJKLMNOPQRSTUVWXYZ';
		this.specialCharacters = ' "#$%&\'()*+,-./:;<=>?@[\]^_`{|}~';
		this.verySpecialCharacters = '¡¢£¤¥₹¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿŒœŠšŸƒˆ˜ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρςστυφχψωϑϒϖ–—‘’‚“”„†‡‰‹›•…′″‾⁄℘ℑℜ™ℵ←↑→↓↔↵⇐⇑⇒⇓⇔◄►▲▼∀∂∃∅∇∈∉∋∏∑−∗√∝∞∠∧∨∩∪∫∴∼≅≈≠≡≤≥⊂⊃⊄⊆⊇⊕⊗⊥⋅⌈⌉⌊⌋〈〉◊♠♣♥♦';
		this.alphaNumericCharacters = this.numbersCharacters.concat(this.alphaCharacters);
		this.allSpecialCharacters = this.specialCharacters.concat(this.verySpecialCharacters);
	}
}

const characterUtils = new CharacterUtils();
module.exports = characterUtils;