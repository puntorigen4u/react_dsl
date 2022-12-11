(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.react_dsl = factory());
})(this, (function () { 'use strict';

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
  }
  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }
    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }
  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
        args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);
        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }
        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }
        _next(undefined);
      });
    };
  }
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  /**
  * Base Deploy: A class define deployments for vue_dsl.
  * @name 	base_deploy
  * @module 	base_deploy
  **/
  class base_deploy {
    constructor() {
      var {
        context = {},
        name = 'base_deploy'
      } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.context = context;
      this.name = name;
    }
    logo() {
      var _arguments = arguments,
        _this = this;
      return _asyncToGenerator(function* () {
        var {
          name = _this.name,
          config = {}
        } = _arguments.length > 0 && _arguments[0] !== undefined ? _arguments[0] : {};
        var cfonts = require('cfonts');
        cfonts.say(name, _objectSpread2(_objectSpread2({}, {
          font: 'block',
          gradient: 'red,blue'
        }), config));
      })();
    }
    run() {
      return _asyncToGenerator(function* () {
        return true;
      })();
    }
    deploy() {
      var _this2 = this;
      return _asyncToGenerator(function* () {
        var errors = [];
        _this2.context.x_console.spinner({
          message: "Deploying ".concat(_this2.name, " instance")
        });
        //spinner.start('Deploying local instance');
        /*try {
            //launch in a new terminal
            await this.context.launchTerminal('npm',['run','dev'],this.context.x_state.dirs.app);
            //results.git_add = await spawn('npm',['run','dev'],{ cwd:this.x_state.dirs.app });
            spinner.succeed('NuxtJS launched successfully');
        } catch(gi) { 
            spinner.fail('Project failed to launch');
            errors.push(gi);
        }*/
        return errors;
      })();
    }
    base_build() {
      var _this3 = this;
      return _asyncToGenerator(function* () {
        // builds the project
        var spawn = require('await-spawn'),
          path = require('path'),
          fs = require('fs').promises;
        //let ora = require('ora');
        var node_modules_final = path.join(_this3.context.x_state.dirs.app, 'node_modules');
        var node_package = path.join(_this3.context.x_state.dirs.app, 'package.json');
        var npm = {},
          errors = [];
        _this3.context.x_console.out({
          message: "Building project",
          color: 'cyan'
        });
        var spinner = _this3.context.x_console.spinner({
          message: 'Building project'
        });
        var node_modules_exist = yield _this3.exists(node_modules_final);
        var node_package_exist = yield _this3.exists(node_package);
        if (node_modules_exist && node_package_exist) {
          //test if every package required is within node_modules
          spinner.start("Some npm packages where installed; checking ..");
          var pkg = JSON.parse(yield fs.readFile(node_package, 'utf-8'));
          var all_ok = true;
          for (var pk in pkg.dependencies) {
            var tst_dir = path.join(_this3.context.x_state.dirs.app, 'node_modules', pk);
            var tst_exist = yield _this3.exists(tst_dir);
            if (!tst_exist) all_ok = false;
          }
          node_modules_exist = all_ok;
          if (all_ok) {
            spinner.succeed('Using existing npm packages');
          } else {
            spinner.warn('Some packages are new, requesting them');
          }
        }
        // issue npm install (400mb)
        if (!node_modules_exist) {
          spinner.start("Installing npm packages");
          //this.x_console.outT({ message:`Installing npm packages` });
          try {
            npm.install = yield spawn('npm', ['install'], {
              cwd: _this3.context.x_state.dirs.app
            }); //, stdio:'inherit'
            spinner.succeed("npm install succesfully");
          } catch (n) {
            npm.install = n;
            spinner.fail('Error installing npm packages');
            errors.push(n);
          }
        }
        // issue npm run build
        spinner.start("Building NEXT project");
        var ci = require('ci-info');
        try {
          if (ci.isCI == false) {
            npm.build = yield spawn('npm', ['run', 'build'], {
              cwd: _this3.context.x_state.dirs.app
            });
          } else {
            npm.build = yield spawn('npm', ['run', 'build'], {
              cwd: _this3.context.x_state.dirs.app,
              stdio: 'inherit'
            });
          }
          spinner.succeed('Project build successfully');
        } catch (nb) {
          npm.build = nb;
          spinner.fail('NEXT build failed');
          if (ci.isCI == false) {
            _this3.context.x_console.out({
              message: "Building NEXT again to show error in console",
              color: 'red'
            });
            //build again with output redirected to console, to show it to user
            try {
              console.log('\n');
              npm.build = yield spawn('npm', ['run', 'dev'], {
                cwd: _this3.context.x_state.dirs.app,
                stdio: 'inherit',
                timeout: 15000
              });
            } catch (eg) {}
          } else {
            _this3.context.x_console.out({
              message: "CI system detected; please double-check your code locally before pushing!",
              color: 'red'
            });
          }
          errors.push(nb);
        }
        return errors;
      })();
    }

    //****************************
    // onPrepare and onEnd steps
    //****************************
    pre() {
      return _asyncToGenerator(function* () {})();
    }
    post() {
      return _asyncToGenerator(function* () {})();
    }
    modifyPackageJSON(data) {
      return _asyncToGenerator(function* () {
        return data;
      })();
    }
    modifyWebpackConfig(config) {
      return _asyncToGenerator(function* () {
        return config;
      })();
    }

    // HELPER methods
    exists(dir_or_file) {
      return _asyncToGenerator(function* () {
        var fs = require('fs').promises;
        try {
          yield fs.access(dir_or_file);
          return true;
        } catch (e) {
          return false;
        }
      })();
    }
    _isLocalServerRunning() {
      var _arguments2 = arguments,
        _this4 = this;
      return _asyncToGenerator(function* () {
        var port = _arguments2.length > 0 && _arguments2[0] !== undefined ? _arguments2[0] : _this4.context.x_state.central_config.port;
        var is_reachable = require('is-port-reachable');
        var resp = yield is_reachable(port);
        return resp;
      })();
    }
    launchTerminal(cmd) {
      var _arguments3 = arguments;
      return _asyncToGenerator(function* () {
        var args = _arguments3.length > 1 && _arguments3[1] !== undefined ? _arguments3[1] : [];
        var basepath = _arguments3.length > 2 ? _arguments3[2] : undefined;
        var spawn = require('await-spawn');
        var args_p = '';
        var resp = {
          error: false
        };
        if (basepath) {
          args_p = "sleep 2; clear; cd ".concat(basepath, " && ").concat(cmd, " ").concat(args.join(' '));
        } else {
          args_p = 'sleep 2; clear; ' + cmd + ' ' + args.join(' ');
        }
        try {
          resp = yield spawn('npx', ['terminal-tab', args_p]);
        } catch (e) {
          resp = _objectSpread2(_objectSpread2({}, e), {
            error: true
          });
        }
        return resp;
      })();
    }
  }

  //const base_deploy = require('./base_deploy');

  class local extends base_deploy {
    constructor() {
      var {
        context = {}
      } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      super({
        context,
        name: 'Local'
      });
    }
    modifyPackageJSON(config) {
      return _asyncToGenerator(function* () {
        //little sass errors hack fix 13jun21
        //config.devDependencies['sass-migrator']='*';
        //config.scripts.hackfix = 'sass-migrator division node_modules/vuetify/**/*.sass && sass-migrator division node_modules/vuetify/**/*.scss';
        //config.scripts.dev = 'npm run hackfix && '+config.scripts.dev;
        return config;
      })();
    }
    modifyNextConfig(config) {
      var _this = this;
      return _asyncToGenerator(function* () {
        if (_this.context.x_state.config_node.axios) {
          var ax_config = config.axios;
          if (_this.context.x_state.config_node.axios.local) {
            ax_config.baseURL = _this.context.x_state.config_node.axios.local;
            ax_config.browserBaseURL = _this.context.x_state.config_node.axios.local;
            delete ax_config.local;
            if (_this.context.x_state.config_node.axios.local.includes('127.0.0.1')) _this.context.x_state.config_node.axios.https = false;
          }
          delete ax_config.deploy;
          config.axios = ax_config;
        }
        //
        return config;
      })();
    }
    deploy() {
      var _this2 = this;
      return _asyncToGenerator(function* () {
        var build = {};
        if ((yield _this2._isLocalServerRunning()) == false) {
          _this2.context.x_console.title({
            title: 'Deploying Local NextJS instance',
            color: 'green'
          });
          yield _this2.logo();
          //only launch nuxt server if its not running already
          // builds the app
          build.try_build = yield _this2.base_build();
          if (build.try_build.length > 0) {
            _this2.x_console.outT({
              message: "There was an error building the project.",
              color: 'red'
            });
            return false;
          }
          if (_this2.context.x_config.nodeploy && _this2.context.x_config.nodeploy == true) {
            _this2.context.x_console.outT({
              message: "Aborting final deployment as requested",
              color: 'brightRed'
            });
            return true;
          } else {
            build.deploy_local = yield _this2.run();
            if (build.deploy_local.length > 0) {
              _this2.context.x_console.outT({
                message: "There was an error deploying locally.",
                color: 'red',
                data: build.deploy_local.toString()
              });
              return false;
            }
          }
        } else {
          _this2.context.x_console.title({
            title: 'Updating local running NextJS instance',
            color: 'green'
          });
          yield _this2.logo();
          _this2.context.x_console.outT({
            message: "Project updated.",
            color: 'green'
          });
        }
        return true;
      })();
    }
    run() {
      var _this3 = this;
      return _asyncToGenerator(function* () {
        //issue npm run dev
        var errors = [];
        require('await-spawn');
        var spinner = _this3.context.x_console.spinner({
          message: 'Deploying local instance'
        });
        //this.debug('Local deploy');
        spinner.start('Deploying local instance');
        try {
          //launch in a new terminal
          yield _this3.launchTerminal('npm', ['run', 'dev'], _this3.context.x_state.dirs.app);
          //results.git_add = await spawn('npm',['run','dev'],{ cwd:this.x_state.dirs.app });
          spinner.succeed('NextJS launched successfully');
        } catch (gi) {
          spinner.fail('Project failed to launch');
          errors.push(gi);
        }
        return errors;
      })();
    }
  }

  //const base_deploy = require('./base_deploy');

  class remote extends base_deploy {
    constructor() {
      var {
        context = {}
      } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      super({
        context,
        name: 'Remote'
      });
    }
    modifyPackageJSON(config) {
      return _asyncToGenerator(function* () {
        //little sass errors hack fix 13jun21
        config.devDependencies['sass-migrator'] = '*';
        config.scripts.hackfix = 'sass-migrator division node_modules/vuetify/**/*.sass && sass-migrator division node_modules/vuetify/**/*.scss';
        config.scripts.dev = 'npm run hackfix && ' + config.scripts.dev;
        return config;
      })();
    }
    modifyPackageJSON(data) {
      var _this = this;
      return _asyncToGenerator(function* () {
        if (_this.context.x_state.central_config.deploy == 'remote' && !_this.context.x_state.central_config[':hostname']) {
          data.scripts.dev += " --hostname '0.0.0.0'";
        }
        return data;
      })();
    }
    modifyNextConfig(config) {
      var _this2 = this;
      return _asyncToGenerator(function* () {
        if (_this2.context.x_state.config_node.axios) {
          var ax_config = config.axios;
          if (_this2.context.x_state.config_node.axios.local) {
            ax_config.baseURL = _this2.context.x_state.config_node.axios.local;
            ax_config.browserBaseURL = _this2.context.x_state.config_node.axios.local;
            delete ax_config.local;
            if (_this2.context.x_state.config_node.axios.local.includes('127.0.0.1')) _this2.context.x_state.config_node.axios.https = false;
          }
          delete ax_config.deploy;
          config.axios = ax_config;
        }
        //force a static build
        config.ssr = false;
        config.target = 'static';
        config.performance.gzip = false;
        //return
        return config;
      })();
    }
    deploy() {
      var _this3 = this;
      return _asyncToGenerator(function* () {
        var build = {};
        if ((yield _this3._isLocalServerRunning()) == false) {
          _this3.context.x_console.title({
            title: 'Deploying NextJS instance with remote access',
            color: 'green'
          });
          yield _this3.logo();
          //only launch nuxt server if its not running already
          // builds the app
          build.try_build = yield _this3.base_build();
          if (build.try_build.length > 0) {
            _this3.x_console.outT({
              message: "There was an error building the project.",
              color: 'red'
            });
            return false;
          }
          build.deploy_local = yield _this3.run();
          if (build.deploy_local.length > 0) {
            _this3.context.x_console.outT({
              message: "There was an error deploying locally.",
              color: 'red',
              data: build.deploy_local.toString()
            });
            return false;
          }
        } else {
          _this3.context.x_console.title({
            title: 'Updating local running NextJS instance',
            color: 'green'
          });
          yield _this3.logo();
          _this3.context.x_console.outT({
            message: "Project updated.",
            color: 'green'
          });
        }
        return true;
      })();
    }
    run() {
      var _this4 = this;
      return _asyncToGenerator(function* () {
        //issue npm run dev
        var errors = [];
        require('await-spawn');
        var sleep = function sleep(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
        };
        var spinner = _this4.context.x_console.spinner({
          message: 'Deploying Ngrok local instance'
        });
        //this.debug('Local deploy');
        spinner.start('Deploying local instance');
        try {
          //launch in a new terminal
          yield _this4.launchTerminal('npm', ['run', 'dev'], _this4.context.x_state.dirs.app);
          //results.git_add = await spawn('npm',['run','dev'],{ cwd:this.x_state.dirs.app });
          spinner.succeed('NextJS launched successfully');
        } catch (gi) {
          spinner.fail('Project failed to launch');
          errors.push(gi);
        }
        spinner.start("Launching remote access for port ".concat(_this4.context.x_state.central_config.port));
        try {
          //launch ngrok in new terminal
          yield sleep(1000);
          yield _this4.launchTerminal('npx', ['--yes', 'localtunnel', '--port', _this4.context.x_state.central_config.port, '--subdomain', _this4.context.x_state.central_config.apptitle.toLowerCase()], _this4.context.x_state.dirs.app);
          spinner.succeed('Remote access requested successfully');
        } catch (ng) {
          spinner.fail('Remote access failed to launch');
          errors.push(ng);
        }
        return errors;
      })();
    }
  }

  class eb extends base_deploy {
    constructor() {
      var {
        context = {}
      } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      super({
        context,
        name: 'AWS EB'
      });
    }
    logo() {
      return _asyncToGenerator(function* () {
        var asciify = require('asciify-image'),
          path = require('path');
        var aws = path.join(__dirname, 'assets', 'aws.png');
        var logo_txt = yield asciify(aws, {
          fit: 'width',
          width: 25
        });
        console.log(logo_txt);
      })();
    }
    modifyNextConfig(config) {
      var _this = this;
      return _asyncToGenerator(function* () {
        if (_this.context.x_state.config_node.axios && _this.context.x_state.config_node.axios.deploy) {
          var ax_config = config.axios;
          ax_config.baseURL = _this.context.x_state.config_node.axios.deploy;
          ax_config.browserBaseURL = _this.context.x_state.config_node.axios.deploy;
          delete ax_config.deploy;
          config.axios = ax_config;
        }
        return config;
      })();
    }
    deploy() {
      var _this2 = this;
      return _asyncToGenerator(function* () {
        var build = {};
        _this2.context.x_console.title({
          title: 'Deploying to Amazon AWS Elastic Bean',
          color: 'green'
        });
        yield _this2.logo();
        // builds the app
        build.try_build = yield _this2.base_build();
        if (build.try_build.length > 0) {
          _this2.context.x_console.outT({
            message: "There was an error building the project.",
            color: 'red'
          });
          return false;
        }
        // deploys to aws
        build.deploy_aws_eb = yield _this2.run(); //test if results.length>0 (meaning there was an error)
        if (build.deploy_aws_eb.length > 0) {
          _this2.context.x_console.outT({
            message: "There was an error deploying to Amazon AWS.",
            color: 'red',
            data: build.deploy_aws_eb.toString()
          });
          return false;
        }
        return true;
      })();
    }
    run() {
      var _this3 = this;
      return _asyncToGenerator(function* () {
        var spawn = require('await-spawn');
        var errors = [];
        //AWS EB deploy
        _this3.context.debug('AWS EB deploy');
        var eb_full = _this3.context.x_state.central_config.deploy.replaceAll('eb:', '');
        var eb_appname = eb_full;
        var eb_instance = "".concat(eb_appname, "-dev");
        if (_this3.context.x_state.central_config.deploy.includes(',')) {
          eb_appname = eb_full.split(',')[0];
          eb_instance = eb_full.split(',').splice(-1)[0];
        }
        if (eb_appname != '') {
          var spinner = _this3.context.x_console.spinner({
            message: 'Creating config files'
          });
          //this.x_console.outT({ message:`Creating EB config yml: ${eb_appname} in ${eb_instance}`, color:'yellow' });
          var yaml = require('yaml');
          var data = {
            'branch-defaults': {
              master: {
                environment: eb_instance,
                group_suffix: null
              }
            },
            global: {
              application_name: eb_appname,
              branch: null,
              default_ec2_keyname: 'aws-eb',
              default_platform: 'Node.js 14 running on 64bit Amazon Linux 2',
              default_region: 'us-east-1',
              include_git_submodules: true,
              instance_profile: null,
              platform_name: null,
              platform_version: null,
              profile: null,
              repository: null,
              sc: 'git',
              workspace_type: 'Application'
            }
          };
          //create .elasticbeanstalk directory
          var path = require('path'),
            fs = require('fs').promises;
          var eb_base = _this3.context.x_state.dirs.app;
          if (_this3.context.x_state.central_config.static) eb_base = path.join(eb_base, 'dist');
          var eb_dir = path.join(eb_base, '.elasticbeanstalk');
          try {
            yield fs.mkdir(eb_dir, {
              recursive: true
            });
          } catch (ef) {}
          //write .elasticbeanstalk/config.yml file with data
          yield _this3.context.writeFile(path.join(eb_dir, 'config.yml'), yaml.stringify(data));
          //write .npmrc file
          yield _this3.context.writeFile(path.join(eb_base, '.npmrc'), 'unsafe-perm=true');
          //create .ebignore file
          var eb_ig = "node_modules/\njspm_packages/\n.npm\n.node_repl_history\n*.tgz\n.yarn-integrity\n.editorconfig\n# Mac OSX\n.DS_Store\n# Elastic Beanstalk Files\n.elasticbeanstalk/*\n!.elasticbeanstalk/*.cfg.yml\n!.elasticbeanstalk/*.global.yml";
          yield _this3.context.writeFile(path.join(eb_base, '.ebignore'), eb_ig);
          //init git if not already
          spinner.succeed('EB config files created successfully');
          var results = {};
          if (!(yield _this3.exists(path.join(eb_base, '.git')))) {
            //git directory doesn't exist
            _this3.context.x_console.outT({
              message: 'CREATING .GIT DIRECTORY'
            });
            spinner.start('Initializing project git repository');
            spinner.text('Creating .gitignore file');
            var git_ignore = "# Mac System files\n.DS_Store\n.DS_Store?\n__MACOSX/\nThumbs.db\n# VUE files\nnode_modules/";
            yield _this3.context.writeFile(path.join(eb_base, '.gitignore'), git_ignore);
            spinner.succeed('.gitignore created');
            spinner.start('Initializing local git repository ..');
            try {
              results.git_init = yield spawn('git', ['init', '-q'], {
                cwd: eb_base
              });
              spinner.succeed('GIT initialized');
            } catch (gi) {
              results.git_init = gi;
              spinner.fail('GIT failed to initialize');
              errors.push(gi);
            }
            spinner.start('Adding files to local git ..');
            try {
              results.git_add = yield spawn('git', ['add', '.'], {
                cwd: eb_base
              });
              spinner.succeed('git added files successfully');
            } catch (gi) {
              results.git_add = gi;
              spinner.fail('git failed to add local files');
              errors.push(gi);
            }
            spinner.start('Creating first git commit ..');
            try {
              results.git_commit = yield spawn('git', ['commit', '-m', 'Inicial'], {
                cwd: eb_base
              });
              spinner.succeed('git created first commit successfully');
            } catch (gi) {
              results.git_commit = gi;
              spinner.fail('git failed to create first commit');
              errors.push(gi);
            }
          }
          if (_this3.context.x_state.central_config.static == true) {
            spinner.start('Deploying *static version* to AWS ElasticBean .. please wait');
          } else {
            spinner.start('Deploying to AWS ElasticBean .. please wait');
          }
          // execute eb deploy
          try {
            if (_this3.context.x_config.nodeploy && _this3.context.x_config.nodeploy == true) {
              spinner.succeed('EB ready to be deployed (nodeploy as requested)');
              _this3.context.x_console.outT({
                message: "Aborting final deployment as requested",
                color: 'brightRed'
              });
            } else {
              results.eb_deploy = yield spawn('eb', ['deploy', eb_instance], {
                cwd: eb_base
              }); //, stdio:'inherit'
              spinner.succeed('EB deployed successfully');
            }
          } catch (gi) {
            //test if eb failed because instance has not being created yet, if so create it
            results.eb_deploy = gi;
            spinner.warn('EB failed to deploy');
            //this.x_console.outT({ message:gi.toString(), color:'red'});
            if (gi.code == 4) {
              // IAM credentials are invalid or instance hasn't being created (eb create is missing)
              spinner.start('Checking if AWS credentials are valid ..');
              try {
                results.eb_create = yield spawn('aws', ['sts', 'get-caller-identity'], {
                  cwd: eb_base
                }); //, stdio:'inherit'
                spinner.succeed('AWS credentials are ok');
              } catch (aws_cred) {
                spinner.fail('Current AWS credentials are invalid');
                errors.push(aws_cred);
              }
              if (errors.length == 0) {
                spinner.start('EB it seems this is a new deployment: issuing eb create');
                try {
                  //console.log('\n');
                  results.eb_create = yield spawn('eb', ['create', eb_instance], {
                    cwd: eb_base
                  }); //, stdio:'inherit'
                  spinner.succeed('EB created and deployed successfully');
                } catch (ec) {
                  _this3.context.x_console.outT({
                    message: gi.stdout.toString(),
                    color: 'red'
                  });
                  spinner.fail('EB creation failed');
                  errors.push(gi);
                }
              }
            } else {
              _this3.context.x_console.outT({
                message: 'error: eb create (exitcode:' + gi.code + '):' + gi.stdout.toString(),
                color: 'red'
              });
              errors.push(gi);
            }
          }
          //if errors.length==0 && this.x_state.central_config.debug=='true'
          if (errors.length == 0 && _this3.context.x_state.central_config.debug == true && !_this3.context.x_config.nodeploy) {
            //open eb logging console
            var ci = require('ci-info');
            if (ci.isCI == false) {
              spinner.start('Opening EB debug terminal ..');
              try {
                var abs_cmd = path.resolve(eb_base);
                var cmd = "clear; sleep 2; clear; cd ".concat(abs_cmd, " && clear && eb open ").concat(eb_instance);
                results.eb_log = yield spawn('npx', ['terminal-tab', cmd], {
                  cwd: abs_cmd
                }); //, detached:true
                spinner.succeed("EB logging opened on new tab successfully");
              } catch (ot) {
                results.eb_log = ot;
                spinner.fail("I was unable to open a new tab terminal window with the EB debugging console");
              }
            } else {
              spinner.warn("Omitting EB debug, because a CI env was detected.");
            }
          }
          // eb deploy done
        }

        return errors;
      })();
    }

    //****************************
    // onPrepare and onEnd steps
    //****************************
    post() {
      var _this4 = this;
      return _asyncToGenerator(function* () {
        var ci = require('ci-info');
        //restores aws credentials if modified by onPrepare after deployment
        if (!_this4.context.x_state.central_config.componente && _this4.context.x_state.central_config.deploy && _this4.context.x_state.central_config.deploy.indexOf('eb:') != -1 && _this4.context.x_state.config_node.aws && ci.isCI == false) {
          // @TODO add this block to deploys/eb 'post' method and onPrepare to 'pre' 20-br-21
          // only execute after deploy and if user requested specific aws credentials on map
          var path = require('path'),
            copy = require('recursive-copy'),
            os = require('os');
          var fs = require('fs');
          var aws_bak = path.join(_this4.context.x_state.dirs.base, 'aws_backup.ini');
          var aws_file = path.join(os.homedir(), '/.aws/') + 'credentials';
          if (yield _this4.context.exists(aws_bak)) {
            yield copy(aws_bak, aws_file, {
              overwrite: true,
              dot: true,
              debug: false
            });
            // remove aws_bak file
            yield fs.promises.unlink(aws_bak);
          }
        }
      })();
    }
    pre() {
      var _this5 = this;
      return _asyncToGenerator(function* () {
        var ci = require('ci-info');
        if (!_this5.context.x_state.central_config.componente && _this5.context.x_state.central_config.deploy && _this5.context.x_state.central_config.deploy.indexOf('eb:') != -1 && ci.isCI == false) {
          // if deploying to AWS eb:x, then recover/backup AWS credentials from local system
          var ini = require('ini'),
            path = require('path'),
            fs = require('fs').promises;
          // read existing AWS credentials if they exist
          var os = require('os');
          var aws_ini = '';
          var aws_ini_file = path.join(os.homedir(), '/.aws/') + 'credentials';
          try {
            //this.debug('trying to read AWS credentials:',aws_ini_file);
            aws_ini = yield fs.readFile(aws_ini_file, 'utf-8');
            _this5.context.debug('AWS credentials:', aws_ini);
          } catch (err_reading) {}
          // 
          if (_this5.context.x_state.config_node.aws) {
            // if DSL defines temporal AWS credentials for this app .. 
            // create backup of aws credentials, if existing previously
            if (aws_ini != '') {
              var aws_bak = path.join(_this5.context.x_state.dirs.base, 'aws_backup.ini');
              _this5.context.x_console.outT({
                message: "config:aws:creating .aws/credentials backup",
                color: 'yellow'
              });
              yield fs.writeFile(aws_bak, aws_ini, 'utf-8');
            }
            // debug
            _this5.context.x_console.outT({
              message: "config:aws:access ->".concat(_this5.context.x_state.config_node.aws.access)
            });
            _this5.context.x_console.outT({
              message: "config:aws:secret ->".concat(_this5.context.x_state.config_node.aws.secret)
            });
            // transform config_node.aws keys into ini
            var to_ini = ini.stringify({
              aws_access_key_id: _this5.context.x_state.config_node.aws.access,
              aws_secret_access_key: _this5.context.x_state.config_node.aws.secret
            }, {
              section: 'default'
            });
            _this5.context.debug('Setting .aws/credentials from config node');
            // save as .aws/credentials (ini file)
            yield fs.writeFile(aws_ini_file, to_ini, 'utf-8');
          } else if (aws_ini != '') {
            // if DSL doesnt define AWS credentials, use the ones defined within the local system.
            var parsed = ini.parse(aws_ini);
            if (parsed.default) _this5.context.debug('Using local system AWS credentials', parsed.default);
            _this5.context.x_state.config_node.aws = {
              access: '',
              secret: ''
            };
            if (parsed.default.aws_access_key_id) _this5.context.x_state.config_node.aws.access = parsed.default.aws_access_key_id;
            if (parsed.default.aws_secret_access_key) _this5.context.x_state.config_node.aws.secret = parsed.default.aws_secret_access_key;
          }
        }
      })();
    }
  }

  class s3 extends base_deploy {
    constructor() {
      var {
        context = {}
      } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      super({
        context,
        name: 'AWS S3'
      });
    }
    logo() {
      var _this = this;
      return _asyncToGenerator(function* () {
        var cfonts = require('cfonts');
        cfonts.say(_this.name, _objectSpread2({}, {
          font: '3d',
          colors: ['red', '#333']
        }));
      })();
    }
    modifyPackageJSON(config) {
      return _asyncToGenerator(function* () {
        //little sass errors hack fix 13jun21
        var ci = require('ci-info');
        if (ci.isCI == false) ;
        return config;
      })();
    }
    modifyNextConfig(config) {
      var _this2 = this;
      return _asyncToGenerator(function* () {
        if (_this2.context.x_state.config_node.axios && _this2.context.x_state.config_node.axios.deploy) {
          var ax_config = config.axios;
          ax_config.baseURL = _this2.context.x_state.config_node.axios.deploy;
          ax_config.browserBaseURL = _this2.context.x_state.config_node.axios.deploy;
          delete ax_config.deploy;
          config.axios = ax_config;
        }
        _this2.context.x_state.central_config.static = true; //force static mode
        return config;
      })();
    }
    deploy() {
      var _this3 = this;
      return _asyncToGenerator(function* () {
        var build = {};
        _this3.context.x_console.title({
          title: 'Deploying to Amazon AWS S3',
          color: 'green'
        });
        yield _this3.logo();
        // builds the app
        build.try_build = yield _this3.base_build();
        if (build.try_build.length > 0) {
          _this3.context.x_console.outT({
            message: "There was an error building the project.",
            color: 'red'
          });
          return false;
        }
        // deploys to aws
        build.deploy_aws_s3 = yield _this3.run(); //test if results.length>0 (meaning there was an error)
        if (build.deploy_aws_s3.length > 0) {
          _this3.context.x_console.outT({
            message: "There was an error deploying to Amazon AWS.",
            color: 'red',
            data: build.deploy_aws_s3.toString()
          });
          return false;
        }
        return true;
      })();
    }
    run() {
      var _this4 = this;
      return _asyncToGenerator(function* () {
        var spawn = require('await-spawn');
        var path = require('path');
        var errors = [],
          results = {};
        var bucket = _this4.context.x_state.central_config.deploy.replaceAll('s3:', '').trim();
        var aliases = [];
        var ci = require('ci-info');
        var spa_opt = {
          cwd: _this4.context.x_state.dirs.base
        };
        var profile = ['--profile', 'default'];
        if (ci.isCI == true) {
          //spa_opt.stdio = 'inherit';
          profile = [];
        }
        if (_this4.context.x_state.central_config.dominio) {
          bucket = _this4.context.x_state.central_config.dominio.trim();
        }
        //support for domain aliases
        if (bucket.includes('<-') == true) {
          require('extractjs');
          aliases = bucket.split('<-').pop().split(',');
          bucket = bucket.split('<-')[0].replaceAll('s3:', '').trim();
        }
        //
        var region = 'us-east-1';
        if (_this4.context.x_state.config_node.aws.region) region = _this4.context.x_state.config_node.aws.region;
        var dist_folder = path.join(_this4.context.x_state.dirs.compile_folder, 'out/');
        //AWS S3 deploy        
        _this4.context.debug('AWS S3 deploy');
        //MAIN
        //create bucket policy
        var spinner = _this4.context.x_console.spinner({
          message: "Creating policy for bucket:".concat(bucket)
        });
        var policy = {
          Version: '2012-10-17',
          Statement: [{
            Sid: 'PublicReadGetObject',
            Effect: 'Allow',
            Principal: '*',
            Action: 's3:GetObject',
            Resource: "arn:aws:s3:::".concat(bucket, "/*")
          }]
        };
        var policyFile = path.join(_this4.context.x_state.dirs.base, 'policy.json');
        try {
          yield _this4.context.writeFile(policyFile, JSON.stringify(policy));
          spinner.succeed('Bucket policy created');
        } catch (x1) {
          spinner.fail('Bucket policy creation failed');
          errors.push(x1);
        }
        //create bucket
        spinner.start('Creating bucket');
        try {
          results.create_bucket = yield spawn('aws', ['s3api', 'create-bucket', '--bucket', bucket, '--region', region, ...profile], spa_opt); //, stdio:'inherit'
          spinner.succeed("Bucket created in ".concat(region));
        } catch (x2) {
          spinner.fail('Bucket creation failed');
          errors.push(x2);
        }
        //add bucket policy
        //aws s3api put-bucket-policy --bucket www.happy-bunny.xyz --policy file:///tmp/bucket_policy.json --profile equivalent
        spinner.start('Adding bucket policy');
        try {
          results.adding_policy = yield spawn('aws', ['s3api', 'put-bucket-policy', '--bucket', bucket, '--policy', 'file://' + policyFile, ...profile], spa_opt); //, stdio:'inherit'
          spinner.succeed("Bucket policy added correctly");
        } catch (x3) {
          spinner.fail('Adding bucket policy failed');
          errors.push(x3);
        }
        //upload website files to bucket
        //aws s3 sync /tmp/SOURCE_FOLDER s3://www.happy-bunny.xyz/  --profile equivalent
        spinner.start('Uploading website files to bucket');
        try {
          results.website_upload = yield spawn('aws', ['s3', 'sync', dist_folder, 's3://' + bucket + '/', ...profile], spa_opt); //, stdio:'inherit'
          spinner.succeed("Website uploaded successfully");
        } catch (x4) {
          spinner.fail('Failed uploading website files');
          errors.push(x4);
        }
        //set s3 bucket as website, set index.html and error page
        //aws s3 website s3://www.happy-bunny.xyz/ --index-document index.html --error-document error.html --profile equivalent
        spinner.start('Setting S3 bucket as type website');
        try {
          results.set_as_website = yield spawn('aws', ['s3', 'website', 's3://' + bucket + '/', '--index-document', 'index.html', '--error-document', '200.html', ...profile], spa_opt);
          spinner.succeed("Bucket configured as website successfully");
        } catch (x5) {
          spinner.fail('Failed configuring bucket as website');
          errors.push(x5);
        }
        //ALIASES
        var fs = require('fs').promises;
        if (aliases.length > 0) {
          for (var alias of aliases) {
            var _spinner = _this4.context.x_console.spinner({
              message: "Creating policy for bucket alias:".concat(alias)
            });
            var _policy = {
              RedirectAllRequestsTo: {
                HostName: bucket
              }
            };
            var _policyFile = path.join(_this4.context.x_state.dirs.base, 'policy_alias.json');
            try {
              yield _this4.context.writeFile(_policyFile, JSON.stringify(_policy));
              _spinner.succeed("Bucket alias '".concat(alias, "' policy created"));
            } catch (x1) {
              _spinner.fail("Bucket alias '".concat(alias, "' policy creation failed"));
              errors.push(x1);
            }
            //create bucket
            _spinner.start("Creating bucket alias '".concat(alias, "'"));
            try {
              results.create_bucket = yield spawn('aws', ['s3api', 'create-bucket', '--bucket', alias, '--region', region, ...profile], spa_opt); //, stdio:'inherit'
              _spinner.succeed("Bucket alias '".concat(alias, "' created in ").concat(region));
            } catch (x2) {
              _spinner.fail("Bucket alias '".concat(alias, "' creation failed"));
              errors.push(x2);
            }
            //add bucket policy
            _spinner.start("Adding bucket alias '".concat(alias, "' policy"));
            try {
              results.adding_policy = yield spawn('aws', ['s3api', 'put-bucket-website', '--bucket', alias, '--website-configuration', 'file://policy_alias.json', ...profile], spa_opt); //, stdio:'inherit'
              _spinner.succeed("Bucket alias '".concat(alias, "' policy added correctly"));
            } catch (x2) {
              _spinner.fail("Adding bucket alias '".concat(alias, "' policy failed"));
              errors.push(x2);
            }
            //erase policy_alias.json file
            try {
              yield fs.unlink(_policyFile);
            } catch (err_erasepolicy_alias) {}
          }
        }
        if (errors.length == 0) {
          _this4.context.x_console.out({
            message: "Website ready at http://".concat(bucket, ".s3-website-").concat(region, ".amazonaws.com/"),
            color: 'brightCyan'
          });
        }
        //erase policy.json file
        try {
          yield fs.unlink(policyFile);
        } catch (err_erasepolicy) {}
        //ready
        return errors;
      })();
    }

    //****************************
    // onPrepare and onEnd steps
    //****************************
    post() {
      var _this5 = this;
      return _asyncToGenerator(function* () {
        var ci = require('ci-info');
        //restores aws credentials if modified by onPrepare after deployment
        if (!_this5.context.x_state.central_config.componente && _this5.context.x_state.central_config.deploy && _this5.context.x_state.central_config.deploy.indexOf('s3:') != -1 && _this5.context.x_state.config_node.aws && ci.isCI == false) {
          // @TODO add this block to deploys/s3 'post' method and onPrepare to 'pre' 20-br-21
          // only execute after deploy and if user requested specific aws credentials on map
          var path = require('path'),
            copy = require('recursive-copy'),
            os = require('os');
          var fs = require('fs');
          var aws_bak = path.join(_this5.context.x_state.dirs.base, 'aws_backup.ini');
          var aws_file = path.join(os.homedir(), '/.aws/') + 'credentials';
          if (yield _this5.context.exists(aws_bak)) {
            yield copy(aws_bak, aws_file, {
              overwrite: true,
              dot: true,
              debug: false
            });
            // remove aws_bak file
            yield fs.promises.unlink(aws_bak);
          }
        }
      })();
    }
    pre() {
      var _this6 = this;
      return _asyncToGenerator(function* () {
        var ci = require('ci-info');
        if (!_this6.context.x_state.central_config.componente && _this6.context.x_state.central_config.deploy && _this6.context.x_state.central_config.deploy.indexOf('s3:') != -1 && ci.isCI == false) {
          // if deploying to AWS s3:x, then recover/backup AWS credentials from local system
          var ini = require('ini'),
            path = require('path'),
            fs = require('fs').promises;
          // read existing AWS credentials if they exist
          var os = require('os');
          var aws_ini = '';
          var aws_ini_file = path.join(os.homedir(), '/.aws/') + 'credentials';
          try {
            //this.debug('trying to read AWS credentials:',aws_ini_file);
            aws_ini = yield fs.readFile(aws_ini_file, 'utf-8');
            _this6.context.debug('AWS credentials:', aws_ini);
          } catch (err_reading) {}
          // 
          if (_this6.context.x_state.config_node.aws) {
            // if DSL defines temporal AWS credentials for this app .. 
            // create backup of aws credentials, if existing previously
            if (aws_ini != '') {
              var aws_bak = path.join(_this6.context.x_state.dirs.base, 'aws_backup.ini');
              _this6.context.x_console.outT({
                message: "config:aws:creating .aws/credentials backup",
                color: 'yellow'
              });
              yield fs.writeFile(aws_bak, aws_ini, 'utf-8');
            }
            // debug
            _this6.context.x_console.outT({
              message: "config:aws:access ->".concat(_this6.context.x_state.config_node.aws.access)
            });
            _this6.context.x_console.outT({
              message: "config:aws:secret ->".concat(_this6.context.x_state.config_node.aws.secret)
            });
            if (_this6.context.x_state.config_node.aws.region) {
              _this6.context.x_console.outT({
                message: "config:aws:region ->".concat(_this6.context.x_state.config_node.aws.region)
              });
            }
            // transform config_node.aws keys into ini
            var to_aws = {
              aws_access_key_id: _this6.context.x_state.config_node.aws.access,
              aws_secret_access_key: _this6.context.x_state.config_node.aws.secret
            };
            if (_this6.context.x_state.config_node.aws.region) {
              to_aws.region = _this6.context.x_state.config_node.aws.region;
            }
            var to_ini = ini.stringify(to_aws, {
              section: 'default'
            });
            _this6.context.debug('Setting .aws/credentials from config node');
            // save as .aws/credentials (ini file)
            yield fs.writeFile(aws_ini_file, to_ini, 'utf-8');
          } else if (aws_ini != '') {
            // if DSL doesnt define AWS credentials, use the ones defined within the local system.
            var parsed = ini.parse(aws_ini);
            if (parsed.default) _this6.context.debug('Using local system AWS credentials', parsed.default);
            _this6.context.x_state.config_node.aws = {
              access: '',
              secret: ''
            };
            if (parsed.default.aws_access_key_id) _this6.context.x_state.config_node.aws.access = parsed.default.aws_access_key_id;
            if (parsed.default.aws_secret_access_key) _this6.context.x_state.config_node.aws.secret = parsed.default.aws_secret_access_key;
            if (parsed.default.region) _this6.context.x_state.config_node.aws.region = parsed.default.region;
          }
        }
      })();
    }
  }

  class ghpages extends base_deploy {
    constructor() {
      var {
        context = {}
      } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      super({
        context,
        name: 'GH Pages'
      });
    }
    modifyNextConfig(config) {
      var _this = this;
      return _asyncToGenerator(function* () {
        // use axios deploy endpoint
        if (_this.context.x_state.config_node.axios && _this.context.x_state.config_node.axios.deploy) {
          var ax_config = config.axios;
          ax_config.baseURL = _this.context.x_state.config_node.axios.deploy;
          ax_config.browserBaseURL = _this.context.x_state.config_node.axios.deploy;
          delete ax_config.deploy;
          config.axios = ax_config;
        }
        //force a static build, since ghpages only support those
        config.ssr = false;
        config.target = 'static';
        config.performance.gzip = false;
        return config;
      })();
    }
    deploy() {
      var _this2 = this;
      return _asyncToGenerator(function* () {
        var build = {};
        _this2.context.x_console.title({
          title: 'Creating GH Workflow for deploying on ghpages on commit',
          color: 'green'
        });
        yield _this2.logo({
          config: {
            font: 'chrome',
            gradient: false,
            space: true,
            colors: ['#F2F3F4', '#0C70E0']
          }
        });
        // builds the app; github can build the app
        /*
        build.try_build = await this.base_build(); 
        if (build.try_build.length>0) {
            this.context.x_console.outT({ message:`There was an error building the project.`, color:'red' });
            return false;
        }*/
        // creates github actions folder, and workflow
        build.create_ghp = yield _this2.run(); //test if results.length>0 (meaning there was an error)
        if (build.create_ghp.length > 0) {
          _this2.context.x_console.outT({
            message: "There was an error creating the github workflow.",
            color: 'red',
            data: build.create_ghp.toString()
          });
          return false;
        }
        return true;
      })();
    }
    run() {
      var _this3 = this;
      return _asyncToGenerator(function* () {
        var yaml = require('yaml'),
          errors = [];
        var spinner = _this3.context.x_console.spinner({
          message: 'Creating github workflow for building and publishing'
        });
        var data = {
          name: 'DSL Build and Publish',
          on: 'push',
          jobs: {
            build: {
              name: 'Build and publish',
              'runs-on': 'ubuntu-latest',
              steps: [{
                name: 'Downloads repo code',
                uses: 'actions/checkout@2',
                with: {
                  submodules: 'recursive'
                }
              }, {
                name: 'Install packages',
                run: 'npm install'
              }, {
                name: 'Builds static distribution',
                run: 'npm run build'
              }, {
                name: 'Publish dist to GHPages of current repo',
                uses: 'peaceiris/actions-gh-pages@v3',
                with: {
                  github_token: '${{ secrets.GITHUB_TOKEN }}',
                  publish_dir: './dist'
                }
              }]
            }
          }
        };
        var content = yaml.stringify(data);
        var path = require('path'),
          fs = require('fs').promises;
        var target = path.join(_this3.context.x_state.dirs.app, '.github', 'workflows');
        // create .github/workflows directory if needed
        try {
          yield fs.mkdir(target, {
            recursive: true
          });
          target = path.join(target, "publish.yml");
          yield _this3.context.writeFile(target, content);
          spinner.succeed('Github workflow ready');
        } catch (errdir) {
          spinner.fail('Github workflow failed');
          errors.push('Github workflow failed');
        }
        // create /.gitignore file for built repo
        spinner.start('Writing repo .gitignore file ..');
        var git = 'dist\n';
        git += 'secrets\n';
        git += 'node_modules';
        target = path.join(_this3.context.x_state.dirs.app, '.gitignore');
        yield _this3.context.writeFile(target, git);
        spinner.succeed('Github .gitignore ready');
        return errors;
      })();
    }

    //****************************
    // onPrepare and onEnd steps
    //****************************
    post() {
      return _asyncToGenerator(function* () {})();
    }
    pre() {
      return _asyncToGenerator(function* () {})();
    }
  }

  /**
  * Base UI: A class to define ui frameworks within React DSL
  * @name 	base_ui
  * @module 	base_ui
  **/
  class base_ui {
    constructor() {
      var {
        context = {},
        name = 'base_ui'
      } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.context = context;
      this.name = name;
      this.i_commands = {};
      this.extend = require('deepmerge');
    }

    //****************************
    // methods to be overwritten
    //****************************

    logo() {
      var _arguments = arguments,
        _this = this;
      return _asyncToGenerator(function* () {
        var {
          name = _this.name,
          config = {}
        } = _arguments.length > 0 && _arguments[0] !== undefined ? _arguments[0] : {};
        require('cfonts');
        //cfonts.say(name, {...{ font:'block', gradient:'red,blue' },...config });
      })();
    }

    install() {
      return _asyncToGenerator(function* () {})();
    }
    autocomplete() {
      return _asyncToGenerator(function* () {
        // return associated ui autocompletion calls here
        return {};
        /**
         * return {
         *  'AppBar': { 
                text:'AppBar',
                icons:['idea'],
                level:[3,4],
                hint:'Top navigation bar',
                attributes:{
                    //all keys are optional - empty by default
                    'color': { type:'string', default:'primary', hint:'Defines the color of the AppBar' },
                }
            } 
        };
        */
      })();
    }

    sharedAutocomplete() {
      return _asyncToGenerator(function* () {
        // returns basic autocompletion calls
        // main commands for now; pages, components, models, config node
        var shared = {};
        shared['_centralnode_'] = {
          text: 'appName',
          type: 'config',
          hint: 'Defines the name of the project and its main configuration',
          level: [1],
          icons: [],
          //childrenTypes: ['file','virtual','config','model'],
          attributes: {
            port: {
              type: 'number',
              default: '3000',
              hint: 'Port to run the server on.'
            },
            langs: {
              type: 'string',
              default: 'en',
              hint: 'Comma delimited list of languages to support. If more than one adds i18n support.'
            },
            debug: {
              type: 'boolean',
              default: 'false',
              hint: 'If true, enables debug mode.'
            },
            'apptitle': {
              type: 'string',
              default: '{node.text}',
              hint: 'Title of the app and name of generted folder.'
            },
            ui: {
              type: 'mui,joy,chakra',
              default: 'mui',
              hint: 'Name of UI library to use.'
            },
            ':cache': {
              type: 'boolean',
              default: 'true',
              hint: 'If false, disables caching of nodes.'
            },
            ':keywords': {
              type: 'string',
              default: '',
              hint: 'Comma delimited list of keywords (for package.json).'
            },
            ':author': {
              type: 'string',
              default: '',
              hint: 'Author of the project (for package.json).'
            },
            ':license': {
              type: 'string',
              default: 'MIT',
              hint: 'License of the project (for package.json).'
            },
            ':github': {
              type: 'string',
              default: '',
              hint: 'Github repository of the project (for package.json).'
            },
            ':version': {
              type: 'string',
              default: '1.0.0',
              hint: 'Version of the project (for package.json).'
            },
            ':description': {
              type: 'string',
              default: '{node.textnote}',
              hint: 'Description of the project (for package.json). Defaults to the textnote of the node.'
            }
          }
        };
        shared['_theme_'] = {
          text: 'theme',
          type: 'config',
          hint: 'Defines the global theme configuration options',
          level: [2],
          icons: ['desktop_new'],
          childrenTypes: ['theme_color'],
          attributes: {
            'mode': {
              type: 'light,dark',
              default: 'light',
              hint: 'Mode of theme to apply.'
            }
          }
        };
        for (var i of ['primary', 'secondary', 'error', 'warning', 'info', 'success']) {
          shared["_themecolor_".concat(i)] = {
            text: i,
            type: 'theme_color',
            hint: "Defines the ".concat(i, " color of the theme. Use the background color of the node to define the color."),
            level: [3],
            icons: [],
            childrenTypes: ['none'],
            attributes: {}
          };
        }
        shared['_themefile_'] = {
          text: 'theme',
          type: 'config',
          hint: 'Defines the theme configuration for the current file',
          level: [3],
          icons: ['desktop_new'],
          childrenTypes: ['theme_color'],
          attributes: {
            'mode': {
              type: 'light,dark',
              default: 'light',
              hint: 'Mode of theme to apply.'
            }
          }
        };
        shared['_index_'] = {
          text: 'index',
          type: 'file',
          hint: 'Defines the first page to be loaded',
          level: [2],
          icons: ['gohome'],
          childrenTypes: [],
          attributes: {
            'params': {
              type: 'string',
              default: '',
              hint: 'Comma delimited list of parameters that the page can receive. You can use their value anywhere within the page, using $params.name.'
            }
          }
        };
        shared['group:*'] = {
          type: 'virtual',
          hint: 'Dummy node to group files visually. Does not generate any code. Use it to organize your files.',
          level: [2],
          icons: ['list'],
          childrenTypes: ['file'],
          attributes: {}
        };
        shared['page'] = {
          text: 'filename',
          type: 'file',
          hint: 'Represents a file to be created',
          level: [2, 3],
          icons: [],
          childrenTypes: [],
          attributes: {
            'path': {
              type: 'string',
              default: '/',
              hint: 'Defines the path that respond to this page'
            },
            'params': {
              type: 'string',
              default: '',
              hint: 'Comma delimited list of parameters that the page can receive. You can use their value anywhere within the page, using $params.name.'
            }
          }
        };
        shared['component:*'] = {
          type: 'file',
          hint: 'Represents component file to be created',
          level: [2, 3],
          icons: [],
          childrenTypes: ['view*', 'attribute*', 'config', 'image'],
          attributes: {
            'params': {
              type: 'string',
              default: '',
              hint: 'Comma delimited list of parameters that the component can receive. You can use their value anywhere within the component, using $params.name.'
            }
          }
        };
        return shared;
      })();
    }
    generateAutoComplete() {
      var _this2 = this;
      return _asyncToGenerator(function* () {
        var main = yield _this2.sharedAutocomplete();
        var custom = yield _this2.autocomplete();
        var auto = _this2.extend(main, custom);
        yield _this2.context.generateAutoComplete(auto);
      })();
    }
    addCommand(command) {
      var _this3 = this;
      return _asyncToGenerator(function* () {
        _this3.i_commands = _objectSpread2(_objectSpread2({}, _this3.i_commands), command);
        /*
        {
            'def_imagen': {
                x_level: '>3',
                x_icons: 'idea',
                x_text_exact: 'imagen',
                //x_not_empty: 'attributes[:src]',
                x_or_hasparent: 'def_page,def_componente,def_layout',
                hint: 'Agrega la imagen indicada en el lugar.',
                func: async function(node, state) {
                    let resp = context.reply_template({ state });
                    let params = {...{ alt:'' },...aliases2params('def_imagen', node)};
                    //code
                    if (node.text_note != '') resp.open += `<!-- ${node.text_note.cleanLines()} -->`;
                    //translate asset if defined
                    for (let x in params) {
                        if (params[x] && params[x].includes('assets:')) {
                            params[x] = context.getAsset(params[x], 'js');
                        }
                        await setImmediatePromise(); //@improved
                    }
                    resp.open += context.tagParams('v-img',params,false)+'\n';
                    resp.close = '</v-img>';
                    resp.state.friendly_name = 'imagen';
                    return resp;
                }
            }
        }
        /**
         * add a command to the context; can overwrite default commands or extend them
         * this.context.x_commands has all loaded commands
         */
      })();
    }

    addCustomCommands() {
      var _this4 = this;
      return _asyncToGenerator(function* () {
        _this4.context.addCommands(_this4.i_commands);
      })();
    }
    defaultState() {
      var _this5 = this;
      return _asyncToGenerator(function* () {
        // overwrites defaults for UI libraries as global state
        _this5.context.x_state.ui = _objectSpread2(_objectSpread2({}, _this5.context.x_state.ui), {
          'textTag': 'div',
          'iconNPM': '',
          'viewNPM': '',
          textSimpleIfParentView: [],
          bold: {
            //gets merged on textTags
            class: 'font-weight-bold'
          },
          italic: {
            class: 'font-italic'
          },
          small: {
            class: 'caption'
          },
          span: {
            tag_: 'span'
          }
        });
      })();
    }
    AppImports() {
      return _asyncToGenerator(function* () {
        // whatever is returned is added to App.jsx header
        return '';
      })();
    }
    AppWrap() {
      return _asyncToGenerator(function* () {
        //returns a wrapper for App.jsx template content
        return {
          open: "",
          close: ""
        };
      })();
    }
    BabelRC(data) {
      return _asyncToGenerator(function* () {
        //transforms the given babelrc.json data, before writing it
        return data;
      })();
    }
    globalCSS() {
      return _asyncToGenerator(function* () {
        // whatever is returned is added to globals.css
        // we now use @stitches/stringify
        return {
          body: {
            fontFamily: 'Arial, Helvetica, sans-serif'
          },
          '.container': {
            fontSize: '3rem',
            margin: 'auto',
            maxWidth: '800px',
            marginTop: '20px'
          }
        };
      })();
    }
    indexHtmlHead() {
      return _asyncToGenerator(function* () {
        // whatever is returned is added to the 'head' of index.html
        return '';
      })();
    }
    generateFiles() {
      return _asyncToGenerator(function* () {})();
    } /**
       * generate theme files within context createSystemFiles()
       * theme data on this.context.x_state.theme
       */

    // HELPER methods
    exists(dir_or_file) {
      return _asyncToGenerator(function* () {
        var fs = require('fs').promises;
        try {
          yield fs.access(dir_or_file);
          return true;
        } catch (e) {
          return false;
        }
      })();
    }
  }

  var Icons = require('@mui/icons-material');
  var autocomplete$1 = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator(function* (parent) {
      // insert associated ui autocompletion calls here
      var types = {
        // type = system, component (user, gets erased on each cache clear) - refers to a subfolder on .autocomplete
        type: 'system',
        colors: ['primary', 'secondary', 'tertriary', 'success', 'error', 'info', 'warning'],
        sizes: ['small, medium, large'],
        variant: ['contained', 'outlined', 'text'],
        all_levels: [3, 4, 5, 6, 7, 8, 9, 10]
      };
      var components = {};
      var systemProp_ = {
        // also equivalent to components.sx = { attributes:systemProp_ };
        //Properties: https://mui.com/system/properties/
        border: {
          type: 'number',
          hint: 'The border of the Box. It accepts any value that the CSS border accepts.'
        },
        borderBottom: {
          type: 'number',
          hint: 'The borderBottom of the Box. It accepts any value that the CSS borderBottom accepts.'
        },
        borderColor: {
          type: types.colors.join(', '),
          hint: 'The border color of the Box. It uses the theme colors.'
        },
        borderLeft: {
          type: 'number, %',
          hint: 'The borderLeft of the Box. It accepts any value that the CSS borderLeft accepts.'
        },
        borderRadius: {
          type: 'number, %',
          hint: 'The borderRadius of the Box. It accepts any value that the CSS borderRadius accepts.'
        },
        borderRight: {
          type: 'number, %',
          hint: 'The borderRight of the Box. It accepts any value that the CSS borderRight accepts.'
        },
        borderTop: {
          type: 'number, %',
          hint: 'The borderTop of the Box. It accepts any value that the CSS borderTop accepts.'
        },
        boxShadow: {
          type: 'number',
          hint: 'The helpers allow you to control relative depth, or distance, between two surfaces along the z-axis.'
        },
        displayPrint: {
          type: 'none, block',
          hint: 'The displayPrint of the Box. It accepts any value that the CSS display accepts.'
        },
        display: {
          type: 'inline, block, none',
          hint: 'Quickly and responsively toggle the display value of components and more with the display utilities.'
        },
        '{icon:list}display': {
          type: 'object',
          hint: 'Quickly and responsively toggle the display value of components and more with the display utilities. Can be specified as a child object with attribute keys for each breakpoint.'
        },
        alignContent: {
          type: 'flex-start, flex-end, center, space-between, space-around, stretch',
          hint: "The CSS align-content property sets the distribution of space between and around content items along a flexbox's cross-axis or a grid's block axis."
        },
        alignItems: {
          type: 'flex-start, flex-end, center, baseline, stretch',
          hint: "The CSS align-items property sets the align-self value on all direct children as a group. The align-self property sets the alignment of an item within its containing block."
        },
        alignSelf: {
          type: 'auto, normal, center, start, end, self-start, self-end, flex-start, flex-end, baseline, first baseline, last baseline, stretch, safe center, unsafe center',
          hint: "The align-self CSS property overrides a grid or flex item's align-items value."
        },
        flex: {
          type: 'number'
        },
        flexDirection: {
          type: 'row, row-reverse, column, column-reverse',
          hint: "The CSS flex-direction property sets how flex items are placed in the flex container defining the main axis and the direction (normal or reversed)."
        },
        flexGrow: {
          type: 'number',
          hint: "The CSS flex-grow property sets the flex grow factor of a flex item main size. It specifies how much of the remaining space in the flex container should be assigned to the item (the flex grow factor)."
        },
        flexShrink: {
          type: 'number',
          hint: "The CSS flex-shrink property sets the flex shrink factor of a flex item. If the size of all flex items is larger than the flex container, items shrink to fit according to flex-shrink."
        },
        flexWrap: {
          type: 'nowrap, wrap, wrap-reverse',
          hint: "The CSS flex-wrap property sets whether flex items are forced in a single line or can be wrapped onto multiple lines. If wrapping is allowed, it sets the direction that lines are stacked."
        },
        justifyContent: {
          type: 'flex-start, flex-end, center, space-between, space-around, space-evenly',
          hint: "The CSS justify-content property defines how the browser distributes space between and around content items along the main-axis of a flex container, and the inline axis of a grid container."
        },
        order: {
          type: 'number',
          hint: "The CSS order property sets the order to lay out an item in a flex or grid container. Items in a container are sorted by ascending order value and then by their source code order."
        },
        gap: {
          type: 'number',
          hint: "The gap CSS property sets the gaps (gutters) between rows and columns. It is a shorthand for row-gap and column-gap."
        },
        columnGap: {
          type: 'number',
          hint: "The column-gap CSS property sets the size of the gap (gutter) between an element's columns."
        },
        rowGap: {
          type: 'number',
          hint: "The row-gap CSS property sets the size of the gap (gutter) between an element's rows."
        },
        gridColumn: {
          type: 'number',
          hint: "The grid-column CSS property is a shorthand property for grid-column-start and grid-column-end specifying a grid item's size and location within the grid column by contributing a line, a span, or nothing (automatic) to its grid placement, thereby specifying the inline-start and inline-end edge of its grid area."
        },
        gridRow: {
          type: 'number',
          hint: "The grid-row CSS property is a shorthand property for grid-row-start and grid-row-end specifying a grid item's size and location within the grid row by contributing a line, a span, or nothing (automatic) to its grid placement, thereby specifying the inline-start and inline-end edge of its grid area."
        },
        gridAutoFlow: {
          type: 'row, column',
          hint: "The grid-auto-flow CSS property controls how the auto-placement algorithm works, specifying exactly how auto-placed items get flowed into the grid."
        },
        gridAutoColumns: {
          type: 'number',
          hint: "The grid-auto-columns CSS property specifies the size of an implicitly-created grid column track."
        },
        gridAutoRows: {
          type: 'number',
          hint: "The grid-auto-rows CSS property specifies the size of an implicitly-created grid row track."
        },
        gridTemplateColumns: {
          type: 'number',
          hint: "The grid-template-columns CSS property defines the line names and track sizing functions of the grid columns."
        },
        gridTemplateRows: {
          type: 'number',
          hint: "The grid-template-rows CSS property defines the line names and track sizing functions of the grid rows."
        },
        gridArea: {
          type: 'number',
          hint: "The grid-area property allows you to give an item a name so that it can be referenced by a template created with the grid-template-areas property."
        },
        bgcolor: {
          type: types.colors.join(','),
          hint: "The background-color CSS property sets the background color of an element."
        },
        color: {
          type: types.colors.join(','),
          hint: "The color CSS property sets the foreground color of an element's text content and text decorations, and sets the currentColor value."
        },
        bottom: {
          type: 'number',
          hint: "The bottom CSS property participates in specifying the position of positioned elements."
        },
        left: {
          type: 'number',
          hint: "The left CSS property participates in specifying the position of positioned elements."
        },
        position: {
          type: 'static, relative, absolute, fixed, sticky',
          hint: "The top, right, bottom, and left properties determine the final location of positioned elements."
        },
        right: {
          type: 'number',
          hint: "The right CSS property participates in specifying the position of positioned elements."
        },
        top: {
          type: 'number',
          hint: "The top CSS property participates in specifying the position of positioned elements."
        },
        zIndex: {
          type: 'number',
          hint: "The z-index CSS property sets the z-order of a positioned element and its descendants or flex items. Overlapping elements with a larger z-index cover those with a smaller one."
        },
        height: {
          type: 'number',
          hint: "The height CSS property specifies the height of an element. By default, the property defines the height of the content area. If box-sizing is set to border-box, however, it instead determines the height of the border area."
        },
        maxHeight: {
          type: 'number',
          hint: "The max-height CSS property sets the maximum height of an element. It prevents the used value of the height property from becoming larger than the value specified for max-height."
        },
        maxWidth: {
          type: 'number',
          hint: "The max-width CSS property sets the maximum width of an element. It prevents the used value of the width property from becoming larger than the value specified for max-width."
        },
        minHeight: {
          type: 'number',
          hint: "The min-height CSS property sets the minimum height of an element. It prevents the used value of the height property from becoming smaller than the value specified for min-height."
        },
        minWidth: {
          type: 'number',
          hint: "The min-width CSS property sets the minimum width of an element. It prevents the used value of the width property from becoming smaller than the value specified for min-width."
        },
        width: {
          type: 'number',
          hint: "The width CSS property sets an element's width. By default, it sets the width of the content area. If box-sizing is set to border-box, however, it sets the width of the border area."
        },
        boxSizing: {
          type: 'content-box, border-box',
          hint: "The box-sizing CSS property sets how the total width and height of an element is calculated. The default behavior of the box model is to include the padding and border in the width and height."
        },
        margin: {
          type: 'number',
          hint: "The margin CSS property sets the margin area on all four sides of an element."
        },
        marginBottom: {
          type: 'number',
          hint: 'The margin-bottom of the element. It accepts any value that the CSS margin-bottom accepts.'
        },
        marginLeft: {
          type: 'number',
          hint: 'The margin-left of the element. It accepts any value that the CSS margin-left accepts.'
        },
        marginRight: {
          type: 'number',
          hint: 'The margin-right of the element. It accepts any value that the CSS margin-right accepts.'
        },
        marginTop: {
          type: 'number',
          hint: 'The margin-top of the element. It accepts any value that the CSS margin-top accepts.'
        },
        marginX: {
          type: 'number',
          hint: 'The margin-left and margin-right of the element.'
        },
        marginY: {
          type: 'number',
          hint: 'The margin-top and margin-bottom of the element.'
        },
        marginInline: {
          type: 'number',
          hint: "The margin-inline CSS property is a logical property that sets all logical inline start/end margins of an element at once, such as margin-inline-start and margin-inline-end."
        }
      };
      types.base = {
        type: 'view',
        icons: ['idea'],
        level: types.all_levels
      };
      components['-private-systemProperties'] = _objectSpread2(_objectSpread2({}, types.base), {
        //hidden AC if contains -private- keyword
        type: 'system',
        icons: [],
        attributes: systemProp_
      });
      // dynamically add 'sx' attribute and system props as children attributes

      components.sx = {
        type: 'attribute',
        icons: ['list'],
        parents: ['Box'],
        level: [],
        childrenTypes: ['attribute'],
        hint: 'The sx prop is a shortcut for defining custom styles that has access to the theme.',
        //attributes: systemProp_
        attributes: (() => {
          var sx = {};
          for (var i in systemProp_) {
            sx['{icon:list}' + i] = systemProp_[i];
            sx['{icon:list}' + i].hint += "<br/><br/><b>posible values</b>: ".concat(systemProp_[i].type);
            if (sx['{icon:list}' + i].childrenTypes && sx['{icon:list}' + i].childrenTypes.length > 0) {
              sx['{icon:list}' + i].childrenTypes.push(i + '-value');
            } else {
              sx['{icon:list}' + i].childrenTypes = [i + '-value'];
            }
          }
          return sx;
        })()
      };
      // add an option for each 'parent' prop that contains 'type' prop
      for (var i in systemProp_) {
        var params = systemProp_[i].type.split(',');
        if (systemProp_[i].type.length > 0 && params.length > 1) {
          //console.log('SX ATTRIB',i,params);
          for (var j in params) {
            var param = params[j].trim();
            if (param != 'number' && param != 'boolean' && param != '%') {
              //create an AC item for each param
              if (!components['sx-attribute-' + i + '-' + param]) {
                var obj = {
                  type: i + '-value',
                  text: param,
                  childrenTypes: ['none'],
                  level: [],
                  icons: [],
                  parents: [i],
                  hint: "The ".concat(param, " value for the ").concat(i, " prop."),
                  attributes: {}
                };
                //console.log('SX ATTRIB!!! '+'sx-attribute-'+i+'-'+param, obj);
                components['sx-attribute-' + i + '-' + param] = obj;
              } else {
                components['sx-attribute-' + i + '-' + param].parents.push(i);
              }
            }
          }
        }
      }
      // ****************************
      // LAYOUT:
      components.Box = parent.extend(components['-private-systemProperties'], {
        type: 'view',
        icons: ['idea'],
        level: types.all_levels,
        extends_: '-private-systemProperties',
        hint: "The Box component serves as a wrapper component for most of the CSS utility needs.",
        attributes: {
          '{icon:list}sx': {
            type: 'object',
            hint: 'The sx prop is a shortcut for defining custom styles that has access to the theme.'
          },
          component: {
            type: 'string',
            default: 'div',
            hint: 'The component used for the root node. Either a string to use a HTML element or a component.'
          },
          h: {
            type: 'number, %',
            hint: 'The height of the Box. It accepts any value that the CSS height accepts.'
          }
        }
      });

      // ****************************
      // ICON: dynamic import from @mui/icons-material
      // also adds the x_command 'icon:Outlined:name' support
      // console.log('material-icons',Object.keys(Icons));
      // variation 3: grouped by styles -> icon:Outlined:x, icon:Rounded:x, icon:Sharp:x, icon:TwoTone:x
      // ****************************
      var icons_grouped_by_style = {};
      var icons_styles = ['Outlined', 'Rounded', 'Sharp', 'TwoTone'];
      Object.keys(Icons).forEach(icon => {
        for (var style of icons_styles) {
          if (icon.indexOf(style) > -1) {
            if (!icons_grouped_by_style[style]) icons_grouped_by_style[style] = [];
            icons_grouped_by_style[style].push(icon.replace(style, ''));
          }
        }
      });
      //console.log('icons_grouped_by_style',icons_grouped_by_style);
      var _loop = function* _loop(style) {
        components['icon:' + style + ':*'] = parent.extend(types.base, {
          hint: "<b>Material UI Icon</b> - style <b>".concat(style, "</b>\n\n                       \n<u>Use any of these icons:</u>\n\n \n                       ").concat(icons_grouped_by_style[style].join(', '), "\n\n"),
          type: 'view-icon',
          childrenTypes: ['attribute*', 'event*'],
          attributes: {
            '{icon:list}sx': {
              type: 'object',
              hint: 'The sx prop is a shortcut for defining custom styles that has access to the theme.'
            },
            '{icon:list}color': {
              type: types.colors.join(', '),
              hint: 'The color of the icon, specified as the bgcolor of the node.'
            },
            color: {
              type: types.colors.join(', '),
              hint: 'The color of the icon.'
            },
            fontSize: {
              type: types.sizes.join(', '),
              hint: 'The fontSize applied to the icon.'
            }
          }
        });
        //add the dynamic x_command support
        yield parent.addCommand({
          ["mui_icon_".concat(style.toLowerCase())]: {
            x_level: '>3',
            x_icons: 'idea',
            x_text_contains: "icon:".concat(style, ":"),
            x_or_hasparent: 'def_page,def_componente,def_layout',
            hint: "Adds an ".concat(style, " Material UI Icon"),
            func: function () {
              var _func = _asyncToGenerator(function* (node, state) {
                var resp = parent.context.reply_template({
                  state
                });
                var icon = node.text.replace("icon:".concat(style, ":"), '') + style;
                var attrs = {
                  refx: node.id
                };
                if (resp.state.current_page && resp.state.current_page in parent.context.x_state.pages) {
                  // add import to page (if its a page)
                  parent.context.x_state.pages[resp.state.current_page].imports[icon] = parent.context.x_state.ui.iconNPM;
                }
                Object.keys(node.attributes).forEach(attr => {
                  attrs[attr] = node.attributes[attr];
                });
                resp.open += parent.context.tagParams(icon, attrs, false) + '\n';
                resp.close += "</".concat(icon, ">\n");
                resp.state.friendly_name = icon;
                //resp.state.from_script = false;
                //console.log(`def_icon_${style}`,attrs);
                return resp;
              });
              function func(_x2, _x3) {
                return _func.apply(this, arguments);
              }
              return func;
            }()
          }
        });
        //
      };
      for (var style in icons_grouped_by_style) {
        yield* _loop(style);
      }
      // basic event attributes
      var event_attributes = {
        ':stop': {
          type: 'boolean',
          default: 'true',
          hint: 'if false prevents stopping event propagations'
        }
      };

      // ****************************
      // INPUTS:
      components.ButtonBase = parent.extend(types.base, {
        hint: "The ButtonBase component is used to create a button based component.",
        attributes: {
          action: {
            type: 'ref',
            hint: "A ref for imperative actions. It currently only supports focusVisible() action"
          },
          centerRipple: {
            type: 'boolean',
            default: 'false',
            hint: "If true, the ripples will be centered. They won't start at the cursor interaction position."
          },
          '{icon:list}classes': {
            type: 'object',
            hint: "Override or extend the styles applied to the component. See CSS API below for more details."
          },
          component: {
            type: 'string',
            default: 'Button',
            hint: "The component used for the root node. Either a string to use a HTML element or a component."
          },
          disabled: {
            type: 'boolean',
            default: 'false',
            hint: "If true, the base button will be disabled."
          },
          disableRipple: {
            type: 'boolean',
            default: 'false',
            hint: "If true, the ripple effect is disabled. Without a ripple there is no styling for :focus-visible by default. "
          },
          disableTouchRipple: {
            type: 'boolean',
            default: 'false',
            hint: "If true, the touch ripple effect is disabled."
          },
          focusRipple: {
            type: 'boolean',
            default: 'false',
            hint: "If true, the base button will have a keyboard focus ripple."
          },
          focusVisibleClassName: {
            type: 'string',
            hint: "This prop can help identify which element has keyboard focus. The class name will be applied when the element gains the focus through keyboard interaction. It's a polyfill for the CSS :focus-visible selector."
          },
          '{icon:idea}LinkComponent': {
            type: '{icon:idea}Element',
            default: 'a',
            hint: "The component used to render a link when the href prop is provided."
          },
          '{icon:list}{icon:help}onFocusVisible': {
            type: 'function',
            hint: "Callback fired when the component is focused with a keyboard. We trigger a onFocus callback too."
          },
          '{icon:list}sx': {
            type: 'object',
            hint: "The sx prop is a shortcut for defining custom styles that has access to the theme."
          },
          '{icon:list}TouchRippleProps': {
            type: 'object',
            hint: "Props applied to the TouchRipple element."
          },
          '{icon:list}{icon:help}touchRippleRef': {
            type: 'function',
            hint: "A ref that points to the TouchRipple element."
          }
        },
        events: {
          focusVisible: {
            hint: "Callback fired when the component is focused with a keyboard. Also triggers a 'focus' event.",
            attributes: event_attributes
          },
          focus: {
            hint: "Callback fired when the component is focused.",
            attributes: event_attributes
          },
          click: {
            params: 'event',
            hint: "Callback fired when the button is clicked.",
            attributes: event_attributes
          }
        }
      });
      components.Button = parent.extend(components.ButtonBase, {
        extends_: 'ButtonBase',
        hint: 'Buttons allow users to take actions, and make choices, with a single tap.',
        attributes: {
          'color': {
            //all keys are optional - empty by default
            type: types.colors.join(', '),
            default: 'primary',
            hint: 'The color of the component. It supports both default and custom theme colors.'
          },
          '{icon:list}classes': {
            //type: systemProp["marginRight"].type,
            type: 'object',
            hint: "Override or extend the styles applied to the component."
          },
          'component': {
            type: 'string',
            hint: "The component used for the root node. Either a string to use a HTML element or a component.",
            default: 'Button'
          },
          'disabled': {
            type: 'boolean',
            default: false,
            hint: "If true, the button will be disabled."
          },
          'disableElevation': {
            type: 'boolean',
            default: false,
            hint: "If true, no elevation is used."
          },
          'disableFocusRipple': {
            type: 'boolean',
            default: false,
            hint: "If true, the keyboard focus ripple will be disabled."
          },
          'disableRipple': {
            type: 'boolean',
            default: false,
            hint: "If true, the ripple effect is disabled."
          },
          '{icon:list}{icon:idea}endIcon': {
            type: '{icon:idea}icon:x',
            hint: "Element placed after the children."
          },
          'fullWidth': {
            type: 'boolean',
            default: false,
            hint: "If true, the button will take up the full width of its container."
          },
          'href': {
            type: 'string',
            hint: "The URL to link to when the button is clicked. If defined, an 'a' element will be used as the root node."
          },
          'size': {
            type: types.sizes.join(', '),
            default: 'medium',
            hint: "The size of the button."
          },
          '{icon:list}{icon:idea}startIcon': {
            type: '{icon:idea}icon:x',
            hint: "Element placed before the children."
          },
          '{icon:list}sx': {
            type: 'object',
            hint: "The sx prop is a shortcut for defining custom styles that has access to the theme."
          },
          variant: {
            type: types.variant.join(', '),
            default: 'text',
            hint: "The variant to use."
          }
        }
      });
      components.LoadingButton = parent.extend(components.Button, {
        extends_: 'Button',
        hint: 'The loading buttons can show loading state and disable interactions.',
        attributes: {
          'loading': {
            type: 'boolean',
            default: false,
            hint: "If true, the button will be in a loading state."
          },
          '{icon:list}loadingIndicator': {
            type: '{icon:idea}Element',
            default: '{icon:idea}CircularProgress[color="inherit" size={16}]',
            hint: "Element placed before the children if the button is in loading state."
          },
          'loadingPosition': {
            type: 'start, end, center',
            default: 'center',
            hint: "The loading indicator can be positioned on the start, end, or the center of the button."
          }
        }
      });
      components.ButtonGroup = parent.extend(types.base, {
        hint: "Component that groups buttons together",
        attributes: {
          '{icon:list}classes': {
            //type: systemProp["marginRight"].type,
            type: 'object',
            hint: "Override or extend the styles applied to the component."
          },
          'color': {
            //all keys are optional - empty by default
            type: types.colors.join(', '),
            default: 'primary',
            hint: 'The color of the component. It supports both default and custom theme colors.'
          },
          'component': {
            type: 'string',
            hint: "The component used for the root node; a string with the HTML element.",
            default: 'Button'
          },
          '{icon:list}{icon:idea}component': {
            type: '{icon:idea}Element',
            hint: "The component used for the root node; a component with the Element.",
            default: '{icon:idea}Button'
          },
          'disabled': {
            type: 'boolean',
            default: false,
            hint: "If true, the component is disabled."
          },
          'disableElevation': {
            type: 'boolean',
            default: false,
            hint: "If true, no elevation is used."
          },
          'disableFocusRipple': {
            type: 'boolean',
            default: false,
            hint: "If true, the button keyboard focus ripple is disabled."
          },
          'disableRipple': {
            type: 'boolean',
            default: false,
            hint: "If true, the button ripple effect is disabled."
          },
          fullWidth: {
            type: 'boolean',
            default: false,
            hint: "If true, the buttons will take up the full width of its container."
          },
          orientation: {
            type: 'horizontal, vertical',
            default: 'horizontal',
            hint: "The component orientation (layout flow direction)."
          },
          'size': {
            type: types.sizes.join(', '),
            default: 'medium',
            hint: "The size of the component. small is equivalent to the dense button styling."
          },
          '{icon:list}sx': {
            type: 'object',
            hint: "The sx prop is a shortcut for defining custom styles that has access to the theme."
          },
          variant: {
            type: types.variant.join(', '),
            default: 'solid'
          }
        }
      });
      components.Checkbox = parent.extend(components.ButtonBase, {
        extends_: 'ButtonBase',
        //@todo to be used to extend ourselfs without using the 'extend' method, and identify which attribs are inherited (to colour them differently on the tables)
        hint: 'Checkboxes allow the user to select one or more items from a set.',
        childrenTypes: ['attribute*', 'event*'],
        attributes: {
          'checked': {
            type: 'boolean',
            default: false,
            hint: "If true, the component is checked."
          },
          '{icon:list}{icon:idea}icon': {
            type: '{icon:idea}Element,{icon:idea}icon:',
            default: '{icon:idea}CheckBoxOutlineBlankIcon',
            hint: "The icon to display when the component is checked."
          },
          '{icon:list}{icon:idea}checkedIcon': {
            type: '{icon:idea}Element,{icon:idea}icon:',
            default: '{icon:idea}CheckBoxIcon',
            hint: "The icon to display when the component is checked.",
            childrenTypes: ['icon*', 'view*']
          },
          '{icon:list}classes': {
            //type: systemProp["marginRight"].type,
            type: 'object',
            hint: "Override or extend the styles applied to the component."
          },
          'color': {
            //all keys are optional - empty by default
            type: types.colors.join(', '),
            default: 'primary',
            hint: 'The color of the component. It supports both default and custom theme colors.'
          },
          defaultChecked: {
            type: 'boolean',
            default: false,
            hint: "The default checked state. Use when the component is not controlled."
          },
          id: {
            type: 'string',
            hint: "The id of the input element."
          },
          indeterminate: {
            type: 'boolean',
            default: false,
            hint: "If true, the component appears indeterminate. This does not set the native input element to indeterminate due to inconsistent behavior across browsers. However, we set a data-indeterminate attribute on the input."
          },
          '{icon:list}{icon:idea}indeterminateIcon': {
            type: '{icon:idea}Element',
            default: '{icon:idea}IndeterminateCheckBoxIcon',
            hint: "The indeterminate icon to display when the component is indeterminate."
          },
          '{icon:list}inputProps': {
            type: 'object',
            hint: "Attributes applied to the input element."
          }
        }
      });
      //****************************
      return components;
    });
    return function autocomplete(_x) {
      return _ref.apply(this, arguments);
    };
  }();

  class mui extends base_ui {
    constructor() {
      var {
        context = {}
      } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      super({
        context,
        name: 'mui'
      });
    }

    //****************************
    // methods to be overwritten
    //****************************

    logo() {
      var _arguments = arguments,
        _this = this;
      return _asyncToGenerator(function* () {
        var {
          name = _this.name,
          config = {}
        } = _arguments.length > 0 && _arguments[0] !== undefined ? _arguments[0] : {};
        require('cfonts');
        //cfonts.say(name, {...{ font:'block', gradient:'red,blue' },...config });
      })();
    }

    install() {
      var _this2 = this;
      return _asyncToGenerator(function* () {
        // add anything that needs to be installed
        _this2.context.x_state.npm['@emotion/react'] = '^11.10.5';
        _this2.context.x_state.npm['@emotion/styled'] = '^11.10.5';
        _this2.context.x_state.npm['@fontsource/roboto'] = '^4.5.8';
        _this2.context.x_state.npm['@mui/icons-material'] = '^5.10.14';
        _this2.context.x_state.npm['@mui/material'] = '^5.10.14';
        _this2.context.x_state.npm['normalize.css'] = '^8.0.1';
      })();
    }
    autocomplete() {
      var _this3 = this;
      return _asyncToGenerator(function* () {
        // moved contents to external file: mui/autocomplete.js
        return yield autocomplete$1(_this3);
      })();
    }
    defaultState() {
      var _this4 = this;
      return _asyncToGenerator(function* () {
        // overwrites defaults for UI libraries as global state
        _this4.context.x_state.ui = _objectSpread2(_objectSpread2({}, _this4.context.x_state.ui), {
          'textTag': 'Typography',
          'viewNPM': '@mui/material',
          'iconNPM': '@mui/icons-material',
          textSimpleIfParentView: ['Button'],
          bold: {
            sx: {
              fontWeight: 'bold'
            }
          },
          italic: {
            sx: {
              fontStyle: 'italic'
            }
          },
          small: {
            variant: 'caption'
          },
          span: {
            component: 'span'
          }
        });
      })();
    }
    AppImports() {
      return _asyncToGenerator(function* () {
        // whatever is returned is added to App.jsx header
        return "import 'normalize.css';\n        import '@fontsource/roboto/300.css';\n        import '@fontsource/roboto/400.css';\n        import '@fontsource/roboto/500.css';\n        import '@fontsource/roboto/700.css';\n        \n        import { CacheProvider } from '@emotion/react';\n        import { ThemeProvider, CssBaseline } from '@mui/material';\n        import appTheme from './styles/theme/theme';\n        import createEmotionCache from './utility/createEmotionCache';\n\n        const clientSideEmotionCache = createEmotionCache();\n        ";
      })();
    }
    AppWrap() {
      return _asyncToGenerator(function* () {
        //returns a wrapper for App.jsx template content
        return {
          open: "<CacheProvider value={clientSideEmotionCache}>\n\t\t\t    <ThemeProvider theme={appTheme}>\n\t\t\t\t    <CssBaseline />",
          close: "</ThemeProvider>\n            </CacheProvider>"
        };
      })();
    }
    BabelRC(data) {
      return _asyncToGenerator(function* () {
        //transforms the given babelrc.json data, before writing it
        var new_ = data;
        new_.plugins.push(['babel-plugin-direct-import', {
          modules: ["@mui/material", "@mui/icons-material"]
        }]);
        return new_;
      })();
    }
    globalCSS() {
      return _asyncToGenerator(function* () {
        // whatever is returned is added to globals.css
        /*
        return `body {
            font-family: Arial, Helvetica, sans-serif;
          }
          
          .container {
            font-size: 3rem;
            margin: auto;
            max-width: 800px;
            margin-top: 20px;
          }
        `;*/
        // we now use @stitches/stringify
        return {
          body: {
            fontFamily: 'Arial, Helvetica, sans-serif'
          },
          '.container': {
            fontSize: '3rem',
            margin: 'auto',
            maxWidth: '800px',
            marginTop: '20px'
          }
        };
      })();
    }
    indexHtmlHead() {
      return _asyncToGenerator(function* () {
        // whatever is returned is added to the 'head' of index.html
        return "<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap\" />\n\t\t<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/icon?family=Material+Icons\" />";
      })();
    }
    generateFiles() {
      var _this5 = this;
      return _asyncToGenerator(function* () {
        /**
         * generate theme files within context createSystemFiles()
         * theme data on this.context.x_state.theme
         */
        //create createEmotionCache.js
        var g = _this5.context.g;
        yield _this5.context.writeFile(g('@utility/createEmotionCache.js'), "import createCache from '@emotion/cache';\n\n        const createEmotionCache = () => {\n          return createCache({ key: 'css', prepend: true });\n        };\n        \n        export default createEmotionCache;\n        ");
        //create styles/theme/theme.js
        var material_theme = "import { createTheme } from '@mui/material/styles';\n\n        const appTheme = createTheme({concepto:theme});\n        \n        export default appTheme;";
        var default_theme = {
          palette: {
            mode: 'light',
            primary: {
              main: '#DCED71'
            },
            secondary: {
              main: '#1E1F24'
            },
            tertiary: {
              main: '#34414B'
            }
          }
        };
        default_theme = _this5.extend(default_theme, _this5.context.x_state.theme);
        material_theme = material_theme.replaceAll('{concepto:theme}', _this5.context.jsDump(default_theme));
        yield _this5.context.writeFile(g('@theme/theme.js'), material_theme);

        /*
        {
           palette: {
               mode: 'dark',
               primary: {
                   main: '#DCED71',
               },
               secondary: {
                   main: '#1E1F24',
               },
               tertiary: {
                   main: '#34414B',
               },
           },
           components: {
               MuiButton: {
                   defaultProps: {
                   }
               }
           }
        }  
        */
      })();
    }

    // HELPER methods
    exists(dir_or_file) {
      return _asyncToGenerator(function* () {
        var fs = require('fs').promises;
        try {
          yield fs.access(dir_or_file);
          return true;
        } catch (e) {
          return false;
        }
      })();
    }
  }

  class joy extends base_ui {
    constructor() {
      var {
        context = {}
      } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      super({
        context,
        name: 'joy'
      });
    }

    //****************************
    // methods to be overwritten
    //****************************

    logo() {
      var _arguments = arguments,
        _this = this;
      return _asyncToGenerator(function* () {
        var {
          name = _this.name,
          config = {}
        } = _arguments.length > 0 && _arguments[0] !== undefined ? _arguments[0] : {};
        require('cfonts');
        //cfonts.say(name, {...{ font:'block', gradient:'red,blue' },...config });
      })();
    }

    install() {
      var _this2 = this;
      return _asyncToGenerator(function* () {
        // add anything that needs to be installed
        _this2.context.x_state.npm['@mui/joy'] = '*';
        _this2.context.x_state.npm['@emotion/react'] = '*';
        _this2.context.x_state.npm['@emotion/styled'] = '*';
        _this2.context.x_state.npm['@fontsource/public-sans'] = '*';
        _this2.context.x_state.npm['@mui/icons-material'] = '^5.10.14';
      })();
    }
    autocomplete() {
      return _asyncToGenerator(function* () {
        // insert associated ui autocompletion calls here
        return {
          'Button': {
            icons: ['idea'],
            level: [3, 4],
            hint: 'Adds a JOY button',
            attributes: {
              //all keys are optional - empty by default
              'variant': {
                type: 'string',
                default: 'solid',
                hint: ''
              }
            }
          }
        };
      })();
    }
    defaultState() {
      var _this3 = this;
      return _asyncToGenerator(function* () {
        // overwrites defaults for UI libraries as global state
        _this3.context.x_state.ui = _objectSpread2(_objectSpread2({}, _this3.context.x_state.ui), {
          'textTag': 'Typography',
          'viewNPM': '@mui/joy',
          'iconNPM': '@mui/icons-material',
          textSimpleIfParentView: [],
          bold: {
            sx: {
              fontWeight: 'bold'
            }
          },
          italic: {
            sx: {
              fontStyle: 'italic'
            }
          },
          small: {
            variant: 'caption'
          },
          span: {
            component: 'span'
          }
        });
      })();
    }
    AppImports() {
      return _asyncToGenerator(function* () {
        // whatever is returned is added to App.jsx header
        return "import '@fontsource/public-sans';\n        import { CssVarsProvider } from '@mui/joy/styles';\n        import CssBaseline from '@mui/joy/CssBaseline';\n        ";
      })();
    }
    AppWrap() {
      return _asyncToGenerator(function* () {
        //returns a wrapper for App.jsx template content
        return {
          open: "<CssVarsProvider>\n\t\t\t\t<CssBaseline />",
          close: "</CssVarsProvider>"
        };
      })();
    }
    globalCSS() {
      return _asyncToGenerator(function* () {
        // whatever is returned is added to globals.css
        return "body {\n            font-family: Public Sans, Arial, Helvetica, sans-serif;\n          }\n        ";
      })();
    }
    indexHtmlHead() {
      return _asyncToGenerator(function* () {
        // whatever is returned is added to the 'head' of index.html
        return "<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/icon?family=Material+Icons\" />";
      })();
    }
    generateFiles() {
      var _this4 = this;
      return _asyncToGenerator(function* () {
        /**
         * generate theme files within context createSystemFiles()
         * theme data on this.context.x_state.theme
         */
        _this4.context.g;
      })();
    }

    // HELPER methods
    exists(dir_or_file) {
      return _asyncToGenerator(function* () {
        var fs = require('fs').promises;
        try {
          yield fs.access(dir_or_file);
          return true;
        } catch (e) {
          return false;
        }
      })();
    }
  }

  var autocomplete = () => {
    // insert associated ui autocompletion calls here
    var types = {
      // type = system, component (user, gets erased on each cache clear) - refers to a subfolder on .autocomplete
      type: 'system',
      colors: ['whiteAlpha', 'blackAlpha', 'gray', 'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'cyan', 'purple', 'pink', 'linkedin', 'facebook', 'messenger', 'whatsapp', 'twitter', 'telegram'],
      sizes: ['lg', 'md', 'sm', 'xs'],
      variant: ['outline', 'ghost', 'link', 'solid', 'unstyled'],
      all_levels: [3, 4, 5, 6, 7, 8, 9, 10]
    };
    types.base = {
      type: types.type,
      icons: ['idea'],
      level: types.all_levels
    };
    var components = {};
    // ****************************
    // LAYOUT:
    components.AspectRatio = _objectSpread2(_objectSpread2({}, types.base), {
      hint: "AspectRatio component is used to embed responsive videos and maps, etc. It uses a very common padding hack to achieve this.",
      attributes: {
        ratio: {
          type: 'number',
          hint: 'The aspect ratio of the Box. Common values are: `21/9`, `16/9`, `9/16`, `4/3`, `1.85/1`'
        }
      }
    });
    //Box has a lot of attributes, so we will just add the most common ones
    //every component in Chakra extends Box
    components.Box = _objectSpread2(_objectSpread2({}, types.base), {
      hint: "Box is the most abstract component on top of which all other Chakra UI components are built. By default, it renders a div element.",
      attributes: {
        bg: {
          type: types.colors.join(', '),
          hint: 'The background color of the Box. It uses the theme colors.'
        },
        w: {
          type: 'number, %',
          hint: 'The width of the Box. It accepts any value that the CSS width accepts.'
        },
        h: {
          type: 'number, %',
          hint: 'The height of the Box. It accepts any value that the CSS height accepts.'
        }
      }
    });

    // ****************************
    // FORMS:
    components.Button = _objectSpread2(_objectSpread2({}, components.Box), {
      hint: 'Button component is used to trigger an action or event, such as submitting a form, opening a Dialog, canceling an action, or performing a delete operation.',
      attributes: {
        'colorScheme': {
          //all keys are optional - empty by default
          type: types.colors.join(', '),
          default: 'grey',
          hint: ''
        },
        'iconSpacing': {
          type: 'SystemProps["marginRight"]',
          hint: "The space between the button icon and label"
        },
        isActive: {
          type: 'boolean',
          hint: 'If true, the button will be styled in its active state.'
        },
        isDisabled: {
          type: 'boolean',
          hint: 'If true, the button will be disabled.'
        },
        isLoading: {
          type: 'boolean',
          hint: 'If true, the button will show a spinner.'
        },
        '{icon:list}leftIcon': {
          type: '{icon:idea}icon:x',
          //{icon:x} -> is replaced by autocomplete with the icon name
          hint: "If added, the button will show an icon before the button's label"
        },
        loadingText: {
          type: 'string',
          hint: "The label to show in the button when isLoading is true If no text is passed, it only shows the spinner"
        },
        '{icon:list}rightIcon': {
          type: "{icon:idea}icon:x",
          hint: "If added, the button will show an icon after the button's label."
        },
        size: {
          type: types.sizes.join(', '),
          default: 'md'
        },
        '{icon:list}spinner': {
          type: '{icon:idea}icon:x',
          hint: "Replace the spinner component when isLoading is set to true"
        },
        spinnerPlacement: {
          type: 'end, start',
          default: 'start',
          hint: "It determines the placement of the spinner when isLoading is true"
        },
        variant: {
          type: types.variant.join(', '),
          default: 'solid'
        }
      }
    });
    components.ButtonGroup = _objectSpread2(_objectSpread2({}, components.Box), {
      hint: "Component that groups buttons together",
      attributes: {
        variant: {
          type: types.variant.join(', '),
          default: 'solid'
        },
        spacing: {
          type: 'integer',
          default: 0,
          hint: "Adds spacing between the buttons"
        }
      }
    });
    components.Checkbox = _objectSpread2(_objectSpread2({}, components.Box), {
      hint: 'The Checkbox component is used in forms when a user needs to select multiple values from several options.',
      attributes: {
        'colorScheme': {
          //all keys are optional - empty by default
          type: types.colors.join(', '),
          default: 'grey',
          hint: ''
        },
        defaultIsChecked: {
          type: 'boolean',
          default: '',
          hint: 'If `true`, the checkbox will be initially checked.'
        },
        '{icon:list}icon': {
          type: "{icon:idea}icon:x",
          default: 'CheckboxIcon',
          hint: "The checked icon to use."
        },
        iconColor: {
          type: types.colors.join(', ')
        },
        iconSize: {
          type: types.sizes.join(', ')
        },
        isChecked: {
          type: 'boolean',
          hint: 'If `true`, the checkbox will be checked.'
        },
        isDisabled: {
          type: 'boolean',
          hint: 'If `true`, the checkbox will be disabled.'
        },
        isFocusable: {
          type: 'boolean',
          hint: 'If `true` and `isDisabled` is passed, the checkbox will remain tabbable but not interactive'
        },
        isIndeterminate: {
          type: 'boolean',
          hint: 'If `true`, the checkbox will be indeterminate.'
        },
        isInvalid: {
          type: 'boolean',
          hint: 'If `true`, the checkbox will be marked as invalid.'
        },
        isReadOnly: {
          type: 'boolean',
          hint: 'If `true`, the checkbox will be readonly.'
        },
        isRequired: {
          type: 'boolean',
          hint: 'If `true`, the checkbox will be required.'
        },
        name: {
          type: 'string',
          hint: 'The name of the input field in a checkbox (useful for form submission).'
        },
        onChange: {
          type: '{icon:help}event',
          hint: 'The callback fired when the state is changed.'
        },
        size: {
          type: types.sizes.join(', ')
        },
        spacing: {
          type: 'SystemProps["marginLeft"]',
          hint: 'The spacing between the checkbox and its label.'
        },
        value: {
          type: 'string, number',
          hint: 'The value to be used in the checkbox input. This is the value that will be returned on form submission.'
        },
        variant: {
          type: types.variant.join(', ')
        }
      }
    });
    //****************************
    return components;
  };

  class chakra extends base_ui {
    constructor() {
      var {
        context = {}
      } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      super({
        context,
        name: 'chakra'
      });
    }

    //****************************
    // methods to be overwritten
    //****************************

    logo() {
      var _arguments = arguments,
        _this = this;
      return _asyncToGenerator(function* () {
        var {
          name = _this.name,
          config = {}
        } = _arguments.length > 0 && _arguments[0] !== undefined ? _arguments[0] : {};
        require('cfonts');
        //cfonts.say(name, {...{ font:'block', gradient:'red,blue' },...config });
      })();
    }

    install() {
      var _this2 = this;
      return _asyncToGenerator(function* () {
        // add anything that needs to be installed
        _this2.context.x_state.npm['@chakra-ui/react'] = '*';
        _this2.context.x_state.npm['@chakra-ui/icons'] = '*';
        _this2.context.x_state.npm['@emotion/react'] = '^11';
        _this2.context.x_state.npm['@emotion/styled'] = '^11';
        _this2.context.x_state.npm['framer-motion'] = '^6';
        _this2.context.x_state.npm['@fontsource/open-sans'] = '*';
        _this2.context.x_state.npm['@fontsource/raleway'] = '*';
      })();
    }
    autocomplete() {
      return _asyncToGenerator(function* () {
        // moved contents to external file: chakra/autocomplete.js
        return yield autocomplete();
      })();
    }
    defaultState() {
      var _this3 = this;
      return _asyncToGenerator(function* () {
        // overwrites defaults for UI libraries as global state
        _this3.context.x_state.ui = _objectSpread2(_objectSpread2({}, _this3.context.x_state.ui), {
          'textTag': 'Text',
          'viewNPM': '@chakra-ui/react',
          'iconNPM': '@chakra-ui/icons',
          textSimpleIfParentView: [],
          bold: {
            fontWeight: 'bold'
          },
          italic: {
            sx: {
              fontStyle: 'italic'
            }
          },
          small: {
            variant: 'caption'
          },
          span: {
            as: 'span'
          }
        });
      })();
    }
    AppImports() {
      return _asyncToGenerator(function* () {
        // whatever is returned is added to App.jsx header
        return "\n        import { extendTheme, ChakraProvider } from '@mui/material';\n        import appTheme from './styles/theme/theme';\n        ";
      })();
    }
    AppWrap() {
      return _asyncToGenerator(function* () {
        //returns a wrapper for App.jsx template content
        return {
          open: "<ChakraProvider theme={theme}>",
          close: "</ChakraProvider>"
        };
      })();
    }
    globalCSS() {
      return _asyncToGenerator(function* () {
        // whatever is returned is added to globals.css
        return "body {\n            font-family: Arial, Helvetica, sans-serif;\n          }\n          \n          .container {\n            font-size: 3rem;\n            margin: auto;\n            max-width: 800px;\n            margin-top: 20px;\n          }\n        ";
      })();
    }
    indexHtmlHead() {
      return _asyncToGenerator(function* () {
        // whatever is returned is added to the 'head' of index.html
        return "<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap\" />\n\t\t<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/icon?family=Material+Icons\" />";
      })();
    }
    generateFiles() {
      var _this4 = this;
      return _asyncToGenerator(function* () {
        /**
         * generate theme files within context createSystemFiles()
         * theme data on this.context.x_state.theme
         */
        //create createEmotionCache.js
        var g = _this4.context.g;
        yield _this4.context.writeFile(g('@utility/createEmotionCache.js'), "import createCache from '@emotion/cache';\n\n        const createEmotionCache = () => {\n          return createCache({ key: 'css', prepend: true });\n        };\n        \n        export default createEmotionCache;\n        ");
        //create styles/theme/theme.js
        var material_theme = "import { createTheme } from '@mui/material/styles';\n\n        const appTheme = createTheme({concepto:theme});\n        \n        export default appTheme;";
        var default_theme = {
          palette: {
            mode: 'light',
            primary: {
              main: '#DCED71'
            },
            secondary: {
              main: '#1E1F24'
            },
            tertiary: {
              main: '#34414B'
            }
          }
        };
        default_theme = _this4.extend(default_theme, _this4.context.x_state.theme);
        material_theme = material_theme.replaceAll('{concepto:theme}', _this4.context.jsDump(default_theme));
        yield _this4.context.writeFile(g('@theme/theme.js'), material_theme);

        /*
        {
           palette: {
               mode: 'dark',
               primary: {
                   main: '#DCED71',
               },
               secondary: {
                   main: '#1E1F24',
               },
               tertiary: {
                   main: '#34414B',
               },
           },
           components: {
               MuiButton: {
                   defaultProps: {
                   }
               }
           }
        }  
        */
      })();
    }

    // HELPER methods
    exists(dir_or_file) {
      return _asyncToGenerator(function* () {
        var fs = require('fs').promises;
        try {
          yield fs.access(dir_or_file);
          return true;
        } catch (e) {
          return false;
        }
      })();
    }
  }

  var Theme = /*#__PURE__*/Object.freeze({
    __proto__: null,
    base_ui: base_ui,
    mui: mui,
    joy: joy,
    chakra: chakra
  });

  var e=e=>e.includes("-")?e:e.replace(/[A-Z]/g,(e=>"-"+e.toLowerCase())),t=(e,t)=>e.reduce(((e,o)=>(e.push(...t.map((e=>e.includes("&")?e.replace(/&/g,/[ +>|~]/.test(o)&&/&.*&/.test(e)?`:is(${o})`:o):o+" "+e))),e)),[]),{isArray:o}=Array,{prototype:{toString:s}}=Object,n=/\s*,\s*(?![^()]*\))/,r=(r,c)=>{const l=new WeakSet,a=(r,i,d,p,h)=>{let f="";e:for(const u in r){const g=64===u.charCodeAt(0);for(const y of g&&o(r[u])?r[u]:[r[u]]){if(c&&(u!==p||y!==h)){const e=c(u,y,r);if(null!==e){f+="object"==typeof e&&e?a(e,i,d,u,y):null==e?"":e;continue e}}if("object"==typeof y&&y&&y.toString===s){l.has(i)&&(l.delete(i),f+="}");const e=Object(u),o=g?i:i.length?t(i,u.split(n)):u.split(n);f+=a(y,o,g?d.concat(e):d),l.has(e)&&(l.delete(e),f+="}"),l.has(o)&&(l.delete(o),f+="}");}else {for(let e=0;e<d.length;++e)l.has(d[e])||(l.add(d[e]),f+=d[e]+"{");i.length&&!l.has(i)&&(l.add(i),f+=i+"{"),f+=(g?u+" ":e(u)+":")+String(y)+";";}}}return f};return a(r,[],[])};//# sourceMappingUrl=index.map

  var concepto = require('@concepto/interface');
  var deepMerge = require('deepmerge');
  class react_dsl extends concepto {
    constructor(file) {
      var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      // we can get class name, from package.json name key (after its in its own project)
      var my_config = {
        class: 'react',
        debug: true
      };
      var nuevo_config = _objectSpread2(_objectSpread2({}, my_config), config);
      super(file, nuevo_config); //,...my_config
      // custom dsl_git version
      this.x_config.dsl_git = /*#__PURE__*/function () {
        var _ref = _asyncToGenerator(function* (content) {
          //save git version
          var tmp = {},
            fs = require('fs').promises,
            path = require('path');
          //SECRETS
          this.x_state.central_config = yield this._readCentralConfig();
          this.x_state.config_node = yield this._readConfig(false);
          if (this.x_flags.dsl.includes('_git.dsl')) {
            // if file is x_git.dsl, expand secrets
            this.x_console.outT({
              message: 'we are the git!',
              color: 'green'
            });
            this.x_state.config_node = yield this._restoreSecrets(this.x_state.config_node);
            delete this.x_state.config_node[':id'];
            delete this.x_state.config_node[':secrets'];
            delete this.x_state.config_node['::secrets'];
            //search and erase config->:secrets node
            //this.x_console.out({ message:'config read on git',data:this.x_state.config_node });
          } else {
            // if file is x.dsl,
            // write x_git.dsl
            tmp.dsl_path = path.dirname(path.resolve(this.x_flags.dsl));
            tmp.dsl_git = path.join(tmp.dsl_path, path.basename(this.x_flags.dsl).replace('.dsl', '_git.dsl'));
            yield fs.writeFile(tmp.dsl_git, content, 'utf-8');
            this.debug("custom dsl_git file saved as: ".concat(tmp.dsl_git));
            // export secret keys as :secrets node to eb_git.dsl
            yield this._secretsToGIT(this.x_state.config_node);
          }
          //
        });
        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }().bind(this);
      //
    }

    // SECRETS helpers (@todo move this to concepto class)
    _secretsToGIT(resp) {
      var _this = this;
      return _asyncToGenerator(function* () {
        var path = require('path'),
          fs = require('fs').promises;
        var encrypt = require('encrypt-with-password');
        var curr_dsl = path.basename(_this.x_flags.dsl);
        // secret nodes to _git.dsl file
        if (resp['::secrets'] && resp['::secrets'].length > 0 && !curr_dsl.includes('_git.')) {
          //encrypt existing secret (password) nodes and save them as config->:secrets within _git.dsl file version
          var password = '';
          if (_this.x_config.secrets_pass && _this.x_config.secrets_pass != '') password = _this.x_config.secrets_pass.trim();
          if (password == '') {
            //if a password was not given, invent a memorable one
            var gpass = require('password-generator');
            password = gpass();
            resp[':password'] = password; //inform a pass was created
          }
          //encrypt secrets object
          var to_secrets = encrypt.encryptJSON(resp['::secrets'], password);
          //create :secrets node within x_git.dsl file
          var dsl_parser = require('@concepto/dsl_parser');
          var dsl = new dsl_parser({
            file: _this.x_flags.dsl.replace('.dsl', '_git.dsl'),
            config: {
              cancelled: true,
              debug: false
            }
          });
          try {
            yield dsl.process();
          } catch (d_err) {
            _this.x_console.out({
              message: "error: file ".concat(_this.x_flags.dsl.replace('.dsl', '_git.dsl'), " does't exist!"),
              data: d_err
            });
            return;
          }
          var new_content = yield dsl.addNode({
            parent_id: resp[':id'],
            node: {
              text: ':secrets',
              icons: ['password'],
              text_note: to_secrets
            }
          });
          var tmp = {};
          tmp.dsl_git_path = path.dirname(path.resolve(_this.x_flags.dsl));
          var git_target = path.join(tmp.dsl_git_path, path.basename(_this.x_flags.dsl).replace('.dsl', '_git.dsl')); //,path.basename(this.x_flags.dsl)
          yield fs.writeFile(git_target, new_content, 'utf-8');
          _this.debug("dsl_git file saved as: ".concat(git_target));
          if (resp[':password']) {
            _this.x_console.outT({
              message: "Password generated for DSL GIT secrets ->".concat(password),
              color: 'brightGreen'
            });
          }
          //
        }

        return resp;
      })();
    }
    // restore :secrets node info if it exists and a password was given
    _restoreSecrets(resp) {
      var _this2 = this;
      return _asyncToGenerator(function* () {
        var path = require('path'),
          fs = require('fs').promises;
        var encrypt = require('encrypt-with-password');
        var curr_dsl = path.basename(_this2.x_flags.dsl);
        if (curr_dsl.includes('_git.') && resp[':secrets']) {
          _this2.x_console.outT({
            message: "Secrets node detected!",
            color: 'brightCyan'
          });
          if (_this2.x_config.secrets_pass && _this2.x_config.secrets_pass != '') {
            _this2.x_console.outT({
              message: 'Decrypting config->secrets',
              color: 'brightGreen'
            });
            try {
              var from_secrets = encrypt.decryptJSON(resp[':secrets'], _this2.x_config.secrets_pass);
              // read nodes into resp struct
              for (var xs of from_secrets) {
                resp = _objectSpread2(_objectSpread2({}, resp), _this2.configFromNode(resp, xs));
              }
              var tmp = {};
              tmp.dsl_git_path = path.dirname(path.resolve(_this2.x_flags.dsl));
              tmp.non_target = path.join(tmp.dsl_git_path, path.basename(_this2.x_flags.dsl).replace('_git.dsl', '.dsl'));
              tmp.exists_non = yield _this2.exists(tmp.non_target);
              if (true) {
                //!tmp.exists_non
                _this2.x_console.outT({
                  message: 'Expanding secrets into ' + curr_dsl.replace('_git.dsl', '.dsl'),
                  color: 'cyan'
                });
                // expand secret nodes into non _git.dsl version config key
                var dsl_parser = require('@concepto/dsl_parser');
                var dsl = new dsl_parser({
                  file: _this2.x_flags.dsl,
                  config: {
                    cancelled: true,
                    debug: false
                  }
                });
                try {
                  yield dsl.process();
                } catch (d_err) {
                  _this2.x_console.out({
                    message: "error: file ".concat(_this2.x_flags.dsl, " does't exist!"),
                    data: d_err
                  });
                  return;
                }
                // remove config->:secrets node if it exists
                var $ = dsl.getParser();
                var search = $("node[TEXT=config] node[TEXT=:secrets]").toArray();
                search.map(function (elem) {
                  $(elem).remove();
                });
                //
                var new_content = '';
                for (var sn of from_secrets) {
                  new_content = yield dsl.addNode({
                    parent_id: resp[':id'],
                    node: sn
                  });
                }
                // save expanded x.dsl file (only if it doesnt exist)
                yield fs.writeFile(tmp.non_target, new_content, 'utf-8');
                _this2.debug("recovered dsl file saved as: ".concat(tmp.non_target));
              }
              //
            } catch (invpass) {
              //console.log(invpass);
              _this2.x_console.outT({
                message: 'Invalid --secret-pass value for map (check your password)',
                color: 'brightRed'
              });
              _this2.x_console.outT({
                message: 'WARNING: The process may fail if keys are needed',
                color: 'red'
              });
            }
          } else {
            _this2.x_console.outT({
              message: 'WARNING: file contains secrets, but no --secrets-pass arg was given',
              color: 'brightRed'
            });
            _this2.x_console.outT({
              message: 'WARNING: The process may fail if keys are needed',
              color: 'red'
            });
          }
        }
        return resp;
      })();
    }

    //

    // **************************
    // methods to be auto-called
    // **************************

    //Called after init method finishes
    onInit() {
      var _this3 = this;
      return _asyncToGenerator(function* () {
        // define and assign commands
        //this.x_console.outT({ message: `React Compiler v${version}`, color: `brightCyan` });
        //await this.addCommands(internal_commands);
        if (Object.keys(_this3.x_commands).length > 0) _this3.x_console.outT({
          message: "".concat(Object.keys(_this3.x_commands).length, " local x_commands loaded!"),
          color: "green"
        });
        //this.debug('x_commands',this.x_commands);
        //this.x_crypto_key = require('crypto').randomBytes(32); // for hash helper method
        // init react
        // set x_state defaults
        _this3.x_state = _objectSpread2(_objectSpread2({}, _this3.x_state), {
          ui: {},
          plugins: {},
          npm: {},
          dev_npm: {},
          envs: {},
          functions: {},
          proxies: {},
          pages: {},
          current_func: '',
          current_folder: '',
          current_proxy: '',
          strings_i18n: {},
          stores: {},
          assets: {},
          stores_types: {
            versions: {},
            expires: {}
          },
          nuxt_config: {
            head_script: {},
            build_modules: {},
            modules: {}
          }
        });
        if (!_this3.x_state.config_node) _this3.x_state.config_node = yield _this3._readConfig();
        //this.debug('config_node',this.x_state.config_node);
        _this3.x_state.central_config = yield _this3._readCentralConfig();
        //if requested silence...
        if (_this3.x_config.silent) {
          _this3.x_console.outT({
            message: "silent mode requested",
            color: "dim"
          });
          //this.x_console.setSilent(true);
          _this3.x_config.debug = false;
        }
        //if requested change deploy target
        if (_this3.x_config.deploy && _this3.x_config.deploy.trim() != '') {
          _this3.x_console.outT({
            message: "(as requested) force changing deploy target to: ".concat(_this3.x_config.deploy.trim()),
            color: "brightYellow"
          });
          _this3.x_state.central_config.deploy = _this3.x_config.deploy;
        }
        var compile_folder = _this3.x_state.central_config.apptitle;
        if (_this3.x_config.folder && _this3.x_config.folder.trim() != '') {
          compile_folder = _this3.x_config.folder.trim();
        }
        if (_this3.x_config.aws_region && _this3.x_config.aws_region.trim() != '') {
          if (!_this3.x_state.config_node.aws) _this3.x_state.config_node.aws = {};
          _this3.x_state.config_node.aws.region = _this3.x_config.aws_region.trim();
        }
        //this.debug('central_config',this.x_state.central_config);
        _this3.x_state.assets = yield _this3._readAssets();
        _this3.x_state.theme = yield _this3._readTheme();
        //this.debug('theme_node',this.x_state.theme);
        //this.debug('assets_node',this.x_state.assets);
        var target_folders = {
          'src': 'src',
          'components': 'src/components',
          'pages': 'src/pages',
          'assets': 'src/assets',
          'styles': 'src/styles',
          'theme': 'src/styles/theme',
          'utility': 'src/utility',
          'public': 'src/public',
          'static': 'src/public',
          'api': 'src/api',
          'secrets': 'secrets'
        };
        _this3.x_state.dirs = yield _this3._appFolders(target_folders, compile_folder);
        // init x_theme
        //this.debug('xtheme!!',[this.x_state.central_config.ui,Theme.default.base_ui.default]);
        //this.debug('xtheme',Theme);
        if (_this3.x_state.central_config.ui in Theme) {
          var xtheme = Theme[_this3.x_state.central_config.ui];
          new xtheme({
            context: _this3
          });
          //console.log('x_theme',x_theme);
          _this3.x_theme = new xtheme({
            context: _this3
          });
        } else {
          var _xtheme = base_ui;
          var _x_theme = new _xtheme({
            context: _this3
          });
          //console.log('x_theme',x_theme);
          _this3.x_theme = _x_theme;
        }
        yield _this3.x_theme.install(); // install required npm pkgs
        yield _this3.x_theme.generateAutoComplete(); // add autocomplete definitions
        yield _this3.x_theme.defaultState(); // set theme definitions
        yield _this3.x_theme.addCustomCommands(); // add custom commands of UI
        // read modelos node (DB definitions)
        _this3.x_state.models = yield _this3._readModels(); //alias: database tables
        //is local server running? if so, don't re-launch it
        _this3.x_state.next_is_running = yield _this3._isLocalServerRunning();
        _this3.debug('is Server Running: ' + _this3.x_state.next_is_running);
        // init terminal diagnostics (not needed here)
        /*if (this.x_state.central_config.next == 'latest' && this.atLeastNode('10') == false) {
            //this.debug('error: You need at least Node v10+ to use latest Next/MUI version!');
            throw new Error('You need to have at least Node v10+ to use latest Next/MUI version!');
        }*/
        _this3.x_state.es6 = true;
        // copy sub-directories if defined in node 'config.copy' key
        if (_this3.x_state.config_node.copy) {
          var _path = require('path');
          var copy = require('recursive-copy');
          _this3.x_console.outT({
            message: "copying config:copy directories to 'public' target folder",
            color: "yellow"
          });
          yield Object.keys(_this3.x_state.config_node.copy).map( /*#__PURE__*/function () {
            var _ref2 = _asyncToGenerator(function* (key) {
              var abs = _path.join(this.x_state.dirs.base, key);
              try {
                yield copy(abs, this.x_state.dirs.public);
              } catch (err_copy) {
                if (err_copy.code != 'EEXIST') this.x_console.outT({
                  message: "error: copying directory ".concat(abs),
                  data: err_copy
                });
              }
              //console.log('copying ',{ from:abs, to:this.x_state.dirs.static });
            });
            return function (_x2) {
              return _ref2.apply(this, arguments);
            };
          }().bind(_this3));
          _this3.x_console.outT({
            message: "copying config:copy directories ... READY",
            color: "yellow"
          });
          delete _this3.x_state.config_node.copy;
        }
        // *********************************************
        // install requested modules within config node
        // *********************************************
        // DEFAULT NPM MODULES & PLUGINS if dsl is not 'component' type
        // react_dsl doesn't have 'component' type; any webapp can share components
        _this3.x_console.outT({
          message: "react initialized() ->"
        });
        _this3.x_state.npm['@babel/runtime'] = '^7.13.10';
        _this3.x_state.npm['react'] = '^17.0.2';
        _this3.x_state.npm['react-dom'] = '^17.0.2';
        // axios
        // this.x_state.npm['@nuxtjs/axios'] = '*';
        // default devDependencies
        _this3.x_state.dev_npm['@babel/core'] = '^7.15.8';
        _this3.x_state.dev_npm['@babel/plugin-transform-runtime'] = '^7.15.8';
        _this3.x_state.dev_npm['babel-plugin-direct-import'] = '*'; // '^7.15.8';
        _this3.x_state.dev_npm['@babel/preset-env'] = '^7.15.8';
        _this3.x_state.dev_npm['@babel/preset-react'] = '^7.14.5';
        _this3.x_state.dev_npm['autoprefixer'] = '^10.1.0';
        _this3.x_state.dev_npm['babel-loader'] = '^8.2.2';
        _this3.x_state.dev_npm['css-loader'] = '^6.3.0';
        _this3.x_state.dev_npm['html-webpack-plugin'] = '^5.3.2';
        _this3.x_state.dev_npm['postcss'] = '^8.2.1';
        _this3.x_state.dev_npm['postcss-loader'] = '^4.1.0';
        _this3.x_state.dev_npm['style-loader'] = '^3.3.0';
        _this3.x_state.dev_npm['webpack'] = '^5.57.1';
        _this3.x_state.dev_npm['webpack-cli'] = '^4.9.0';
        _this3.x_state.dev_npm['webpack-dev-server'] = '^4.3.1';

        // serialize 'secret' config keys as json files in app secrets sub-directory (if any)
        // extract 'secret's from config keys; 
        /* */
        _this3.x_state.secrets = {}; //await _extractSecrets(config_node)
        var path = require('path');
        for (var key in _this3.x_state.config_node) {
          if (typeof key === 'string' && key.includes(':') == false) {
            if (_this3.x_state.config_node[key][':secret']) {
              var new_obj = _objectSpread2({}, _this3.x_state.config_node[key]);
              delete new_obj[':secret'];
              if (new_obj[':link']) delete new_obj[':link'];
              // set object keys to uppercase
              _this3.x_state.secrets[key] = {};
              var obj_keys = Object.keys(new_obj);
              for (var x in obj_keys) {
                _this3.x_state.secrets[key][x.toUpperCase()] = new_obj[x];
              }
              var target = path.join(_this3.x_state.dirs.secrets, "".concat(key, ".json"));
              yield _this3.writeFile(target, JSON.stringify(new_obj));
            }
          }
        }
        // set config keys as ENV accesible variables (ex. $config.childnode.attributename)
        // @todo move this into a const var in the top of the file
        var _loop = function _loop(_key) {
          // omit special config 'reserved' node keys
          if (['aurora', 'vpc', 'aws'].includes(_key) && typeof _this3.x_state.config_node[_key] === 'object') {
            Object.keys(_this3.x_state.config_node[_key]).map(function (attr) {
              this.x_state.envs["config.".concat(_key, ".").concat(attr)] = "process.env.".concat((_key + '_' + attr).toUpperCase());
            }.bind(_this3));
          }
        };
        for (var _key in _this3.x_state.config_node) {
          _loop(_key);
        }

        // get absolute path for given @file
        _this3.g = file => {
          var res = file;
          if (file[0] == '@') {
            var base = file.split('/')[0].replace('@', '');
            var withoutBase = file.replace("@".concat(base, "/"), '');
            if (base in _this3.x_state.dirs) {
              res = path.join(_this3.x_state.dirs[base], withoutBase);
            }
          }
          return res;
        };
        // show this.x_state contents
        //this.debug('x_state says',this.x_state);
      })();
    }

    renderTable(title, table, render) {
      //obtain our theme data
      var meta = this.x_commands.meta;
      var theme = {
        table_bgcolor: "#AAD3F3",
        tr0_bgcolor: "#AAD3F3",
        tr_bgcolor: "#AAD3F3",
        tr_inherited_bgcolor: "#C3C3C3",
        cellpadding: 2,
        cellspacing: 0
      };
      // overwrite with given theme if defined
      var custom_theme = meta.autocomplete && meta.autocomplete.theme ? meta.autocomplete.theme : {};
      theme = _objectSpread2(_objectSpread2({}, theme), custom_theme);
      //********************/
      //RENDER HTML TABLE
      //********************/
      var html = "<table width='100%' border=1 cellspacing=".concat(theme.cellspacing, " cellpadding=").concat(theme.cellpadding, " bordercolor='").concat(theme.table_bgcolor, "'>");
      var header = Object.keys(table[0]);
      var numHeaders = header.length;
      if (header.includes('inherited_')) {
        numHeaders = numHeaders - 1;
      }
      //table title
      html += "<tr bgcolor='".concat(theme.tr0_bgcolor, "'>");
      html += "<td colspan='".concat(numHeaders, "' valign='top' align='left'>").concat(title, ":</td>");
      html += "</tr>";
      //table header
      html += "<tr bgcolor='".concat(theme.tr0_bgcolor, "'>");
      for (var h of header) {
        if (h.indexOf('_') == -1) {
          html += "<td valign='top'><b>".concat(h, "</b></td>");
        }
      }
      html += "</tr>";
      //table rows
      for (var row in table) {
        if (table[row].inherited_ && table[row].inherited_ == true) {
          html += "<tr bgcolor='".concat(theme.tr_inherited_bgcolor, "'>");
        } else {
          html += "<tr bgcolor='".concat(theme.tr_bgcolor, "'>");
        }
        for (var col in table[row]) {
          if (col.indexOf('_') == -1) {
            html += "<td>".concat(render.placeholders(table[row][col]), "</td>");
          }
        }
        html += "</tr>";
      }
      //close table
      html += "</table>";
      return html;
    }

    //overwrite autocomplete HTML generator template
    autocompleteContentTemplate(record, render) {
      var _this4 = this;
      return _asyncToGenerator(function* () {
        // param record is an autocomplete object for a given item
        // returns the template to show in an autocomplete view
        var keyword = render.placeholders(record.text);
        var hint = render.placeholders(record.hint.replace('\n', '<br/>'));
        var attributes = record.attributes;
        var events = record.events && Object.keys(record.events).length > 0 ? record.events : {};
        var icons = record.icons ? record.icons : [];
        record.type ? record.type : 'internal';
        var html = '';
        var renderIcon = icon => {
          return "<img src=\"".concat(icon, ".png\" align=\"left\" hspace=\"0\" vspace=\"1\" valign=\"bottom\" />&nbsp;");
        };
        for (var icon of icons) {
          html += renderIcon(icon);
        }
        html += "<b>".concat(keyword, "</b><br /><br />");
        if (record.extends_ && record.extends_ != '') {
          html += render.placeholders("Extends {icon:idea}<b>".concat(record.extends_.replaceAll('-private-', ''), "</b><br/>"));
        }
        html += "".concat(hint, "<br /><br />");
        if (Object.keys(attributes).length > 0) {
          html += render.attrs(attributes, renderIcon);
          html += "<br />";
        }
        var customRender = _objectSpread2(_objectSpread2({}, render), {
          placeholders: str => {
            return render.placeholders(str, renderIcon);
          }
        });
        // add events
        if (Object.keys(events).length > 0) {
          var eventsArr = [];
          for (var event in events) {
            // push event object
            eventsArr.push({
              'Name': '{icon:help}' + event,
              'Params': events[event].params ? events[event].params : '',
              'Hint': events[event].hint,
              'inherited_': events[event].inherited_
            });
          }
          var x = _this4.renderTable(customRender.placeholders('<b>Events</b>'), eventsArr, customRender);
          html += x;
        }
        html += "<br />";
        //;
        return html;
      })();
    }

    //Called after parsing nodes
    onAfterProcess(processedNode) {
      return _asyncToGenerator(function* () {
        return processedNode;
      })();
    }

    //Called for defining the title of class/page by testing node.
    onDefineTitle(node) {
      var _this5 = this;
      return _asyncToGenerator(function* () {
        var resp = node.text;
        Object.keys(node.attributes).map(function (i) {
          if (i == 'title' || i == 'titulo') {
            resp = node.attributes[i];
            return false;
          }
        }.bind(_this5));
        /*
        for (i in node.attributes) {
        	if (['title','titulo'].includes(node.attributes[i])) {
        		resp = node.attributes[i];
        		break;
        	}
        }*/
        return resp;
      })();
    }

    //Called for naming filename of class/page by testing node.
    onDefineFilename(node) {
      return _asyncToGenerator(function* () {
        var resp = node.text;
        // @idea we could use some 'slug' method here
        resp = resp.replace(/\ /g, '_') + '.js';
        if (node.icons.includes('gohome')) {
          resp = 'Home.js';
        } else if (node.icons.includes('desktop_new')) {
          if (node.text.indexOf('assets') != -1) {
            resp = 'internal_assets.omit';
          } else if (node.text.indexOf('theme') != -1) {
            resp = 'internal_theme.omit';
          } else if (node.text.indexOf('styles') != -1) {
            resp = 'internal_styles.omit';
          } else if (node.text.indexOf('config') != -1) {
            resp = 'config.omit';
          } else if (node.text.indexOf('models') != -1) {
            //@todo rename into 'models'
            resp = 'models.omit';
          } else if (['servidor', 'server', 'api'].includes(node.text)) {
            resp = 'server.omit';
          }
        } else if (node.text.indexOf('component:') != -1) {
          resp = node.text.split(':')[node.text.split(':').length - 1] + '.js';
          // ensure to capitalize first letter
          resp = resp[0].toUpperCase() + resp.slice(1);
        } else if (node.text.indexOf('layout:') != -1) {
          resp = node.text.split(':')[node.text.split(':').length - 1] + '.js';
        } else if (node.icons.includes('list')) {
          resp = resp.replaceAll('.js', '.group');
        } else {
          //page node (ensure to capitalize first letter)
          resp = resp[0].toUpperCase() + resp.slice(1);
        }
        return resp;
      })();
    }

    //Called for naming the class/page by testing node.
    onDefineNodeName(node) {
      return _asyncToGenerator(function* () {
        return node.text.replace(' ', '_');
      })();
    }

    //Defines template for code given the processedNode of process() - for each level2 node
    onCompleteCodeTemplate(processedNode) {
      return _asyncToGenerator(function* () {
        return processedNode;
      })();
    }

    //Defines preparation steps before processing nodes.
    onPrepare() {
      var _this6 = this;
      return _asyncToGenerator(function* () {
        if (Object.keys(_this6.x_commands).length > 0) _this6.x_console.outT({
          message: "".concat(Object.keys(_this6.x_commands).length, " x_commands loaded!"),
          color: "green"
        });
        _this6.deploy_module = {
          pre: () => {},
          post: () => {},
          deploy: () => true
        };
        var deploy = _this6.x_state.central_config.deploy;
        if (deploy) {
          //@todo need to modify this deployment modules for using dist folder
          deploy += '';
          if (deploy.includes('eb:')) {
            _this6.deploy_module = new eb({
              context: _this6
            });
          } else if (deploy.includes('s3:')) {
            _this6.deploy_module = new s3({
              context: _this6
            });
          } else if (deploy == 'local') {
            _this6.deploy_module = new local({
              context: _this6
            });
            //
          } else if (deploy == 'remote') {
            _this6.deploy_module = new remote({
              context: _this6
            });
          } else if (deploy == 'ghpages') {
            _this6.deploy_module = new ghpages({
              context: _this6
            });
          } else ;
        }
        yield _this6.deploy_module.pre();
      })();
    }

    //Executed when compiler founds an error processing nodes.
    onErrors(errors) {
      var _this7 = this;
      return _asyncToGenerator(function* () {
        _this7.errors_found = true;
      })();
    }

    //configNode helper
    generalConfigSetup() {
      var _this8 = this;
      return _asyncToGenerator(function* () {
        //this.x_state.dirs.base
        _this8.debug('Setting general configuration steps');
        //this.debug('Defining module federation next.config.js : initializing');
        // default modules
        /*
        this.debug('Defining next.config.js : default modules');
        this.x_state.nuxt_config.modules['@nuxtjs/axios'] = {};
        //google analytics
        if (this.x_state.config_node['google:analytics']) {
            this.debug('Defining nuxt.config.js : Google Analytics');
            this.x_state.nuxt_config.build_modules['@nuxtjs/google-gtag'] = {
                'id': this.x_state.config_node['google:analytics'].id,
                'debug': true,
                'disableAutoPageTrack': true
            };
            if (this.x_state.config_node['google:analytics'].local) this.x_state.nuxt_config.build_modules['@nuxtjs/google-gtag'].debug = this.x_state.config_node['google:analytics'].local;
            if (this.x_state.config_node['google:analytics'].auto && this.x_state.config_node['google:analytics'].auto == true) {
                delete this.x_state.nuxt_config.build_modules['@nuxtjs/google-gtag']['disableAutoPageTrack'];
            }
        }*/
        //langs support i18n
        //@todo refactor nuxt_config modules key into modules_config (for setting within index.js)
        if (_this8.x_state.central_config['langs'].indexOf(',') != -1) {
          _this8.debug('Defining react-i18n support : module react-i18next (langs)');
          _this8.x_state.npm['i18next'] = '*';
          _this8.x_state.nuxt_config.modules['i18next'] = {
            'defaultLocale': _this8.x_state.central_config['langs'].split(',')[0],
            'vueI18n': {
              'fallbackLocale': _this8.x_state.central_config['langs'].split(',')[0]
            },
            'detectBrowserLanguage': {
              'useCookie': true,
              'alwaysRedirect': true
            },
            locales: [],
            lazy: true,
            langDir: 'lang/'
          };
          var self = _this8;
          _this8.x_state.central_config['langs'].split(',').map(function (lang) {
            if (lang == 'es') {
              self.x_state.nuxt_config.modules['i18next'].locales.push({
                code: 'es',
                iso: 'es-ES',
                file: "".concat(lang, ".js")
              });
            } else if (lang == 'en') {
              self.x_state.nuxt_config.modules['i18next'].locales.push({
                code: 'en',
                iso: 'en-US',
                file: "".concat(lang, ".js")
              });
            } else {
              self.x_state.nuxt_config.modules['i18next'].locales.push({
                code: lang,
                file: "".concat(lang, ".js")
              });
            }
          }.bind(self));
        }
        //local storage
        /*
        if (this.x_state.stores_types['local'] && Object.keys(this.x_state.stores_types['local']) != '') {
            this.debug('Defining nuxt.config.js : module nuxt-vuex-localstorage (store:local)');
            this.x_state.nuxt_config.modules['nuxt-vuex-localstorage'] = {
                mode: 'debug',
                'localStorage': Object.keys(this.x_state.stores_types['local'])
            };
        }*/
        //session storage
        /*
        if (this.x_state.stores_types['session'] && Object.keys(this.x_state.stores_types['session']) != '') {
            this.debug('Defining nuxt.config.js : module nuxt-vuex-localstorage (store:session)');
            let prev = {};
            // if vuex-localstorage was defined before, recover keys and just replace with news, without deleting previous
            if (this.x_state.nuxt_config.modules['nuxt-vuex-localstorage']) prev = this.x_state.nuxt_config.modules['nuxt-vuex-localstorage'];
            this.x_state.nuxt_config.modules['nuxt-vuex-localstorage'] = {...prev,
                ... {
                    mode: 'debug',
                    'sessionStorage': Object.keys(this.x_state.stores_types['session'])
                }
            };
        }*/
        //end
      })();
    }

    //'serializeComplexAttr' encrypts value to be treated as a complex script within a tag attribute
    // method 'decryptSpecialProps' deserializes them
    serializeComplexAttr(value) {
      var encrypt = require('encrypt-with-password');
      return encrypt.encryptJSON(value, '123');
    }
    //.gitignore helper
    createGitIgnore() {
      var _this9 = this;
      return _asyncToGenerator(function* () {
        _this9.debug('writing .gitignore files');
        var fs = require('fs').promises;
          require('path');
        _this9.x_console.out({
          message: 'writing /.gitignore file'
        });
        var git = "# Mac System files\n.DS_Store\n.DS_Store?\n_MACOSX/\nThumbs.db\n# NPM files\npackage.json\npackage-lock.json\nnode_modules/\n# AWS EB files\npolicy.json\n.ebextensions/\n.elasticbeanstalk/*\n!.elasticbeanstalk/*.cfg.yml\n!.elasticbeanstalk/*.global.yml\n# REACT files\n# Logs\nlogs\n*.log\nnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\nlerna-debug.log*\n\n# Diagnostic reports (https://nodejs.org/api/report.html)\nreport.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json\n\n# Runtime data\npids\n*.pid\n*.seed\n*.pid.lock\n\n# Directory for instrumented libs generated by jscoverage/JSCover\nlib-cov\n\n# Coverage directory used by tools like istanbul\ncoverage\n*.lcov\n\n# nyc test coverage\n.nyc_output\n\n# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)\n.grunt\n\n# Bower dependency directory (https://bower.io/)\nbower_components\n\n# node-waf configuration\n.lock-wscript\n\n# Compiled binary addons (https://nodejs.org/api/addons.html)\nbuild/Release\n\n# Dependency directories\nnode_modules/\njspm_packages/\n\n# Snowpack dependency directory (https://snowpack.dev/)\nweb_modules/\n\n# TypeScript cache\n*.tsbuildinfo\n\n# Optional npm cache directory\n.npm\n\n# Optional eslint cache\n.eslintcache\n\n# Microbundle cache\n.rpt2_cache/\n.rts2_cache_cjs/\n.rts2_cache_es/\n.rts2_cache_umd/\n\n# Optional REPL history\n.node_repl_history\n\n# Output of 'npm pack'\n*.tgz\n\n# Yarn Integrity file\n.yarn-integrity\n\n# dotenv environment variables file\n.env\n.env.test\n\n# parcel-bundler cache (https://parceljs.org/)\n.cache\n.parcel-cache\n\n# Next.js build output\n.next\nout\n\n# Nuxt.js build / generate output\n.nuxt\ndist\n\n# Gatsby files\n.cache/\n# Comment in the public line in if your project uses Gatsby and not Next.js\n# https://nextjs.org/blog/next-9-1#public-directory-support\n# public\n\n# vuepress build output\n.vuepress/dist\n\n# Serverless directories\n.serverless/\n\n# FuseBox cache\n.fusebox/\n\n# DynamoDB Local files\n.dynamodb/\n\n# TernJS port file\n.tern-port\n\n# Stores VSCode versions used for testing VSCode extensions\n.vscode-test\n\n# yarn v2\n.yarn/cache\n.yarn/unplugged\n.yarn/build-state.yml\n.yarn/install-state.gz\n.pnp.*\n\n# Concepto files\n.concepto/\naws_backup.ini\nreact.dsl\nreact_diff.dsl\n.secrets-pass\nstore/\n".concat(_this9.x_state.dirs.compile_folder, "/");
        yield fs.writeFile("".concat(_this9.x_state.dirs.base, ".gitignore"), git, 'utf-8'); //.gitignore
      })();
    }

    //process .omit file 
    processOmitFile(thefile) {
      var _this10 = this;
      return _asyncToGenerator(function* () {
        //@TODO refactor this 23-nov-22
        //@TODO 13-mar-21 check if .toArray() is needed here (ref processInternalTags method)
        //internal_stores.omit
        var self = _this10;
        if (thefile.file == 'internal_stores.omit') {
          _this10.debug('processing internal_stores.omit');
          var cheerio = require('cheerio');
          var $ = cheerio.load(thefile.code, {
            ignoreWhitespace: false,
            xmlMode: true,
            decodeEntities: false
          });
          var nodes = $("store_mutation").toArray();
          nodes.map(function (elem) {
            var cur = $(elem);
            var store = cur.attr('store') ? cur.attr('store') : '';
            var mutation = cur.attr('mutation') ? cur.attr('mutation') : '';
            var params = cur.attr('params') ? cur.attr('params') : '';
            var code = cur.text();
            if (self.x_state.stores[store] && !(':mutations' in self.x_state.stores[store])) {
              self.x_state.stores[store][':mutations'] = {};
            }
            self.x_state.stores[store][':mutations'][mutation] = {
              code,
              params
            };
          });
        }
        //internal_middleware.omit
        if (thefile.file == 'internal_middleware.omit') {
          _this10.debug('processing internal_middleware.omit');
          var _cheerio = require('cheerio');
          var _$ = _cheerio.load(thefile.code, {
            ignoreWhitespace: false,
            xmlMode: true,
            decodeEntities: false
          });
          var _nodes = _$("proxy_code").toArray();
          _nodes.map(function (elem) {
            var cur = _$(elem);
            var name = cur.attr('name') ? cur.attr('name') : '';
            self.x_state.proxies[name].code = cur.text().trim();
          });
        }
        //server.omit
        if (thefile.file == 'server.omit') {
          _this10.debug('processing server.omit');
          var _cheerio2 = require('cheerio');
          var _$2 = _cheerio2.load(thefile.code, {
            ignoreWhitespace: false,
            xmlMode: true,
            decodeEntities: false
          });
          var _nodes2 = _$2("func_code").toArray();
          _nodes2.map(function (elem) {
            var cur = _$2(elem);
            var name = cur.attr('name') ? cur.attr('name') : '';
            self.x_state.functions[name].code = cur.text().trim();
          });
        }
      })();
    }
    getComponentStory(thefile) {
      var _this11 = this;
      return _asyncToGenerator(function* () {
        // {component}.stories.js file
        // @TODO 23-nov-22 refactor this
        var js = {
          script: '',
          style: '',
          first: false
        };
        var page = _this11.x_state.pages[thefile.title];
        var camel = require('camelcase');
        if (page) {
          if (page.type == 'component' && page.params != '') {
            var argType = {},
              title = thefile.title.split(':')[1].trim(),
              evts = '';
            //prepare events
            var events = page.stories['_default'].events;
            for (var evt in events) {
              var on_name = camel("on_".concat(evt.replaceAll(':', '_')));
              evts += " v-on:".concat(evt, "=\"").concat(on_name, "\"");
              argType[on_name] = {
                action: 'clicked'
              };
            }
            //prepare component attributes (props)
            var isNumeric = function isNumeric(n) {
              return !isNaN(parseFloat(n)) && isFinite(n);
            };
            //let props = []; // story attr control type
            var default_args = [];
            if (Object.keys(page.defaults) != '') {
              page.params.split(',').map(function (key) {
                var def_val = '';
                if (page.defaults[key]) def_val = page.defaults[key];
                if (def_val == 'true' || def_val == 'false') {
                  default_args.push("".concat(key, ": ").concat(def_val));
                  //props.push(`${key}: { type: Boolean, default: ${def_val}}`);
                } else if (isNumeric(def_val)) {
                  //if def_val is number or string with number
                  default_args.push("".concat(key, ": ").concat(def_val));
                  //props.push(`${key}: { type: Number, default: ${def_val}}`);
                } else if (def_val.indexOf('[') != -1 && def_val.indexOf(']') != -1) {
                  default_args.push("".concat(key, ": ").concat(def_val));
                  //props.push(`${key}: { type: Array, default: () => ${def_val}}`);
                } else if (def_val.indexOf('{') != -1 && def_val.indexOf('}') != -1) {
                  default_args.push("".concat(key, ": ").concat(def_val));
                  //props.push(`${key}: { type: Object, default: () => ${def_val}}`);
                } else if (def_val.indexOf("()") != -1) {
                  //ex. new Date()
                  default_args.push("".concat(key, ": ").concat(def_val));
                  //props.push(`${key}: { type: Object, default: () => ${def_val}}`);
                } else if (def_val.toLowerCase().indexOf("null") != -1) {
                  default_args.push("".concat(key, ": null"));
                  //props.push(`${key}: { default: null }`);
                } else if (def_val.indexOf("'") != -1) {
                  default_args.push("".concat(key, ": ").concat(def_val));
                  //props.push(`${key}: { type: String, default: ${def_val}}`);
                } else {
                  default_args.push("".concat(key, ": '").concat(def_val, "'"));
                  //props.push(`${key}: { default: '${def_val}' }`);
                }
              });
            }
            //write story code
            var compName = camel(title, {
              pascalCase: true
            });
            js.script += "import ".concat(compName, " from '../client/components/").concat(title, "/").concat(thefile.file.replace('.vue', '-story.vue'), "';\n\n");
            js.script += "export default {\n                    title: '".concat(camel(_this11.x_state.central_config.apptitle, {
              pascalCase: true
            }), "/").concat(title, "',\n                    component: ").concat(compName, ",\n                    argTypes: ").concat(JSON.stringify(argType), "\n                };\n\n");
            js.script += "const Template = (args, { argTypes }) => ({\n                    props: Object.keys(argTypes),\n                    components: { ".concat(compName, " },\n                    template: '<").concat(compName, " v-bind=\"$props\"").concat(evts, "/>'\n                });\n");
            //default story
            js.script += "export const Default = Template.bind({});\n";
            js.script += "Default.args = {\n";
            js.script += "".concat(default_args.join(','), "\n};\n");
            //additional defined stories
            //@todo
          }
        }

        return js;
      })();
    }
    getBasicReact(thefile) {
      var _this12 = this;
      return _asyncToGenerator(function* () {
        // write .JSX file
        // @todo 23-nov-22 refactor this into JSX needs
        var react = {
          template: thefile.code,
          script: '',
          style: '',
          first: false,
          variables: ''
        };
        var page = _this12.x_state.pages[thefile.title];
        if (page) {
          // declare middlewares (proxies)
          if (page.proxies.indexOf(',') != -1) {
            _this12.debug('- declare middlewares');
            react.script += "middleware: [".concat(page.proxies, "]");
            react.first = true;
          } else if (page.proxies.trim() != '') {
            _this12.debug('- declare middlewares');
            react.script += "middleware: '".concat(page.proxies, "'");
            react.first = true;
          }
          // layout attr
          if (page.layout != '') {
            _this12.debug('- declare layout');
            if (react.first) react.script += ',\n';
            react.first = true;
            react.script += "layout: '".concat(page.layout.trim(), "'");
          }
          // declare components
          if (page.components != '') {
            _this12.debug('- declare components');
            if (react.first) react.script += ',\n';
            react.first = true;
            react.script += "components: {";
            var comps = [];
            Object.keys(page.components).map(function (key) {
              comps.push(" '".concat(key, "': ").concat(page.components[key]));
            }); //.bind(page,comps));
            react.script += "".concat(comps.join(','), "\n\t}");
          }
          // declare directives
          if (page.directives != '') {
            _this12.debug('- declare directives');
            if (react.first) react.script += ',\n';
            react.first = true;
            react.script += "directives: {";
            var directs = [];
            Object.keys(page.directives).map(function (key) {
              if (key == page.directives[key]) {
                directs.push(key);
              } else {
                directs.push("'".concat(key, "': ").concat(page.directives[key]));
              }
            }); //.bind(page,directs));
            react.script += "".concat(directs.join(','), "\n\t}");
          }
          // declare props (if page type component)
          if (page.type == 'component' && page.params != '') {
            _this12.debug('- declare component:props');
            if (react.first) react.script += ',\n';
            react.first = true;
            var isNumeric = function isNumeric(n) {
              return !isNaN(parseFloat(n)) && isFinite(n);
            };
            var props = [];
            if (Object.keys(page.defaults) != '') {
              page.params.split(',').map(function (key) {
                var def_val = '';
                if (page.defaults[key]) def_val = page.defaults[key];
                if (def_val == 'true' || def_val == 'false') {
                  props.push("".concat(key, ": { type: Boolean, default: ").concat(def_val, "}"));
                } else if (isNumeric(def_val)) {
                  //if def_val is number or string with number
                  props.push("".concat(key, ": { type: Number, default: ").concat(def_val, "}"));
                } else if (def_val.indexOf('[') != -1 && def_val.indexOf(']') != -1) {
                  props.push("".concat(key, ": { type: Array, default: () => ").concat(def_val, "}"));
                } else if (def_val.indexOf('{') != -1 && def_val.indexOf('}') != -1) {
                  props.push("".concat(key, ": { type: Object, default: () => ").concat(def_val, "}"));
                } else if (def_val.indexOf("()") != -1) {
                  //ex. new Date()
                  props.push("".concat(key, ": { type: Object, default: () => ").concat(def_val, "}"));
                } else if (def_val.toLowerCase().indexOf("null") != -1) {
                  props.push("".concat(key, ": { default: null }"));
                } else if (def_val.indexOf("'") != -1) {
                  props.push("".concat(key, ": { type: String, default: ").concat(def_val, "}"));
                } else {
                  props.push("".concat(key, ": { default: '").concat(def_val, "' }"));
                }
              });
              react.script += "\tprops: {".concat(props.join(','), "}");
            } else {
              page.params.split(',').map(function (key) {
                props.push("'".concat(key, "'"));
              });
              react.script += "\tprops: [".concat(props.join(','), "]");
            }
          }
          // declare meta data
          if (page.xtitle || page.meta.length > 0 || page.link.length > 0) {
            _this12.debug('- declare head() meta data');
            if (react.first) react.script += ',\n';
            react.first = true;
            react.script += " head() {\n return {\n";
            // define title
            if (page.xtitle) {
              if (_this12.x_state.central_config.langs.indexOf(',') != -1) {
                // i18n title
                var crc32 = "t_".concat(yield _this12.hash(page.xtitle));
                var def_lang = _this12.x_state.central_config.langs.indexOf(',')[0].trim().toLowerCase();
                if (!_this12.x_state.strings_i18n[def_lang]) {
                  _this12.x_state.strings_i18n[def_lang] = {};
                }
                _this12.x_state.strings_i18n[def_lang][crc32] = page.xtitle;
                react.script += "titleTemplate: this.$t('".concat(crc32, "')\n");
              } else {
                // normal title
                react.script += "titleTemplate: ".concat(_this12.jsDump(page.xtitle), "\n");
              }
            }
            // define meta SEO
            if (page.meta.length > 0) {
              if (page.xtitle) react.script += ",";
              //vue.script += `meta: ${JSON.stringify(page.meta)}\n`;
              react.script += "meta: ".concat(_this12.jsDump(page.meta), "\n");
            }
            // define head LINK
            if (page.link.length > 0) {
              if (page.xtitle || page.meta.length > 0) react.script += ",";
              react.script += "link: ".concat(JSON.stringify(page.link), "\n");
            }
            react.script += "};\n}";
          }
          // declare variables (data)
          if (Object.keys(page.variables) != '') {
            _this12.debug('- declare data() variables');
            var camel = require('camelcase');
            if (react.first) react.script += ',\n';
            react.first = true;
            console.log(page.variables);
            for (var key in page.variables) {
              var def_val = page.variables[key] ? _this12.jsDump(page.variables[key]) : "''";
              if (page.var_types[key] && def_val == "''") {
                var type = page.var_types[key];
                if (type == 'string') {
                  def_val = "''";
                } else if (type == 'number') {
                  def_val = '0';
                } else if (type == 'boolean') {
                  def_val = 'false';
                } else if (type == 'object') {
                  def_val = '{}';
                }
              }
              react.variables += "const [ ".concat(key, ", ").concat(camel('set_' + key), " ] = useState(").concat(def_val, ");\n");
            }
            //react.script += `data() {\n`;
            //react.script += ` return ${this.jsDump(page.variables)}\n`;
            //react.script += `}\n`;
            _this12.debug('- declare data() variables dump', react.variables);
            //react.variables = this.jsDump(page.variables);
          }
        }

        return react;
      })();
    }
    processInternalTags(react, page) {
      var _this13 = this;
      return _asyncToGenerator(function* () {
        var cheerio = require('cheerio');
        //console.log('PABLO beforeInteralTags:',{ template:react.template, script:react.script });
        var $ = cheerio.load(react.template, {
          ignoreWhitespace: false,
          xmlMode: true,
          decodeEntities: false
        });
        var self = _this13;
        var removeSpecialRefx = content => {
          //removes attrs refx from given content without using cheerio
          var extract = require('extractjs')();
          var new_ = content;
          var elements = extract("refx=\"{id}\"", content);
          if (elements.id) {
            new_ = new_.replace("refx=\"".concat(elements.id, "\""), '');
            if (new_.indexOf('refx=') != -1) {
              new_ = removeSpecialRefx(new_);
            }
          }
          return new_;
        };
        //
        // PROCESS DEF_PARAM VIRTUAL TAGS
        //
        var nodes = $("def_param").toArray();
        if (nodes.length > 0) _this13.debug('post-processing def_param tags');
        //nodes.map(function(elem) {
        for (var i = 0; i < nodes.length; i++) {
          var elem = nodes[i];
          var value = {};
          var special_x = {};
          var cur = $(elem);
          var attribs = cur.attr();
          //this.debug('def_param attribs BEFORE',attribs);
          // search partial attributes attr_?
          for (var key in attribs) {
            if (key.indexOf('x_attr') > -1) {
              special_x[key.replace('x_attr_', '')] = cur.attr(key);
            } else if (key.indexOf('attr_') > -1 && key.indexOf('-') > -1) {
              value[key.replace('attr_', '').replaceAll('-', '&:')] = cur.attr(key);
            } else if (key.indexOf('attr_') > -1 && key.indexOf('$') > -1) {
              value[key.replace('attr_', '').replaceAll('$', ',')] = cur.attr(key);
            } else if (key.indexOf('attr_') > -1) {
              value[key.replace('attr_', '')] = cur.attr(key);
            }
          }
          //this.debug('def_param value',value);
          // do {node.value} mapping to key values
          var extract = require('extractjs')({
            startExtract: '-',
            endExtract: '-'
          });
          for (var _key2 in value) {
            //@todo replace with extractJS npm module
            var special = extract("{node.-key-}", value[_key2]);
            if (special.key && special.key in special_x) {
              value[_key2] = special_x[special.key];
            } else if (special.key) {
              //assigned as empty if special key value doesn't exist but value has a special key defined 
              value[_key2] = '';
            }
          }
          // if value obj has single special key (and no attribs), re-asign as direct value
          if (!value.is_object) {
            if (Object.keys(special_x).length == 1 && Object.keys(value).length == 0) {
              value = special_x[Object.keys(special_x)[0]];
            }
          }
          // delete meta keys from value
          delete value['is_object'];
          delete value['is_function'];
          delete value['is_view'];
          // get target node
          var target_node = $("*[refx=".concat(cur.attr('target_id'), "]")).toArray();
          /*if (target_node.length == 0) {
              //if target node is not found, try to find its parent (maybe it was a text or virtual tag)
              this.debug('DADDY NOT FOUND');
              target_node = $(`*[refx=${cur.attr('targetparent_id')}]`).toArray();
              this.debug('GRAND DADDY?',target_node.length);
              //let target_ = $(target_node[0]);
          }*/
          if (target_node.length > 0) {
            //build value for attr
            var target_ = $(target_node[0]);
            var val = '';
            var inner = cur.html();
            if (cur.attr('is_function') && cur.attr('is_function') == "true") {
              //wrap contents in a function within the value of the parent attribute
              //prepend event stop propagation if not :stop
              var function_params = [];
              var function_inner = '';
              if (value[':stop'] && value[':stop'] == "false") {
                function_inner += cur.html();
              } else {
                function_inner = "event.stopPropagation(); " + cur.html();
              }
              if (function_inner.indexOf('event.') != -1) {
                function_params.push('event');
              }
              if (function_inner.indexOf('params.') != -1) {
                function_params.push('params');
              }
              val = self.serializeComplexAttr("(".concat(function_params.join(','), ")=>{ ").concat(function_inner, " }"));
            } else if (cur.attr('is_view') && cur.attr('is_view') == "true") {
              //before processing, check if within us we need to call ourselfs 
              //this.debug('def_param inner',inner);
              //to process other internal tags
              if (inner.indexOf('def_param') != -1) {
                //console.log('calling self.processInternalTags()');
                //inner = this.decryptSpecialProps(inner);
                inner = (yield self.processInternalTags({
                  template: inner
                }, page)).template;
                //console.log('after self.processInternalTags()',inner);
              }

              inner = removeSpecialRefx(inner);
              val = self.serializeComplexAttr(inner);
            } else {
              //assign 'value' to parent 'name' attr
              //this.debug('val before processing attr',{ value, serialized:self.jsDump(value) });
              val = self.serializeComplexAttr(self.jsDump(value));
            }
            //encrypt value for attr
            target_.attr(cur.attr('param_name') + '_encrypt', val);
          }
          cur.remove(); // remove ourselfs
        }
        react.template = $.html();
        //
        // PROCESS other * VIRTUAL TAGS
        //
        /* 
        if (nodes.length > 0) vue.script += `}\n`;
        // process ?mounted event
        nodes = $(`vue\_mounted`).toArray();
        if (nodes.length > 0) this.debug('post-processing vue_mounted tag');
        if (nodes.length > 0 && vue.first) vue.script += ',\n';
        vue.first = true;
        let uses_await = false, mounted_content = '';
        nodes.map(function(elem) {
            let cur = $(elem);
            //console.log('valor vue_mounted',elem.children[0].data);
            if (elem.children[0].data.includes('await ')) {
                uses_await = true;
            }
            mounted_content += elem.children[0].data; //cur.text();
            //vue.script += elem.children[0].data; //cur.text();
            cur.remove();
        });
        if (nodes.length > 0) {
            if (uses_await) {
                vue.script += `async mounted() {\n`;
                vue.script += `this.$nextTick(async function() {\n`;
             } else {
                vue.script += `mounted() {\n`;
            }
            vue.script += mounted_content;
        }
        vue.template = $.html();
        if (nodes.length > 0) {
            if (uses_await) {
                vue.script += `});\n}\n`;
            } else {
                vue.script += `}\n`;
            }
        }
        // process ?created event
        nodes = $(`vue\_created`).toArray();
        if (nodes.length > 0) this.debug('post-processing vue_created tag');
        if (nodes.length > 0 && vue.first) vue.script += ',\n';
        vue.first = true;
        uses_await = false, mounted_content = '';
        nodes.map(function(elem) {
            let cur = $(elem);
            //console.log('valor vue_mounted',elem.children[0].data);
            if (elem.children[0].data.includes('await ')) {
                uses_await = true;
            }
            mounted_content += elem.children[0].data; //cur.text();
            //vue.script += elem.children[0].data; //cur.text();
            cur.remove();
        });
        if (nodes.length > 0) {
            if (uses_await) {
                vue.script += `async created() {\n`;
                vue.script += `this.$nextTick(async function() {\n`;
             } else {
                vue.script += `created() {\n`;
            }
            vue.script += mounted_content;
        }
        vue.template = $.html();
        if (nodes.length > 0) {
            if (uses_await) {
                vue.script += `});\n}\n`;
            } else {
                vue.script += `}\n`;
            }
        }
        // process ?var (vue_computed)
        nodes = $('vue\_computed').toArray();
        //this.debug('nodes',nodes);
        if (nodes.length > 0) this.debug('post-processing vue_computed tag');
        if (nodes.length > 0 && vue.first) vue.script += ',\n';
        vue.first = true;
        if (nodes.length > 0) vue.script += `computed: {\n`;
        let computed = [];
        nodes.map(function(elem) {
            let cur = $(elem);
            let name = cur.attr('name');
            let code = elem.children[0].data; //cur.html();
            //console.log('PABLO debug code computed:',code);
            if (computed.includes(`${name}() {${code}}`)==false) {
                computed.push(`${name}() {${code}}`);
            }
            cur.remove();
            //return elem;
        });
        vue.template = $.html();
        vue.script += computed.join(',');
        if (nodes.length > 0) vue.script += `}\n`;
        // process ?var (asyncComputed)
        nodes = $('vue_async_computed').toArray();
        if (nodes.length > 0) this.debug('post-processing vue_async_computed tag');
        if (nodes.length > 0 && vue.first) vue.script += ',\n';
        vue.first = true;
        if (nodes.length > 0) vue.script += `asyncComputed: {\n`;
        let async_computed = [];
        nodes.map(function(elem) {
            let cur = $(elem);
            let code = elem.children[0].data; //cur.text();
            if (cur.attr('valor') || cur.attr('watch')) {
                let lazy = '';
                if (cur.attr('lazy')) lazy += `,lazy: ${cur.attr('lazy')}`;
                let valor = '';
                if (cur.attr('valor')) {
                    valor += `,`;
                    let test = cur.attr('valor');
                    if ((test.indexOf('[') != -1 && test.indexOf(']') != -1) ||
                        (test.indexOf('{') != -1 && test.indexOf('}') != -1) ||
                        (test.indexOf('(') != -1 && test.indexOf(')') != -1)
                    ) {
                        valor += `default: ${test}`;
                    } else {
                        valor += `default: '${test}'`;
                    }
                }
                let watch = '';
                if (cur.attr('watch')) {
                    watch += ',';
                    let test = cur.attr('watch');
                    let test_n = [];
                    test.split(',').map(function(x) {
                        let tmp = x.replaceAll('$variables.', '')
                            .replaceAll('$vars.', '')
                            .replaceAll('$params.', '')
                            .replaceAll('$store.', '$store.state.');
                        test_n.push(`'${tmp}'`);
                    });
                    watch += `watch: [${test_n.join(',')}]`;
                }
                async_computed.push(`
        ${cur.attr('name')}: {
        async get() {
        ${code}
        }
        ${lazy}
        ${valor}
        ${watch}
        }`);
            } else {
                async_computed.push(`async ${cur.attr('name')}() {${code}}`);
            }
            cur.remove();
        });
        vue.template = $.html();
        vue.script += async_computed.join(',');
        if (nodes.length > 0) vue.script += `}\n`;
        // process var ?change -> vue_watched_var
        nodes = $('vue_watched_var').toArray();
        if (nodes.length > 0) this.debug('post-processing vue_async_computed tag');
        if (nodes.length > 0 && vue.first) vue.script += ',\n';
        vue.first = true;
        if (nodes.length > 0) vue.script += `watch: {\n`;
        let watched = [];
        nodes.map(function(elem) {
            let cur = $(elem);
            let code = elem.children[0].data; //cur.text();
            if (cur.attr('deep')) {
                watched.push(`
        '${cur.attr('flat')}': {
        async handler(newVal, oldVal) {
        let evento = { ${cur.attr('newvar')}:newVal, ${cur.attr('oldvar')}:oldVal };
        ${code}
        },
        deep: true
        }
        `);
            } else {
                watched.push(`
        '${cur.attr('flat')}': async function (newVal, oldVal) {
        let evento = { ${cur.attr('newvar')}:newVal, ${cur.attr('oldvar')}:oldVal };
        ${code}
        }
        `);
            }
            cur.remove();
        });
        vue.template = $.html();
        vue.script += watched.join(',');
        if (nodes.length > 0) vue.script += `}\n`;
        // process vue_if tags
        // repeat upto 5 times (@todo transform this into a self calling method)
        for (let x of [1,2,3,4,5]) {
            nodes = $('vue_if').toArray();
            if (nodes.length > 0) {
                this.debug(`post-processing vue_if tag ${x} (len:${nodes.length})`);
                nodes.map(function(elem) {
                    let cur = $(elem);
                    let if_type = cur.attr('tipo');
                    let if_test = cur.attr('expresion');
                    if (cur.attr('target') != 'template') {
                        //search refx ID tag
                        let target = $(`*[refx="${cur.attr('target')}"]`).toArray();
                        if (target.length > 0) {
                            let target_node = $(target[0]);
                            if (if_type == 'v-else') {
                                target_node.attr(if_type, 'xpropx');
                            } else {
                                target_node.attr(if_type, if_test);
                            }
                            //erase if tag
                            cur.replaceWith(cur.html());
                        }
                    }
                });
            } else {
                break;
            }
            await this.setImmediatePromise(); //@improved
        }
        //
        vue.template = $.html();
        // process vue_for tags
        // repeat upto 5 times (@todo transform this into a self calling method)
        for (let x of [1,2,3,4,5]) {
            nodes = $('vue_for').toArray();
            if (nodes.length > 0) {
                this.debug(`post-processing vue_for tag ${x} (len:${nodes.length})`);
                let self = this;
                nodes.map(function(elem) {
                    let cur = $(elem);
                    let iterator = cur.attr('iterator')
                        .replaceAll('$variables.', '')
                        .replaceAll('$vars.', '')
                        .replaceAll('$params.', '')
                        .replaceAll('$store.', '$store.state.');
                    if (cur.attr('use_index') && cur.attr('use_index') == 'false' && cur.attr('key') != 0) {
                        iterator = `(${cur.attr('item')}, ${cur.attr('key')}) in ${iterator}`;
                    } else if (cur.attr('use_index') && cur.attr('use_index') == 'false' && cur.attr('key') == 0) {
                        iterator = `${cur.attr('item')} in ${iterator}`;
                    } else if (cur.attr('key') && cur.attr('key') != 0 && cur.attr('use_index') != 'false') {
                        iterator = `(${cur.attr('item')}, ${cur.attr('key')}, ${cur.attr('use_index')}) in ${iterator}`;
                    } else {
                        iterator = `(${cur.attr('item')}, ${cur.attr('use_index')}) in ${iterator}`;
                    }
                    if (cur.attr('target') != 'template') {
                        //search refx ID tag
                        let target = $(`*[refx="${cur.attr('target')}"]`).toArray();
                        if (target.length > 0) {
                            let target_node = $(target[0]);
                            target_node.attr('v-for', iterator);
                            if (cur.attr('unique')!=0) target_node.attr(':key', cur.attr('unique'));
                            cur.replaceWith(cur.html());
                        }
                        //cur.replaceWith(cur.html()); // remove also if target node is not found
                    } else {
                        // transform <v_for>x</v_for> -> <template v-for='iterator'>x</template>
                        // lookAt x=v_for_selector.html() and selector.replaceWith('<template v-for>'+x+'</template>')
                        cur.replaceWith(`<template v-for="${iterator}">${cur.html()}</template>`);
                    }
                });
            } else {
                break;
            }
            await this.setImmediatePromise(); //@improved
        }
        //
        vue.template = $.html();
        // process vue_event tags
        let common_methods = $('vue_event_method').toArray();
        let on_events = $('vue_event_element').toArray();
        if (common_methods.length > 0 || on_events.length > 0) {
            this.debug('post-processing methods (common, timer, and v-on element events methods)');
            if (vue.first) vue.script += ',\n';
            vue.first = true;
            let methods = [],
                self = this;
            // event_methods
            common_methods.map(function(elem) {
                let cur = $(elem);
                let code = elem.children[0].data; //cur.text();
                let tmp = '';
                if (cur.attr('timer_time')) {
                    self.x_state.npm['vue-interval'] = '*';
                    page.mixins['vueinterval'] = 'vue-interval/dist/VueInterval.common';
                    let timer_prefix = '';
                    if (cur.attr('timer_time') && cur.attr('timer_time') != '') {
                        //always in ms; tranform into 1e2 notation
                        let ceros = cur.attr('timer_time').length - 1;
                        let first = cur.attr('timer_time')[0];
                        timer_prefix = `INTERVAL__${first}e${ceros}$`;
                    }
                    if (cur.attr('m_params')) {
                        if (cur.attr('type') == 'async') {
                            tmp += `${timer_prefix}${cur.attr('name')}: async function(${cur.attr('m_params')}) {`;
                        } else {
                            tmp += `${timer_prefix}${cur.attr('name')}: function(${cur.attr('m_params')}) {`;
                        }
                    } else {
                        if (cur.attr('type') == 'async') {
                            tmp += `${timer_prefix}${cur.attr('name')}: async function() {`;
                        } else {
                            tmp += `${timer_prefix}${cur.attr('name')}: function() {`;
                        }
                    }
                } else {
                    if (cur.attr('m_params')) {
                        if (cur.attr('type') == 'async') {
                            tmp += `${cur.attr('name')}: async function(params) {`; //${cur.attr('m_params')}
                        } else {
                            tmp += `${cur.attr('name')}: function(params) {`; //${cur.attr('m_params')}
                        }
                    } else {
                        if (cur.attr('type') == 'async') {
                            tmp += `${cur.attr('name')}: async function() {`;
                        } else {
                            tmp += `${cur.attr('name')}: function() {`;
                        }
                    }
                }
                methods.push(`${tmp}\n${code}\n}`);
                cur.remove();
            });
            // events_methods
            on_events.map(function(elem) {
                let evt = $(elem);
                //search father node of event
                let origin = $($(`*[refx="${evt.attr('parent_id')}"]`).toArray()[0]);
                let event = evt.attr('event');
                // declare call in origin node
                if (evt.attr('link')) {
                    // event linked to another node; usually another existing method func
                    let link = evt.attr('link');
                    let method_name = link;
                    if (evt.attr('link_id')) {
                        let target = $(`vue_event_element[id="${evt.attr('link_id')}"]`).toArray();
                        if (target.length>0) {
                            let the_node = $(target[0]);
                            method_name = the_node.attr('friendly_name');
                        } else {
                            //console.log('target node ID (events) not found');
                            //@todo maybe its a method function and not an event
                        }
                        method_name = method_name.replaceAll(':', '_').replaceAll('.', '_').replaceAll('-', '_');
                    }
                    // plugin related events
                    if (event == 'click-outside') {
                        origin.attr('v-click-outside', method_name);
                    } else if (event == 'visibility') {
                        origin.attr('v-observe-visibility', method_name);
                    } else if (event == ':rules') {
                        origin.attr(':rules', `[${method_name}]`);
                    } else if (event == 'resize') {
                        origin.attr('v-resize', method_name);
                    } else {
                        // custom defined methods
                        if (evt.attr('v_params')) {
                            // v-on with params
                            origin.attr(`v-on:${event}`,`${method_name}(${evt.attr('v_params')})`);
                        } else {
                            // without params
                            if (evt.attr('link_id')) {
                                origin.attr(`v-on:${event}`, `${method_name}($event)`);
                            } else {
                                origin.attr(`v-on:${event}`, method_name);
                            }
                        }
                        //
                    }
                    // @TODO check if this is needed/used: was on original CFC code, but it seems it just overwrites previous things
                    //if (evt.attr('link_id')) { 	
                    //	origin.attr(`v-on:${event}`,`${link}_${evt.attr('link_id')}($event)`);
                    //}
                    //
                } else {
                    // create method function and script
                    let tmp = '';
                    let method_name = event;
                    if (evt.attr('friendly_name')!='') method_name = `${evt.attr('friendly_name')}`; //event_suffix
                    method_name = method_name.replaceAll(':', '_').replaceAll('.', '_').replaceAll('-', '_');
                    let method_code = elem.children[0].data; //evt.text();
                    if (event == 'click-outside') {
                        origin.attr(`v-click-outside`, method_name);
                        tmp = `${method_name}: async function() {
        ${method_code}
        }`;
                    } else if (event == 'visibility') {
                        origin.attr(`v-observe-visibility`, method_name);
                        tmp = `${method_name}: async function(estado, elemento) {
        ${method_code}
        }`;
                    } else if (event == ':rules') {
                        origin.attr(`:rules`, `[${method_name}]`);
                        tmp = `${method_name}: function() {
        ${method_code}
        }`;
                    } else if (event == 'resize') {
                        origin.attr(`v-resize`, method_name);
                        tmp = `${method_name}: async function() {
        ${method_code}
        }`;
                    } else {
                        if (evt.attr('v_params') && evt.attr('v_params') != '') {
                            origin.attr(`v-on:${event}`, `${method_name}(${evt.attr('v_params')})`);
                        } else {
                            origin.attr(`v-on:${event}`, `${method_name}($event)`);
                        }
                        if (evt.attr('n_params')) {
                            tmp = `${method_name}: async function(${evt.attr('n_params')}) {
        ${method_code}
        }`;
                        } else {
                            tmp = `${method_name}: async function(evento) {
        ${method_code}
        }`;
                        }
                    }
                    // push tmp to methods
                    methods.push(tmp);
                }
                // remove original event tag node
                // ** evt.remove();
            });
            //remove vue_event_element tags
            on_events.map(function(elem) {
                let evt = $(elem).remove();
            });
            // apply methods and changes
            vue.script += `methods: {
        ${methods.join(',')}
         }`;
            vue.template = $.html(); // apply changes to template
        }
        */
        return react;
      })();
    }
    processStyles(react, page) {
      var cheerio = require('cheerio');
      var $ = cheerio.load(react.template, {
        ignoreWhitespace: false,
        xmlMode: true,
        decodeEntities: false
      });
      var styles = $("page_styles").toArray();
      if (styles.length > 0) {
        this.debug('post-processing styles');
        var node = $(styles[0]);
        if (node.attr('scoped') && node.attr('scoped') == 'true') {
          react.style += "\n\t\t\t\t<style scoped>\n\t\t\t\t".concat(node.text(), "\n\t\t\t\t</style>");
        } else {
          react.style += "\n\t\t\t\t<style>\n\t\t\t\t".concat(node.text(), "\n\t\t\t\t</style>");
        }
        node.remove();
      }
      react.template = $.html();
      // add page styles (defined in js) to style tag code
      if (Object.keys(page.styles).length > 0) {
        var jss = require('jss').default;
        var global_plug = require('jss-plugin-global').default;
        jss.use(global_plug());
        var sheet = jss.createStyleSheet({
          '@global': page.styles
        });
        if (!react.style) react.style = '';
        react.style += "<style>\n".concat(sheet.toString(), "</style>");
        //this.debug('JSS sheet',sheet.toString());
      }

      return react;
    }
    processMixins(vue, page) {
      // call after processInternalTags
      if (page.mixins && Object.keys(page.mixins).length > 0) {
        this.debug('post-processing mixins');
        var close = '';
        if (vue.first) close += ',\n';
        vue.first = true;
        close += "mixins: [".concat(Object.keys(page.mixins).join(','), "]");
        var mixins = [];
        for (var key in page.mixins) {
          mixins.push("import ".concat(key, " from '").concat(page.mixins[key], "';"));
        }
        vue.script = vue.script.replaceAll('{concepto:mixins:import}', mixins.join(';'));
        vue.script = vue.script.replaceAll('{concepto:mixins:array}', close);
      } else {
        vue.script = vue.script.replaceAll('{concepto:mixins:import}', '').replaceAll('{concepto:mixins:array}', '');
      }
      return vue;
    }
    removeSpecialRefx(content) {
      //removes attrs refx from given content without using cheerio
      var extract = require('extractjs')();
      var new_ = content;
      var elements = extract("refx=\"{id}\"", content);
      if (elements.id) {
        new_ = new_.replace("refx=\"".concat(elements.id, "\""), '');
        if (new_.indexOf('refx=') != -1) {
          new_ = this.removeSpecialRefx(new_);
        }
      }
      return new_;
    }
    removeRefx(react) {
      var cheerio = require('cheerio');
      var $ = cheerio.load(react.template, {
        ignoreWhitespace: false,
        xmlMode: true,
        decodeEntities: false
      });
      var refx = $("*[refx]").toArray();
      if (refx.length > 0) {
        this.debug('removing refx attributes (internal)');
        refx.map(function (x) {
          $(x).attr('refx', null);
        });
        react.template = $.html();
      }
      return react;
    }
    decryptSpecialProps(react) {
      // react special attributes (js) are encrypted so they don't mess with cheerio
      this.debug('deserializing complex attrs');
      // replace cheerio with extractjs
      var extract = require('extractjs')();
      var new_ = react.template;
      var elements = extract(" {prop}_encrypt=\"{encrypted}\"", react.template);
      if (elements.prop && elements.encrypted) {
        var decrypt = require('encrypt-with-password');
        var val = decrypt.decryptJSON(elements.encrypted, '123');
        new_ = new_.replace("".concat(elements.prop, "_encrypt=\"").concat(elements.encrypted, "\""), "".concat(elements.prop, "={").concat(val, "}"));
        var more = extract(" {prop}_encrypt=\"{encrypted}\"", new_);
        if (more.prop && more.encrypted) {
          new_ = this.decryptSpecialProps(_objectSpread2(_objectSpread2({}, react), {
            template: new_
          })).template;
        }
      }
      return _objectSpread2(_objectSpread2({}, react), {
        template: new_
      });
    }
    fixVuePaths(vue, page) {
      for (var key in this.x_state.pages) {
        if (this.x_state.pages[key].path) {
          vue.script = vue.script.replaceAll("{vuepath:".concat(key, "}"), this.x_state.pages[key].path);
        } else {
          this.x_console.outT({
            message: "WARNING! path key doesn't exist for page ".concat(key),
            color: 'yellow'
          });
        }
      }
      // remove / when first char inside router push name
      vue.script = vue.script.replaceAll("this.$router.push({ name:'/", "this.$router.push({ name:'");
      return vue;
    }
    processLangPo(vue, page) {
      var _this14 = this;
      return _asyncToGenerator(function* () {
        // writes default lang.po file and converts alternatives to client/lang/iso.js
        if (_this14.x_state.central_config.idiomas.indexOf(',') != -1) {
          _this14.debug('process /lang/ po/mo files');
          var path = require('path'),
            fs = require('fs').promises;
          // .check and create directs if needed
          var lang_path = path.join(_this14.x_state.dirs.base, '/lang/');
          try {
            yield fs.mkdir(lang_path, {
              recursive: true
            });
          } catch (errdir) {}
          // .create default po file from strings_i18n
          _this14.x_state.central_config.idiomas.split(',')[0];

          // .read other po/mo files from lang dir and convert to .js
          for (var idioma in _this14.x_state.central_config.idiomas.split(',')) {
          }
          //
        }

        return vue;
      })();
    }
    createVueXStores() {
      var _this15 = this;
      return _asyncToGenerator(function* () {
        if (Object.keys(_this15.x_state.stores).length > 0) {
          _this15.x_console.outT({
            message: "creating VueX store definitions",
            color: 'cyan'
          });
          var path = require('path');
          require('util');
          var safe = require('safe-eval');
          //console.log('debug stores complete',this.x_state.stores);
          for (var store_name in _this15.x_state.stores) {
            var store = _this15.x_state.stores[store_name];
            var file = path.join(_this15.x_state.dirs.store, "".concat(store_name, ".js"));
            var def_types = {
              'integer': 0,
              'int': 0,
              'float': 0.0,
              'boolean': false,
              'array': []
            };
            var obj = {};
            // iterate each store field
            //this.debug(`store ${store_name}`,store);
            for (var field_name in store) {
              var field = store[field_name];
              //this.debug({ message:`checking field ${field_name} within store ${i}` });
              if (field.default && field.default.trim() == '') {
                if (field.type in def_types) {
                  obj[field_name] = def_types[field.type];
                } else {
                  obj[field_name] = '';
                }
              } else {
                if ('integer,int,float,boolean,array'.split(',').includes[field.type]) {
                  obj[field_name] = safe(field.default);
                } else if ('true,false,0,1'.split(',').includes[field.default]) {
                  obj[field_name] = safe(field.default);
                } else {
                  obj[field_name] = '' + field.default;
                }
              }
            }
            // expires?
            if (store_name in _this15.x_state.stores_types['expires']) {
              obj['expire'] = parseInt(_this15.x_state.stores_types['expires'][store_name]);
            }
            // versions?
            if (store_name in _this15.x_state.stores_types['versions']) {
              obj['version'] = parseInt(_this15.x_state.stores_types['versions'][store_name]);
            }
            // write content
            delete obj[':mutations'];
            var content = "export const state = () => (".concat(_this15.jsDump(obj), ")\n");
            // :mutations?
            if (':mutations' in store) {
              var muts = [];
              for (var mut_name in store[':mutations']) {
                var mutation = store[':mutations'][mut_name];
                //console.log('mutation debug',{mutation, mut_name});
                var mut = {
                  params: ['state']
                };
                if (Object.keys(mutation.params).length > 0) mut.params.push('objeto');
                muts.push("".concat(mut_name, "(").concat(mut.params.join(','), ") {\n                            ").concat(mutation.code, "\n                        }"));
              }
              content += "\nexport const mutations = {".concat(muts.join(','), "}");
            }
            // write file
            _this15.writeFile(file, content);
          }
        }
      })();
    }
    createServerMethods() {
      var _this16 = this;
      return _asyncToGenerator(function* () {
        if (Object.keys(_this16.x_state.functions).length > 0) {
          _this16.x_console.outT({
            message: "creating NuxtJS server methods",
            color: 'green'
          });
          var path = require('path');
          var file = path.join(_this16.x_state.dirs.server, "api.js");
          var content = "\n            var express = require('express'), _ = require('underscore'), axios = require('axios');\n            var server = express();\n            var plugins = {\n                bodyParser: require('body-parser'),\n                cookieParser: require('cookie-parser')\n            };\n            server.disable('x-powered-by');\n            server.use(plugins.bodyParser.urlencoded({ extended: false,limit: '2gb' }));\n            server.use(plugins.bodyParser.json({ extended: false,limit: '2gb' }));\n            server.use(plugins.cookieParser());\n            ";
          //merge functions import's into a single struct
          var imps = {};
          for (var x in _this16.x_state.functions) {
            for (var imp in _this16.x_state.functions[x]) {
              imps[imp] = _this16.x_state.functions[x][imp];
              yield _this16.setImmediatePromise(); //@improved
            }

            yield _this16.setImmediatePromise(); //@improved
          }
          //declare imports
          content += "// app declared functions imports\n";
          for (var _x3 in imps) {
            content += "var ".concat(imps[_x3], " = require('").concat(_x3, "');\n");
          }
          content += "// app declared functions\n";
          //declare app methods
          for (var func_name in _this16.x_state.functions) {
            var func = _this16.x_state.functions[func_name];
            var func_return = "";
            if (func.return != '') func_return = "res.send(".concat(func.return, ");");
            content += "server.".concat(func.method, "('").concat(func.path, "', async function(req,res) {\n                    var params = req.").concat(func.method == 'get' ? 'params' : 'body', ";\n                    ").concat(func.code, "\n                    ").concat(func_return, "\n                });\n");
          }
          //close
          content += "module.exports = server;\n";
          //write file
          _this16.writeFile(file, content);
          _this16.x_console.outT({
            message: "NuxtJS server methods ready",
            color: 'green'
          });
        }
      })();
    }
    createMiddlewares() {
      var _this17 = this;
      return _asyncToGenerator(function* () {
        if (Object.keys(_this17.x_state.proxies).length > 0) {
          _this17.x_console.outT({
            message: "creating VueJS Middlewares",
            color: 'cyan'
          });
          var path = require('path');
          for (var proxy_name in _this17.x_state.proxies) {
            var proxy = _this17.x_state.proxies[proxy_name];
            var file = path.join(_this17.x_state.dirs.middleware, "".concat(proxy_name, ".js"));
            //add imports
            var content = "";
            for (var key in proxy.imports) {
              content += "import ".concat(proxy.imports[key], " from '").concat(key, "';\n");
            }
            //add proxy code
            content += "export default async function ({ route, store, redirect, $axios, $config }) {\n                    ".concat(proxy.code, "\n\n                }\n                ");
            //find and replace instances of strings {vuepath:targetnode}
            for (var page_name in _this17.x_state.pages) {
              if (page_name != '') {
                var page = _this17.x_state.pages[page_name];
                if (page.path) {
                  content = content.replaceAll("{vuepath:".concat(page_name, "}"), page.path);
                } else {
                  _this17.x_console.outT({
                    message: "Warning! path key doesn't exist for page ".concat(page_name),
                    color: 'yellow'
                  });
                }
              }
              yield _this17.setImmediatePromise(); //@improved
            }
            //write file
            _this17.writeFile(file, content);
            yield _this17.setImmediatePromise(); //@improved
          }

          _this17.x_console.outT({
            message: "VueJS Middlewares ready",
            color: 'cyan'
          });
        }
      })();
    }
    createSystemFiles(processedNodes) {
      var _this18 = this;
      return _asyncToGenerator(function* () {
        require('path');
        var g = _this18.g;
        yield _this18.x_theme.generateFiles();

        //generate common files
        //create index.js
        _this18.writeFile(g('@src/index.js'), "import(\"./App\");\n");
        //create styles/globals.css
        //@todo grab values from main node 'styles'
        var globalsCSS = yield _this18.x_theme.globalCSS();
        var globalStyle = yield _this18._readStyle();
        //merge with values from main->styles into a single object and stringify to CSS
        _this18.writeFile(g('@styles/globals.css'), r(deepMerge(globalsCSS, globalStyle)));
        //create public/index.html
        //@todo add website title, modify lang, add meta data and any additional head requirements
        //add conifg:meta data
        var config = {
          head: {
            meta: [],
            script: []
          }
        };
        if (_this18.x_state.config_node['html:meta']) {
          for (var meta_key in _this18.x_state.config_node['html:meta']) {
            if (meta_key.charAt(0) != ':') {
              var test = meta_key.toLowerCase().trim();
              var value = _this18.x_state.config_node['html:meta'][meta_key];
              if (test == 'charset') {
                config.head.meta.push({
                  charset: value
                });
              } else if (test == 'description') {
                config.head.push({
                  hid: 'description',
                  name: 'description',
                  content: value
                });
              } else {
                config.head.meta.push({
                  name: meta_key,
                  content: value
                });
              }
            }
          }
        } else if (_this18.x_state.config_node.meta && _this18.x_state.config_node.meta.length > 0) {
          config.head.meta = _this18.x_state.config_node.meta;
        }
        //add custom head scripts
        //sort head scripts a-z
        var as_array = [];
        for (var head in _this18.x_state.head_script) {
          as_array.push({
            key: head,
            params: _this18.x_state.head_script[head]
          });
          //config.head.script.push({ ...this.x_state.head_script[head] });
        }

        var sorted = as_array.sort(function (key) {
          var sort_order = 1; //desc=-1
          return function (a, b) {
            if (a[key] < b[key]) {
              return -1 * sort_order;
            } else if (a[key] > b[key]) {
              return 1 * sort_order;
            } else {
              return 0 * sort_order;
            }
          };
        });
        for (var _head in sorted) {
          config.head.script.push(sorted[_head].params);
        }
        // convert head into html tags
        var meta_head = '';
        for (var meta in config.head.meta) {
          var meta_tag = config.head.meta[meta];
          meta_head += "<meta ";
          for (var key in meta_tag) {
            meta_head += "".concat(key, "=\"").concat(meta_tag[key], "\" ");
          }
          meta_head += ">\n";
        }
        for (var script in config.head.script) {
          var script_tag = config.head.script[script];
          meta_head += "<script ";
          for (var _key3 in script_tag) {
            meta_head += "".concat(_key3, "=\"").concat(script_tag[_key3], "\" ");
          }
          meta_head += "></script>\n";
        }
        //
        var indexHeadTheme = yield _this18.x_theme.indexHtmlHead();
        _this18.writeFile(g('@public/index.html'), "\n        <!DOCTYPE html>\n        <html lang=\"".concat(_this18.x_state.central_config.langs.split(',')[0], "\">\n        \n        <head>\n          <meta charset=\"UTF-8\">\n          <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n          <title>").concat(_this18.x_state.config_node['nuxt:title'] ? _this18.x_state.config_node['nuxt:title'] : _this18.x_state.central_config.apptitle, "</title>\n          ").concat(indexHeadTheme, "\n          ").concat(meta_head, "\n        </head>\n        \n        <body>\n          <div id=\"app\"></div>\n        </body>\n        \n        </html>        \n        "));

        //@pages/index.js created on onCreateFiles
        //create App.jsx
        //@todo obtain files and routes from map and use React Router
        var appJSX = "import React from \"react\";\n        import ReactDOM from \"react-dom\";\n        {appJSX.imports}\n\n        // import each main page\n        {appJSX.import_pages}\n\n        import \"./styles/globals.css\";\n\n        export const App = (props) => {\n        return (\n            {appJSX.open}\n            <div className=\"container\">\n            {appJSX.routes}\n            </div>\n            {appJSX.close}\n        )\n        };\n        ReactDOM.render(<App />, document.getElementById(\"app\"));\n        ";
        // get pages {appJSX.import_pages} 
        // iterate this.x_state.pages, and grab file names from processedNodes 
        var import_pages = '';
        var pages = [];
        for (var thefile_num in processedNodes) {
          var thefile = processedNodes[thefile_num];
          var page = _this18.x_state.pages[thefile.title];
          if (page) {
            var name = thefile.file.split('.')[0];
            if (page.type == 'page') {
              pages.push({
                name,
                params: page.params,
                defaults: page.defaults,
                path: page.path,
                styles: page.styles
              });
              import_pages += "import { ".concat(name, " } from \"./pages\";\n");
            }
          }
        }
        //this.debug('pages!',pages);
        appJSX = appJSX.replace('{appJSX.import_pages}', import_pages);
        //
        var JSX_imports = yield _this18.x_theme.AppImports();
        //@todo add support for react-dom-router
        //sort pages from longest path to shortest (first to match wins on react-router)
        pages.sort(function (a, b) {
          var sort_order = -1; //desc=-1
          if (a.path.length < b.path.length) {
            return -1 * sort_order;
          } else if (a.path.length > b.path.length) {
            return 1 * sort_order;
          } else {
            return 0 * sort_order;
          }
        });
        //this.debug('pages',pages);
        if (pages.length == 1) {
          appJSX = appJSX.replace('{appJSX.routes}', "<Home/>");
        } else {
          // add react-dom-router import and a switch for each page
          _this18.x_state.npm['react-router-dom'] = '5.3.3';
          //this.x_state.npm['localforage']='*';
          //this.x_state.npm['match-sorter']='*';
          //this.x_state.npm['sort-by']='*';
          JSX_imports += "import { BrowserRouter as Router, Route, Switch } from \"react-router-dom\";";
          var switch_ = {
            open: '',
            close: ''
          };
          switch_.open = "<Router>\n<Switch>\n";
          switch_.close = "</Switch>\n</Router>\n";
          for (var _page in pages) {
            switch_.open += "<Route exact path=\"".concat(pages[_page].path, "\" component={").concat(pages[_page].name, "} />\n");
          }
          appJSX = appJSX.replace('{appJSX.routes}', switch_.open + switch_.close);
        }
        //
        appJSX = appJSX.replace('{appJSX.imports}', JSX_imports);
        var JSX_wrap = yield _this18.x_theme.AppWrap();
        appJSX = appJSX.replace('{appJSX.open}', JSX_wrap.open);
        appJSX = appJSX.replace('{appJSX.close}', JSX_wrap.close);
        _this18.writeFile(g('@src/App.jsx'), appJSX);
        // create .babelrc
        var default_babel = {
          presets: ["@babel/preset-react", "@babel/preset-env"],
          plugins: [["@babel/transform-runtime"]]
        };
        var babel_ = yield _this18.x_theme.BabelRC(default_babel);
        _this18.writeFile(g('@app/.babelrc'), JSON.stringify(babel_));
        // create webpack.config.js
        var webpack = {
          exposes: {}
        };
        webpack.template = "\n        const HtmlWebPackPlugin = require(\"html-webpack-plugin\");\n        const ModuleFederationPlugin = require(\"webpack/lib/container/ModuleFederationPlugin\");\n        \n        const path = require('path');\n        const deps = require(\"./package.json\").dependencies;\n        module.exports = {\n          output: {\n            publicPath: \"http://localhost:".concat(_this18.x_state.central_config.port, "/\",\n          },\n        \n          resolve: {\n            extensions: [\".tsx\", \".ts\", \".jsx\", \".js\", \".json\"],\n          },\n        \n          devServer: {\n            historyApiFallback: true,\n            static: {\n              directory: path.join(__dirname),\n            },\n            compress: true,\n            port: ").concat(_this18.x_state.central_config.port, ",\n            hot: true,\n            headers: {\n              'Access-Control-Allow-Origin': '*',\n              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',\n              'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',\n            },\n          },\n        \n          module: {\n            rules: [\n              {\n                test: /.m?js/,\n                type: \"javascript/auto\",\n                resolve: {\n                  fullySpecified: false,\n                },\n              },\n              {\n                test: /.(css|s[ac]ss)$/i,\n                use: [\"style-loader\", \"css-loader\", \"postcss-loader\"],\n              },\n              {\n                test: /.(ts|tsx|js|jsx)$/,\n                exclude: /node_modules/,\n                use: {\n                  loader: \"babel-loader\",\n                },\n              },\n            ],\n          },\n        \n          plugins: [\n            new ModuleFederationPlugin({\n              name: \"").concat(_this18.x_state.central_config.apptitle, "\",\n              filename: \"remoteEntry.js\",\n              remotes: {\n              },\n              //@todo add components marked as 'shared'\n              exposes: {webpack:exposes},\n              shared: {\n                ...deps,\n                react: {\n                  singleton: true,\n                  requiredVersion: deps.react,\n                },\n                \"react-dom\": {\n                  singleton: true,\n                  requiredVersion: deps[\"react-dom\"],\n                },\n              },\n            }),\n            new HtmlWebPackPlugin({webpack:html}),\n          ],\n        };        \n        ");
        //
        webpack.HtmlWebPackPlugin = {
          template: "./src/public/index.html"
        };
        // copy the 'favicon' file, and add it to HtmlWebPackPlugin node within webpack.config.js file
        if (_this18.x_state.config_node['favicon']) {
          // copy icon to static dir
          var _path2 = require('path');
          var source = _path2.join(_this18.x_state.dirs.base, _this18.x_state.config_node['favicon']);
          var target = _this18.x_state.dirs.static + 'icon.png'; //@todo get extension from source
          webpack.favicon = target;
          _this18.debug({
            message: "FAVICON ICON dump (copy icon)",
            color: "yellow",
            data: source
          });
          var fs = require('fs').promises;
          try {
            yield fs.copyFile(source, target);
            //@todo absolute target to relative format
            //assign to webpack.HtmlWebPackPlugin.favicon
            webpack.HtmlWebPackPlugin.favicon = target;
          } catch (err_fs) {
            _this18.x_console.outT({
              message: "error: copying defined favicon",
              data: err_fs
            });
          }
        }
        // create webpack.config.js
        // replace placeholders with values
        webpack.template = webpack.template.replace('{webpack:html}', _this18.jsDump(webpack.HtmlWebPackPlugin));
        // test if central node is 'shared'
        if (_this18.x_state.central_config.shared) {
          webpack.exposes['./App'] = './src/App.jsx';
        }
        // test which pages/components are shared
        for (var _thefile_num in processedNodes) {
          var _thefile = processedNodes[_thefile_num];
          var _page2 = _this18.x_state.pages[_thefile.title];
          if (_page2) {
            var _name = _thefile.file.split('.')[0];
            if (_page2.type == 'page' && _page2.shared) {
              webpack.exposes['./' + _name] = './src/pages/' + _name;
            } else if (_page2.type == 'component' && _page2.shared) {
              webpack.exposes['./' + _name] = './src/components/' + _name;
            }
          }
        }
        webpack.template = webpack.template.replace('{webpack:exposes}', JSON.stringify(webpack.exposes));
        // write file
        _this18.writeFile(g('@app/webpack.config.js'), webpack.template);

        // create .env file
        var env = {};
        var ini = require('ini');
        var _loop2 = function _loop2(node_key) {
          if (node_key.includes(':') == false) {
            if ('aurora,vpc,aws'.split(',').includes(node_key) == false) {
              /*if (this.x_state.secrets[node_key]===undefined && typeof this.x_state.config_node[node_key] === 'object') {
                  env[node_key.toLowerCase()]={...this.x_state.config_node[node_key]};
              }*/
              if (typeof _this18.x_state.config_node[node_key] === 'object') {
                Object.keys(_this18.x_state.config_node[node_key]).map(function (attr) {
                  if (attr.includes(':') == false) {
                    env["".concat((node_key + '_' + attr).toUpperCase())] = this.x_state.config_node[node_key][attr];
                  }
                }.bind(_this18));
              }
            }
          }
        };
        for (var node_key in _this18.x_state.config_node) {
          _loop2(node_key);
        }
        _this18.writeFile(g('@app/.env'), ini.stringify(env));
      })();
    }
    installRequiredPlugins() {
      var _this19 = this;
      return _asyncToGenerator(function* () {
        _this19.x_state.plugins['vuetify'] = {
          global: true,
          npm: {
            'node-sass': '*'
          },
          dev_npm: {
            '@nuxtjs/vuetify': '1.12.1'
          },
          nuxt_config: {
            vuetify: {
              theme: {
                dark: true,
                themes: {
                  dark: {
                    primary: 'colors.blue.darken2',
                    accent: 'colors.grey.darken3',
                    secondary: 'colors.amber.darken3',
                    info: 'colors.teal.lighten1',
                    warning: 'colors.amber.base',
                    error: 'colors.deepOrange.accent4',
                    success: 'colors.green.accent3'
                  }
                }
              }
            }
          }
        };
        _this19.x_state.nuxt_config.build_modules['@nuxtjs/vuetify'] = {};
        _this19.x_state.plugins['aos'] = {
          global: true,
          npm: {
            aos: '*'
          },
          mode: 'client',
          customcode: "import AOS from \"aos\";\n            import \"aos/dist/aos.css\";\n            export default ({app}) => {\n                app.AOS = new AOS.init({});\n            };"
        };
        //add font awesome 5 support
        _this19.x_state.plugins['fontawesome'] = {
          global: true,
          npm: {
            '@fortawesome/fontawesome-free': '*'
          },
          mode: 'client',
          customcode: "import '@fortawesome/fontawesome-free/css/all.css' // Ensure you are using css-loader\n            import Vue from 'vue'\n            import Vuetify from 'vuetify/lib'\n            \n            Vue.use(Vuetify)\n            \n            export default new Vuetify({\n              icons: {\n                iconfont: 'fa',\n              },\n            })"
        };
        //support for tawk.io
        if (_this19.x_state.config_node.tawk && _this19.x_state.config_node.tawk.propertyId && _this19.x_state.config_node.tawk.widgetId) {
          _this19.x_state.plugins['tawk'] = {
            global: true,
            npm: {
              '@tawk.to/tawk-messenger-vue': '*'
            },
            mode: 'client',
            customcode: "import Vue from \"vue\";\n                import TawkMessengerVue from '@tawk.to/tawk-messenger-vue';\n\n                export default function () {\n                    Vue.use(TawkMessengerVue, {\n                        propertyId : '".concat(_this19.x_state.config_node.tawk.propertyId, "',\n                        widgetId : '").concat(_this19.x_state.config_node.tawk.widgetId, "'\n                    });\n                }")
          };
        }
      })();
    }
    createNuxtPlugins() {
      var _arguments = arguments,
        _this20 = this;
      return _asyncToGenerator(function* () {
        var write = _arguments.length > 0 && _arguments[0] !== undefined ? _arguments[0] : true;
        var path = require('path');
        var resp = {
          global_plugins: {},
          css_files: [],
          nuxt_config: [],
          stories: {}
        };
        for (var plugin_key in _this20.x_state.plugins) {
          var plugin = _this20.x_state.plugins[plugin_key];
          if (typeof plugin === 'object') {
            // copy x_state_plugins npm's into npm global imports (for future package.json)
            if (plugin.npm) _this20.x_state.npm = _objectSpread2(_objectSpread2({}, _this20.x_state.npm), plugin.npm);
            if (plugin.dev_npm) _this20.x_state.dev_npm = _objectSpread2(_objectSpread2({}, _this20.x_state.dev_npm), plugin.dev_npm);
            if (plugin.global && plugin.global == true) resp.global_plugins[plugin_key] = '*';
            if (plugin.styles) {
              for (var style_key in plugin.styles) {
                var style = plugin.styles[style_key];
                if (style.file.includes('/') == false) {
                  var target = path.join(_this20.x_state.dirs.css, style.file);
                  yield _this20.writeFile(target, style.content);
                  resp.css_files.push({
                    src: "~/assets/css/".concat(style.file),
                    lang: style.lang
                  });
                }
              }
            }
            // write the plugin code
            var import_as = '',
              _code = '';
            if (plugin.var) {
              import_as = plugin.var;
            } else {
              import_as = plugin_key.split('/').splice(-1)[0].replaceAll('-', '').replaceAll('_', '').toLowerCase().trim();
            }
            _code = "import Vue from 'vue';\n";
            if (plugin.as_star) {
              if (plugin.as_star == true) {
                _code += "import * as ".concat(import_as, " from '").concat(plugin_key, "';\n");
              } else {
                _code += "import ".concat(import_as, " from '").concat(plugin_key, "';\n");
              }
            } else {
              _code += "import ".concat(import_as, " from '").concat(plugin_key, "';\n");
            }
            if (plugin.custom) _code += "".concat(plugin.custom, "\n");
            if (plugin.extra_imports) {
              for (var extra in plugin.extra_imports) {
                var new_key = plugin.extra_imports[extra].replaceAll('-', '').replaceAll('_', '').replaceAll('/', '').replaceAll('.css', '').replaceAll('.', '_').toLowerCase().trim();
                _code += "import ".concat(new_key, " from '").concat(plugin.extra_imports[extra], "'\n");
              }
            }
            if (plugin.requires) {
              for (var req in plugin.requires) {
                _code += "require('".concat(plugin.requires[req], "');\n");
              }
            }
            if (plugin.styles) {
              for (var _style_key in plugin.styles) {
                var _style = plugin.styles[_style_key];
                if (_style.file.includes('/')) {
                  _code += "import '".concat(_style.file, "';\n");
                }
              }
            }
            // add config to plugin code if requested
            if (plugin.config) {
              if (typeof plugin.config === 'object') {
                _code += "const config = ".concat(_this20.jsDump(plugin.config), ";\n                        Vue.use(").concat(import_as, ",config);");
              } else {
                _code += "Vue.use(".concat(import_as, ",").concat(plugin.config, ");\n");
              }
            } else if (plugin.tag && plugin.customvar == '') {
              _code += "Vue.use(".concat(import_as, ",'").concat(plugin.tag, "');\n");
            } else if (plugin.tag) {
              _code += "Vue.component('".concat(plugin.tag, "',").concat(import_as, ");\n");
            } else if (plugin.customvar) {
              _code += "Vue.use(".concat(plugin.customvar, ");\n");
            } else {
              _code += "Vue.use(".concat(import_as, ");\n");
            }
            // if customcode overwrite 'code'
            if (plugin.customcode) {
              _code = plugin.customcode;
            }
            // write to disk and add to response
            if (import_as != 'vuetify') {
              if (plugin.mode) {
                resp.nuxt_config.push({
                  mode: plugin.mode.toLowerCase().trim(),
                  src: "~/plugins/".concat(import_as, ".js")
                });
              } else {
                resp.nuxt_config.push({
                  src: "~/plugins/".concat(import_as, ".js")
                });
              }
              var _target = path.join(_this20.x_state.dirs.plugins, "".concat(import_as, ".js"));
              if (write) yield _this20.writeFile(_target, _code);
            }
            //10-ago-21 assign code to plugin registry (for storybook)
            resp.stories[plugin_key] = plugin;
            resp.stories[plugin_key].code = _code;
          } else {
            //simple plugin
            _this20.x_state.npm[plugin_key] = plugin;
            var _import_as = plugin_key.replaceAll('-', '').replaceAll('_', '').toLowerCase().trim();
            code += "import Vue from 'vue';\n                import ".concat(_import_as, " from '").concat(plugin_key, "';\n                Vue.use(").concat(_import_as, ");\n                ");
            // write to disk and add to response
            if (_import_as != 'vuetify') {
              resp.nuxt_config.push({
                src: "~/plugins/".concat(_import_as, ".js")
              });
              var _target2 = path.join(_this20.x_state.dirs.plugins, "".concat(_import_as, ".js"));
              if (write) yield _this20.writeFile(_target2, code);
            }
            //10-ago-21 assign code to plugin registry (for storybook)
            resp.stories[plugin_key] = plugin;
            resp.stories[plugin_key].code = code;
          }
        }
        return resp;
      })();
    }
    createNuxtConfig() {
      var _this21 = this;
      return _asyncToGenerator(function* () {
        //creates the file nuxt.config.js
        //define structure with defaults
        var path = require('path');
        var target = path.join(_this21.x_state.dirs.app, "nuxt.config.js");
        _this21.x_state.central_config[':mode'] == 'spa' ? true : false;
        if (_this21.x_state.central_config[':ssr']) _this21.x_state.central_config[':ssr'];
        var target_val = _this21.x_state.central_config.static == true ? 'static' : 'server';
        _this21.x_state.central_config.deploy + '';
        var config = {
          ssr: true,
          //8may21 forced psb,18may default true
          target: target_val,
          components: true,
          telemetry: false,
          loading: {
            color: 'orange',
            height: '2px',
            continuous: true
          },
          head: {
            title: _this21.x_state.config_node['nuxt:title'] ? _this21.x_state.config_node['nuxt:title'] : _this21.x_state.central_config.apptitle,
            meta: [],
            link: [
            //{ rel: 'icon', type: 'image/x-icon', href:'/favicon.ico' },
            {
              rel: 'icon',
              type: 'image/png',
              href: '/icon.png'
            }, {
              rel: 'stylesheet',
              href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons'
            }],
            script: [],
            __dangerouslyDisableSanitizers: ['script']
          },
          env: {},
          debug: false,
          modules: [],
          buildModules: [],
          plugins: [],
          css: [],
          build: {
            publicPath: '/_nuxt/'
          },
          srcDir: 'client/',
          performance: {
            gzip: true
          },
          router: {
            base: '/'
          },
          dev: false
        };
        if (_this21.x_state.central_config.static == true) {
          config.ssr = false;
          config.performance.gzip = false;
        }
        //add title:meta data
        if (_this21.x_state.config_node['nuxt:meta']) {
          for (var meta_key in _this21.x_state.config_node['nuxt:meta']) {
            if (meta_key.charAt(0) != ':') {
              var test = meta_key.toLowerCase().trim();
              var value = _this21.x_state.config_node['nuxt:meta'][meta_key];
              if (test == 'charset') {
                config.head.meta.push({
                  charset: value
                });
              } else if (test == 'description') {
                config.head.push({
                  hid: 'description',
                  name: 'description',
                  content: value
                });
              } else {
                config.head.meta.push({
                  name: meta_key,
                  content: value
                });
              }
            }
          }
        } else if (_this21.x_state.config_node.meta && _this21.x_state.config_node.meta.length > 0) {
          config.head.meta = _this21.x_state.config_node.meta;
        }
        //add custom head scripts
        //sort head scripts a-z
        var as_array = [];
        for (var head in _this21.x_state.head_script) {
          as_array.push({
            key: head,
            params: _this21.x_state.head_script[head]
          });
          //config.head.script.push({ ...this.x_state.head_script[head] });
        }

        var sorted = as_array.sort(function (key) {
          var sort_order = 1; //desc=-1
          return function (a, b) {
            if (a[key] < b[key]) {
              return -1 * sort_order;
            } else if (a[key] > b[key]) {
              return 1 * sort_order;
            } else {
              return 0 * sort_order;
            }
          };
        });
        for (var _head2 in sorted) {
          config.head.script.push(sorted[_head2].params);
        }
        //nuxt axios config
        if (_this21.x_state.config_node.axios) {
          var ax_config = {
            proxy: _this21.x_state.nuxt_config.modules['@nuxtjs/proxy'] ? true : false
          };
          ax_config = _objectSpread2(_objectSpread2({}, _this21.x_state.config_node.axios), ax_config);
          if (ax_config.retries) {
            ax_config.retry = {
              retries: ax_config.retries
            };
            delete ax_config.retries;
            _this21.x_state.npm['axios-retry'] = '*';
          }
          /*
          if (deploy.includes('eb:') || deploy.includes('true')) {
              if (this.x_state.config_node.axios.deploy) {
                  ax_config.baseURL = this.x_state.config_node.axios.deploy;
                  ax_config.browserBaseURL = this.x_state.config_node.axios.deploy;
                  delete ax_config.deploy;
              }
          } else if (deploy=='local' || deploy=='remote') {
              if (this.x_state.config_node.axios.local) {
                  ax_config.baseURL = this.x_state.config_node.axios.local;
                  ax_config.browserBaseURL = this.x_state.config_node.axios.local;
                  delete ax_config.local;
                  if (this.x_state.config_node.axios.local.includes('127.0.0.1')) 
                      this.x_state.config_node.axios.https=false;
              }
              delete ax_config.deploy;
          }*/
          config.axios = ax_config;
          //delete this.x_state.config_node.axios;
        }
        //nuxt vue config
        if (_this21.x_state.config_node['vue:config']) {
          config.vue = {
            config: _this21.x_state.config_node['vue:config']
          };
          delete config.vue.config[':secret'];
          delete config.vue.config[':link'];
        }
        //nuxt proxy config keys
        if (_this21.x_state.nuxt_config.modules['@nuxtjs/proxy']) {
          config.proxy = _this21.x_state.nuxt_config.modules['@nuxtjs/proxy'];
        }
        //nuxt env variables
        config.publicRuntimeConfig = {};
        for (var node_key in _this21.x_state.config_node) {
          if (node_key.includes(':') == false) {
            if ('aurora,vpc,aws'.split(',').includes(node_key) == false) {
              if (_this21.x_state.secrets[node_key] === undefined && typeof _this21.x_state.config_node[node_key] === 'object') {
                config.publicRuntimeConfig[node_key.toLowerCase()] = _objectSpread2({}, _this21.x_state.config_node[node_key]);
              }
            }
          }
        }
        //nuxt google:analytics
        if (_this21.x_state.config_node['google:analytics']) {
          if (_this21.x_state.config_node['google:analytics'].local && _this21.x_state.config_node['google:analytics'].local == true) {
            config.debug = true;
          }
        }
        //nuxt modules
        for (var module_key in _this21.x_state.nuxt_config.modules) {
          var module = _this21.x_state.nuxt_config.modules[module_key];
          if (Object.keys(module) == '') {
            config.modules.push(module_key);
          } else {
            config.modules.push([module_key, module]);
          }
        }
        //nuxt build_modules
        for (var _module_key in _this21.x_state.nuxt_config.build_modules) {
          var _module = _this21.x_state.nuxt_config.build_modules[_module_key];
          if (Object.keys(_module) == '') {
            config.buildModules.push(_module_key);
          } else {
            config.buildModules.push([_module_key, _module]);
          }
        }
        //nuxt plugins
        config.plugins = _this21.x_state.nuxt_config.plugins;
        config.css = _this21.x_state.nuxt_config.css;
        //muxt server methods
        if (_this21.x_state.functions && Object.keys(_this21.x_state.functions).length > 0) config.serverMiddleware = ['~/server/api'];
        //nuxt build - cfc: 12637
        //google-autocomplete plugin doesn work if treeShake is true
        config.vuetify = {
          treeShake: false,
          options: {
            variations: false
          }
        }; //8may21 psb
        config.build = {
          publicPath: '/_nuxt/',
          analyze: false,
          extractCSS: {
            ignoreOrder: true
          }
          //optimizeCSS: true,
          /*
          html: {
              minify: {
                  collapseBooleanAttributes: true,
                  decodeEntities: true,
                  minifyCSS: true,
                  minifyJS: true,
                  processConditionalComments: true,
                  removeEmptyAttributes: true,
                  removeRedundantAttributes: true,
                  trimCustomFragments: true,
                  useShortDoctype: true,
                  minifyURLs: true,
                  removeComments: true,
                  removeEmptyElements: true,
                  preserveLineBreaks: false,
                  collapseWhitespace: true
              }
          }*/
        };
        //23feb22: hack added support for vue2-google-map plugin (@todo make this controlled from the tag command)
        config.build.transpile = [/^vue2-google-maps($|\/)/];
        //
        if (_this21.x_state.central_config.static == true) {
          config.build.html = {
            minify: {
              collapseBooleanAttributes: true,
              decodeEntities: true,
              minifyCSS: true,
              minifyJS: true,
              processConditionalComments: true,
              removeEmptyAttributes: true,
              removeRedundantAttributes: true,
              trimCustomFragments: true,
              useShortDoctype: true,
              minifyURLs: true,
              removeComments: true,
              removeEmptyElements: true,
              preserveLineBreaks: false,
              collapseWhitespace: true
            }
          };
        }
        if (_this21.x_state.central_config.stage && _this21.x_state.central_config.stage != 'production' && _this21.x_state.central_config.stage != 'prod') {
          config.build.publicPath = "/".concat(_this21.x_state.central_config.stage, "/_nuxt/");
        }
        //we don't need webpack build rules in this edition:omit from cfc, so we are ready here
        //let util = require('util');
        //let content = util.inspect(config,{ depth:Infinity }).replaceAll("'`","`").replaceAll("`'","`");
        if (_this21.deploy_module.modifyNuxtConfig) {
          config = yield _this21.deploy_module.modifyNuxtConfig(config);
        }
        var content = _this21.jsDump(config).replaceAll("'`", "`").replaceAll("`'", "`");
        yield _this21.writeFile(target, "export default ".concat(content));
        //this.x_console.outT({ message:'future nuxt.config.js', data:data});
      })();
    }

    createPackageJSON() {
      var _this22 = this;
      return _asyncToGenerator(function* () {
        var data = {
          name: _this22.x_state.central_config.service_name,
          version: '',
          description: _this22.x_state.central_config[':description'],
          //main: 'index.js',
          dependencies: {},
          devDependencies: {},
          scripts: {
            build: 'webpack --mode production',
            'build:dev': 'webpack --mode development',
            'build:start': "cd dist && PORT=".concat(_this22.x_state.central_config.port, " npx serve"),
            start: 'webpack serve --open --mode development',
            'start:live': 'webpack serve --open --mode development --live-reload --hot'
          },
          keywords: [],
          author: '',
          license: ''
        };
        //if not static
        /*if (!this.x_state.central_config.static) {
            data.scripts = {...data.scripts, ...{
                dev: 'nuxt --no-lock',
                build: 'nuxt build --no-lock',
                start: 'nuxt start --no-lock',
                generate: 'nuxt generate',
                deploy: 'nuxt build --no-lock && sls deploy'
            }};
        }*/
        //if port is not 3000
        //if (this.x_state.central_config.port!=3000) data.scripts.dev = `nuxt --port ${this.x_state.central_config.port}`;
        //if (this.x_state.central_config[':hostname']) data.scripts.dev += ` --hostname '${this.x_state.central_config[':hostname']}'`;
        //if (this.x_state.central_config.deploy=='remote' && !this.x_state.central_config[':hostname']) data.scripts.dev += ` --hostname '0.0.0.0'`;
        if (_this22.x_state.central_config[':version']) data.version = _this22.x_state.central_config[':version'];
        if (_this22.x_state.central_config[':author']) data.author = _this22.x_state.central_config[':author'];
        if (_this22.x_state.central_config[':license']) data.license = _this22.x_state.central_config[':license'];
        if (_this22.x_state.central_config[':git']) {
          data.repository = {
            type: 'git',
            url: "git+".concat(_this22.x_state.central_config[':git'], ".git")
          };
          data.bugs = {
            url: "".concat(_this22.x_state.central_config[':git'], "/issues")
          };
          data.homepage = _this22.x_state.central_config[':git'];
        }
        if (_this22.x_state.central_config[':keywords']) data.keywords = _this22.x_state.central_config[':keywords'].split(',');
        //add dependencies
        for (var pack in _this22.x_state.npm) {
          if (_this22.x_state.npm[pack].includes('http') && _this22.x_state.npm[pack].includes('github.com')) {
            data.dependencies[pack] = "git+".concat(_this22.x_state.npm[pack]);
          } else {
            data.dependencies[pack] = _this22.x_state.npm[pack];
          }
        }
        //add devDependencies
        for (var _pack in _this22.x_state.dev_npm) {
          if (_this22.x_state.dev_npm[_pack].includes('http') && _this22.x_state.dev_npm[_pack].includes('github.com')) {
            data.devDependencies[_pack] = "git+".concat(_this22.x_state.dev_npm[_pack]);
          } else {
            data.devDependencies[_pack] = _this22.x_state.dev_npm[_pack];
          }
        }
        //storybook support
        /*
        if (this.x_state.central_config.storybook==true) {
            data.devDependencies['@socheatsok78/storybook-addon-vuetify'] = '^0.1.8';
            data.scripts['storybook2'] = 'start-storybook -s ./stories/assets -p 6006';
            data.scripts['build-storybook2'] = 'build-storybook -s ./stories/assets';
        } */
        //write to disk
        var path = require('path');
        var target = path.join(_this22.x_state.dirs.app, "package.json");
        if (_this22.deploy_module.modifyPackageJSON) {
          data = yield _this22.deploy_module.modifyPackageJSON(data);
        }
        var content = JSON.stringify(data);
        yield _this22.writeFile(target, content);
        //this.x_console.outT({ message:'future package.json', data:data});
      })();
    }

    createStorybookFiles() {
      var _this23 = this;
      return _asyncToGenerator(function* () {
        //23-nov-22 commented out for now
        // creates Storybook required files
        if (_this23.x_state.central_config.storybook == true) {
          var path = require('path');
          var spawn = require('await-spawn');
          var spinner = _this23.x_console.spinner({
            message: 'Installing storybook'
          });
          try {
            var install = yield spawn('npx', ['sb', 'init', '-f'], {
              cwd: _this23.x_state.dirs.app
            });
            spinner.succeed("Storybook installed and initialized successfully");
          } catch (n) {
            spinner.fail('Storybook failed to initialize');
          }
          // creates .storybook/main.js file
          var data = {
            'stories': ['../stories/**/*.stories.mdx', '../stories/**/*.stories.@(js|jsx|ts|tsx)'],
            'addons': ["@storybook/addon-links", "@storybook/addon-essentials", '@socheatsok78/storybook-addon-vuetify']
          };
          //write main.js to disk
          //this.x_console.outT({ message:'STORYBOOK dirs', color:'yellow', data:this.x_state.dirs });
          var target = path.join(_this23.x_state.dirs['storybook'], "main.js");
          var content = 'module.exports = ' + JSON.stringify(data);
          yield _this23.writeFile(target, content);
          // creates .storybook/preview.js
          content = "import { withVuetify } from '@socheatsok78/storybook-addon-vuetify/dist/decorators'\n\nexport const parameters = {\n    actions: { argTypesRegex: \"^on[A-Z].*\" },\n    controls: {\n        matchers: {\n            color: /(background|color)$/i,\n            date: /Date$/,\n        },\n    },\n}\n\nexport const decorators = [\n    withVuetify\n]";
          // write preview.js to disk
          target = path.join(_this23.x_state.dirs['storybook'], "preview.js");
          yield _this23.writeFile(target, content);
          // creates/writes .storybook/preview-head.html
          content = "<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons\">";
          target = path.join(_this23.x_state.dirs['storybook'], "preview-head.html");
          yield _this23.writeFile(target, content);
          // creates custom Theme
          // copy po logo
          var po_logo = path.join(__dirname, 'assets', 'po.png');
          var po_target = path.join(_this23.x_state.dirs['stories_assets'], 'po.png');
          var fs = require('fs-extra');
          yield fs.copy(po_logo, po_target);
          // remove original stories
          //let fso = require('fs').promises;
          yield fs.rmdir(_this23.x_state.dirs['stories'].replace('stories2', 'stories'), {
            recursive: true
          });
          // copy stories2 to stories folder
          yield fs.copy(_this23.x_state.dirs['stories'], _this23.x_state.dirs['stories'].replace('stories2', 'stories'));
          yield fs.rmdir(_this23.x_state.dirs['stories'], {
            recursive: true
          });
          //await fs.remove(path.resolve());
          // creates/writes .storybook/potheme.js
          var config = {
            base: 'light',
            brandTitle: 'Punto Origen SpA',
            brandUrl: 'http://www.puntorigen.com',
            brandImage: 'po.png',
            colorPrimary: '#E10106',
            colorSecondary: '#86CD46',
            // UI
            appBg: '#FFFFFF',
            appContentBg: '#F6F8FC',
            appBorderColor: 'grey',
            appBorderRadius: 1
          };
          content = "import { create } from '@storybook/theming'\n";
          content += "export default create(".concat(JSON.stringify(config), ");");
          target = path.join(_this23.x_state.dirs['storybook'], "po.js");
          yield _this23.writeFile(target, content);
          // creates/writes .storybook/manager.js
          content = "import { addons } from '@storybook/addons';\n";
          content += "import poTheme from './po';\n\n";
          content += "addons.setConfig({ theme: poTheme });";
          target = path.join(_this23.x_state.dirs['storybook'], "manager.js");
          yield _this23.writeFile(target, content);
        }
      })();
    }
    createVSCodeHelpers() {
      var _this24 = this;
      return _asyncToGenerator(function* () {
        // creates Visual Studio code common helpers
        var path = require('path');
        // creates /jsconfig.json file for Vetur and IntelliSense
        var data = {
          include: ['./src/**/*'],
          compilerOptions: {
            baseUrl: './',
            module: 'es2015',
            moduleResolution: 'node',
            target: 'es5',
            sourceMap: true,
            paths: {
              '~/*': ['./src/*'],
              '@/*': ['./src/*'],
              '~~/*': ['./*'],
              '@@/*': ['./*']
            }
          },
          exclude: ['node_modules', 'dist', 'secrets']
        };
        //write to disk
        var target = path.join(_this24.x_state.dirs.app, "jsconfig.json");
        var content = JSON.stringify(data);
        yield _this24.writeFile(target, content);
      })();
    }
    createServerlessYML() {
      var _this25 = this;
      return _asyncToGenerator(function* () {
        var yaml = require('yaml'),
          data = {};
        var deploy = _this25.x_state.central_config.deploy + '';
        if (deploy.includes('eb:') == false && deploy.includes('s3:') == false && deploy != false && deploy != 'local') {
          data.service = _this25.x_state.central_config.service_name;
          data.custom = {
            prune: {
              automatic: true,
              includeLayers: true,
              number: 1
            },
            apigwBinary: {
              types: ['*/*']
            }
          };
          //add 'secrets' config json keys - cfc:12895
          //this.x_state.secrets
          for (var secret in _this25.x_state.secrets) {
            data.custom[secret] = '${file(secrets/' + secret + '.json)}';
          }
          //domain info
          if (_this25.x_state.central_config.dominio) {
            data.custom.customDomain = {
              domainName: _this25.x_state.central_config.dominio
            };
            if (_this25.x_state.central_config.basepath) data.custom.customDomain.basePath = _this25.x_state.central_config.basepath;
            if (_this25.x_state.central_config.stage) data.custom.customDomain.stage = _this25.x_state.central_config.stage;
            data.custom.customDomain.createRoute53Record = true;
          }
          //nodejs env on aws
          data.provider = {
            name: 'aws',
            runtime: 'nodejs8.10',
            timeout: _this25.x_state.central_config.timeout
          };
          if (_this25.x_state.central_config.stage) data.provider.stage = _this25.x_state.central_config.stage;
          //env keys
          if (Object.keys(_this25.x_state.config_node) != '') {
            data.provider.enviroment = {};
            if (_this25.x_state.central_config.stage) data.provider.enviroment.STAGE = _this25.x_state.central_config.stage;
            if (_this25.x_state.config_node.vpc) {
              data.provider.vpc = {
                securityGroupIds: [_this25.x_state.config_node.vpc.security_group_id],
                subnetIDs: []
              };
              if (_this25.x_state.secrets.vpc) {
                data.provider.vpc.securityGroupIds = ['${self:custom.vpc.SECURITY_GROUP_ID}'];
              }
              if (_this25.x_state.config_node.vpc.subnet1_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET1_ID}');
              if (_this25.x_state.config_node.vpc.subnet2_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET2_ID}');
              if (_this25.x_state.config_node.vpc.subnet3_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET3_ID}');
              if (_this25.x_state.config_node.vpc.subnet4_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET4_ID}');
              if (_this25.x_state.config_node.vpc.subnet5_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET5_ID}');
              if (_this25.x_state.config_node.vpc.subnet6_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET6_ID}');
              if (_this25.x_state.config_node.vpc.subnet7_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET7_ID}');
            }
          }
          //aws iam for s3 permissions (x_state.aws_iam) (@TODO later - cfc:12990)
          /*
          data.provider.iamRoleStatements = {
              Effect: 'Allow'
          };*/
          //nuxt handler
          data.functions = {
            nuxt: {
              handler: 'index.nuxt',
              events: [{
                'http': 'ANY /'
              }, {
                'http': 'ANY /{proxy+}'
              }]
            }
          };
          if (_this25.x_state.central_config['keep-warm']) {
            data.functions.nuxt.events.push({
              schedule: 'rate(20 minutes)'
            });
          }
          //aws resources for s3 (x_state.aws_resources) (@TODO later - no commands use them - cfc:13017)
          //serverless plugins
          data.plugins = ['serverless-apigw-binary', 'serverless-offline', 'serverless-prune-plugin'];
          if (_this25.x_state.central_config.dominio) data.plugins.push('serverless-domain-manager');
          //write yaml to disk
          var content = yaml.stringify(data);
          var path = require('path');
          var target = path.join(_this25.x_state.dirs.app, "serverless.yml");
          yield _this25.writeFile(target, content);
          //debug
          //this.debug('future serverless.yml', content);
        }
      })();
    }

    onEnd() {
      var _this26 = this;
      return _asyncToGenerator(function* () {
        //execute deploy (npm install, etc) AFTER vue compilation (18-4-21: this is new)
        if (!_this26.errors_found) {
          //only deploy if no errors were found
          if (!(yield _this26.deploy_module.deploy())) {
            _this26.x_console.outT({
              message: 'Something went wrong deploying, check the console, fix it and run again.',
              color: 'red'
            });
            yield _this26.deploy_module.post();
            // found errors deploying
            process.exit(100);
          } else {
            yield _this26.deploy_module.post();
          }
        } else {
          //found errors compiling
          process.exit(50);
        }
      })();
    }
    exists(dir_or_file) {
      return _asyncToGenerator(function* () {
        var fs = require('fs').promises;
        try {
          yield fs.access(dir_or_file);
          return true;
        } catch (e) {
          return false;
        }
      })();
    }
    writeFile(file, content) {
      var _arguments2 = arguments,
        _this27 = this;
      return _asyncToGenerator(function* () {
        var encoding = _arguments2.length > 2 && _arguments2[2] !== undefined ? _arguments2[2] : 'utf-8';
        var fs = require('fs').promises,
          prettier = require('prettier');
        var ext = file.split('.').splice(-1)[0].toLowerCase();
        _this27.debug('writeFile:' + file + ' (ext:' + ext + ')');
        /*let beautify = require('js-beautify');
        let beautify_js = beautify.js;
        let beautify_vue = beautify.html;
        let beautify_css = beautify.css;*/
        var resp = content;
        if (ext == 'jsx') {
          try {
            resp = prettier.format(resp, {
              parser: 'babel',
              useTabs: true,
              singleQuote: true,
              bracketSameLine: true
            });
          } catch (ee) {
            _this27.debug("error: could not format the JS file; trying js-beautify");
            var beautify = require('js-beautify');
            var beautify_js = beautify.js;
            resp = beautify_js(resp, {});
          }
        } else if (ext == 'js') {
          // && file.indexOf('pages/')==-1 25nov22
          //dont format js pages (for now 24-11-22)
          try {
            resp = prettier.format(resp, {
              parser: 'babel',
              useTabs: true,
              singleQuote: true,
              bracketSameLine: true
            });
          } catch (ee) {
            _this27.debug("error: could not format the JS file; trying js-beautify");
            var _beautify = require('js-beautify');
            var _beautify_js = _beautify.js;
            resp = _beautify_js(resp, {});
          }
        } else if (ext == 'babelrc') {
          var _beautify2 = require('js-beautify');
          var _beautify_js2 = _beautify2.js;
          resp = _beautify_js2(resp, {});
        } else if (ext == 'json') {
          try {
            resp = prettier.format(resp, {
              parser: 'json'
            });
          } catch (ee) {
            _this27.debug("error: could not format the JSON file; trying js-beautify");
            var _beautify3 = require('js-beautify');
            var _beautify_js3 = _beautify3.js;
            resp = _beautify_js3(resp, {});
          }
        } else if (ext == 'html') {
          /*
          let beautify = require('js-beautify');
          let beautify_vue = beautify.html;
          resp = beautify_vue(resp.replaceAll(`="xpropx"`,''),{});*/
          resp = resp.replaceAll("=\"xpropx\"", '');
          try {
            resp = prettier.format(resp, {
              parser: 'html',
              htmlWhitespaceSensitivity: 'ignore',
              useTabs: true,
              printWidth: 2000,
              embeddedLanguageFormatting: 'auto',
              singleQuote: true,
              trailingComma: 'none'
            });
          } catch (ee) {
            _this27.debug("warning: could not format the html file; trying vue-beautify", ee);
            var _beautify4 = require('js-beautify');
            var beautify_vue = _beautify4.html;
            resp = beautify_vue(resp, {});
          }
        } else if (ext == 'css') {
          //console.log('prettifiing CSS');
          resp = prettier.format(resp, {
            parser: 'css'
          });
        }
        /*
        
        let resp = content;
        if (ext=='js' || ext=='json') {
            resp = beautify_js(resp, { eval_code: false }).replaceAll(`\n\n`,'');
        } else if (ext=='vue') {
            resp = beautify_vue(resp.replaceAll(`="xpropx"`,''),{}); //{ indent_scripts: 'keep' }
        } else if (ext=='css') {
            resp = beautify_css(resp, { indent_scripts: 'keep' });
        }*/
        //12-dic-21: only write if target content is different from existing.
        var target_exists = yield _this27.exists(file);
        var same = false;
        if (target_exists) {
          var prev = yield fs.readFile(file, encoding);
          var prev_hash = yield _this27.hash(prev);
          var curr_hash = yield _this27.hash(resp);
          //this.debug('testing file writing hashes',{prev_hash,curr_hash});
          if (prev_hash == curr_hash) same = true;
        }
        if (!same) yield fs.writeFile(file, resp, encoding);
      })();
    }

    //Transforms the processed nodes into files.
    onCreateFiles(processedNodes) {
      var _this28 = this;
      return _asyncToGenerator(function* () {
        //copy our 'autocomplete' assets folder to this.autocomplete.path
        if (_this28.autocomplete && _this28.autocomplete.path && _this28.autocomplete.path != '') {
          var _path3 = require('path');
          var sourceAssets = _path3.join(__dirname, 'assets', 'autocomplete');
          _this28.debug("- copying react autocomplete assets to project .autocomplete folder"); //+this.autocomplete.path
          var copy = require('recursive-copy');
          try {
            yield copy(sourceAssets, _this28.autocomplete.path, {
              overwrite: true
            });
          } catch (ercp) {}
        }
        //this.x_console.out({ message:'onCreateFiles', data:processedNodes });
        //this.x_console.out({ message:'x_state.plugins', data:this.x_state.plugins });
        yield _this28.generalConfigSetup();
        yield _this28.createGitIgnore();
        //create @pages/index.js file with references
        var page_exports = '';
        var comp_exports = '';
        for (var thefile_num in processedNodes) {
          var thefile = processedNodes[thefile_num];
          var page = _this28.x_state.pages[thefile.title];
          if (page) {
            //console.log('page',page);
            var name = thefile.file.split('.')[0];
            if (page.type == 'page') {
              page_exports += "export { ".concat(name, " } from './").concat(name, "';\n");
            } else if (page.type == 'component') {
              comp_exports += "export { ".concat(name, " } from './").concat(name, "';\n");
            }
          }
        }
        if (page_exports != '') _this28.writeFile(_this28.g('@pages/index.js'), page_exports);
        if (comp_exports != '') _this28.writeFile(_this28.g('@components/index.js'), comp_exports);
        //let plugins_info4stories = await this.createNuxtPlugins(false);
        //this.x_console.out({ message:'plugins_info4stories', data:plugins_info4stories });
        /*let add_plugins2story = function(story_vue) {
            let plugins = plugins_info4stories.stories;
            let resp = story_vue;
            for (let plugin in plugins) {
                if (plugins[plugin].code.includes('vuetify')==false) {
                    let nscript = `<script>\n`;
                    nscript += plugins[plugin].code.replace(`import Vue from 'vue';`,'');
                    resp = resp.replace('<script>\n',nscript);
                }
            }
            return resp.replaceAll('\n\n','\n');
        };*/
        _this28.debug('processing nodes');
        require('fs').promises;
          var path = require('path');
        for (var _thefile_num2 in processedNodes) {
          //await processedNodes.map(async function(thefile) {
          var _thefile2 = processedNodes[_thefile_num2]; // only level 2 nodes!
          _thefile2.code + '\n';
          var toDisk = /*#__PURE__*/function () {
            var _ref3 = _asyncToGenerator(function* (thefile) {
              //@todo transform this whole block into a function (so .grouped) can also called it per file
              this.debug('processing node ' + thefile.title); //, thefile
              var page = this.x_state.pages[thefile.title];
              var react = yield this.getBasicReact(thefile);
              // @TODO check the react.template replacements (8-mar-21)
              // declare server:asyncData
              this.debug('post-processing internal custom tags');
              yield this.processInternalTags(react, page);
              // closure ...
              // **** **** start script wrap **** **** **** **** 
              var script_imports = '';
              // header for imports
              if (page) {
                // group by key (if multiple of the same pkg)
                var grouped = {};
                for (var var_ in page.imports) {
                  if (!grouped[page.imports[var_]]) grouped[page.imports[var_]] = [];
                  grouped[page.imports[var_]].push(var_);
                }
                for (var key in grouped) {
                  if (key.indexOf('/') != -1 && key.indexOf(grouped[key]) != -1) {
                    // if import key is part of the package key string (and contains a /), then do a direct import
                    script_imports += "import ".concat(grouped[key].join(','), " from '").concat(key, "';\n");
                  } else {
                    script_imports += "import { ".concat(grouped[key].join(','), " } from '").concat(key, "';\n");
                  }
                }
              }
              // ************************************
              // post-process .template
              // process Styles
              react = this.processStyles(react, page);
              // removes refx attributes
              react = this.removeRefx(react);
              //react.template = this.removeSpecialRefx(react.template);
              // apply this as last react.template modification/process
              // decrypt special attributes into react js (so they don't mess with pre-cheerio parsing)
              react = this.decryptSpecialProps(react);
              // ************************************
              // export default
              react.script = "import React from 'react';\n                {concepto:import}\n\n                export const {concepto:name} = ({concepto:attributes}) => {\n                    {concepto:variables}\n                    {concepto:params}\n                    {concepto:init}\n                    {concepto:methods}\n                    return (\n                        <>\n                        {concepto:template}\n                        </>\n                    )\n                }";
              react.script = react.script.replaceAll('{concepto:name}', thefile.file.split('.')[0]);
              react.script = react.script.replaceAll('{concepto:variables}', react.variables);
              react.script = react.script.replaceAll('{concepto:template}', react.template);
              react.script = react.script.replaceAll('{concepto:init}', ''); //@todo
              react.script = react.script.replaceAll('{concepto:methods}', ''); //@todo
              //page.params is only for components not pages
              if (page.params == '' || page.type == 'page') {
                react.script = react.script.replaceAll('{concepto:attributes}', '{ children }');
              } else if (page.type != 'page') {
                var multiparams = page.params;
                if (page.params.indexOf(',') == -1) {
                  multiparams = [page.params];
                  multiparams.push('children');
                  multiparams = multiparams.join(',');
                } else {
                  multiparams = page.params.split(',').push('children').join(',');
                }
                react.script = react.script.replaceAll('{concepto:attributes}', "{ ".concat(multiparams, " }"));
              }
              // add support for page params
              var pageParams = '';
              if (page.type == 'page' && page.params != '') {
                if (!this.x_state.npm['react-router-dom']) this.x_state.npm['react-router-dom'] = '5.3.3';
                script_imports += "import { useLocation } from 'react-router-dom';\n";
                pageParams += "const location_ = useLocation();\n";
                pageParams += "const query_ = new URLSearchParams(location_.search);\n";
                pageParams += "const $params = {};\n";
                page.params.split(',').map(function (param) {
                  pageParams += "$params['".concat(param, "'] = query_.get('").concat(param, "')");
                  if (page.defaults && page.defaults[param]) {
                    pageParams += " || '".concat(page.defaults[param], "'");
                  }
                  pageParams += ";\n";
                });
              } else if (page.params != '') {
                //remap each prop argument to $params
                pageParams += "const $params = {};\n";
                page.params.split(',').map(function (param) {
                  pageParams += "$params['".concat(param, "'] = ").concat(param);
                  if (page.defaults && page.defaults[param]) {
                    pageParams += " || '".concat(page.defaults[param], "'");
                  }
                  pageParams += ";\n";
                });
              }
              react.script = react.script.replaceAll('{concepto:params}', pageParams); //@todo
              // create page styles if any
              if (Object.keys(page.styles).length > 0) {
                // create file @styles/{thefile.file.replaceAll('.js','.type.css')}
                var page_css = r(page.styles);
                var page_import = thefile.file.replaceAll('.js', ".module.css");
                var page_css_file = '';
                if (page.type == 'page') {
                  page_css_file = this.g("@pages/".concat(page_import));
                  script_imports += "import $styles from './".concat(page_import, "';\n");
                } else {
                  page_css_file = this.g("@components/".concat(page_import));
                  script_imports += "import $styles from './".concat(page_import, "';\n");
                }
                yield this.writeFile(page_css_file, page_css);
                // add to script_imports
                //this.debug('CSS the file',thefile.file);
              }
              // add imports
              react.script = react.script.replaceAll('{concepto:import}', script_imports);
              // **** **** end script wrap **** **** 
              // process Mixins
              //-23nov22- react = this.processMixins(react, page);
              // process Styles
              //-23nov22- react = this.processStyles(react, page);
              // fix {vuepath:} placeholders
              //-23nov22- react = this.fixVuePaths(react, page);
              // process lang files (po)
              //-23nov22- react = await this.processLangPo(react, page);
              // ********************************** //
              // beautify the script and template
              // ********************************** //
              //react.script = '<script>\n' + react.script + '\n</script>';
              if (!react.style) react.style = '';
              //react.full = `${react.template}\n${react.script}\n${react.style}`;
              react.full = react.script;
              // ********************************** //
              // write files
              if (page.type == 'page') {
                //let w_path = path.join(this.x_state.dirs.pages, thefile.file);
                this.x_console.outT({
                  message: "writing react 'page' file ".concat(thefile.file),
                  color: 'cyan'
                });
                yield this.writeFile(this.g("@pages/".concat(thefile.file)), react.full);
              } else if (page.type == 'component') {
                this.x_console.outT({
                  message: "writing react 'component' file ".concat(thefile.file),
                  color: 'cyan'
                });
                yield this.writeFile(this.g("@components/".concat(thefile.file)), react.full);
              }
              //
              //this.x_console.out({ message: 'vue ' + thefile.title, data: { vue, page_style: page.styles } });
            });
            return function (_x4) {
              return _ref3.apply(this, arguments);
            };
          }().bind(_this28);
          //
          if (_thefile2.file.split('.').slice(-1) == 'omit') ; else if (_thefile2.file.includes('.group') == true) {
            yield* function* () {
              _this28.x_console.outT({
                message: "segmenting 'group' file ".concat(_thefile2.file),
                color: 'cyan'
              });
              //console.log('@TODO pending support for "grouped" components');
              //extract react_file tags
              _this28.debug('processing group ' + _thefile2.file + ' of files', _thefile2);
              var cheerio = require('cheerio');
              var $ = cheerio.load(_thefile2.code, {
                ignoreWhitespace: false,
                xmlMode: true,
                decodeEntities: false
              });
              var files_ = $("react_file").toArray();
              var tobe_created = [];
              files_.map(function (file_) {
                var cur = $(file_);
                cur.attr('title') ? cur.attr('title') : '';
                var node_id = cur.attr('node_id') ? cur.attr('node_id') : '';
                var code = cur.html();
                tobe_created.push({
                  id: node_id,
                  code: code,
                  valid: true,
                  error: false,
                  hasChildren: true,
                  open: '',
                  close: '',
                  x_ids: ''
                });
              });
              for (var tobe of tobe_created) {
                var the_node = yield _this28.dsl_parser.getNode({
                  id: tobe.id,
                  recurse: false
                });
                tobe.title = yield _this28.onDefineTitle(the_node);
                tobe.file = yield _this28.onDefineFilename(the_node);
                //console.log('to create ',tobe);
                //console.log('the page',this.x_state.pages[tobe.title]);
                //process.exit(0);
                yield toDisk(tobe);
              }
              //await this.processOmitFile(thefile);
              //expand 'grouped' pages a sub-process them
            }();
          } else {
            yield toDisk(_thefile2);
          }
          //this.x_console.out({ message:'pages debug', data:this.x_state.pages });
          yield _this28.setImmediatePromise(); //@improved
        }
        // *************************
        // copy/write related files
        // *************************
        // copy static required files for known NPMs packages (gif.js) @TODO improve this ugly hack  
        //this.x_state.npm['gif.js'] = '*';
        /*if (this.x_state.npm['gif.js']) {
            this.x_console.outT({ message: `downloading required gif.worker.js file for gif.js npm package`, color: 'yellow' });
            let fetch = require('node-fetch');
            let static_path = path.join(this.x_state.dirs.static, 'gif.worker.js');
            let worker = await fetch('https://raw.githubusercontent.com/jnordberg/gif.js/master/dist/gif.worker.js');
            let contenido = await worker.text();
            await fs.writeFile(static_path, contenido, 'utf-8');
        }*/
        // create React template structure
        //-await this.createVueXStores();
        //-await this.createServerMethods();
        //-await this.createMiddlewares();
        //create server files (nuxt express, mimetypes)
        //-await this.prepareServerFiles();
        yield _this28.createSystemFiles(processedNodes);
        //@todo 23nov22 create method for declaring default mf files structure
        //declare required plugins
        //-await this.installRequiredPlugins();
        //create NuxtJS plugin definition files
        //-let nuxt_plugs = await this.createNuxtPlugins(); //return plugin array list for nuxt.config.js
        //-this.x_state.nuxt_config.plugins = nuxt_plugs.nuxt_config;
        //-this.x_state.nuxt_config.css = nuxt_plugs.css_files;
        //create package.json
        yield _this28.createPackageJSON();
        //create storybook related files
        //await this.createStorybookFiles();
        //create VSCode helpers
        yield _this28.createVSCodeHelpers();
        //create serverless.yml for deploy:sls - cfc:12881
        //-await this.createServerlessYML();
        // execute deploy (npm install, etc) - moved to onEnd
        // copy assets
        //this.debug('DEBUG assets',this.x_state.assets);
        if (Object.keys(_this28.x_state.assets).length > 0) {
          _this28.debug({
            message: "Copying assets",
            color: 'cyan'
          });
          var _copy = require('recursive-copy');
          for (var i in _this28.x_state.assets) {
            //@TODO add support for i18n assets
            var asset = _this28.x_state.assets[i];
            if (!asset.i18n) {
              var source = path.join(_this28.x_state.dirs.base, asset.original);
              var target = path.join(_this28.x_state.dirs.assets, asset.original.split('/').slice(-1)[0]);
              //this.debug({ message: `Copying asset`, data:{source,target}, color:'cyan'});
              try {
                yield _copy(source, target, {
                  overwrite: true
                });
              } catch (e) {}
            }
            yield _this28.setImmediatePromise(); //@improved
          }

          _this28.debug({
            message: "Copying assets ready",
            color: 'cyan'
          });
        }
        //
      })();
    }

    // ************************
    // INTERNAL HELPER METHODS 
    // ************************

    /*
     * Returns true if a local server is running on the DSL defined port
     */
    _isLocalServerRunning() {
      var _this29 = this;
      return _asyncToGenerator(function* () {
        var is_reachable = require('is-port-reachable');
        var resp = yield is_reachable(_this29.x_state.central_config.port);
        return resp;
      })();
    }

    /*
     * Reads the node called modelos and creates tables definitions and managing code (alias:database).
     */
    _readModels() {
      var _this30 = this;
      return _asyncToGenerator(function* () {
        // @IDEA this method could return the insert/update/delete/select 'function code generators'
        // @TODO refactor this for react - AlaSQL in react; should live within a ContextProvider
        _this30.debug('_readModels');
        _this30.debug_time({
          id: 'readModels'
        });
        var modelos = yield _this30.dsl_parser.getNodes({
          text: 'models',
          level: 2,
          icon: 'desktop_new',
          recurse: true
        }); //nodes_raw:true	
        var tmp = {
            appname: _this30.x_state.config_node.name
          },
          fields_map = {};
        var resp = {
          tables: {},
          attributes: {},
          length: 0,
          doc: ''
        };
        // map our values to real database values 
        var type_map = {
          id: {
            value: 'INT AUTOINCREMENT PRIMARY KEY',
            alias: ['identificador', 'autoid', 'autonum', 'key']
          },
          string: {
            value: 'STRING',
            alias: ['varchar', 'string', 'text']
          },
          int: {
            value: 'INTEGER',
            alias: ['numero chico', 'small int', 'numero']
          },
          float: {
            value: 'FLOAT',
            alias: ['decimal', 'real']
          },
          boolean: {
            value: 'BOOLEAN',
            alias: ['boleano', 'true/false']
          },
          date: {
            value: 'DATEONLY',
            alias: ['fecha']
          },
          datetime: {
            value: 'DATETIME',
            alias: ['fechahora']
          },
          blob: {
            value: 'BLOB',
            alias: ['binario', 'binary']
          }
        };
        // expand type_map into fields_map
        Object.keys(type_map).map(function (x) {
          var aliases = type_map[x].alias;
          aliases.push(x);
          aliases.map(y => {
            fields_map[y] = type_map[x].value;
          });
        });
        // parse nodes into tables with fields
        if (modelos.length > 0) {
          //modelos[0].attributes.map(x=>{ resp.attributes={...resp.attributes,...x} }); //modelos attributes
          resp.attributes = _objectSpread2({}, modelos[0].attributes);
          resp.doc = modelos[0].text_note;
          resp.length = modelos[0].nodes.length;
          for (var table of modelos[0].nodes) {
            var fields = _objectSpread2({}, table.attributes); //table.attributes.map(x=>{ fields={...fields,...x} }); //table attributes
            resp.tables[table.text] = {
              fields: {}
            }; //create table
            tmp.sql_fields = [];
            for (var field in fields) {
              resp.tables[table.text].fields[field] = fields_map[fields[field]]; //assign field with mapped value
              tmp.sql_fields.push(field + ' ' + fields_map[fields[field]]);
            }
            resp.tables[table.text].sql = "CREATE TABLE ".concat(table.text, "(").concat(tmp.sql_fields.join(','), ")");
            yield _this30.setImmediatePromise(); //@improved
          }
        }

        _this30.debug_timeEnd({
          id: 'readModels'
        });
        // install alaSQL plugin and define tables
        if (resp.length > 0) {
          // get tables sql create
          var ala_create = [];
          for (var _table in resp.tables) {
            ala_create.push("alasqlJs('".concat(resp.tables[_table].sql, "');"));
          }
          // set custom install code
          "const alasql = {\n\t\t\t\tinstall (v) {\n\t\t\t\t\t// create tables from models\n\t\t\t\t\t".concat(ala_create.join('\n'), "\n\t\t\t\t\tVue.prototype.alasql = alasqlJs;\n\t\t\t\t}\n\t\t\t}");
          /*
          // set plugin info in state
          this.x_state.plugins['../../node_modules/alasql/dist/alasql.min.js'] = {
              global: true,
              npm: {
                  alasql: '*'
              },
              var: 'alasqlJs',
              mode: 'client',
              customvar: 'alasql',
              custom: ala_custom
          };*/
        }
        // return 
        return resp;
      })();
    }

    /*
     * Reads main theme node, and returns object with info
     */
    _readTheme() {
      var _this31 = this;
      return _asyncToGenerator(function* () {
        var resp = {
            palette: {}
          };
          require('path');
        _this31.debug('_readTheme');
        _this31.debug_time({
          id: '_readTheme'
        });
        var theme = yield _this31.dsl_parser.getNodes({
          text: 'theme',
          level: 2,
          icon: 'desktop_new',
          recurse: true
        }); //nodes_raw:true
        if (theme.length > 0) {
          theme = theme[0];
          resp.palette = theme.attributes;
          for (var child of theme.nodes) {
            if (child.bgcolor != '') {
              // assume it's a color
              // & merge with child attributes (ex. dark:another_color )
              resp.palette[child.text] = deepMerge({
                main: child.bgcolor.toUpperCase()
              }, child.attributes);
            }
          }
        }
        _this31.debug_timeEnd({
          id: '_readTheme'
        });
        return resp;
      })();
    }

    /*
     * Reads main style node, and returns object with info
     */
    _readStyle() {
      var _this32 = this;
      return _asyncToGenerator(function* () {
        var resp = {},
          path = require('path');
        _this32.debug('_readStyle');
        _this32.debug_time({
          id: '_readStyle'
        });
        var style = yield _this32.dsl_parser.getNodes({
          text: 'styles',
          level: 2,
          icon: 'desktop_new',
          recurse: true
        }); //nodes_raw:true
        if (style.length > 0) {
          style = style[0];
          for (var child of style.nodes) {
            if (child.link != '') {
              // if it's a link, test if it's a font -> extensions: .ttf, .otf, .woff, .woff2
              var ext = path.extname(child.link);
              if (['.ttf', '.otf', '.woff', '.woff2'].indexOf(ext) > -1) {
                // it's a font; add style to resp object
                if (!resp['@font-face']) resp['@font-face'] = [];
                // get file from path
                var file = path.basename(child.link);
                resp['@font-face'].push({
                  fontFamily: child.text,
                  src: "url('../assets/".concat(file, "')")
                });
                // add to this.x_state.assets object (original) to be copied to dist
                _this32.x_state.assets[child.link] = {
                  original: child.link // needs to be relative
                };
              }
            }
            /*
            if (child.bgcolor!='') {
                // assume it's a color
                // & merge with child attributes (ex. dark:another_color )
                resp.palette[child.text] = deepMerge({ main:child.bgcolor.toUpperCase() },child.attributes);
            }*/
          }
        }

        _this32.debug_timeEnd({
          id: '_readStyle'
        });
        return resp;
      })();
    }

    /*
     * Reads assets node, and returns object with info
     */
    _readAssets() {
      var _this33 = this;
      return _asyncToGenerator(function* () {
        var resp = {},
          path = require('path');
        _this33.debug('_readAssets');
        _this33.debug_time({
          id: '_readAssets'
        });
        var assets = yield _this33.dsl_parser.getNodes({
          text: 'assets',
          level: 2,
          icon: 'desktop_new',
          recurse: true
        }); //nodes_raw:true
        var sep = path.sep;
        //
        //this.debug('assets search',assets);
        if (assets.length > 0) {
          assets = assets[0];
          // 15ms full
          for (var child of assets.nodes) {
            if (child.nodes.length == 1 && child.nodes[0].image != '') {
              // if there is just 1 grand-child and has an image defined
              resp[child.text.toLowerCase()] = {
                i18n: false,
                original: child.nodes[0].image,
                css: '~assets' + sep + path.basename(child.nodes[0].image),
                js: '~' + sep + 'assets' + sep + path.basename(child.nodes[0].image)
              };
            } else if (child.nodes.length > 1) {
              // if child has more than 1 child (grandchild), we'll assume its an image with i18n alternatives
              var key = child.text.toLowerCase();
              resp[key] = {
                i18n: true,
                i18n_keys: []
              };
              for (var i18n_node of child.nodes) {
                // expand node attributes
                var attrs = _objectSpread2({}, i18n_node.attributes);
                /*i18n_node.attributes.map(function(x) {
                	attrs = {...attrs,...x};
                });*/
                if (attrs.idioma && i18n_node.image != '') {
                  var lang = attrs.idioma.toLowerCase();
                  resp[key].i18n_keys.push(lang);
                  resp[key][lang] = {
                    original: i18n_node.image,
                    css: '~assets' + sep + path.basename(i18n_node.image),
                    js: '~' + sep + 'assets' + sep + path.basename(i18n_node.image)
                  };
                }
              }
              // transform i18n_keys to list
              resp[key].i18n_keys = resp[key].i18n_keys.join(',');
            } else if (child.link != '') {
              resp[child.text.toLowerCase()] = {
                original: child.link,
                css: '~assets' + sep + path.basename(child.link),
                js: '~' + sep + 'assets' + sep + path.basename(child.link)
              };
            }
            //console.log('child of asset '+assets.text,child);
          }
          // 12ms full
          /*let children = await assets.getNodes();
          for (let child of children) {
          	console.log('child of asset '+assets.text,children);
          }*/
        }

        _this33.debug_timeEnd({
          id: '_readAssets'
        });
        return resp;
      })();
    }

    /* 
     * Grabs central node configuration information
     */
    _readCentralConfig() {
      var _this34 = this;
      return _asyncToGenerator(function* () {
        _this34.debug('_readCentralConfig');
        var central = yield _this34.dsl_parser.getNodes({
          level: 1,
          recurse: false
        });
        //this.debug('central search',central);
        // set defaults
        var resp = {
          port: 3000,
          git: true,
          ui: 'mui',
          langs: 'en',
          cloud: 'aws',
          type: 'simple',
          i18n: false,
          log: 'console',
          debug: false,
          deploy: false,
          static: false,
          timeout: 30,
          modelos: 'aurora',
          models: 'aurora',
          component: false,
          storybook: false,
          shared: false,
          'keep-alive': true,
          'keep-warm': true,
          ':cache': _this34.x_config.cache,
          ':mode': 'spa',
          ':keywords': '',
          ':author': 'Punto Origen SpA',
          ':license': 'MIT',
          ':github': '',
          ':version': '1.0.0',
          ':description': central[0].text_note,
          default_face: central[0].font.face,
          default_size: central[0].font.size,
          apptitle: central[0].text.replace(' ', '_')
        };
        // overwrite default resp with info from central node
        //resp = {...resp, ...central[0].attributes };
        //bit slower but transforms string booleans (19-4-21)
        var values = {};
        for (var xz in central[0].attributes) {
          var x = central[0].attributes[xz];
          if (x == 'true') {
            x = true;
          } else if (x == 'false') {
            x = false;
          }
          values = _objectSpread2(_objectSpread2({}, values), {
            [xz]: x
          });
        }
        resp = _objectSpread2(_objectSpread2({}, resp), values);
        /*central[0].attributes.map(function(x) {
        	resp = {...resp,...x};
        });*/
        if (resp.dominio) {
          resp.service_name = resp.dominio.replace(/\./g, '').toLowerCase();
        } else {
          resp.service_name = resp.apptitle;
        }
        if (!resp[':cache']) _this34.x_config.cache = false; // disables cache when processing nodes (@todo)
        // test if whole project is 'shared' (has a star on the central node)
        if (central[0].icons.includes('bookmark') == true) resp.shared = true;
        // return
        return resp;
      })();
    }

    /* helper for readConfig and secrets extraction */
    configFromNode(resp, key) {
      if (key.icons.includes('button_cancel') == false) {
        if (Object.keys(key.attributes).length > 0) {
          // prepare config key
          var config_key = key.text.toLowerCase().replace(/ /g, '');
          //alt1 let values = {...key.attributes }; 
          //alt2, bit slower but considers booleans as string
          var values = {};
          for (var xz in key.attributes) {
            var x = key.attributes[xz];
            if (x == 'true') {
              x = true;
            } else if (x == 'false') {
              x = false;
            }
            values = _objectSpread2(_objectSpread2({}, values), {
              [xz]: x
            });
          }
          resp[config_key] = values;
          // mark secret status true if contains 'password' icon
          if (key.icons.includes('password')) {
            resp[config_key][':secret'] = true;
            if (!resp['::secrets']) resp['::secrets'] = [];
            resp['::secrets'].push(key); //add key as secret
          }
          // add link attribute if defined
          if (key.link != '') resp[config_key][':link'] = key.link;
        } else if (key.nodes.length > 0) {
          resp[key.text] = key.nodes[0].text;
        } else if (key.link != '') {
          resp[key.text] = key.link;
        }
        //
        if (key.text == ':secrets' && key.icons.includes('password')) {
          resp[':secrets'] = key.text_note.replaceAll('\n', '').trim();
        }
      }
      return resp;
    }

    /*
     * Grabs the configuration from node named 'config'
     */
    _readConfig() {
      var _arguments3 = arguments,
        _this35 = this;
      return _asyncToGenerator(function* () {
        var delete_secrets = _arguments3.length > 0 && _arguments3[0] !== undefined ? _arguments3[0] : true;
        _this35.debug('_readConfig');
        var resp = {
            id: '',
            meta: [],
            seo: {},
            secrets: {}
          },
          config_node = {};
        var search = yield _this35.dsl_parser.getNodes({
          text: 'config',
          level: 2,
          icon: 'desktop_new',
          recurse: true
        });
        //this.debug({ message:'search says',data:search, prefix:'_readConfig,dim' });
        //
        if (search.length > 0) {
          config_node = search[0];
          // define default font_face
          if (!delete_secrets) resp[':id'] = config_node.id;
          resp.default_face = config_node.font.face;
          resp.default_size = config_node.font.size;
          // apply children nodes as keys/value for resp
          for (var key of config_node.nodes) {
            if (key.text.toLowerCase() == 'meta') {
              for (var meta_child of key.nodes) {
                // apply grand_childs as meta tags
                if (meta_child.text.toLowerCase() == 'keywords') {
                  resp.seo['keywords'] = meta_child.nodes.map(x => x.text);
                  resp.meta.push({
                    hid: yield _this35.hash(meta_child.nodes[0].text),
                    name: 'keywords',
                    content: resp.seo['keywords'].join(',')
                  });
                } else if (meta_child.text.toLowerCase() == 'language') {
                  resp.seo['language'] = meta_child.nodes[0].text;
                  resp.meta.push({
                    hid: yield _this35.hash(meta_child.nodes[0].text),
                    lang: meta_child.nodes[0].text
                  });
                } else if (meta_child.text.toLowerCase() == 'charset') {
                  resp.seo['charset'] = meta_child.nodes[0].text;
                  resp.meta.push({
                    charset: meta_child.nodes[0].text
                  });
                } else {
                  resp.seo['charset'] = meta_child.nodes[0].text;
                  if (meta_child.text.indexOf(':') != -1) {
                    resp.meta.push({
                      property: meta_child.text,
                      vmid: meta_child.text,
                      content: meta_child.nodes[0].text
                    });
                  } else {
                    resp.meta.push({
                      hid: yield _this35.hash(meta_child.nodes[0].text),
                      name: meta_child.text,
                      content: meta_child.nodes[0].text
                    });
                  }
                }
                //
              }
            } else {
              // apply keys as config keys (standard config node by content types)
              resp = _objectSpread2(_objectSpread2({}, resp), _this35.configFromNode(resp, key));
              //
            }
          }
          //map values that reference other nodes[attr]
          var safe_eval = require('safe-eval');
          var resp2 = JSON.parse(JSON.stringify(resp));
          var central2 = JSON.parse(JSON.stringify(_this35.x_state.central_config));
          for (var _key4 in resp) {
            if (typeof resp[_key4] === 'object') {
              for (var key2 in resp[_key4]) {
                if (typeof resp[_key4][key2] === 'string' && resp[_key4][key2].indexOf('${') != -1 && resp[_key4][key2].indexOf('}') != -1) {
                  var to_eval = resp[_key4][key2];
                  to_eval = to_eval.replaceAll('${', "'+").replaceAll('}', "+'");
                  to_eval = "'" + to_eval + "'";
                  if (central2.deploy != 'local') central2.deploy = 'deploy';
                  var eval_ = safe_eval(to_eval, {
                    config: resp2,
                    central: central2
                  });
                  resp[_key4][key2] = eval_;
                  //console.log('config evaluated',{ to_eval,raw:resp[key][key2], eval_ });
                }
              }
            }
          }
        }
        // assign dsl file folder name+filename if node.name is not given
        if (!resp.name) {
          var path = require('path');
          var dsl_folder = path.dirname(path.resolve(_this35.x_flags.dsl));
          var parent_folder = path.resolve(dsl_folder, '../');
          var folder = dsl_folder.replace(parent_folder, '');
          resp.name = folder.replace('/', '').replace('\\', '') + '_' + path.basename(_this35.x_flags.dsl, '.dsl');
          //console.log('folder:',{folder,name:resp.name});
          //this.x_flags.dsl
        }
        // create id if not given
        if (!resp.id) resp.id = 'com.puntorigen.' + resp.name;
        // *********************************************
        if (delete_secrets == true) delete resp[':secrets'];
        return resp;
      })();
    }
    getParentNodes() {
      var _arguments4 = arguments,
        _this36 = this;
      return _asyncToGenerator(function* () {
        var id = _arguments4.length > 0 && _arguments4[0] !== undefined ? _arguments4[0] : _this36.throwIfMissing('id');
        var exec = _arguments4.length > 1 && _arguments4[1] !== undefined ? _arguments4[1] : false;
        var parents = yield _this36.dsl_parser.getParentNodesIDs({
          id,
          array: true
        });
        var resp = [];
        for (var parent_id of parents) {
          var node = yield _this36.dsl_parser.getNode({
            id: parent_id,
            recurse: false
          });
          var command = yield _this36.findValidCommand({
            node,
            object: exec
          });
          if (command) resp.push(command);
          yield setImmediatePromise(); //@improved
        }

        return resp;
      })();
    }

    //gets the asset code for a given string like: assets:assetname
    getAsset() {
      var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.throwIfMissing('text');
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'js';
      //this.x_state.assets
      var resp = text.replaceAll('assets:', ''),
        type_o = type.replaceAll('jsfunc', 'js').toLowerCase();
      if (text.includes('assets:')) {
        if (resp in this.x_state.assets) {
          if (this.x_state.central_config.idiomas.indexOf(',') != -1 && this.x_state.assets[resp].i18n == true) {
            var first_key = this.x_state.assets[resp].i18n_keys.split(',')[0];
            resp = this.x_state.assets[resp][first_key][type_o];
            if (type.toLowerCase() == 'js') {
              resp = resp.replaceAll("/".concat(first_key, "/"), "/' + $i18n.locale + '/");
              resp = "require('".concat(resp, "')");
            } else if (type.toLowerCase() == 'jsfunc') {
              resp = resp.replaceAll("/".concat(first_key, "/"), "/' + this.$i18n.locale + '/");
              resp = "require('".concat(resp, "')");
            }
          } else if (resp in this.x_state.assets && type_o in this.x_state.assets[resp]) {
            resp = this.x_state.assets[resp][type_o];
            if (type_o == 'js') {
              resp = "require('".concat(resp, "')");
            }
          } else ;
        }
      }
      return resp;
    }

    //vue attributes tag version
    struct2params() {
      var struct = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.throwIfMissing('id');
      var resp = [],
        tmp = _objectSpread2({}, struct);
      // pre-process
      if ('aos' in tmp) {
        var aos_p = struct['aos'].split(',');
        if (aos_p.length == 3) {
          tmp['data-aos'] = aos_p[0];
          tmp['data-aos-duration'] = aos_p[1];
          tmp['data-aos-delay'] = aos_p[2];
        } else {
          tmp['data-aos'] = aos_p[0];
          tmp['data-aos-duration'] = aos_p[1];
        }
        delete tmp['aos'];
      }
      // process
      for (var [key, value] of Object.entries(tmp)) {
        if (value == null) {
          //needed cause cheerio assigns empty values to props, and vue props don't have values
          //little hack that works together with writeFile method
          resp.push("".concat(key, "=\"xpropx\""));
        } else if (typeof value !== 'object' && typeof value !== 'function' && typeof value !== 'undefined') {
          this.debug('typeof value', typeof value);
          if (key[0] == ':') {
            //serialize value
            //this.debug('struct2params',{key,value});
            var encrypt = require('encrypt-with-password');
            var val = encrypt.encryptJSON(value, '123');
            resp.push("".concat(key.replaceAll(':', ''), "_encrypt=\"").concat(val, "\""));
          } else if (typeof value === 'string' && (value.indexOf('$params.') != -1 || value.indexOf('$styles.') != -1 || value.indexOf('$variables.') != -1)) {
            //serialize value
            //this.debug('struct2params',{key,value});
            var _encrypt = require('encrypt-with-password');
            var _val = _encrypt.encryptJSON(value, '123');
            resp.push("".concat(key, "_encrypt=\"").concat(_val, "\""));
          } else {
            resp.push("".concat(key, "=\"").concat(value, "\""));
          }
        } else if (typeof value === 'object') {
          //serialize value
          var _encrypt2 = require('encrypt-with-password');
          var _val2 = _encrypt2.encryptJSON(this.jsDump(value), '123');
          resp.push("".concat(key, "_encrypt=\"").concat(_val2, "\""));
        }
      }
      return resp.join(' ');
    }

    //serializes the given obj escaping quotes from values containing js code
    jsDump(obj) {
      var resp = '';
      var isNumeric = function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
      };
      var escape = function escape(obi) {
        var nuevo = '',
          ob = obi;
        //special escapes first
        if (typeof ob === 'string' && ob == '{null}') ob = null;
        if (typeof ob === 'string') ob = ob.replaceAll('{now}', 'new Date()');
        //
        if (typeof ob === 'number') {
          nuevo += ob;
        } else if (ob == null) {
          nuevo = null;
        } else if (typeof ob === 'boolean') {
          nuevo += ob;
        } else if (typeof ob === 'string' && ob.substr(0, 2) == '**' && ob.substr(ob.length - 2) == '**') {
          nuevo += ob.replaceAll('**', ''); //escape single ** vars 21-abr-21
        } else if (typeof ob === 'string' && (ob.charAt(0) == '!' || ob.indexOf('this.') != -1 || ob.indexOf('new ') != -1 || ob.indexOf('require(') != -1 || ob.indexOf("'") != -1 || ob.indexOf('`') != -1 || ob.charAt(0) != '0' && isNumeric(ob) || ob.charAt(0) == '[' && ob.charAt(ob.length - 1) == ']' || ob == '0' || ob == 'true' || ob == 'false')) {
          nuevo += ob;
        } else if (!isNaN(ob) && ob.toString().indexOf('.') != -1) {
          nuevo += ob;
        } else if (typeof ob === 'string') {
          nuevo += "'".concat(ob, "'");
        } else {
          nuevo += ob;
        }
        return nuevo;
      };
      if (Array.isArray(obj)) {
        var tmp = [];
        var resx = '[';
        for (var item in obj) {
          tmp.push(this.jsDump(obj[item]));
          if (resx == '[') {
            resx += tmp[item];
          } else {
            resx += ',' + tmp[item];
          }
        }
        resp = resx + ']';
        //resp = `[${tmp.join(',')}]`;
      } else if (typeof obj === 'object' && obj != null) {
        var _tmp = [];
        //23feb22 test if object if regEx type
        if (obj.toString()[0] == '/' && obj.toString()[obj.toString().length - 1] == '/') {
          //regEx type
          resp = obj.toString();
        } else {
          //
          for (var llave in obj) {
            var llavet = llave;
            if (llavet.includes('-') && llavet.includes("'") == false) llavet = "'".concat(llave, "'");
            if (llavet.includes('&') && llavet.includes("'") == false) llavet = "'".concat(llave, "'");
            if (llavet.includes(':') && llavet.includes("'") == false) llavet = "'".concat(llave, "'");
            var nuevo = "".concat(llavet, ": ");
            var valor = obj[llave];
            if (typeof valor === 'object' || Array.isArray(valor)) {
              nuevo += this.jsDump(valor);
            } else {
              nuevo += escape(valor);
            }
            _tmp.push(nuevo);
          }
          resp = "{\n".concat(_tmp.join(','), "\n}");
        }
      } else if (typeof obj === 'string') {
        resp = escape(obj);
      } else {
        resp = obj;
      }
      return resp;
    }

    // hash helper method
    hash(thing) {
      var _this37 = this;
      return _asyncToGenerator(function* () {
        var resp = yield _this37.dsl_parser.hash(thing);
        /*const {sha1} = require('crypto-hash');
        let resp = await sha1(thing,{ outputFormat:'hex' });*/
        return resp;
      })();
    }
    /*
    hash(thing) {
        // returns a hash of the given object, using google highwayhash (fastest)
        //this.debug_time({ id:`hash ${thing}` });
        const highwayhash = require('highwayhash');
        let input;
        if (typeof thing === 'string') {
            input = Buffer.from(thing);
        } else if (typeof thing === 'object') {
            // serialize object into buffer first
            input = Buffer.from(JSON.stringify(thing));
        }
        let resp = highwayhash.asHexString(this.x_crypto_key, input);
        //this.debug_timeEnd({ id:`hash ${thing}` });;
        return resp;
    }*/

    // atLeastNode
    atLeastNode(r) {
      var n = process.versions.node.split('.').map(x => parseInt(x, 10));
      r = r.split('.').map(x => parseInt(x, 10));
      return n[0] > r[0] || n[0] === r[0] && (n[1] > r[1] || n[1] === r[1] && n[2] >= r[2]);
    }
    setImmediatePromise() {
      //for preventing freezing node thread within loops (fors)
      return new Promise(resolve => {
        setImmediate(() => resolve());
      });
    }
  }

  return react_dsl;

}));
