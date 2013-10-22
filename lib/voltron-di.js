var globule = require('globule');

module.exports = function (di) {
    di.defineModule = function  (moduleName, path, options) {
      var dependencies = (options && options.dependencies)? options.dependencies : [];
      if (!Array.isArray(dependencies)) {
        dependencies = [dependencies];
      }
      var type = (options && options.type)? options.type : 'value';
      path = process.cwd() + '/' + path;

      var injectables = globule.find(path + "/**/*.*");
      var mod = di.module(moduleName, dependencies);
      mod.modules = [];
      injectables.forEach(function (injectable) {
        var injectableName = injectable.replace(path, '');
        injectableName = injectableName.replace(/\.\w+$/, '');
        injectableName = injectableName.split('/');
        var namespace = injectableName.slice(0).map(function (part, idx) {
          if (idx > 0) {
            return part.charAt(0).toUpperCase() + part.slice(1);
          }
          else {
            return part;
          }
        });
        injectableName = namespace.join('');
        injectableName = injectableName.charAt(0).toLowerCase() + injectableName.slice(1);

        mod[type](injectableName, require(injectable));
        mod.modules.push(injectableName);
      });
    };

    di.setupCore = function (additionalModules) {
      var pkg = require(process.cwd() + '/package.json');
      var core = di.module('Core', []);
      Object.keys(pkg.dependencies).forEach(function (dep) {
        if (!dep.match(/^grunt/)) {
          core.value(dep, require(dep));
        }
      });
      if (additionalModules) {
        additionalModules.forEach(function (mod) {
          core.value(mod[0], mod[1]);
        });
      }
    };
};
