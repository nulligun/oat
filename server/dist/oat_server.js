'use strict';

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var restify = require('restify');
var server = restify.createServer();



function get_oa_entries(address, records) {
	var result = [];
	records.forEach(function (r) {
		if (r.data.substr(0, 5) == '"oa1:') {
			var rec = r.data.substr(5);
			var matches = rec.match('/^(.*?) (.*)$');
			var currency = matches[1];
			var mappings = parse_oa_string(matches[2]);
			result.push({currency: mappings});
		}
	});
	return result;
}

function oa_sign_result(result) {
	return '';
}

function lookup(req, res, next) {
	var address = req.body.address;

	_axios2.default.get('https://dns.google.com/resolve', { params: { name: address, type: 'TXT' } }).then(function (res) {
		var result = {};
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
		} else {
			result['message'] = 'Unknown error: ' + res.data.Status;
		}
		result['googledns'] = res.data.RD && res.data.RA;
		result['dnssec_valid'] = res.data.AD;

		result['records'] = get_oa_entries(address, res.data.Answer);

		res.send({ payload: result, signature: oa_sign_result(result) });
		next();
	});
}

server.use(restify.plugins.bodyParser());
server.post('/lookup', lookup);

server.listen(5000, function () {
	console.log('%s listening at %s', server.name, server.url);
});