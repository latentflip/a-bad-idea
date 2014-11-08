var Promise = require('bluebird');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var async = require('async');
var parser = require('./parser');
var _ = require('underscore');

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

var ast = parser.parse(fs.readFileSync(resolvePath('ExampleMakefile')).toString());

var targets = {};

ast.forEach(function (task) {
    targets[task.target.file] = task;
});

var build = function (target) {
    if (targets[target]) return buildTarget(target, targets[target]);
    //return buildFile(target);
};

function buildTarget(target, task) {
    console.log(target, task);

    return existsPromise(target).then(function (exists) {
        if (exists) { return getMtime(target); }

        return runTask(task).then(function () {
            return getMtime(target);
        });
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
    return task.actions.reduce(function (p, action) {
        return p.then(execAsync(action));
    }, Promise.resolve());
}

function getMtime(file) {
    return fs.statAsync(resolvePath(file))
             .then(function (stat) {
                 return stat.mtime;
             });
}

build('foo.js').then(function (r) {
                    console.log('Build complete', r);
                })
                .error(console.log);

/* Build foo.js
 * Does foo.js have any dependencies?
 *   - If not, does it exist?
 *      - If not, build it */



//ast.forEach(function (task) {
//    isStale(runAt, task.target.target, task.target.dependencies, function (err, stale) {
//        if (stale) {
//            console.log('Is stale', task.target);
//            runTask(task);
//        } else {
//            console.log('Is not stale', task.target);
//        }
//    });
//    //async.eachSeries(target.actions, function (action, next) {
//    //    exec(action, next);
//    //}, function (err) {
//    //    console.log(err);
//    //    console.log('done');
//    //});
//});
//
//function isStale(target, deps, done) {
//    fs.exists(resolvePath(target), function (exists) {
//        //If target doesn't exist, rebuild it
//        if (!exists) return done(null, true);
//
//        //If has no depths, must not be stale
//        if (deps.length === 0) return done(null, false);
//        
//        async.map(deps, function (dep, done) {
//            
//
//        }, function (err, results) {
//            if (err) { return done(err); }
//            done(null, _.all(results));
//        });
//    });
//}
//
//function runTask(task, done) {
//    async.eachSeries(task.actions, function (action, next) {
//        exec(action, next, {
//            cwd: relativeTo
//        }); 
//    }, done);
//}
