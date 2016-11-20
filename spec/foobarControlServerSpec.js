/* global describe, it */
const assert = require('chai').assert;

describe('Foobar web UI server', () => {

	const express = require('express');
	const app = express();
	const server = require('http').createServer(app);
	const websocketServer = require('../src/websocketServer');

	server.listen(9999);

	it('should initialize a websocket server', (done) => {
		const foobarServer = websocketServer(server);
		assert.isOk(foobarServer);
		server.close();
		done();
	});
});

describe('parseMessage', () => {

	const parseMessage = require('../src/parseMessage');

	it('should parse an information block', () => {
		const lines = [
			'999|Connected to foobar2000 Control Server v1.0.1|',
			'999|Accepted client from 127.0.0.1|',
			'999|There are currently 2/10 clients connected|',
			'999|Type \'?\' or \'help\' for command information|'
		];
		const message = lines.join('\r\n');
		const expectedMessage = lines.join('\n') + '\n';
		const parsedMessage = parseMessage.parseControlData(message);

		assert.equal(parsedMessage.info, expectedMessage);
	});

	it('should parse a playback status message', () => {
		const message = '111|3|282|2.73|FLAC|605|Imaginary Friends|Bronchitis|2013|Post-rock|01|Bronchitis (entire)|745|';
		const expectedTrackData = {
			status: '111',
			secondsPlayed: '2.73',
			codec: 'FLAC',
			bitrate: '605',
			artist: 'Imaginary Friends',
			album: 'Bronchitis',
			date: '2013',
			genre: 'Post-rock',
			trackNumber: '01',
			track: 'Bronchitis (entire)',
			trackLength: '745',
			state: 'playing'
		};
		const parsedObject = parseMessage.parseControlData(message);

		assert.deepEqual(parsedObject.status, expectedTrackData);
	});

	it('should set state "playing" for code "111"', () => {
		const message = '111|3|282|2.73|FLAC|605|Imaginary Friends|Bronchitis|2013|Post-rock|01|Bronchitis (entire)|745|';
		const parsedObject = parseMessage.parseControlData(message);

		assert.equal(parsedObject.status.state, 'playing');
	});

	it('should set state "stopped" for code "112"', () => {
		const message = '112|3|282|2.73|FLAC|605|Imaginary Friends|Bronchitis|2013|Post-rock|01|Bronchitis (entire)|745|';
		const parsedObject = parseMessage.parseControlData(message);

		assert.equal(parsedObject.status.state, 'stopped');
	});

	it('should set state "paused" for code "113"', () => {
		const message = '113|3|282|2.73|FLAC|605|Imaginary Friends|Bronchitis|2013|Post-rock|01|Bronchitis (entire)|745|';
		const parsedObject = parseMessage.parseControlData(message);

		assert.equal(parsedObject.status.state, 'paused');
	});

	it('should parse volume change message', () => {
		const message = '222|-1.58|';
		const parsedObject = parseMessage.parseControlData(message);
		const mockVolumeResponse = {
			status: {
				volume: '-1.58'
			}
		};

		assert.deepEqual(parsedObject, mockVolumeResponse);
	});
});
