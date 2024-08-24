import { assert } from "chai";

// Test cases including multiple networks
describe("TestNetworkDetection", function () {
	const TEST_CASES = [
		["341234567890123", "American Express"],
		["371234567890123", "American Express"],
		["38123456789012", "Diners Club"],
		["4123456789012", "Visa"],
		["4123456789012345", "Visa"],
		["4123456789012345678", "Visa"],
		["5112345678901234", "MasterCard"],
		["5212345678901234", "MasterCard"],
		["5312345678901234", "MasterCard"],
		["5412345678901234", "MasterCard"],
		["5512345678901234", "MasterCard"],
		["6011123456789012345", "Discover"],
		["6221261234567890", "Discover"],
		["6441234567890123", "Discover"],
		["6512345678901234", "Discover"],
		["5034567890123456", "Maestro"],
		["582126123456", "Maestro"],
	];

	TEST_CASES.forEach(function ([cardNumber, expectedNetwork]) {
		it(`should detect ${expectedNetwork} for card number ${cardNumber}`, function () {
			let detectedNetwork = detectNetwork(cardNumber);
			if (Array.isArray(detectedNetwork)) {
				assert.include(
					detectedNetwork,
					expectedNetwork,
					`Card number ${cardNumber} is not in network ${expectedNetwork}.`
				);
			} else {
				assert.equal(
					detectedNetwork,
					expectedNetwork,
					`Card number ${cardNumber} is not in network ${expectedNetwork}.`
				);
			}
		});
	});
});

// #| Network		| IIN (Prefix)		    | Length	|
// #| American Express	| 34, 37	  | 15		|
// #| Diners Club		| 38, 39	  | 14	 	|
// #| Visa			| 4					          | 13, 16, 19	|
// #| MasterCard| 51, 52, 53, 54, 55	| 16		|
// #| Discover  | 6011, 622126-622925, 644-649, 65	| 16, 19     	|
// #| Maestro   | 50, 56-59				| 12-19      	|

function detectNetwork(cardNumber) {
	const cardNetworkByPrefix = {
		"American Express": ["34", "37"],
		"Diners Club": ["38", "39"],
		Visa: ["4"],
		MasterCard: ["51", "52", "53", "54", "55"],
		Discover: ["6011", ["622126", "622925"], ["644", "649"], "65"],
		Maestro: ["50", ["56", "59"]],
	};

	const cardNetworkByLength = {
		"American Express": [15],
		"Diners Club": [14],
		Visa: [13, 16, 19],
		MasterCard: [16],
		Discover: [16, 19],
		Maestro: [[12, 19]],
	};

	const lengthType = [];
	for (let el in cardNetworkByLength) {
		const arr = cardNetworkByLength[el];
		for (let i = 0; i < arr.length; i++) {
			if (arr[i] == cardNumber.length) {
				lengthType.push(el);
			} else if (Array.isArray(arr[i])) {
				if (cardNumber.length >= arr[i][0] && cardNumber.length <= arr[i][1]) {
					lengthType.push(el);
				}
			}
		}
	}

	const prefixType = [];
	for (let el in cardNetworkByPrefix) {
		const arr = cardNetworkByPrefix[el];
		for (let i = 0; i < arr.length; i++) {
			if (typeof arr[i] == "string") {
				const prefixLength = arr[i].length;
				const prefix = cardNumber.slice(0, prefixLength);

				if (prefix == arr[i]) {
					prefixType.push(el);
				}
			} else if (Array.isArray(arr[i])) {
				const prefixLength = arr[i][0].length;
				const prefix = parseInt(cardNumber.slice(0, prefixLength));

				if (prefix >= arr[i][0] && prefix <= arr[i][1]) {
					prefixType.push(el);
				}
			}
		}
	}

	for (let i = 0; i < lengthType.length; i++) {
		for (let j = 0; j < prefixType.length; j++) {
			if (lengthType[i] == prefixType[j]) return lengthType[i];
		}
	}

	return false;
}
