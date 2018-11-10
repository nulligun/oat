import axios from "axios";
let restify = require('restify');
let server = restify.createServer();
var rsa = require('jsrsasign');

function parse_oa_string(oa_string)
{
	let mode = 'key';
	let key = '';
	let value = '';
	let valuePos = 0;
	let quotedString = false;
	let results = {};
	for (let i = 0; i < oa_string.length; i++) {
		let char = oa_string.substr(i, 1);
		if (mode === 'key') {
			if (char === '=') {
				key = key.trim();
				mode = 'value';
				valuePos = 0;
				quotedString = false;
			} else {
				key = key + char;
			}
		} else if (mode === 'value') {
			if (char === '"') {
				if (valuePos === 0) {
					quotedString = true;
				} else {
					if (!quotedString) {
						value = value + char;
					} else {
						quotedString = false;
					}
				}
			} else if (char === ';') {
				if (quotedString) {
					value = value + char;
				} else {
					mode = 'key';
					results[key] = value.trim();
					key = '';
					value = '';
				}
			} else {
				value = value + char;
			}
			valuePos = valuePos + 1;
		}
	}

	if (key !== '') {
		results[key] = value.trim();
	}
	return results;
}

function get_oa_entries(address, records)
{
	let result = [];
	records.forEach((r) => {
		let record = r.data.replace(/^"|"$/, '').replace(/\"\"/, '');
		if (record.substr(0, 4).toLowerCase() == 'oa1:')
		{
			let rec = record.substr(4).trim();
			let matches = rec.match(/^(.*?) (.*)"$/);
			let currency = matches[1].toLowerCase();
			let properties = parse_oa_string(matches[2]);
			result.push({currency: currency, domain: address, txt: record, properties: properties});
		}
	});

	return result;
}

function oa_sign_result(result)
{
	let sig = new rsa.Signature({"alg": "SHA256withRSA"});
	sig.init("-----BEGIN PRIVATE KEY-----\n" +
		"MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC/jamf82OVuhdO\n" +
		"xGBhLk8sdx337YxTLztXejBdB7HvRkoZwZhU29Z3SWwKdXvH7d7KyJ1qQOKbPExf\n" +
		"gtVv54cMW6KztKSwOU0+5qg7ecCzpSH7bwl2sH9PvPPPrRLNrVZYHDZR0fgIT0kW\n" +
		"wJrbKSdLVetErNGlGu+IdXia62diACJk74TqxzSZJw8ttMZGa+tYBHUpCC+oxTUq\n" +
		"p2akLeu38xHFB5GzgxaD1iIh9wme5rl7EQHo/P4KOZXH6GXQO42/KPM893CLuJIV\n" +
		"fb+6aAYO4z+Hqa33CMp5iDC5sWa1RqFZNhqOw8U2ZcFg+iyeqO62qdzdWib0HXnD\n" +
		"p+KnhgiXAgMBAAECggEAMhjmqAKLpPkKZ3tMiZ4G7uYoXFMwRAEyT+qRA4OjsaR8\n" +
		"dMgBAxCLwp7dNs8LFHrNrdNR+BwIJ/lZMBGTqLSwyTaeEsnH2J7j6POCRCvPjiw9\n" +
		"+vhLTVNTuJL+YO4u4MPYtSqLulJjwCicQOsWlQLqV/WcllVsbvXgd5vhcwLmAub6\n" +
		"KXLzlqB79kOsX2r2tzNRLY91UuIfFFz3seTSoDPvigRsRB+6UDeUgOUCv8N/t5Bo\n" +
		"1foybSA1wbMcxFOqVEZfWqzZh9MDCB3zwlQ/orefUK4k3LWbbG0CHdIFGUd0k4sv\n" +
		"tTKKbMYPIrY+8Nfkxod5uoaRsJS4vIPLcp2P0JrrYQKBgQDm1cMQj9ykpqzCgd6e\n" +
		"oDIzJerU5ellUXWOSKLKpTdBhyI+mj3dfYPHqE4Y0bXip786a+zV3r9VY4bklv7h\n" +
		"FrF99qzPIKwBO4Mkypx3zFWnpafBtJ9+8JZVO+8cZZlYR23CTC81EQGEMy2JDE4h\n" +
		"QN6TUpvj66k86RsIIKdqZQe7AwKBgQDUb5zQ7wTPiGEMZqnpuRLwwm4t8DRyqRlY\n" +
		"KIHiHoeLz9pZhYm+AnhlnNaLXPI9NDXE3Qf3mHND5Tx7q2ElBFPR/jDr0oDsEgBR\n" +
		"JjKP76Lbgk2CzNluYehabvGilnXipvcc0dj1odYmWwWIdcmIjVelYgTUGF5jmiWD\n" +
		"hhItXnjd3QKBgGsATbKgrSuZo11qa/Jl2b9B5VAY3w67Kt3wp5195lY2uNYCE4lX\n" +
		"RD3Js6HnnANbtNX070zYOyLuxrmxkKZwKYh1TveYcoMDvi/Qx6T0kAPtUw0EmCZ0\n" +
		"iYsrBBTKt8FnIua8/+j+YBCS1JnBnXnmowXxdhe5xrJYb9JdqJ02BdZXAoGAVssj\n" +
		"Ltn5BTGbNQ3c7fkHnAZULcCuLQqZqEMkjdYbWywY8ep1VIR93EYwAdB/yDHEpiII\n" +
		"V0iaD2thQsXKcu1JscpBApiGw+y25HDOx7AIwdaDBKXdUBQAcrJRVzRSBcBhxgyW\n" +
		"sATnEdSudgppxLi6zn81qdIq/lbEbPAiDRdEGqECgYEA212QJMTET3Zw16sUzkyz\n" +
		"FWW038dROhjUos+A3KXmdtK1VyJylF2K/nx33rLRKsD1pVReb89zYnwZ8TJoQWnP\n" +
		"ZgIhFMt7VmtVOsu8y3Jk/KOwrII28k5E0oJUmrIs73BY47PvZjWkqjXZva8zetah\n" +
		"ymTIQnuSfuBBgOB6XZILLUQ=\n" +
		"-----END PRIVATE KEY-----\n");   // rsaPrivateKey of RSAKey object
	sig.updateString(JSON.stringify(result));
	let sigValueHex = sig.sign()
	return sigValueHex;
}

function lookup(request, response, next) {
	let address = request.body.address;

	axios.get('https://dns.google.com/resolve', {params: {name: address, type: 'TXT'}}).then((res) => {
		let result = {};
		result['status'] = res.data.Status;
		if (res.data.Status === 1) {
			result['message'] = 'DNS Query Format Error';
		} else if (res.data.Status === 2) {
			result['message'] = 'Server failed to complete the DNS request';
		} else if (res.data.Status === 3) {
			result['message'] = 'Domain name does not exist';
		} else if (res.data.Status === 4) {
			result['message'] = 'Function not implemented';
		} else if (res.data.Status === 5) {
			result['message'] = 'The server refused to answer for the query';
		} else if (res.data.Status === 6) {
			result['message'] = 'Name that should not exist, does exist';
		} else if (res.data.Status === 7) {
			result['message'] = 'RRset that should not exist, does exist';
		} else if (res.data.Status === 8) {
			result['message'] = 'Server not authoritative for the zone';
		} else if (res.data.Status === 9) {
			result['message'] = 'Name not in zone';
		} else if (res.data.Status !== 0) {
			result['message'] = 'Unknown error: ' + res.data.Status;
		}
		result['googledns'] = res.data.RD && res.data.RA;
		result['dnssec_valid'] = res.data.AD;

		if ('Answer' in res.data) {
			result['records'] = get_oa_entries(address, res.data.Answer);
		} else {
			result['records'] = [];
		}

		response.send({payload: result, signature: oa_sign_result(result)});
		next();
	});
}

server.use(restify.plugins.bodyParser());
server.post('/lookup', lookup);

server.listen(5000, function () {
	console.log('%s listening at %s', server.name, server.url);
});