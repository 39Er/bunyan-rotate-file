'use strict';

const path = require('path');
const bunyan = require('bunyan');
const RotateFileStream = require('./index');

let logger = bunyan.createLogger({
  name: 'bunyan-rotate',
  serializers: bunyan.stdSerializers,
  src: false,
  streams: [
    {
      level: 'error',
      type: 'raw',
      stream: new RotateFileStream(path.join(__dirname, '/logs/error.log')),
    }, {
      level: 'info',
      stream: process.stdout,
    },
  ],
});

setInterval(function () {
  logger.error('test bunyan error');
}, 2000);