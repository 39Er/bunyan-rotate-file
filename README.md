# bunyan-rotate-file-stream

> **A stream for bunyan to output log to file,every day create a new file**

## Installation

	npm install bunyan-rotate-file-stream

Example:

	let logger = bunyan.createLogger({
	  name: 'bunyan-rotate',
	  serializers: bunyan.stdSerializers,
	  src: false,
	  streams: [
	    {
	      level: 'error',
	      type: 'raw',
	      stream: new RotateFileStream('./logs/error.log')),
	    }
	  ],
	});
	logger.error('test bunyan logger');

In your directory,it will make a file named 'error.log'. On the secode day,it will rename the file like 'error.log.20170607',and make a new file named 'error.log' to store new logs of the secode day.

You can also add other streams ,like:

	let logger = bunyan.createLogger({
	  name: 'bunyan-rotate',
	  serializers: bunyan.stdSerializers,
	  src: false,
	  streams: [
	    {
	      level: 'error',
	      type: 'raw',
	      stream: new RotateFileStream(path.join('./logs/error.log')),
	    }, {
	      level: 'info',
	      stream: process.stdout,
	    },
	  ],
	});
	logger.info('test bunyan info');
	logger.error('test bunyan logger');

Output:

	[2017-06-07T08:21:10.965Z]  INFO: bunyan-rotate/13896 on CNBJHQTEC111: test bunyan info
	[2017-06-07T08:21:10.967Z] ERROR: bunyan-rotate/13896 on CNBJHQTEC111: test bunyan error

File '/logs/error.log':

	{"name":"bunyan-rotate","hostname":"CNBJHQTEC111","pid":13896,"level":50,"msg":"test bunyan error","time":"2017-06-07T08:21:10.967Z","v":0}


	