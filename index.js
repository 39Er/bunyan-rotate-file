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
  }
  write(rec) {
    let logger;
    try {
      let stat = fs.statSync(this.logpath);
      if (moment(stat.atime, 'YYYYMMDD').diff(moment().format('YYYYMMDD'), 'days') !== 0) {
        if (logger) {
          logger.close();
        }
        fs.renameSync(this.logpath, util.format('%s.%s', this.logpath, moment(stat.ctime).format('YYYYMMDD')));
      }
    } catch (e) {
      if (e.code === 'ENOENT') {
        let logdir = this.logpath.slice(0, this.logpath.lastIndexOf(sep));
        if (!fs.existsSync(logdir)) {
          fs.mkdirSync(logdir);
        }
      }
    }
    logger = fs.createWriteStream(this.logpath, { flags: 'a', encoding: 'utf8' });
    let str = JSON.stringify(rec, safeCycles()) + '\n';
    logger.write(str);
  }
}
