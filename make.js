var VERBOSE = process.argv.slice(2).indexOf('-v') >= 0;

var Promise = require('bluebird');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var async = require('async');
var parser = require('./parser');
var _ = require('underscore');
var messages = require('./messages');

var debug = VERBOSE ? console.log.bind(console, '>>') : _.identity;

fs = Promise.promisifyAll(fs);

var relativeTo = __dirname;
var runAt = Date.now();

var resolvePath = function (p) {
    return path.join(relativeTo, p);
};

var existsPromise = function (file) {
    return new Promise(function (resolve, reject) {
        fs.exists(file, resolve);
    });
};

var ast = parser.parse(fs.readFileSync(resolvePath('Makefile')).toString());

var targets = {};

ast.forEach(function (task) {
    targets[task.target] = task;
});

var build = function (target) {
    if (targets[target]) return buildTarget(target, targets[target]);
    return buildFile(target);
};

function buildTarget(target, task) {
    debug('Build target', target);
    return existsPromise(target).then(function (exists) {
        var deps = task.dependencies.map(function (d) {
            return build(d).error(function (e) {
                if (e.cause.code === 'ENOENT') {
                    console.error(messages.ENORULE(d, task.target));
                    process.exit(2);
                }
            });
        });

        return Promise.all(deps).then(function (depStats) {
            if (!exists) {
                debug('Does not exist', task.target);
                return runTask(task);
            } else {
                return getMtime(task.target).then(function (taskMtime) {
                    if (_.any(depStats, function (ds) { return ds.mTime > taskMtime; })) {
                        return runTask(task);
                    }

                    return { mTime: taskMtime, built: false, target: task.target };
                });
            }
        });
    });
}

function buildFile(file) {
    return getMtime(file).then(function (mTime) {
        return { mTime: mTime, built: false, target: file };
    });
}

function execAsync(cmd, options) {
    return new Promise(function (resolve, reject) {
        exec(cmd, function (err, result) {
            if (err) { return reject(err); }
            resolve(result.toString());
        }, options);
    });
}

function runTask(task) {
    return _runTask(task).then(function (stdout) {
        console.log(stdout.trim());
        return {mTime: Date.now(), built: true, target: task.target};//getMtime(task.target);
    });
}

function _runTask(task) {
    debug('Actually building', task.target);
    return task.actions.reduce(function (p, action) {
        console.log(action);
        return p.then(function () {
            return execAsync(action);
        });
    }, Promise.resolve());
}

function getMtime(file) {
    return fs.statAsync(resolvePath(file))
             .then(function (stat) {
                 return stat.mtime;
             });
}

build('foo.js').then(function (r) {
                    debug('Build complete', r);
                    if (!r.built) {
                        console.log(messages.upToDate(r.target));
                    }
                })
                .error(console.log);
