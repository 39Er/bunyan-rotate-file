'use strict';

const fs = require('fs');
const util = require('util');
const path = require('path');
const bunyan = require('bunyan');
const moment = require('moment');

const sep = path.sep;
const safeCycles = bunyan.safeCycles;

/**
 * bunyan stream
 * @param [string] logpath
 */
module.exports = class RotateFileStream {

  constructor(logpath, maxSize) {
    if (arguments.length === 2) {
      this.maxSize = maxSize;
    }
    this.logpath = logpath;
    this.logger = null;
  }

  write(rec) {
    if (this.maxSize === undefined) {
      this.logger = _createStream(this.logpath, this.logger);
    } else {
      this.logger = _createStream(this.logpath, this.logger, this.maxSize);
    }
    rec.time = moment().format('YYYY-MM-DDTHH:mm:ss');
    let str = JSON.stringify(rec, safeCycles()) + '\n';
    this.logger.write(str);
  }
}

/**
 * create log writeStream
 * @param {String} logpath 
 */
function _createStream(logpath, logger, maxSize) {
  if (arguments.length === 3 && (isNaN(maxSize) || maxSize < 1)) {
    throw new Error('maxSize should be a number and bigger than 1');
  }
  try {
    let stat = fs.statSync(logpath);
    if (moment(stat.atime, 'YYYYMMDD').diff(moment(), 'days') !== 0) {
      if (logger) {
        logger.close();
        logger = null;
      }
      fs.renameSync(logpath, util.format('%s.%s', logpath, moment(stat.atime).format('YYYYMMDD')));
      let logdir = logpath.slice(0, logpath.lastIndexOf(sep));
      let files = fs.readdirSync(logdir);
      let currentNum = files.length;
      if (arguments.length === 3) {
        let i = 0;
        while (maxSize <= currentNum) {
          fs.unlinkSync(path.join(logdir, files[i]));
          i += 1;
          currentNum -= 1;
        }
      }
    }
  } catch (e) {
    if (e.code === 'ENOENT') {
      let logdir = logpath.slice(0, logpath.lastIndexOf(sep));
      if (!fs.existsSync(logdir)) {
        fs.mkdirSync(logdir);
      }
    }
  }
  if (!logger) {
    logger = fs.createWriteStream(logpath, { flags: 'a', encoding: 'utf8' });
  }
  return logger;
}
