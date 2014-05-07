var globule = require('globule');
var NODE_CORE = ['assert', 'buffer', 'child_process', 'cluster',
  'crypto', 'dgram', 'dns', 'events', 'fs', 'http', 'https', 'net',
  'os', 'path', 'punycode', 'querystring', 'readline', 'repl',
  'string_decoder', 'tls', 'tty', 'url', 'util', 'vm', 'zlib'];

module.exports = function (di) {
    di.indexModule = function  (moduleName, path, options) {
      var dependencies = (options && options.dependencies)? options.dependencies : [];
      if (!Array.isArray(dependencies)) {
        dependencies = [dependencies];
      }
      var type = (options && options.type)? options.type : 'value';
      path = process.cwd() + '/' + path;

      var injectables = globule.find(path + "/**/*.*");

      var mod = di.module(moduleName, dependencies);
      mod.value(moduleName+"Index", function (name) {
        return di.injector([moduleName]).get(name);
      });
      injectables.forEach(function (injectable) {
        mod[type].call(mod, _formatInjectableName(injectable, path), require(injectable));
      });
      return di;
    };

    di.indexCore = function (options) {
      if (!options) { options = {}; }
      options.includeNode || (options.includeNode = true);

      var aliases = options.aliases;
      var includeNodeCore = options.includeNode;
      var additionalModules = options.additionalModules;

      var pkg = require(process.cwd() + '/package.json');
      var core = di.module('Core', []);

      Object.keys(pkg.dependencies).forEach(function (dep) {
        try {
          if (aliases && aliases[dep]) {
            core.value(aliases[dep], require(dep));
          }
          else {
            core.value(dep, require(dep));
          }
        }
        catch (e) {
          console.log(dep + " is not able to be required.");
        }
      });

      if (includeNodeCore) {
        NODE_CORE.forEach(function (mod) {
          core.value(mod, require(mod));
        });
      }

      if (additionalModules) {
        Object.keys(additionalModules).forEach(function (mod) {
          core.value(mod, additionalModules[mod]);
        });
      }
      return di;
    };
};

var _formatInjectableName = function(injectable, path) {
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
  return injectableName;
};
