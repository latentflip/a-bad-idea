module.exports.ENORULE = function (target, requirer) {
    return "make: *** No rule to make target `" + target + "', needed by `" + requirer + "'.  Stop.";
};

module.exports.upToDate = function (f) {
    return "make: `" + f + "' is up to date.";
};
