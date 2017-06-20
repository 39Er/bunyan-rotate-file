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

  constructor(logpath) {
    this.logpath = logpath;
    this.logger = null;
  }

  write(rec) {
    this.logger = _createStream(this.logpath, this.logger);
    rec.time = moment().format('YYYY-MM-DDTHH:mm:ss');
    let str = JSON.stringify(rec, safeCycles()) + '\n';
    this.logger.write(str);
  }

}

/**
 * create log writeStream
 * @param {String} logpath 
 */
function _createStream(logpath, logger) {
  try {
    let stat = fs.statSync(logpath);
    if (moment(stat.atime, 'YYYYMMDD').diff(moment().format('YYYYMMDD'), 'days') !== 0) {
      if (logger) {
        logger.close();
        logger = null;
      }
      fs.renameSync(logpath, util.format('%s.%s', logpath, moment(stat.ctime).format('YYYYMMDD')));
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
