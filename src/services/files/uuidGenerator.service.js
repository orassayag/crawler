const { v1: uuidv1, v3: uuidv3, v4: uuidv4, v5: uuidv5 } = require('uuid');

class UUIDGeneratorService {

	constructor() { }

	getUUID(number, name) {
		switch (number) {
			case 1: { return uuidv1(); }
			case 2: case 3: { return uuidv3(name, uuidv3.DNS); }
			case 4: { return uuidv4(); }
			case 5: { return uuidv5(name, uuidv5.DNS); }
		}
	}
}

module.exports = new UUIDGeneratorService();