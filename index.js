'use strict';

const fs = require('fs');
const bunyan = require('bunyan');
const moment = require('moment');
const util = require('util');
const path = require('path');

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
      if (moment(stat.ctime).diff(new Date(), 'days') !== 0) {
        if (logger) {
          logger.close();
        }
        let pathArr = this.logpath.split('/');
        fs.renameSync(this.logpath, util.format('%s.%s', pathArr[pathArr.length - 1], moment(stat.ctime).format('YYYYMMDD')));
      }
      logger = fs.createWriteStream(this.logpath, { flags: 'a', encoding: 'utf8' });
    } catch (e) {
      if (e.errno === -4058) {
        let logdir = this.logpath.slice(0, this.logpath.lastIndexOf('\\'));
        if (!fs.existsSync(logdir)) {
          fs.mkdirSync(logdir);
        }
        logger = fs.createWriteStream(this.logpath, { flags: 'a', encoding: 'utf8' });
      }
    }
    let str = JSON.stringify(rec, safeCycles()) + '\n';
    logger.write(str);
  }
}
