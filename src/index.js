const concepto = require('@concepto/interface');
//import { timingSafeEqual } from 'crypto';
//import { isContext, runInThisContext } from 'vm';
//import concepto from '../../concepto/src/index'
/**
 * Concepto REACT DSL Class: A class for compiling react.dsl Concepto diagrams into MF+ReactJS WebApps.
 * @name 	react_dsl
 * @module 	react_dsl
 **/
//import internal_commands from './commands'
import deploy_local from './deploys/local'
import deploy_remote from './deploys/remote'
import deploy_eb from './deploys/eb'
import deploy_s3 from './deploys/s3'
import deploy_ghpages from './deploys/ghpages'
import * as Theme from './ui'
import { stringify } from '@stitches/stringify';

const deepMerge = require('deepmerge');

export default class react_dsl extends concepto {

    constructor(file, config = {}) {
        // we can get class name, from package.json name key (after its in its own project)
        let my_config = {
            class: 'react',
            debug: true
        };
        
        let nuevo_config = {...my_config, ...config };
        super(file, nuevo_config); //,...my_config
        // custom dsl_git version
        this.x_config.dsl_git = async function(content) {
            //save git version
            let tmp = {}, fs = require('fs').promises, path = require('path');
            //SECRETS
            this.x_state.central_config = await this._readCentralConfig();
            this.x_state.config_node = await this._readConfig(false);
            if (this.x_flags.dsl.includes('_git.dsl')) {
                // if file is x_git.dsl, expand secrets
                this.x_console.outT({ message:'we are the git!', color:'green' });
                this.x_state.config_node = await this._restoreSecrets(this.x_state.config_node);
                delete this.x_state.config_node[':id'];
                delete this.x_state.config_node[':secrets'];
                delete this.x_state.config_node['::secrets'];
                //search and erase config->:secrets node
                //this.x_console.out({ message:'config read on git',data:this.x_state.config_node });
            } else {
                // if file is x.dsl,
                // write x_git.dsl
                tmp.dsl_path = path.dirname(path.resolve(this.x_flags.dsl));
                tmp.dsl_git = path.join(tmp.dsl_path,path.basename(this.x_flags.dsl).replace('.dsl','_git.dsl'));
                await fs.writeFile(tmp.dsl_git,content,'utf-8');
                this.debug(`custom dsl_git file saved as: ${tmp.dsl_git}`);
                // export secret keys as :secrets node to eb_git.dsl
                await this._secretsToGIT(this.x_state.config_node);
            }
            //
        }.bind(this);
        //
    }

    // SECRETS helpers (@todo move this to concepto class)
    async _secretsToGIT(resp) {
        let path = require('path'), fs = require('fs').promises;
        let encrypt = require('encrypt-with-password');
        let curr_dsl = path.basename(this.x_flags.dsl);
        // secret nodes to _git.dsl file
        if (resp['::secrets'] && resp['::secrets'].length>0 && !curr_dsl.includes('_git.')) {
            //encrypt existing secret (password) nodes and save them as config->:secrets within _git.dsl file version
            let password = '';
            if (this.x_config.secrets_pass && this.x_config.secrets_pass!='') password = this.x_config.secrets_pass.trim();
            if (password=='') {
                //if a password was not given, invent a memorable one
                let gpass = require('password-generator');
                password = gpass();
                resp[':password'] = password; //inform a pass was created
            }
            //encrypt secrets object
            let to_secrets = encrypt.encryptJSON(resp['::secrets'],password);
            //create :secrets node within x_git.dsl file
            let dsl_parser = require('@concepto/dsl_parser');
			let dsl = new dsl_parser({ file:this.x_flags.dsl.replace('.dsl','_git.dsl'), config:{ cancelled:true, debug:false } });
			try {
				await dsl.process();
			} catch(d_err) {
				this.x_console.out({ message:`error: file ${this.x_flags.dsl.replace('.dsl','_git.dsl')} does't exist!`,data:d_err });
				return;
			}
            let new_content = await dsl.addNode({ parent_id:resp[':id'], node:{
                text:':secrets',
                icons: ['password'],
                text_note: to_secrets
            }});
            let tmp={};
            tmp.dsl_git_path = path.dirname(path.resolve(this.x_flags.dsl));
            let git_target = path.join(tmp.dsl_git_path,path.basename(this.x_flags.dsl).replace('.dsl','_git.dsl')); //,path.basename(this.x_flags.dsl)
            await fs.writeFile(git_target,new_content,'utf-8');
            this.debug(`dsl_git file saved as: ${git_target}`);
            if (resp[':password']) {
                this.x_console.outT({ message:`Password generated for DSL GIT secrets ->${password}`, color:'brightGreen' });
            }
            //
        }
        return resp;
    }
    // restore :secrets node info if it exists and a password was given
    async _restoreSecrets(resp) {
        let path = require('path'), fs = require('fs').promises;
        let encrypt = require('encrypt-with-password');
        let curr_dsl = path.basename(this.x_flags.dsl);
        if (curr_dsl.includes('_git.') && resp[':secrets']) {
            this.x_console.outT({ message:`Secrets node detected!`, color:'brightCyan' });
            if (this.x_config.secrets_pass && this.x_config.secrets_pass!='') {
                this.x_console.outT({ message:'Decrypting config->secrets', color:'brightGreen' });
                try {
                    let from_secrets = encrypt.decryptJSON(resp[':secrets'],this.x_config.secrets_pass);
                    // read nodes into resp struct
                    for (let xs of from_secrets) {
                        resp = {...resp,...this.configFromNode(resp,xs)};
                    }
                    let tmp = {};
                    tmp.dsl_git_path = path.dirname(path.resolve(this.x_flags.dsl));
                    tmp.non_target = path.join(tmp.dsl_git_path,path.basename(this.x_flags.dsl).replace('_git.dsl','.dsl'));
                    tmp.exists_non = await this.exists(tmp.non_target);
                    if (true) { //!tmp.exists_non
                        this.x_console.outT({ message:'Expanding secrets into '+curr_dsl.replace('_git.dsl','.dsl'), color:'cyan' });
                        // expand secret nodes into non _git.dsl version config key
                        let dsl_parser = require('@concepto/dsl_parser');
                        let dsl = new dsl_parser({ file:this.x_flags.dsl, config:{ cancelled:true, debug:false } });
                        try {
                            await dsl.process();
                        } catch(d_err) {
                            this.x_console.out({ message:`error: file ${this.x_flags.dsl} does't exist!`,data:d_err });
                            return;
                        }
                        // remove config->:secrets node if it exists
                        let $ = dsl.getParser();
                        let search = $(`node[TEXT=config] node[TEXT=\:secrets]`).toArray();
                        search.map(function(elem) {
                            $(elem).remove();
                        });
                        //
                        let new_content = '';
                        for (let sn of from_secrets) {
                            new_content = await dsl.addNode({ parent_id:resp[':id'], node:sn });
                        }
                        // save expanded x.dsl file (only if it doesnt exist)
                        await fs.writeFile(tmp.non_target,new_content,'utf-8');
                        this.debug(`recovered dsl file saved as: ${tmp.non_target}`);
                    }
                    //

                } catch(invpass) {
                    //console.log(invpass);
                    this.x_console.outT({ message:'Invalid --secret-pass value for map (check your password)', color:'brightRed' });
                    this.x_console.outT({ message:'WARNING: The process may fail if keys are needed', color:'red' });
                }
            } else {
                this.x_console.outT({ message:'WARNING: file contains secrets, but no --secrets-pass arg was given', color:'brightRed' });
                this.x_console.outT({ message:'WARNING: The process may fail if keys are needed', color:'red' });
            }
        }
        return resp;
    }

    //

    // **************************
    // methods to be auto-called
    // **************************

    //Called after init method finishes
    async onInit() {
        // define and assign commands
        //this.x_console.outT({ message: `React Compiler v${version}`, color: `brightCyan` });
        //await this.addCommands(internal_commands);
        if (Object.keys(this.x_commands).length>0) this.x_console.outT({ message: `${Object.keys(this.x_commands).length} local x_commands loaded!`, color: `green` });
        //this.debug('x_commands',this.x_commands);
        //this.x_crypto_key = require('crypto').randomBytes(32); // for hash helper method
        // init react
        // set x_state defaults
        this.x_state = {...this.x_state,...{
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
            stores_types: { versions: {}, expires: {} },
            nuxt_config: { head_script: {}, build_modules: {}, modules: {} },
        }};
        if (!this.x_state.config_node) this.x_state.config_node = await this._readConfig();
        //this.debug('config_node',this.x_state.config_node);
        this.x_state.central_config = await this._readCentralConfig();
        //if requested silence...
        if (this.x_config.silent) {
            this.x_console.outT({ message: `silent mode requested`, color: `dim` });
            //this.x_console.setSilent(true);
            this.x_config.debug=false;
        }
        //if requested change deploy target
        if (this.x_config.deploy && this.x_config.deploy.trim()!='') {
            this.x_console.outT({ message: `(as requested) force changing deploy target to: ${this.x_config.deploy.trim()}`, color: `brightYellow` });
            this.x_state.central_config.deploy = this.x_config.deploy;
        }
        let compile_folder = this.x_state.central_config.apptitle;
        if (this.x_config.folder && this.x_config.folder.trim()!='') {
            compile_folder = this.x_config.folder.trim();
        }
        if (this.x_config.aws_region && this.x_config.aws_region.trim()!='') {
            if (!this.x_state.config_node.aws) this.x_state.config_node.aws = {}; 
            this.x_state.config_node.aws.region = this.x_config.aws_region.trim();    
        }
        //this.debug('central_config',this.x_state.central_config);
        this.x_state.assets = await this._readAssets();
        this.x_state.theme = await this._readTheme();
        //this.debug('theme_node',this.x_state.theme);
        //this.debug('assets_node',this.x_state.assets);
        let target_folders = {
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
            'secrets': 'secrets',
        };
        this.x_state.dirs = await this._appFolders(target_folders,compile_folder);
        // init x_theme
        //this.debug('xtheme!!',[this.x_state.central_config.ui,Theme.default.base_ui.default]);
        //this.debug('xtheme',Theme);
        if (this.x_state.central_config.ui in Theme) {
            const xtheme = Theme[this.x_state.central_config.ui];
            const x_theme = new xtheme({ context:this });
            //console.log('x_theme',x_theme);
            this.x_theme = new xtheme({ context:this });
        } else {
            const xtheme = Theme.base_ui;
            const x_theme = new xtheme({ context:this });
            //console.log('x_theme',x_theme);
            this.x_theme = x_theme;
        }
        await this.x_theme.install(); // install required npm pkgs
        await this.x_theme.generateAutoComplete(); // add autocomplete definitions
        await this.x_theme.defaultState(); // set theme definitions
        await this.x_theme.addCustomCommands(); // add custom commands of UI
        // read modelos node (DB definitions)
        this.x_state.models = await this._readModels(); //alias: database tables
        //is local server running? if so, don't re-launch it
        this.x_state.next_is_running = await this._isLocalServerRunning();
        this.debug('is Server Running: ' + this.x_state.next_is_running);
        // init terminal diagnostics (not needed here)
        /*if (this.x_state.central_config.next == 'latest' && this.atLeastNode('10') == false) {
            //this.debug('error: You need at least Node v10+ to use latest Next/MUI version!');
            throw new Error('You need to have at least Node v10+ to use latest Next/MUI version!');
        }*/
        this.x_state.es6 = true;
        // copy sub-directories if defined in node 'config.copy' key
        if (this.x_state.config_node.copy) {
            let path = require('path');
            let copy = require('recursive-copy');
            this.x_console.outT({ message: `copying config:copy directories to 'public' target folder`, color: `yellow` });
            await Object.keys(this.x_state.config_node.copy).map(async function(key) {
                let abs = path.join(this.x_state.dirs.base, key);
                try {
                    await copy(abs, this.x_state.dirs.public);
                } catch (err_copy) {
                    if (err_copy.code != 'EEXIST') this.x_console.outT({ message: `error: copying directory ${abs}`, data: err_copy });
                }
                //console.log('copying ',{ from:abs, to:this.x_state.dirs.static });
            }.bind(this));
            this.x_console.outT({ message: `copying config:copy directories ... READY`, color: `yellow` });
            delete this.x_state.config_node.copy;
        }
        // *********************************************
        // install requested modules within config node
        // *********************************************
        // DEFAULT NPM MODULES & PLUGINS if dsl is not 'component' type
        // react_dsl doesn't have 'component' type; any webapp can share components
        this.x_console.outT({ message: `react initialized() ->` });
        this.x_state.npm['@babel/runtime'] = '^7.13.10';
        this.x_state.npm['react'] = '^17.0.2';
        this.x_state.npm['react-dom'] = '^17.0.2';
        this.x_state.npm['react-state-proxy'] = '^1.4.11';
        // axios
        // this.x_state.npm['@nuxtjs/axios'] = '*';
        // default devDependencies
        this.x_state.dev_npm['@babel/core'] = '^7.15.8';
        this.x_state.dev_npm['@babel/plugin-transform-runtime'] = '^7.15.8';
        this.x_state.dev_npm['babel-plugin-direct-import'] = '*'; // '^7.15.8';
        this.x_state.dev_npm['@babel/preset-env'] = '^7.15.8';
        this.x_state.dev_npm['@babel/preset-react'] = '^7.14.5';
        this.x_state.dev_npm['autoprefixer'] = '^10.1.0';
        this.x_state.dev_npm['babel-loader'] = '^8.2.2';
        this.x_state.dev_npm['css-loader'] = '^6.3.0';
        this.x_state.dev_npm['html-webpack-plugin'] = '^5.3.2';
        this.x_state.dev_npm['postcss'] = '^8.2.1';
        this.x_state.dev_npm['postcss-loader'] = '^4.1.0';
        this.x_state.dev_npm['style-loader'] = '^3.3.0';
        this.x_state.dev_npm['webpack'] = '^5.57.1';
        this.x_state.dev_npm['webpack-cli'] = '^4.9.0';
        this.x_state.dev_npm['webpack-dev-server'] = '^4.3.1';

        // serialize 'secret' config keys as json files in app secrets sub-directory (if any)
        // extract 'secret's from config keys; 
        /* */
        this.x_state.secrets={}; //await _extractSecrets(config_node)
        let path = require('path');
        for (let key in this.x_state.config_node) {
            if (typeof key === 'string' && key.includes(':')==false) {
                if (this.x_state.config_node[key][':secret']) {
                    let new_obj = {...this.x_state.config_node[key]};
                    delete new_obj[':secret']
                    if (new_obj[':link']) delete new_obj[':link']
                    // set object keys to uppercase
                    this.x_state.secrets[key]={};
                    let obj_keys = Object.keys(new_obj);
                    for (let x in obj_keys) {
                        this.x_state.secrets[key][x.toUpperCase()] = new_obj[x];
                    }
                    let target = path.join(this.x_state.dirs.secrets, `${key}.json`);
                    await this.writeFile(target,JSON.stringify(new_obj));
                }
            }
        }
        // set config keys as ENV accesible variables (ex. $config.childnode.attributename)
        // @todo move this into a const var in the top of the file
        for (let key in this.x_state.config_node) {
            // omit special config 'reserved' node keys
            if (['aurora', 'vpc', 'aws'].includes(key) && typeof this.x_state.config_node[key] === 'object') {
                Object.keys(this.x_state.config_node[key]).map(function(attr) {
                    this.x_state.envs[`config.${key}.${attr}`] = `process.env.${(key+'_'+attr).toUpperCase()}`;
                }.bind(this));
            }
        }

        // get absolute path for given @file
        this.g = (file) => {
            let res = file;
            if (file[0] == '@') {
                const base = file.split('/')[0].replace('@','');
                const withoutBase = file.replace(`@${base}/`,'');
                if (base in this.x_state.dirs) {
                    res = path.join(this.x_state.dirs[base],withoutBase);
                }
            }
            return res;
        };
        // show this.x_state contents
        //this.debug('x_state says',this.x_state);
    }

    renderTable(title, table, render) {
		//obtain our theme data
        const meta = this.x_commands.meta;
		let theme = {
			table_bgcolor: "#AAD3F3",
			tr0_bgcolor: "#AAD3F3",
			tr_bgcolor: "#AAD3F3",
            tr_inherited_bgcolor: "#C3C3C3",
			cellpadding: 2,
			cellspacing: 0,
		};
		// overwrite with given theme if defined
		let custom_theme = (meta.autocomplete && meta.autocomplete.theme)?meta.autocomplete.theme:{};
		theme = { ...theme, ...custom_theme };
        //********************/
        //RENDER HTML TABLE
        //********************/
        let html = `<table width='100%' border=1 cellspacing=${theme.cellspacing} cellpadding=${theme.cellpadding} bordercolor='${theme.table_bgcolor}'>`;
        let header = Object.keys(table[0]);
        let numHeaders = header.length;
        if (header.includes('inherited_')) {
            numHeaders = numHeaders-1;
        }
        //table title
        html += `<tr bgcolor='${theme.tr0_bgcolor}'>`;
        html += `<td colspan='${numHeaders}' valign='top' align='left'>${title}:</td>`;
        html += `</tr>`;
        //table header
        html += `<tr bgcolor='${theme.tr0_bgcolor}'>`;
        for (let h of header) {
            if (h.indexOf('_')==-1) {
                html += `<td valign='top'><b>${h}</b></td>`;
            }
        }
        html += `</tr>`;
        //table rows
        for (let row in table) {
            if (table[row].inherited_ && table[row].inherited_==true) {
                html += `<tr bgcolor='${theme.tr_inherited_bgcolor}'>`;
            } else {
                html += `<tr bgcolor='${theme.tr_bgcolor}'>`;
            }
            for (let col in table[row]) {
                if (col.indexOf('_')==-1) {
                    html += `<td>${render.placeholders(table[row][col])}</td>`;
                }
            }
            html += `</tr>`;
        }
        //close table
        html += `</table>`;
        return html;
    }

    //overwrite autocomplete HTML generator template
    async autocompleteContentTemplate(record, render) {
		// param record is an autocomplete object for a given item
		// returns the template to show in an autocomplete view
		const keyword = render.placeholders(record.text);
		const hint = render.placeholders(record.hint.replace('\n','<br/>'));
		const attributes = record.attributes;
		const events = (record.events && Object.keys(record.events).length>0)?record.events:{};
		const icons = (record.icons)?record.icons:[];
		const type = (record.type)?record.type:'internal';
		let html = '';
        const renderIcon = (icon) => {
            return `<img src="${icon}.png" align="left" hspace="0" vspace="1" valign="bottom" />&nbsp;`
        };
		for (let icon of icons) {
            html += renderIcon(icon);
		}
		html += `<b>${keyword}</b><br /><br />`;
        if (record.extends_ && record.extends_!='') {
			html += render.placeholders(`Extends {icon:idea}<b>${record.extends_.replaceAll('-private-','')}</b><br/>`);
		}
		html += `${hint}<br /><br />`;
        if (Object.keys(attributes).length>0) {
            html += render.attrs(attributes,renderIcon);
            html += `<br />`;
        }
        const customRender = {
            ...render,
            ...{
                placeholders: (str) => {
                    return render.placeholders(str,renderIcon);
                }
            }
        };
        // add events
        if (Object.keys(events).length>0) {
            let eventsArr = [];
            for (let event in events) {
                // push event object
                eventsArr.push({ 'Name':'{icon:help}'+event, 'Params':(events[event].params)?events[event].params:'', 'Hint':events[event].hint, 'inherited_':events[event].inherited_ });
            }
            const x = this.renderTable(customRender.placeholders('<b>Events</b>'),eventsArr,customRender);
            html += x;
        }
        html += `<br />`;
		//;
		return html;
	}

    //Called after parsing nodes
    async onAfterProcess(processedNode) {
        return processedNode;
    }

    //Called for defining the title of class/page by testing node.
    async onDefineTitle(node) {
        let resp = node.text;
        Object.keys(node.attributes).map(function(i) {
            if (i == 'title' || i == 'titulo') {
                resp = node.attributes[i];
                return false;
            }
        }.bind(this));
        /*
        for (i in node.attributes) {
        	if (['title','titulo'].includes(node.attributes[i])) {
        		resp = node.attributes[i];
        		break;
        	}
        }*/
        return resp;
    }

    //Called for naming filename of class/page by testing node.
    async onDefineFilename(node) {
        let resp = node.text;
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
            } else if (node.text.indexOf('models') != -1) { //@todo rename into 'models'
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
            resp = resp.replaceAll('.js','.group');
        } else {
            //page node (ensure to capitalize first letter)
            resp = resp[0].toUpperCase() + resp.slice(1);
        }
        return resp;
    }

    //Called for naming the class/page by testing node.
    async onDefineNodeName(node) {
        return node.text.replace(' ', '_');
    }

    //Defines template for code given the processedNode of process() - for each level2 node
    async onCompleteCodeTemplate(processedNode) {
        return processedNode;
    }

    //Defines preparation steps before processing nodes.
    async onPrepare() {
        if (Object.keys(this.x_commands).length>0) this.x_console.outT({ message: `${Object.keys(this.x_commands).length} x_commands loaded!`, color: `green` });
        this.deploy_module = { pre:()=>{}, post:()=>{}, deploy:()=>true };
        let deploy = this.x_state.central_config.deploy;
        if (deploy) {
            //@todo need to modify this deployment modules for using dist folder
            deploy += '';
            if (deploy.includes('eb:')) {
                this.deploy_module = new deploy_eb({ context:this });
            } else if (deploy.includes('s3:')) {
                this.deploy_module = new deploy_s3({ context:this }); 

            } else if (deploy=='local') {
                this.deploy_module = new deploy_local({ context:this }); 
                //
            } else if (deploy=='remote') {
                this.deploy_module = new deploy_remote({ context:this });

            } else if (deploy=='ghpages') {
                this.deploy_module = new deploy_ghpages({ context:this });

            } else if (deploy=='localsls') {
                //sls local deployment

            } else if (deploy==true) {
                //sls deploy; use central_config domain for deployment
            }
        }
        await this.deploy_module.pre();
    }

    //Executed when compiler founds an error processing nodes.
    async onErrors(errors) {
        this.errors_found=true;
    }

    //configNode helper
    async generalConfigSetup() {
        //this.x_state.dirs.base
        this.debug('Setting general configuration steps');
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
        if (this.x_state.central_config['langs'].indexOf(',') != -1) {
            this.debug('Defining react-i18n support : module react-i18next (langs)');
            this.x_state.npm['i18next'] = '*';
            this.x_state.nuxt_config.modules['i18next'] = {
                'defaultLocale': this.x_state.central_config['langs'].split(',')[0],
                'vueI18n': { 'fallbackLocale': this.x_state.central_config['langs'].split(',')[0] },
                'detectBrowserLanguage': {
                    'useCookie': true,
                    'alwaysRedirect': true
                },
                locales: [],
                lazy: true,
                langDir: 'lang/'
            };
            let self = this;
            this.x_state.central_config['langs'].split(',').map(function(lang) {
                if (lang == 'es') {
                    self.x_state.nuxt_config.modules['i18next'].locales.push({
                        code: 'es',
                        iso: 'es-ES',
                        file: `${lang}.js`
                    });
                } else if (lang == 'en') {
                    self.x_state.nuxt_config.modules['i18next'].locales.push({
                        code: 'en',
                        iso: 'en-US',
                        file: `${lang}.js`
                    });
                } else {
                    self.x_state.nuxt_config.modules['i18next'].locales.push({
                        code: lang,
                        file: `${lang}.js`
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
    }

    //'serializeComplexAttr' encrypts value to be treated as a complex script within a tag attribute
    // method 'decryptSpecialProps' deserializes them
    serializeComplexAttr(value) {
        const encrypt = require('encrypt-with-password');
        return encrypt.encryptJSON(value,'123');
    };

    //.gitignore helper
    async createGitIgnore() {
        this.debug('writing .gitignore files');
        let fs = require('fs').promises,
            path = require('path');
            this.x_console.out({ message: 'writing /.gitignore file' });
            let git =
                `# Mac System files
.DS_Store
.DS_Store?
_MACOSX/
Thumbs.db
# NPM files
package.json
package-lock.json
node_modules/
# AWS EB files
policy.json
.ebextensions/
.elasticbeanstalk/*
!.elasticbeanstalk/*.cfg.yml
!.elasticbeanstalk/*.global.yml
# REACT files
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Diagnostic reports (https://nodejs.org/api/report.html)
report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
.grunt

# Bower dependency directory (https://bower.io/)
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons (https://nodejs.org/api/addons.html)
build/Release

# Dependency directories
node_modules/
jspm_packages/

# Snowpack dependency directory (https://snowpack.dev/)
web_modules/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next
out

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
# Comment in the public line in if your project uses Gatsby and not Next.js
# https://nextjs.org/blog/next-9-1#public-directory-support
# public

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# yarn v2
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*

# Concepto files
.concepto/
aws_backup.ini
react.dsl
react_diff.dsl
.secrets-pass
store/
${this.x_state.dirs.compile_folder}/`;
            await fs.writeFile(`${this.x_state.dirs.base}.gitignore`, git, 'utf-8'); //.gitignore
        
    }

    //process .omit file 
    async processOmitFile(thefile) {
        //@TODO refactor this 23-nov-22
        //@TODO 13-mar-21 check if .toArray() is needed here (ref processInternalTags method)
        //internal_stores.omit
        let self = this;
        if (thefile.file == 'internal_stores.omit') {
            this.debug('processing internal_stores.omit');
            let cheerio = require('cheerio');
            let $ = cheerio.load(thefile.code, { ignoreWhitespace: false, xmlMode: true, decodeEntities: false });
            let nodes = $(`store_mutation`).toArray();
            nodes.map(function(elem) {
                let cur = $(elem);
                let store = cur.attr('store') ? cur.attr('store') : '';
                let mutation = cur.attr('mutation') ? cur.attr('mutation') : '';
                let params = cur.attr('params') ? cur.attr('params') : '';
                let code = cur.text();
                if (self.x_state.stores[store] && !(':mutations' in self.x_state.stores[store])) {
                    self.x_state.stores[store][':mutations'] = {};
                }
                self.x_state.stores[store][':mutations'][mutation] = { code, params };
            });
        }
        //internal_middleware.omit
        if (thefile.file == 'internal_middleware.omit') {
            this.debug('processing internal_middleware.omit');
            let cheerio = require('cheerio');
            let $ = cheerio.load(thefile.code, { ignoreWhitespace: false, xmlMode: true, decodeEntities: false });
            let nodes = $(`proxy_code`).toArray();
            nodes.map(function(elem) {
                let cur = $(elem);
                let name = cur.attr('name') ? cur.attr('name') : '';
                self.x_state.proxies[name].code = cur.text().trim();
            });
        }
        //server.omit
        if (thefile.file == 'server.omit') {
            this.debug('processing server.omit');
            let cheerio = require('cheerio');
            let $ = cheerio.load(thefile.code, { ignoreWhitespace: false, xmlMode: true, decodeEntities: false });
            let nodes = $(`func_code`).toArray();
            nodes.map(function(elem) {
                let cur = $(elem);
                let name = cur.attr('name') ? cur.attr('name') : '';
                self.x_state.functions[name].code = cur.text().trim();
            });
        }
    }

    async getComponentStory(thefile) {
        // {component}.stories.js file
        // @TODO 23-nov-22 refactor this
        let js = { script: '', style: '', first: false };
        let page = this.x_state.pages[thefile.title];
        let camel = require('camelcase');
        if (page) {
            if (page.type == 'component' && page.params != '') {
                let argType = {}, title = thefile.title.split(':')[1].trim(), evts = '';
                //prepare events
                let events = page.stories['_default'].events;
                for (let evt in events) {
                    let on_name = camel(`on_${evt.replaceAll(':','_')}`);
                    evts += ` v-on:${evt}="${on_name}"`;
                    argType[on_name] = {
                        action:'clicked'
                    }
                }
                //prepare component attributes (props)
                let isNumeric = function(n) {
                    return !isNaN(parseFloat(n)) && isFinite(n);
                };
                //let props = []; // story attr control type
                let default_args = [];
                if (Object.keys(page.defaults) != '') {
                    page.params.split(',').map(function(key) {
                        let def_val = '';
                        if (page.defaults[key]) def_val = page.defaults[key];
                        if (def_val == 'true' || def_val == 'false') {
                            default_args.push(`${key}: ${def_val}`);
                            //props.push(`${key}: { type: Boolean, default: ${def_val}}`);
                        } else if (isNumeric(def_val)) { //if def_val is number or string with number
                            default_args.push(`${key}: ${def_val}`);
                            //props.push(`${key}: { type: Number, default: ${def_val}}`);
                        } else if (def_val.indexOf('[') != -1 && def_val.indexOf(']') != -1) {
                            default_args.push(`${key}: ${def_val}`);
                            //props.push(`${key}: { type: Array, default: () => ${def_val}}`);
                        } else if (def_val.indexOf('{') != -1 && def_val.indexOf('}') != -1) {
                            default_args.push(`${key}: ${def_val}`);
                            //props.push(`${key}: { type: Object, default: () => ${def_val}}`);
                        } else if (def_val.indexOf("()") != -1) { //ex. new Date()
                            default_args.push(`${key}: ${def_val}`);
                            //props.push(`${key}: { type: Object, default: () => ${def_val}}`);
                        } else if (def_val.toLowerCase().indexOf("null") != -1) {
                            default_args.push(`${key}: null`);
                            //props.push(`${key}: { default: null }`);
                        } else if (def_val.indexOf("'") != -1) {
                            default_args.push(`${key}: ${def_val}`);
                            //props.push(`${key}: { type: String, default: ${def_val}}`);
                        } else {
                            default_args.push(`${key}: '${def_val}'`);
                            //props.push(`${key}: { default: '${def_val}' }`);
                        }
                    });
                }
                //write story code
                let compName = camel(title,{pascalCase:true});
                js.script += `import ${compName} from '../client/components/${title}/${thefile.file.replace('.vue','-story.vue')}';\n\n`;
                js.script += `export default {
                    title: '${camel(this.x_state.central_config.apptitle,{pascalCase:true})}/${title}',
                    component: ${compName},
                    argTypes: ${JSON.stringify(argType)}
                };\n\n`;
                js.script += `const Template = (args, { argTypes }) => ({
                    props: Object.keys(argTypes),
                    components: { ${compName} },
                    template: '<${compName} v-bind="$props"${evts}/>'
                });\n`;
                //default story
                js.script += `export const Default = Template.bind({});\n`;
                js.script += `Default.args = {\n`;
                js.script += `${default_args.join(',')}\n};\n`
                //additional defined stories
                //@todo
            }
        }
        return js;
    }

    async getBasicReact(thefile) {
        // write .JSX file
        // @todo 23-nov-22 refactor this into JSX needs
        let react = { template: thefile.code, script: '', style: '', first: false, variables:'' };
        let page = this.x_state.pages[thefile.title];
        let vars = {};
        if (page) {
            // declare middlewares (proxies)
            if (page.proxies.indexOf(',') != -1) {
                this.debug('- declare middlewares');
                react.script += `middleware: [${page.proxies}]`;
                react.first = true;
            } else if (page.proxies.trim() != '') {
                this.debug('- declare middlewares');
                react.script += `middleware: '${page.proxies}'`;
                react.first = true;
            }
            // layout attr
            if (page.layout != '') {
                this.debug('- declare layout');
                if (react.first) react.script += ',\n';
                react.first = true;
                react.script += `layout: '${page.layout.trim()}'`;
            }
            // declare components
            if (page.components != '') {
                this.debug('- declare components');
                if (react.first) react.script += ',\n';
                react.first = true;
                react.script += `components: {`;
                let comps = [];
                Object.keys(page.components).map(function(key) {
                    comps.push(` '${key}': ${page.components[key]}`);
                }); //.bind(page,comps));
                react.script += `${comps.join(',')}\n\t}`;
            }
            // declare directives
            if (page.directives != '') {
                this.debug('- declare directives');
                if (react.first) react.script += ',\n';
                react.first = true;
                react.script += `directives: {`;
                let directs = [];
                Object.keys(page.directives).map(function(key) {
                    if (key == page.directives[key]) {
                        directs.push(key);
                    } else {
                        directs.push(`'${key}': ${page.directives[key]}`);
                    }
                }); //.bind(page,directs));
                react.script += `${directs.join(',')}\n\t}`;
            }
            // declare props (if page type component)
            if (page.type == 'component' && page.params != '') {
                this.debug('- declare component:props');
                if (react.first) react.script += ',\n';
                react.first = true;
                let isNumeric = function(n) {
                    return !isNaN(parseFloat(n)) && isFinite(n);
                };
                let props = [];
                if (Object.keys(page.defaults) != '') {
                    page.params.split(',').map(function(key) {
                        let def_val = '';
                        if (page.defaults[key]) def_val = page.defaults[key];
                        if (def_val == 'true' || def_val == 'false') {
                            props.push(`${key}: { type: Boolean, default: ${def_val}}`);
                        } else if (isNumeric(def_val)) { //if def_val is number or string with number
                            props.push(`${key}: { type: Number, default: ${def_val}}`);
                        } else if (def_val.indexOf('[') != -1 && def_val.indexOf(']') != -1) {
                            props.push(`${key}: { type: Array, default: () => ${def_val}}`);
                        } else if (def_val.indexOf('{') != -1 && def_val.indexOf('}') != -1) {
                            props.push(`${key}: { type: Object, default: () => ${def_val}}`);
                        } else if (def_val.indexOf("()") != -1) { //ex. new Date()
                            props.push(`${key}: { type: Object, default: () => ${def_val}}`);
                        } else if (def_val.toLowerCase().indexOf("null") != -1) {
                            props.push(`${key}: { default: null }`);
                        } else if (def_val.indexOf("'") != -1) {
                            props.push(`${key}: { type: String, default: ${def_val}}`);
                        } else {
                            props.push(`${key}: { default: '${def_val}' }`);
                        }
                    });
                    react.script += `\tprops: {${props.join(',')}}`;
                } else {
                    page.params.split(',').map(function(key) {
                        props.push(`'${key}'`);
                    });
                    react.script += `\tprops: [${props.join(',')}]`;                    
                }
                
            }
            // declare meta data
            if (page.xtitle || page.meta.length > 0 || page.link.length > 0) {
                this.debug('- declare head() meta data');
                if (react.first) react.script += ',\n';
                react.first = true;
                react.script += ` head() {\n return {\n`;
                // define title
                if (page.xtitle) {
                    if (this.x_state.central_config.langs.indexOf(',') != -1) {
                        // i18n title
                        let crc32 = `t_${(await this.hash(page.xtitle))}`;
                        let def_lang = this.x_state.central_config.langs.indexOf(',')[0].trim().toLowerCase();
                        if (!this.x_state.strings_i18n[def_lang]) {
                            this.x_state.strings_i18n[def_lang] = {};
                        }
                        this.x_state.strings_i18n[def_lang][crc32] = page.xtitle;
                        react.script += `titleTemplate: this.$t('${crc32}')\n`;
                    } else {
                        // normal title
                        react.script += `titleTemplate: ${this.jsDump(page.xtitle)}\n`;
                    }
                }
                // define meta SEO
                if (page.meta.length > 0) {
                    if (page.xtitle) react.script += `,`;
                    //vue.script += `meta: ${JSON.stringify(page.meta)}\n`;
                    react.script += `meta: ${this.jsDump(page.meta)}\n`;
                }
                // define head LINK
                if (page.link.length > 0) {
                    if (page.xtitle || page.meta.length > 0) react.script += `,`;
                    react.script += `link: ${JSON.stringify(page.link)}\n`;
                }
                react.script += `};\n}`;
            }
            // declare variables (data)
            if (Object.keys(page.variables) != '') {
                this.debug('- declare data() variables');
                let camel = require('camelcase');
                if (react.first) react.script += ',\n';
                react.first = true;
                //console.log(page.variables);
                /* - this could be useful if we enable an option for user to define using vars as either state or proxy
                for (let key in page.variables) {
                    let def_val = (page.variables[key])?this.jsDump(page.variables[key]):`''`;
                    if (page.var_types[key] && def_val==`''`) {
                        const type = page.var_types[key];
                        if (type=='string') { 
                            def_val = `''`;
                        } else if (type=='number') {
                            def_val = '0';
                        } else if (type=='boolean') {
                            def_val = 'false';
                        } else if (type=='object') {
                            def_val = '{}';
                        }
                    }
                    react.variables += `const [ ${key}, ${camel('set_'+key)} ] = useState(${def_val});\n`;
                }*/
                react.variables = `const $variables = stateProxy(${this.jsDump(page.variables)});\n`;
                //react.script += `data() {\n`;
                //react.script += ` return ${this.jsDump(page.variables)}\n`;
                //react.script += `}\n`;
                this.debug('- declare data() variables dump',react.variables);
                //react.variables = this.jsDump(page.variables);
            }
        }
        return react;
    }

    async processInternalTags(react, page) {
        let cheerio = require('cheerio');
        //console.log('PABLO beforeInteralTags:',{ template:react.template, script:react.script });
        let $ = cheerio.load(react.template, { ignoreWhitespace: false, xmlMode: true, decodeEntities: false });
        const self = this;
        const removeSpecialRefx = (content) => {
            //removes attrs refx from given content without using cheerio
            const extract = require('extractjs')();
            let new_ = content;
            let elements = extract(`refx="{id}"`,content);
            if (elements.id) {
                new_ = new_.replace(`refx="${elements.id}"`,''); 
                if (new_.indexOf('refx=')!=-1) {
                    new_ = removeSpecialRefx(new_);
                }
            }
            return new_;
        };
        //
        // PROCESS DEF_PARAM VIRTUAL TAGS
        //
        let nodes = $(`def_param`).toArray();
        if (nodes.length > 0) this.debug('post-processing def_param tags');
        //nodes.map(function(elem) {
        for (let i = 0; i < nodes.length; i++) {
            const elem = nodes[i];
            let value = {};
            let special_x = {};
            let cur = $(elem);
            const attribs = cur.attr();
            //this.debug('def_param attribs BEFORE',attribs);
            // search partial attributes attr_?
            for (let key in attribs) {
                if (key.indexOf('x_attr') > -1) {
                    special_x[key.replace('x_attr_', '')] = cur.attr(key);
                } else if (key.indexOf('attr_') > -1 && key.indexOf('-') > -1) {
                    value[key.replace('attr_', '').replaceAll('-','&:')] = cur.attr(key);
                } else if (key.indexOf('attr_') > -1 && key.indexOf('$') > -1) {
                    value[key.replace('attr_', '').replaceAll('$',',')] = cur.attr(key);
                } else if (key.indexOf('attr_') > -1) {
                    value[key.replace('attr_', '')] = cur.attr(key);
                }
            }
            //this.debug('def_param value',value);
            // do {node.value} mapping to key values
            const extract = require('extractjs')({
                startExtract: '-',
                endExtract: '-',
            });
            
            for (let key in value) {
                //@todo replace with extractJS npm module
                const special = extract(`{node.-key-}`, value[key]);
                if (special.key && special.key in special_x) {
                    value[key] = special_x[special.key];
                } else if (special.key) {
                    //assigned as empty if special key value doesn't exist but value has a special key defined 
                    value[key] = '';
                }
            } 
            // if value obj has single special key (and no attribs), re-asign as direct value
            if (!value.is_object) {            
                if (Object.keys(special_x).length==1 && Object.keys(value).length == 0) {
                    value = special_x[Object.keys(special_x)[0]];
                }
            }
            // delete meta keys from value
            delete value['is_object']; 
            delete value['is_function'];
            delete value['is_view'];
            // get target node
            let target_node = $(`*[refx=${cur.attr('target_id')}]`).toArray();
            /*if (target_node.length == 0) {
                //if target node is not found, try to find its parent (maybe it was a text or virtual tag)
                this.debug('DADDY NOT FOUND');
                target_node = $(`*[refx=${cur.attr('targetparent_id')}]`).toArray();
                this.debug('GRAND DADDY?',target_node.length);
                //let target_ = $(target_node[0]);
            }*/
            if (target_node.length>0) {
                //build value for attr
                let target_ = $(target_node[0]);
                let val = '';
                let inner = cur.html();
                if (cur.attr('is_function') && cur.attr('is_function')=="true") {
                    //wrap contents in a function within the value of the parent attribute
                    //prepend event stop propagation if not :stop
                    let function_params = [];
                    let function_inner = '';
                    if (value[':stop'] && value[':stop']=="false") {
                        function_inner += cur.html();
                    } else {
                        function_inner = `event.stopPropagation(); `+cur.html();
                    }
                    if (function_inner.indexOf('event.')!=-1) {
                        function_params.push('event');
                    }
                    if (function_inner.indexOf('params.')!=-1) {
                        function_params.push('params');
                    }
                    val = self.serializeComplexAttr(`(${function_params.join(',')})=>{ ${function_inner} }`);
                } else if (cur.attr('is_view') && cur.attr('is_view')=="true") {
                    //before processing, check if within us we need to call ourselfs 
                    //this.debug('def_param inner',inner);
                    //to process other internal tags
                    if (inner.indexOf('def_param')!=-1) {
                        //console.log('calling self.processInternalTags()');
                        //inner = this.decryptSpecialProps(inner);
                        inner = (await self.processInternalTags({template:inner},page)).template;
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
                target_.attr(cur.attr('param_name')+'_encrypt', val);
            }
            cur.remove(); // remove ourselfs
        };
        react.template = $.html();
        //
        // PROCESS other * VIRTUAL TAGS
        //
        // process 'react_mounted' into react script like: useEffect(()=>{//html() of react_mounted },[])
        nodes = $(`react\_mounted`).toArray();
        if (nodes.length > 0) this.debug('post-processing react_mounted tag');
        if (!react.init) react.init = ``;
        let uses_await = false, mounted_content = '';
        nodes.map(function(elem) {
            let cur = $(elem);
            //console.log('valor react_mounted',elem.children[0].data);
            if (elem.children[0].data.includes('await ')) {
                uses_await = true;
            }
            mounted_content += elem.children[0].data; //cur.text();
            cur.remove();
            //react.script += elem.children[0].data
        });
        if (mounted_content.length > 0) {
            if (uses_await) {
                //wrap within a self calling async function
                mounted_content = `const asyncMounted = async () =>{
                    ${mounted_content}
                };
                asyncMounted().catch(console.error); //call function and catch any error
                `;
            }
            //wrap useEffect when using react.init not here
            react.init += `useEffect(()=>{${mounted_content}},[])`;
        }
        react.template = $.html();

        // process ?init event
        nodes = $(`react\_init`).toArray();
        if (nodes.length > 0) this.debug('post-processing react_init tag');
        if (!react.init) react.init = ``;
        uses_await = false, mounted_content = '';
        nodes.map(function(elem) {
            let cur = $(elem);
            //console.log('value reaact_init',elem.children[0].data);
            if (elem.children[0].data.includes('await ')) {
                uses_await = true;
            }
            mounted_content += elem.children[0].data; //cur.text();
            cur.remove();
            react.init += '\n'+mounted_content;
        });
        react.template = $.html();

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
    }

    processStyles(react, page) {
        let cheerio = require('cheerio');
        let $ = cheerio.load(react.template, { ignoreWhitespace: false, xmlMode: true, decodeEntities: false });
        let styles = $(`page_styles`).toArray();
        if (styles.length > 0) {
            this.debug('post-processing styles');
            let node = $(styles[0]);
            if (node.attr('scoped') && node.attr('scoped') == 'true') {
                react.style += `
				<style scoped>
				${node.text()}
				</style>`;
            } else {
                react.style += `
				<style>
				${node.text()}
				</style>`;
            }
            node.remove();
        }
        react.template = $.html();
        // add page styles (defined in js) to style tag code
        if (Object.keys(page.styles).length > 0) {
            let jss = require('jss').default;
            let global_plug = require('jss-plugin-global').default;
            jss.use(global_plug());
            let sheet = jss.createStyleSheet({
                '@global': page.styles
            });
            if (!react.style) react.style = '';
            react.style += `<style>\n${sheet.toString()}</style>`;
            //this.debug('JSS sheet',sheet.toString());
        }
        return react;
    }

    processMixins(vue, page) {
        // call after processInternalTags
        if (page.mixins && Object.keys(page.mixins).length > 0) {
            this.debug('post-processing mixins');
            let close = '';
            if (vue.first) close += ',\n';
            vue.first = true;
            close += `mixins: [${Object.keys(page.mixins).join(',')}]`;
            let mixins = [];
            for (let key in page.mixins) {
                mixins.push(`import ${key} from '${page.mixins[key]}';`);
            }
            vue.script = vue.script.replaceAll('{concepto:mixins:import}', mixins.join(';'));
            vue.script = vue.script.replaceAll('{concepto:mixins:array}', close);
        } else {
            vue.script = vue.script.replaceAll('{concepto:mixins:import}', '')
                                   .replaceAll('{concepto:mixins:array}','');
        }
        return vue;
    }

    removeSpecialRefx(content) {
        //removes attrs refx from given content without using cheerio
        const extract = require('extractjs')();
        let new_ = content;
        let elements = extract(`refx="{id}"`,content);
        if (elements.id) {
            new_ = new_.replace(`refx="${elements.id}"`,''); 
            if (new_.indexOf('refx=')!=-1) {
                new_ = this.removeSpecialRefx(new_);
            }
        }
        return new_;
    };

    removeRefx(react) {
        let cheerio = require('cheerio');
        let $ = cheerio.load(react.template, { ignoreWhitespace: false, xmlMode: true, decodeEntities: false });
        let refx = $(`*[refx]`).toArray();
        if (refx.length > 0) {
            this.debug('removing refx attributes (internal)');
            refx.map(function(x) {
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
        const extract = require('extractjs')();
        let new_ = react.template;
        let elements = extract(` {prop}_encrypt="{encrypted}"`,react.template);
        if (elements.prop && elements.encrypted) {
            let decrypt = require('encrypt-with-password');
            let val = decrypt.decryptJSON(elements.encrypted,'123');
            new_ = new_.replace(`${elements.prop}_encrypt="${elements.encrypted}"`,`${elements.prop}={${val}}`);
            let more = extract(` {prop}_encrypt="{encrypted}"`,new_);
            if (more.prop && more.encrypted) {
                new_ = this.decryptSpecialProps({...react,...{ template:new_ }}).template;
            }
        }
        return {...react,...{ template:new_ }};
    }

    fixVuePaths(vue, page) {
        for (let key in this.x_state.pages) {
            if (this.x_state.pages[key].path) {
                vue.script = vue.script.replaceAll(`{vuepath:${key}}`, this.x_state.pages[key].path);
            } else {
                this.x_console.outT({ message: `WARNING! path key doesn't exist for page ${key}`, color: 'yellow' });
            }
        }
        // remove / when first char inside router push name
        vue.script = vue.script.replaceAll(`this.$router.push({ name:'/`, `this.$router.push({ name:'`);
        return vue;
    }

    async processLangPo(vue, page) {
        // writes default lang.po file and converts alternatives to client/lang/iso.js
        if (this.x_state.central_config.idiomas.indexOf(',') != -1) {
            this.debug('process /lang/ po/mo files');
            let path = require('path'),
                fs = require('fs').promises;
            // .check and create directs if needed
            let lang_path = path.join(this.x_state.dirs.base, '/lang/');
            try {
                await fs.mkdir(lang_path, { recursive: true });
            } catch (errdir) {}
            // .create default po file from strings_i18n
            let def_lang = this.x_state.central_config.idiomas.split(',')[0];

            // .read other po/mo files from lang dir and convert to .js
            for (let idioma in this.x_state.central_config.idiomas.split(',')) {
                if (idioma != def_lang) {

                }
            }
            //
        }
        return vue;
    }

    async createVueXStores() {
        if (Object.keys(this.x_state.stores).length>0) {
            this.x_console.outT({ message:`creating VueX store definitions`, color:'cyan' });
            let path = require('path');
            let util = require('util');
            let safe = require('safe-eval');
            //console.log('debug stores complete',this.x_state.stores);
            for (let store_name in this.x_state.stores) {
                let store = this.x_state.stores[store_name];
                let file = path.join(this.x_state.dirs.store,`${store_name}.js`);
                let def_types = {
                    'integer': 0,
                    'int': 0,
                    'float': 0.0,
                    'boolean': false,
                    'array': []
                };
                let obj = {}, mutations={};
                // iterate each store field
                //this.debug(`store ${store_name}`,store);
                for (let field_name in store) {
                    let field = store[field_name];
                    //this.debug({ message:`checking field ${field_name} within store ${i}` });
                    if (field.default && field.default.trim()=='') {
                        if (field.type in def_types) {
                            obj[field_name]=def_types[field.type];
                        } else {
                            obj[field_name]='';
                        }
                    } else {
                        if ('integer,int,float,boolean,array'.split(',').includes[field.type]) {
                            obj[field_name]=safe(field.default);
                        } else if ('true,false,0,1'.split(',').includes[field.default]) {
                            obj[field_name]=safe(field.default);
                        } else {
                            obj[field_name]=''+field.default;
                        }
                    }
                }
                // expires?
                if (store_name in this.x_state.stores_types['expires']) {
                    obj['expire']=parseInt(this.x_state.stores_types['expires'][store_name]);
                }
                // versions?
                if (store_name in this.x_state.stores_types['versions']) {
                    obj['version']=parseInt(this.x_state.stores_types['versions'][store_name]);
                }
                // write content
                delete obj[':mutations'];
                let content = `export const state = () => (${this.jsDump(obj)})\n`;
                // :mutations?
                if (':mutations' in store) {
                    let muts=[];
                    for (let mut_name in store[':mutations']) {
                        let mutation = store[':mutations'][mut_name];
                        //console.log('mutation debug',{mutation, mut_name});
                        let mut = { params:['state'] };
                        if (Object.keys(mutation.params).length>0) mut.params.push('objeto');
                        muts.push(`${mut_name}(${mut.params.join(',')}) {
                            ${mutation.code}
                        }`);
                    }
                    content += `\nexport const mutations = {${ muts.join(',')}}`;
                }
                // write file
                this.writeFile(file,content);
            }
        }
    }

    async createServerMethods() {
        if (Object.keys(this.x_state.functions).length>0) {
            this.x_console.outT({ message:`creating NuxtJS server methods`, color:'green' });
            let path = require('path');
            let file = path.join(this.x_state.dirs.server,`api.js`);
            let content = `
            var express = require('express'), _ = require('underscore'), axios = require('axios');
            var server = express();
            var plugins = {
                bodyParser: require('body-parser'),
                cookieParser: require('cookie-parser')
            };
            server.disable('x-powered-by');
            server.use(plugins.bodyParser.urlencoded({ extended: false,limit: '2gb' }));
            server.use(plugins.bodyParser.json({ extended: false,limit: '2gb' }));
            server.use(plugins.cookieParser());
            `;
            //merge functions import's into a single struct
            let imps = {};
            for (let x in this.x_state.functions) {
                for (let imp in this.x_state.functions[x]) {
                    imps[imp] = this.x_state.functions[x][imp];
                    await this.setImmediatePromise(); //@improved
                }
                await this.setImmediatePromise(); //@improved
            }
            //declare imports
            content += `// app declared functions imports\n`;
            for (let x in imps) {
                content += `var ${imps[x]} = require('${x}');\n`;
            }
            content += `// app declared functions\n`;
            //declare app methods
            for (let func_name in this.x_state.functions) {
                let func = this.x_state.functions[func_name];
                let func_return = ``;
                if (func.return!='') func_return = `res.send(${func.return});`;
                content += 
                `server.${func.method}('${func.path}', async function(req,res) {
                    var params = req.${(func.method=='get')?'params':'body'};
                    ${func.code}
                    ${func_return}
                });\n`;
            }
            //close
            content += `module.exports = server;\n`;
            //write file
            this.writeFile(file,content);
            this.x_console.outT({ message:`NuxtJS server methods ready`, color:'green' });
        }
    }

    async createMiddlewares() {
        if (Object.keys(this.x_state.proxies).length>0) {
            this.x_console.outT({ message:`creating VueJS Middlewares`, color:'cyan' });
            let path = require('path');
            for (let proxy_name in this.x_state.proxies) {
                let proxy = this.x_state.proxies[proxy_name];
                let file = path.join(this.x_state.dirs.middleware,`${proxy_name}.js`);
                //add imports
                let content = ``;
                for (let key in proxy.imports) {
                    content += `import ${proxy.imports[key]} from '${key}';\n`;
                }
                //add proxy code
                content += 
                `export default async function ({ route, store, redirect, $axios, $config }) {
                    ${proxy.code}\n
                }
                `;
                //find and replace instances of strings {vuepath:targetnode}
                for (let page_name in this.x_state.pages) {
                    if (page_name!='') {
                        let page = this.x_state.pages[page_name];
                        if (page.path) {
                            content = content.replaceAll(`{vuepath:${page_name}}`,page.path);
                        } else {
                            this.x_console.outT({ message:`Warning! path key doesn't exist for page ${page_name}`, color:'yellow'});
                        }
                    }
                    await this.setImmediatePromise(); //@improved
                }
                //write file
                this.writeFile(file,content);
                await this.setImmediatePromise(); //@improved
            }
            this.x_console.outT({ message:`VueJS Middlewares ready`, color:'cyan' });
        }
    }

    async createSystemFiles(processedNodes) {
        const path = require('path');
        const g = this.g;
        await this.x_theme.generateFiles();
        
        //generate common files
        //create index.js
        this.writeFile(g('@src/index.js'),`import("./App");\n`);
        //create styles/globals.css
        //@todo grab values from main node 'styles'
        const globalsCSS = await this.x_theme.globalCSS();
        const globalStyle = await this._readStyle();
        //merge with values from main->styles into a single object and stringify to CSS
        this.writeFile(g('@styles/globals.css'), stringify(deepMerge(globalsCSS,globalStyle)));
        //create public/index.html
        //@todo add website title, modify lang, add meta data and any additional head requirements
        //add conifg:meta data
        let config = { head: { meta: [], script:[] } };  
        if (this.x_state.config_node['html:meta']) {
            for (let meta_key in this.x_state.config_node['html:meta']) {
                if (meta_key.charAt(0)!=':') {
                    let test = meta_key.toLowerCase().trim();
                    let value = this.x_state.config_node['html:meta'][meta_key];
                    if (test=='charset') {
                        config.head.meta.push({ charset:value });
                    } else if (test=='description') {
                        config.head.push({ hid:'description', name:'description', content:value });
                    } else {
                        config.head.meta.push({ name:meta_key, content:value });
                    }
                }
            }
        } else if (this.x_state.config_node.meta && this.x_state.config_node.meta.length>0) {
            config.head.meta = this.x_state.config_node.meta;
        }
        //add custom head scripts
        //sort head scripts a-z
        let as_array = [];
        for (let head in this.x_state.head_script) {
            as_array.push({ key:head, params:this.x_state.head_script[head] });
            //config.head.script.push({ ...this.x_state.head_script[head] });
        }
        let sorted = as_array.sort(function(key) {
            let sort_order=1; //desc=-1
            return function(a,b) {
                if (a[key] < b[key]) {
                    return -1 * sort_order;
                } else if (a[key] > b[key]) {
                    return 1 * sort_order;
                } else {
                    return 0 * sort_order;
                }
            }
        });
        for (let head in sorted) {
            config.head.script.push(sorted[head].params);
        }
        // convert head into html tags
        let meta_head = '';
        for (let meta in config.head.meta) {
            let meta_tag = config.head.meta[meta];
            meta_head += `<meta `;
            for (let key in meta_tag) {
                meta_head += `${key}="${meta_tag[key]}" `;
            }
            meta_head += `>\n`;
        }
        for (let script in config.head.script) {
            let script_tag = config.head.script[script];
            meta_head += `<script `;
            for (let key in script_tag) {
                meta_head += `${key}="${script_tag[key]}" `;
            }
            meta_head += `></script>\n`;
        }
        //
        const indexHeadTheme = await this.x_theme.indexHtmlHead();
        this.writeFile(g('@public/index.html'),
        `
        <!DOCTYPE html>
        <html lang="${this.x_state.central_config.langs.split(',')[0]}">
        
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${(this.x_state.config_node['nuxt:title'])?this.x_state.config_node['nuxt:title']:this.x_state.central_config.apptitle}</title>
          ${indexHeadTheme}
          ${meta_head}
        </head>
        
        <body>
          <div id="app"></div>
        </body>
        
        </html>        
        `);
        
        //@pages/index.js created on onCreateFiles
        //create App.jsx
        //@todo obtain files and routes from map and use React Router
        let appJSX =
        `import React, { useState, useEffect } from 'react';
        import ReactDOM from "react-dom";
        {appJSX.imports}

        // import each main page
        {appJSX.import_pages}

        import "./styles/globals.css";

        export const App = (props) => {
        return (
            {appJSX.open}
            <div className="container">
            {appJSX.routes}
            </div>
            {appJSX.close}
        )
        };
        ReactDOM.render(<App />, document.getElementById("app"));
        `;
        // get pages {appJSX.import_pages} 
        // iterate this.x_state.pages, and grab file names from processedNodes 
        let import_pages = ''; let pages = [];
        for (let thefile_num in processedNodes)  {
            let thefile = processedNodes[thefile_num];
            let page = this.x_state.pages[thefile.title];
            if (page) {
                const name = thefile.file.split('.')[0];
                if (page.type=='page') {
                    pages.push({ name, params:page.params, defaults:page.defaults, path:page.path, styles:page.styles });
                    import_pages += `import { ${name} } from "./pages";\n`;
                }
            }
        }
        //this.debug('pages!',pages);
        appJSX = appJSX.replace('{appJSX.import_pages}', import_pages);
        //
        let JSX_imports = await this.x_theme.AppImports();
        //@todo add support for react-dom-router
        //sort pages from longest path to shortest (first to match wins on react-router)
        pages.sort(function(a,b) {
            let sort_order=-1; //desc=-1
            if (a.path.length < b.path.length) {
                return -1 * sort_order;
            } else if (a.path.length > b.path.length) {
                return 1 * sort_order;
            } else {
                return 0 * sort_order;
            }
        });
        //this.debug('pages',pages);
        if (pages.length==1) {
            appJSX = appJSX.replace('{appJSX.routes}', `<Home/>`);
        } else {
            // add react-dom-router import and a switch for each page
            this.x_state.npm['react-router-dom']='5.3.3';
            //this.x_state.npm['localforage']='*';
            //this.x_state.npm['match-sorter']='*';
            //this.x_state.npm['sort-by']='*';
            JSX_imports += `import { BrowserRouter as Router, Route, Switch } from "react-router-dom";`;
            let switch_ = { open:'', close:'' };
            switch_.open = `<Router>\n<Switch>\n`;
            switch_.close = `</Switch>\n</Router>\n`;
            for (let page in pages) {
                switch_.open += `<Route exact path="${pages[page].path}" component={${pages[page].name}} />\n`;
            }
            appJSX = appJSX.replace('{appJSX.routes}', switch_.open + switch_.close);
        }
        //
        appJSX = appJSX.replace('{appJSX.imports}', JSX_imports);
        const JSX_wrap = await this.x_theme.AppWrap();
        appJSX = appJSX.replace('{appJSX.open}', JSX_wrap.open);
        appJSX = appJSX.replace('{appJSX.close}', JSX_wrap.close);
        this.writeFile(g('@src/App.jsx'), appJSX);
        // create .babelrc
        const default_babel = {
            presets: ["@babel/preset-react", "@babel/preset-env"],
            plugins: [
                ["@babel/transform-runtime"]
            ]
        };
        const babel_ = await this.x_theme.BabelRC(default_babel);
        this.writeFile(g('@app/.babelrc'),JSON.stringify(babel_));
        // create webpack.config.js
        let webpack = { exposes:{} };
        webpack.template = `
        const HtmlWebPackPlugin = require("html-webpack-plugin");
        const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
        
        const path = require('path');
        const deps = require("./package.json").dependencies;
        module.exports = {
          output: {
            publicPath: "http://localhost:${this.x_state.central_config.port}/",
          },
        
          resolve: {
            extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
          },
        
          devServer: {
            historyApiFallback: true,
            static: {
              directory: path.join(__dirname),
            },
            compress: true,
            port: ${this.x_state.central_config.port},
            hot: true,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
              'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
            },
          },
        
          module: {
            rules: [
              {
                test: /\.m?js/,
                type: "javascript/auto",
                resolve: {
                  fullySpecified: false,
                },
              },
              {
                test: /\.(css|s[ac]ss)$/i,
                use: ["style-loader", "css-loader", "postcss-loader"],
              },
              {
                test: /\.(ts|tsx|js|jsx)$/,
                exclude: /node_modules/,
                use: {
                  loader: "babel-loader",
                },
              },
            ],
          },
        
          plugins: [
            new ModuleFederationPlugin({
              name: "${this.x_state.central_config.apptitle}",
              filename: "remoteEntry.js",
              remotes: {
              },
              //@todo add components marked as 'shared'
              exposes: {webpack:exposes},
              shared: {
                ...deps,
                react: {
                  singleton: true,
                  requiredVersion: deps.react,
                },
                "react-dom": {
                  singleton: true,
                  requiredVersion: deps["react-dom"],
                },
              },
            }),
            new HtmlWebPackPlugin({webpack:html}),
          ],
        };        
        `;
        //
        webpack.HtmlWebPackPlugin = {
            template: "./src/public/index.html",
        };
        // copy the 'favicon' file, and add it to HtmlWebPackPlugin node within webpack.config.js file
        if (this.x_state.config_node['favicon']) {
            // copy icon to static dir
            let path = require('path');
            let source = path.join(this.x_state.dirs.base, this.x_state.config_node['favicon']);
            let target = this.x_state.dirs.static + 'icon.png'; //@todo get extension from source
            webpack.favicon = target;
            this.debug({ message: `FAVICON ICON dump (copy icon)`, color: `yellow`, data: source });
            let fs = require('fs').promises;
            try {
                await fs.copyFile(source, target);
                //@todo absolute target to relative format
                //assign to webpack.HtmlWebPackPlugin.favicon
                webpack.HtmlWebPackPlugin.favicon = target; 

            } catch (err_fs) {
                this.x_console.outT({ message: `error: copying defined favicon`, data: err_fs });
            }
        }
        // create webpack.config.js
        // replace placeholders with values
        webpack.template = webpack.template.replace('{webpack:html}',this.jsDump(webpack.HtmlWebPackPlugin));
        // test if central node is 'shared'
        if (this.x_state.central_config.shared) {
            webpack.exposes['./App'] = './src/App.jsx'
        }
        // test which pages/components are shared
        for (let thefile_num in processedNodes)  {
            let thefile = processedNodes[thefile_num];
            let page = this.x_state.pages[thefile.title];
            if (page) {
                const name = thefile.file.split('.')[0];
                if (page.type=='page' && page.shared) {
                    webpack.exposes['./'+name] = './src/pages/'+name;
                } else if (page.type=='component' && page.shared) {
                    webpack.exposes['./'+name] = './src/components/'+name;
                }
            }
        }
        webpack.template = webpack.template.replace('{webpack:exposes}',JSON.stringify(webpack.exposes));
        // write file
        this.writeFile(g('@app/webpack.config.js'),webpack.template);
        
        // create .env file
        const env = {};
        const ini = require('ini');
        for (let node_key in this.x_state.config_node) {
            if (node_key.includes(':')==false) {
                if ('aurora,vpc,aws'.split(',').includes(node_key)==false) {
                    /*if (this.x_state.secrets[node_key]===undefined && typeof this.x_state.config_node[node_key] === 'object') {
                        env[node_key.toLowerCase()]={...this.x_state.config_node[node_key]};
                    }*/
                    if (typeof this.x_state.config_node[node_key] === 'object') {
                        Object.keys(this.x_state.config_node[node_key]).map(function(attr) {
                            if (attr.includes(':')==false) {
                                env[`${(node_key+'_'+attr).toUpperCase()}`] = this.x_state.config_node[node_key][attr];
                            }
                        }.bind(this));
                    }
                }
            }
        }
        this.writeFile(g('@app/.env'),ini.stringify(env));
    }
    
    async installRequiredPlugins() {
        this.x_state.plugins['vuetify'] = {
            global: true,
            npm: { 'node-sass':'*' },
            dev_npm: { '@nuxtjs/vuetify':'1.12.1' },
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
        this.x_state.nuxt_config.build_modules['@nuxtjs/vuetify'] = {};
        this.x_state.plugins['aos'] = {
            global: true,
            npm: { aos:'*' },
            mode: 'client',
            customcode: 
            `import AOS from "aos";
            import "aos/dist/aos.css";
            export default ({app}) => {
                app.AOS = new AOS.init({});
            };`
        };
        //add font awesome 5 support
        this.x_state.plugins['fontawesome'] = {
            global: true,
            npm: { '@fortawesome/fontawesome-free':'*' },
            mode: 'client',
            customcode: 
            `import '@fortawesome/fontawesome-free/css/all.css' // Ensure you are using css-loader
            import Vue from 'vue'
            import Vuetify from 'vuetify/lib'
            
            Vue.use(Vuetify)
            
            export default new Vuetify({
              icons: {
                iconfont: 'fa',
              },
            })`
        };
        //support for tawk.io
        if (this.x_state.config_node.tawk && this.x_state.config_node.tawk.propertyId && this.x_state.config_node.tawk.widgetId) {
            this.x_state.plugins['tawk'] = {
                global: true,
                npm: { '@tawk.to/tawk-messenger-vue':'*' },
                mode: 'client',
                customcode: 
                `import Vue from "vue";
                import TawkMessengerVue from '@tawk.to/tawk-messenger-vue';

                export default function () {
                    Vue.use(TawkMessengerVue, {
                        propertyId : '${this.x_state.config_node.tawk.propertyId}',
                        widgetId : '${this.x_state.config_node.tawk.widgetId}'
                    });
                }`
            };
        }
    }

    async createNuxtPlugins(write=true) {
        let path = require('path');
        let resp = { global_plugins:{}, css_files:[], nuxt_config:[], stories:{} };
        for (let plugin_key in this.x_state.plugins) {
            let plugin = this.x_state.plugins[plugin_key];
            if (typeof plugin === 'object') {
                // copy x_state_plugins npm's into npm global imports (for future package.json)
                if (plugin.npm) this.x_state.npm = {...this.x_state.npm, ...plugin.npm };
                if (plugin.dev_npm) this.x_state.dev_npm = {...this.x_state.dev_npm, ...plugin.dev_npm };
                if (plugin.global && plugin.global==true) resp.global_plugins[plugin_key] = '*';
                if (plugin.styles) {
                    for (let style_key in plugin.styles) {
                        let style = plugin.styles[style_key];
                        if (style.file.includes('/')==false) {
                            let target = path.join(this.x_state.dirs.css, style.file);
                            await this.writeFile(target, style.content);
                            resp.css_files.push({
                                src: `~/assets/css/${style.file}`,
                                lang: style.lang
                            });
                        }
                    }
                }
                // write the plugin code
                let import_as='', code='';
                if (plugin.var) {
                    import_as = plugin.var;
                } else {
                    import_as = plugin_key.split('/').splice(-1)[0]
                                                    .replaceAll('-','')
                                                    .replaceAll('_','')
                                                    .toLowerCase().trim();
                }
                code = `import Vue from 'vue';\n`;
                if (plugin.as_star) {
                    if (plugin.as_star==true) {
                        code += `import * as ${import_as} from '${plugin_key}';\n`;
                    } else {
                        code += `import ${import_as} from '${plugin_key}';\n`;
                    }
                } else {
                    code += `import ${import_as} from '${plugin_key}';\n`;
                }
                if (plugin.custom) code += `${plugin.custom}\n`;
                if (plugin.extra_imports) {
                    for (let extra in plugin.extra_imports) {
                        let new_key = plugin.extra_imports[extra]
                                        .replaceAll('-','')
                                        .replaceAll('_','')
                                        .replaceAll('/','')
                                        .replaceAll('.css','')
                                        .replaceAll('.','_')
                                        .toLowerCase().trim();
                        code += `import ${new_key} from '${plugin.extra_imports[extra]}'\n`;
                    }
                }
                if (plugin.requires) {
                    for (let req in plugin.requires) code += `require('${plugin.requires[req]}');\n`;
                }
                if (plugin.styles) {
                    for (let style_key in plugin.styles) {
                        let style = plugin.styles[style_key];
                        if (style.file.includes('/')) {
                            code += `import '${style.file}';\n`;
                        }
                    }
                }
                // add config to plugin code if requested
                if (plugin.config) {
                    if (typeof plugin.config === 'object') {
                        code += 
                        `const config = ${this.jsDump(plugin.config)};
                        Vue.use(${import_as},config);`;        
                    } else {
                        code += `Vue.use(${import_as},${plugin.config});\n`;
                    }
                } else if (plugin.tag && plugin.customvar=='') {
                    code += `Vue.use(${import_as},'${plugin.tag}');\n`;
                } else if (plugin.tag) {
                    code += `Vue.component('${plugin.tag}',${import_as});\n`;
                } else if (plugin.customvar) {
                    code += `Vue.use(${plugin.customvar});\n`;
                } else {
                    code += `Vue.use(${import_as});\n`;
                }
                // if customcode overwrite 'code'
                if (plugin.customcode) {
                    code = plugin.customcode;
                }
                // write to disk and add to response
                if (import_as!='vuetify') {
                    if (plugin.mode) {
                        resp.nuxt_config.push({ mode:plugin.mode.toLowerCase().trim(), src:`~/plugins/${import_as}.js` });
                    } else {
                        resp.nuxt_config.push({ src:`~/plugins/${import_as}.js` });
                    }
                    let target = path.join(this.x_state.dirs.plugins, `${import_as}.js`);
                    if (write) await this.writeFile(target, code);
                }
                //10-ago-21 assign code to plugin registry (for storybook)
                resp.stories[plugin_key] = plugin;
                resp.stories[plugin_key].code = code;
            } else {
                //simple plugin
                this.x_state.npm[plugin_key] = plugin;
                let import_as = plugin_key.replaceAll('-','')
                                          .replaceAll('_','')
                                          .toLowerCase().trim();
                code += 
                `import Vue from 'vue';
                import ${import_as} from '${plugin_key}';
                Vue.use(${import_as});
                `;
                // write to disk and add to response
                if (import_as!='vuetify') {
                    resp.nuxt_config.push({ src:`~/plugins/${import_as}.js` });
                    let target = path.join(this.x_state.dirs.plugins, `${import_as}.js`);
                    if (write) await this.writeFile(target, code);
                }
                //10-ago-21 assign code to plugin registry (for storybook)
                resp.stories[plugin_key] = plugin;
                resp.stories[plugin_key].code = code;
            }
        }
        return resp;
    }

    async createNuxtConfig() {
        //creates the file nuxt.config.js
        //define structure with defaults
        let path = require('path');
        let target = path.join(this.x_state.dirs.app,`nuxt.config.js`);
        let ssr=(this.x_state.central_config[':mode']=='spa')?true:false;
        if (this.x_state.central_config[':ssr']) ssr=this.x_state.central_config[':ssr'];
        let target_val = (this.x_state.central_config.static==true)?'static':'server';
        let deploy = this.x_state.central_config.deploy+'';
        let config = {
            ssr:true, //8may21 forced psb,18may default true
            target:target_val,
            components: true,
            telemetry: false,
            loading: {
                color: 'orange',
                height: '2px',
                continuous: true
            },
            head: {
                title: (this.x_state.config_node['nuxt:title'])?this.x_state.config_node['nuxt:title']:this.x_state.central_config.apptitle,
                meta: [],
                link: [
                    //{ rel: 'icon', type: 'image/x-icon', href:'/favicon.ico' },
                    { rel: 'icon', type: 'image/png', href:'/icon.png' },
                    { rel: 'stylesheet', href:'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' }
                ],
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
        if (this.x_state.central_config.static==true) {
            config.ssr=false;
            config.performance.gzip = false;
        }
        //add title:meta data
        if (this.x_state.config_node['nuxt:meta']) {
            for (let meta_key in this.x_state.config_node['nuxt:meta']) {
                if (meta_key.charAt(0)!=':') {
                    let test = meta_key.toLowerCase().trim();
                    let value = this.x_state.config_node['nuxt:meta'][meta_key];
                    if (test=='charset') {
                        config.head.meta.push({ charset:value });
                    } else if (test=='description') {
                        config.head.push({ hid:'description', name:'description', content:value });
                    } else {
                        config.head.meta.push({ name:meta_key, content:value });
                    }
                }
            }
        } else if (this.x_state.config_node.meta && this.x_state.config_node.meta.length>0) {
            config.head.meta = this.x_state.config_node.meta;
        }
        //add custom head scripts
        //sort head scripts a-z
        let as_array = [];
        for (let head in this.x_state.head_script) {
            as_array.push({ key:head, params:this.x_state.head_script[head] });
            //config.head.script.push({ ...this.x_state.head_script[head] });
        }
        let sorted = as_array.sort(function(key) {
            let sort_order=1; //desc=-1
            return function(a,b) {
                if (a[key] < b[key]) {
                    return -1 * sort_order;
                } else if (a[key] > b[key]) {
                    return 1 * sort_order;
                } else {
                    return 0 * sort_order;
                }
            }
        });
        for (let head in sorted) {
            config.head.script.push(sorted[head].params);
        }
        //nuxt axios config
        if (this.x_state.config_node.axios) {
            let ax_config = { 
                proxy:(this.x_state.nuxt_config.modules['@nuxtjs/proxy'])?true:false 
            };
            ax_config = {...this.x_state.config_node.axios, ...ax_config};
            if (ax_config.retries) {
                ax_config.retry = { retries:ax_config.retries };
                delete ax_config.retries;
                this.x_state.npm['axios-retry']='*';
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
        if (this.x_state.config_node['vue:config']) {
            config.vue = { config:this.x_state.config_node['vue:config'] };
            delete config.vue.config[':secret'];
            delete config.vue.config[':link'];
        }
        //nuxt proxy config keys
        if (this.x_state.nuxt_config.modules['@nuxtjs/proxy']) {
            config.proxy = this.x_state.nuxt_config.modules['@nuxtjs/proxy'];
        }
        //nuxt env variables
        config.publicRuntimeConfig={};
        for (let node_key in this.x_state.config_node) {
            if (node_key.includes(':')==false) {
                if ('aurora,vpc,aws'.split(',').includes(node_key)==false) {
                    if (this.x_state.secrets[node_key]===undefined && typeof this.x_state.config_node[node_key] === 'object') {
                        config.publicRuntimeConfig[node_key.toLowerCase()]={...this.x_state.config_node[node_key]};
                    }
                }
            }
        }
        //nuxt google:analytics
        if (this.x_state.config_node['google:analytics']) {
            if (this.x_state.config_node['google:analytics'].local && this.x_state.config_node['google:analytics'].local==true) {
                config.debug=true;
            }
        }
        //nuxt modules
        for (let module_key in this.x_state.nuxt_config.modules) {
            let module = this.x_state.nuxt_config.modules[module_key];
            if (Object.keys(module)=='') {
                config.modules.push(module_key);
            } else {
                config.modules.push([module_key,module]);
            }
        }
        //nuxt build_modules
        for (let module_key in this.x_state.nuxt_config.build_modules) {
            let module = this.x_state.nuxt_config.build_modules[module_key];
            if (Object.keys(module)=='') {
                config.buildModules.push(module_key);
            } else {
                config.buildModules.push([module_key,module]);
            }
        }
        //nuxt plugins
        config.plugins = this.x_state.nuxt_config.plugins;
        config.css = this.x_state.nuxt_config.css;
        //muxt server methods
        if (this.x_state.functions && Object.keys(this.x_state.functions).length>0) config.serverMiddleware = ['~/server/api'];
        //nuxt build - cfc: 12637
        //google-autocomplete plugin doesn work if treeShake is true
        config.vuetify = {
            treeShake:false,
            options: {
               variations:false
            }
        }; //8may21 psb
        config.build = { 
            publicPath:'/_nuxt/',
            analyze: false,
            extractCSS: {
                ignoreOrder:true
            },
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
        if (this.x_state.central_config.static==true) {
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
        if (this.x_state.central_config.stage && this.x_state.central_config.stage!='production' && this.x_state.central_config.stage!='prod') {
            config.build.publicPath = `/${this.x_state.central_config.stage}/_nuxt/`;
        }
        //we don't need webpack build rules in this edition:omit from cfc, so we are ready here
        //let util = require('util');
        //let content = util.inspect(config,{ depth:Infinity }).replaceAll("'`","`").replaceAll("`'","`");
        if (this.deploy_module.modifyNuxtConfig) {
            config = await this.deploy_module.modifyNuxtConfig(config);
        }
        let content = this.jsDump(config).replaceAll("'`","`").replaceAll("`'","`");
        await this.writeFile(target,`export default ${content}`);
        //this.x_console.outT({ message:'future nuxt.config.js', data:data});
    }

    async createPackageJSON() {
        let data = {
            name: this.x_state.central_config.service_name,
            version: '',
            description: this.x_state.central_config[':description'],
            //main: 'index.js',
            dependencies: {},
            devDependencies: {},
            scripts: {
                build: 'webpack --mode production',
                'build:dev': 'webpack --mode development',
                'build:start': `cd dist && PORT=${this.x_state.central_config.port} npx serve`,
                start: 'webpack serve --open --mode development',
                'start:live': 'webpack serve --open --mode development --live-reload --hot',
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
        if (this.x_state.central_config[':version']) data.version = this.x_state.central_config[':version'];
        if (this.x_state.central_config[':author']) data.author = this.x_state.central_config[':author'];
        if (this.x_state.central_config[':license']) data.license = this.x_state.central_config[':license'];
        if (this.x_state.central_config[':git']) {
            data.repository = {
                type: 'git',
                url: `git+${this.x_state.central_config[':git']}.git`
            };
            data.bugs = {
                url: `${this.x_state.central_config[':git']}/issues`
            }
            data.homepage = this.x_state.central_config[':git'];
        }
        if (this.x_state.central_config[':keywords']) data.keywords = this.x_state.central_config[':keywords'].split(',');
        //add dependencies
        for (let pack in this.x_state.npm) {
            if (this.x_state.npm[pack].includes('http') && this.x_state.npm[pack].includes('github.com')) {
                data.dependencies[pack] = `git+${this.x_state.npm[pack]}`;
            } else {
                data.dependencies[pack] = this.x_state.npm[pack];
            }
        }
        //add devDependencies
        for (let pack in this.x_state.dev_npm) {
            if (this.x_state.dev_npm[pack].includes('http') && this.x_state.dev_npm[pack].includes('github.com')) {
                data.devDependencies[pack] = `git+${this.x_state.dev_npm[pack]}`;
            } else {
                data.devDependencies[pack] = this.x_state.dev_npm[pack];
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
        let path = require('path');
        let target = path.join(this.x_state.dirs.app,`package.json`);
        if (this.deploy_module.modifyPackageJSON) {
            data = await this.deploy_module.modifyPackageJSON(data);
        }
        let content = JSON.stringify(data);
        await this.writeFile(target,content);
        //this.x_console.outT({ message:'future package.json', data:data});
    }

    async createStorybookFiles() {
        //23-nov-22 commented out for now
        // creates Storybook required files
        if (this.x_state.central_config.storybook==true) {
            let path = require('path');
            let spawn = require('await-spawn');
            let spinner = this.x_console.spinner({ message:'Installing storybook' });
            try {
                let install = await spawn('npx',['sb','init','-f'],{ cwd:this.x_state.dirs.app });
                spinner.succeed(`Storybook installed and initialized successfully`);
            } catch(n) { 
                spinner.fail('Storybook failed to initialize');
            }
            // creates .storybook/main.js file
            let data = {
                'stories': [
                    '../stories/**/*.stories.mdx',
                    '../stories/**/*.stories.@(js|jsx|ts|tsx)'
                ],
                'addons': [
                    "@storybook/addon-links",
                    "@storybook/addon-essentials",
                    '@socheatsok78/storybook-addon-vuetify'
                ]
            };
            //write main.js to disk
            //this.x_console.outT({ message:'STORYBOOK dirs', color:'yellow', data:this.x_state.dirs });
            let target = path.join(this.x_state.dirs['storybook'],`main.js`);
            let content = 'module.exports = '+JSON.stringify(data);
            await this.writeFile(target,content);
            // creates .storybook/preview.js
            content = `import { withVuetify } from '@socheatsok78/storybook-addon-vuetify/dist/decorators'

export const parameters = {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
}

export const decorators = [
    withVuetify
]`;
            // write preview.js to disk
            target = path.join(this.x_state.dirs['storybook'],`preview.js`);
            await this.writeFile(target,content);
            // creates/writes .storybook/preview-head.html
            content = `<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons">`;
            target = path.join(this.x_state.dirs['storybook'],`preview-head.html`);
            await this.writeFile(target,content);
            // creates custom Theme
            // copy po logo
            let po_logo = path.join(__dirname,'assets','po.png');
            let po_target = path.join(this.x_state.dirs['stories_assets'],'po.png');
            let fs = require('fs-extra');
            await fs.copy(po_logo,po_target);
            // remove original stories
            //let fso = require('fs').promises;
            await fs.rmdir(this.x_state.dirs['stories'].replace('stories2','stories'), { recursive:true })
            // copy stories2 to stories folder
            await fs.copy(this.x_state.dirs['stories'],this.x_state.dirs['stories'].replace('stories2','stories'));
            await fs.rmdir(this.x_state.dirs['stories'], { recursive:true })
            //await fs.remove(path.resolve());
            // creates/writes .storybook/potheme.js
            let config = {
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
                appBorderRadius: 1,
            };
            content = `import { create } from '@storybook/theming'\n`;
            content += `export default create(${JSON.stringify(config)});`;
            target = path.join(this.x_state.dirs['storybook'],`po.js`);
            await this.writeFile(target,content);
            // creates/writes .storybook/manager.js
            content = `import { addons } from '@storybook/addons';\n`;
            content += `import poTheme from './po';\n\n`;
            content += `addons.setConfig({ theme: poTheme });`;
            target = path.join(this.x_state.dirs['storybook'],`manager.js`);
            await this.writeFile(target,content);
        }
    }

    async createVSCodeHelpers() {
        // creates Visual Studio code common helpers
        let path = require('path');
        // creates /jsconfig.json file for Vetur and IntelliSense
        let data = {
            include: [ './src/**/*' ],
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
            exclude: ['node_modules','dist','secrets']
        };
        //write to disk
        let target = path.join(this.x_state.dirs.app,`jsconfig.json`);
        let content = JSON.stringify(data);
        await this.writeFile(target,content);
    }

    async createServerlessYML() {
        let yaml = require('yaml'), data = {};
        let deploy = this.x_state.central_config.deploy+'';
        if (deploy.includes('eb:')==false && 
            deploy.includes('s3:')==false && 
            deploy!=false &&
            deploy!='local') {
            data.service = this.x_state.central_config.service_name;
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
            for (let secret in this.x_state.secrets) {
                data.custom[secret] = '${file(secrets/'+secret+'.json)}'
            }
            //domain info
            if (this.x_state.central_config.dominio) {
                data.custom.customDomain = {
                    domainName: this.x_state.central_config.dominio
                };
                if (this.x_state.central_config.basepath) data.custom.customDomain.basePath = this.x_state.central_config.basepath;
                if (this.x_state.central_config.stage) data.custom.customDomain.stage = this.x_state.central_config.stage;
                data.custom.customDomain.createRoute53Record = true;
            }
            //nodejs env on aws
            data.provider = {
                name: 'aws',
                runtime: 'nodejs8.10',
                timeout: this.x_state.central_config.timeout
            };
            if (this.x_state.central_config.stage) data.provider.stage = this.x_state.central_config.stage;
            //env keys
            if (Object.keys(this.x_state.config_node)!='') {
                data.provider.enviroment = {};
                if (this.x_state.central_config.stage) data.provider.enviroment.STAGE = this.x_state.central_config.stage;
                if (this.x_state.config_node.vpc) {
                    data.provider.vpc = {
                        securityGroupIds: [this.x_state.config_node.vpc.security_group_id],
                        subnetIDs: []
                    };
                    if (this.x_state.secrets.vpc) {
                        data.provider.vpc.securityGroupIds = ['${self:custom.vpc.SECURITY_GROUP_ID}'];
                    }
                    if (this.x_state.config_node.vpc.subnet1_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET1_ID}'); 
                    if (this.x_state.config_node.vpc.subnet2_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET2_ID}');
                    if (this.x_state.config_node.vpc.subnet3_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET3_ID}');
                    if (this.x_state.config_node.vpc.subnet4_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET4_ID}');
                    if (this.x_state.config_node.vpc.subnet5_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET5_ID}');
                    if (this.x_state.config_node.vpc.subnet6_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET6_ID}');
                    if (this.x_state.config_node.vpc.subnet7_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET7_ID}');
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
                    events: [{'http':'ANY /'},{'http':'ANY /{proxy+}'}]
                }
            };
            if (this.x_state.central_config['keep-warm']) {
                data.functions.nuxt.events.push({ schedule: 'rate(20 minutes)'})
            }
            //aws resources for s3 (x_state.aws_resources) (@TODO later - no commands use them - cfc:13017)
            //serverless plugins
            data.plugins = ['serverless-apigw-binary',
                            'serverless-offline',
                            'serverless-prune-plugin'];
            if (this.x_state.central_config.dominio) data.plugins.push('serverless-domain-manager');
            //write yaml to disk
            let content = yaml.stringify(data);
            let path = require('path');
            let target = path.join(this.x_state.dirs.app,`serverless.yml`);
            await this.writeFile(target,content);
            //debug
            //this.debug('future serverless.yml', content);
        }
    }

    async onEnd() {
        //execute deploy (npm install, etc) AFTER vue compilation (18-4-21: this is new)
        if (!this.errors_found) {
            //only deploy if no errors were found
            if (!(await this.deploy_module.deploy())) {
                this.x_console.outT({ message:'Something went wrong deploying, check the console, fix it and run again.', color:'red' });
                await this.deploy_module.post();
                // found errors deploying
                process.exit(100);
            } else {
                await this.deploy_module.post();
            }
        } else {
            //found errors compiling
            process.exit(50);
        }
    }

    async exists(dir_or_file) {
        let fs = require('fs').promises;
        try {
            await fs.access(dir_or_file);
            return true;
        } catch(e) {
            return false;
        }
    }

    async writeFile(file,content,encoding='utf-8') {
        let fs = require('fs').promises, prettier = require('prettier');
        let ext = file.split('.').splice(-1)[0].toLowerCase();
        this.debug('writeFile:'+file+' (ext:'+ext+')');
        /*let beautify = require('js-beautify');
        let beautify_js = beautify.js;
        let beautify_vue = beautify.html;
        let beautify_css = beautify.css;*/
        let resp = content;
        if (ext=='jsx') {
            try {
                resp = prettier.format(resp, { 
                    parser: 'babel', useTabs:true, singleQuote:true, bracketSameLine:true 
                });
            } catch(ee) {
                this.debug(`error: could not format the JS file; trying js-beautify`);
                let beautify = require('js-beautify');
                let beautify_js = beautify.js;
                resp = beautify_js(resp,{});
            }
        } else if (ext=='js') { // && file.indexOf('pages/')==-1 25nov22
            //dont format js pages (for now 24-11-22)
            try {
                resp = prettier.format(resp, { 
                    parser: 'babel', useTabs:true, singleQuote:true, bracketSameLine:true 
                });
            } catch(ee) {
                this.debug(`error: could not format the JS file; trying js-beautify`);
                let beautify = require('js-beautify');
                let beautify_js = beautify.js;
                resp = beautify_js(resp,{});
            }
        } else if (ext=='babelrc') {
            let beautify = require('js-beautify');
            let beautify_js = beautify.js;
            resp = beautify_js(resp,{});

        } else if (ext=='json') {
            try {
                resp = prettier.format(resp, { parser: 'json' });
            } catch(ee) {
                this.debug(`error: could not format the JSON file; trying js-beautify`);
                let beautify = require('js-beautify');
                let beautify_js = beautify.js;
                resp = beautify_js(resp,{});
            }
        } else if (ext=='html') {
            /*
            let beautify = require('js-beautify');
            let beautify_vue = beautify.html;
            resp = beautify_vue(resp.replaceAll(`="xpropx"`,''),{});*/
            resp = resp.replaceAll(`="xpropx"`,'');
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
            } catch(ee) {
                this.debug(`warning: could not format the html file; trying vue-beautify`,ee);
                let beautify = require('js-beautify');
                let beautify_vue = beautify.html;
                resp = beautify_vue(resp,{});
            }

        } else if (ext=='css') {
            //console.log('prettifiing CSS');
            resp = prettier.format(resp, { parser: 'css' });
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
        let target_exists = await this.exists(file);
        let same=false;
        if (target_exists) {
			let prev = await fs.readFile(file,encoding);
            let prev_hash = await this.hash(prev);
            let curr_hash = await this.hash(resp);
            //this.debug('testing file writing hashes',{prev_hash,curr_hash});
            if (prev_hash==curr_hash) same=true;
        }
        if (!same) await fs.writeFile(file, resp, encoding);
    }

    //Transforms the processed nodes into files.
    async onCreateFiles(processedNodes) {
        //copy our 'autocomplete' assets folder to this.autocomplete.path
        if (this.autocomplete && this.autocomplete.path && this.autocomplete.path!='') {
            const path = require('path');
            const sourceAssets = path.join(__dirname,'assets','autocomplete');
            this.debug(`- copying react autocomplete assets to project .autocomplete folder`); //+this.autocomplete.path
            let copy = require('recursive-copy');
            try {
                await copy(sourceAssets, this.autocomplete.path, { overwrite: true });
            } catch(ercp) {
            }
        }
        //this.x_console.out({ message:'onCreateFiles', data:processedNodes });
        //this.x_console.out({ message:'x_state.plugins', data:this.x_state.plugins });
        await this.generalConfigSetup();
        await this.createGitIgnore();
        //create @pages/index.js file with references
        let page_exports = '';
        let comp_exports = '';
        for (let thefile_num in processedNodes)  {
            let thefile = processedNodes[thefile_num];
            let page = this.x_state.pages[thefile.title];
            if (page) {
                //console.log('page',page);
                const name = thefile.file.split('.')[0];
                if (page.type=='page') {
                    page_exports += `export { ${name} } from './${name}';\n`;
                } else if (page.type=='component') {
                    comp_exports += `export { ${name} } from './${name}';\n`;
                }
            }
        }
        if (page_exports!='') this.writeFile(this.g('@pages/index.js'),page_exports);
        if (comp_exports!='') this.writeFile(this.g('@components/index.js'),comp_exports);        
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
        this.debug('processing nodes');
        let fs = require('fs').promises, path = require('path');
        for (let thefile_num in processedNodes)  {
            //await processedNodes.map(async function(thefile) {
            let thefile = processedNodes[thefile_num]; // only level 2 nodes!
            let contenido = thefile.code + '\n';
            let toDisk = async function(thefile) {
                //@todo transform this whole block into a function (so .grouped) can also called it per file
                this.debug('processing node ' + thefile.title); //, thefile
                let page = this.x_state.pages[thefile.title];
                let react = await this.getBasicReact(thefile);
                // @TODO check the react.template replacements (8-mar-21)
                // declare server:asyncData
                this.debug('post-processing internal custom tags');
                await this.processInternalTags(react, page);
                // closure ...
                // **** **** start script wrap **** **** **** **** 
                let script_imports = '';
                // header for imports
                if (page) {
                    // group by key (if multiple of the same pkg)
                    let grouped = {};
                    for (let var_ in page.imports) {
                        if (!grouped[page.imports[var_]]) grouped[page.imports[var_]] = [];
                        grouped[page.imports[var_]].push(var_);
                    }
                    for (let key in grouped) {
                        if (key.indexOf('/')!=-1 && key.indexOf(grouped[key])!=-1) {
                            // if import key is part of the package key string (and contains a /), then do a direct import
                            script_imports += `import ${grouped[key].join(',')} from '${key}';\n`;
                        } else {
                            script_imports += `import { ${grouped[key].join(',')} } from '${key}';\n`;
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
                react.script = `import React, { useState, useEffect } from 'react';
                {concepto:import}

                export const {concepto:name} = ({concepto:attributes}) => {
                    {concepto:variables}
                    {concepto:params}
                    {concepto:init}
                    {concepto:methods}
                    return (
                        <>
                        {concepto:template}
                        </>
                    )
                }`;
                
                react.script = react.script.replaceAll('{concepto:name}',thefile.file.split('.')[0]);
                react.script = react.script.replaceAll('{concepto:variables}',react.variables);
                react.script = react.script.replaceAll('{concepto:template}',react.template);
                react.script = react.script.replaceAll('{concepto:init}',react.init); //@todo
                react.script = react.script.replaceAll('{concepto:methods}',''); //@todo
                //page.params is only for components not pages
                if (page.params=='' || page.type=='page') {
                    react.script = react.script.replaceAll('{concepto:attributes}','{ children }');
                } else if (page.type!='page') {
                    let multiparams = page.params;
                    if (page.params.indexOf(',')==-1) {
                        multiparams = [page.params];
                        multiparams.push('children');
                        multiparams = multiparams.join(',');
                    } else {
                        multiparams = page.params.split(',').push('children').join(',');
                    }
                    react.script = react.script.replaceAll('{concepto:attributes}',`{ ${multiparams} }`);
                }
                // add support for page params
                let pageParams = '';
                if (page.type=='page' && page.params!='') {
                    if (!this.x_state.npm['react-router-dom']) this.x_state.npm['react-router-dom']='5.3.3';
                    script_imports += `import { useLocation } from 'react-router-dom';\n`;
                    pageParams += `const location_ = useLocation();\n`;
                    pageParams += `const query_ = new URLSearchParams(location_.search);\n`;
                    pageParams += `const $params = {};\n`;
                    page.params.split(',').map(function(param) {
                        pageParams += `$params['${param}'] = query_.get('${param}')`;
                        if (page.defaults && page.defaults[param]) {
                            pageParams += ` || '${page.defaults[param]}'`;
                        }
                        pageParams += `;\n`;
                    });
                } else if (page.params!='') {
                    //remap each prop argument to $params
                    pageParams += `const $params = {};\n`;
                    page.params.split(',').map(function(param) {
                        pageParams += `$params['${param}'] = ${param}`;
                        if (page.defaults && page.defaults[param]) {
                            pageParams += ` || '${page.defaults[param]}'`;
                        }
                        pageParams += `;\n`;
                    });
                }
                react.script = react.script.replaceAll('{concepto:params}',pageParams); //@todo
                // create page styles if any
                if (Object.keys(page.styles).length>0) {
                    // transform page.styles arrays into a single object
                    let copy_ = { ...page.styles };
                    for (let key in copy_) {
                        if (Array.isArray(copy_[key])) {
                            let sObj = {};
                            for (let i=0;i<copy_[key].length;i++) {
                                let keys_ = Object.keys(copy_[key][i]);
                                for (let j=0;j<keys_.length;j++) {
                                    let key_ = keys_[j];
                                    let value_ = copy_[key][i][key_];
                                    sObj[key_] = value_;
                                }
                                //let value_ = Object.values(copy_[key][i])[0];
                                //sObj[key_] = value_;
                            }
                            page.styles[key] = sObj;
                        }
                    }
                    //
                    // create file @styles/{thefile.file.replaceAll('.js','.type.css')}
                    let page_css = stringify(page.styles);
                    let page_import = thefile.file.replaceAll('.js',`.module.css`);
                    let page_css_file = '';
                    if (page.type=='page') {
                        page_css_file = this.g(`@pages/${page_import}`);
                        script_imports += `import $styles from './${page_import}';\n`;
                    } else {
                        page_css_file = this.g(`@components/${page_import}`);
                        script_imports += `import $styles from './${page_import}';\n`;
                    }
                    await this.writeFile(page_css_file,page_css);
                    // add to script_imports
                    //this.debug('CSS the file',thefile.file);
                }
                // add import { stateProxy } from 'react-state-proxy'; if react.variables is not empty
                if (react.variables!='') {
                    script_imports += `import { stateProxy } from 'react-state-proxy';\n`;
                }
                // add imports
                react.script = react.script.replaceAll('{concepto:import}',script_imports);
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
                if (page.type=='page') {
                    //let w_path = path.join(this.x_state.dirs.pages, thefile.file);
                    this.x_console.outT({ message: `writing react 'page' file ${thefile.file}`, color: 'cyan' });
                    await this.writeFile(this.g(`@pages/${thefile.file}`), react.full);
                } else if (page.type=='component') {
                    this.x_console.outT({ message: `writing react 'component' file ${thefile.file}`, color: 'cyan' });
                    await this.writeFile(this.g(`@components/${thefile.file}`), react.full);
                }
                //
                //this.x_console.out({ message: 'vue ' + thefile.title, data: { vue, page_style: page.styles } });
            }.bind(this);
            //
            if (thefile.file.split('.').slice(-1) == 'omit') {
                //@todo 23nov22: refactor this
                //await this.processOmitFile(thefile);
                //process special non 'files'
            } else if (thefile.file.includes('.group')==true) {
                this.x_console.outT({ message: `segmenting 'group' file ${thefile.file}`, color: 'cyan' });
                //console.log('@TODO pending support for "grouped" components');
                //extract react_file tags
                this.debug('processing group '+thefile.file+' of files',thefile);
                let cheerio = require('cheerio');
                let $ = cheerio.load(thefile.code, { ignoreWhitespace: false, xmlMode: true, decodeEntities: false });
                let files_ = $(`react_file`).toArray();
                let tobe_created = [];
                files_.map(function(file_) {
                    let cur = $(file_);
                    let title = cur.attr('title') ? cur.attr('title') : '';
                    let node_id = cur.attr('node_id') ? cur.attr('node_id') : '';
                    let code = cur.html();
                    tobe_created.push({
                        id:node_id,
                        code:code,
                        valid:true,
                        error:false,
                        hasChildren:true,
                        open:'',
                        close:'',
                        x_ids:''
                    });
                });
                for (let tobe of tobe_created) {
                    let the_node = await this.dsl_parser.getNode({ id:tobe.id, recurse: false });
                    tobe.title = await this.onDefineTitle(the_node);
                    tobe.file = await this.onDefineFilename(the_node);
                    //console.log('to create ',tobe);
                    //console.log('the page',this.x_state.pages[tobe.title]);
                    //process.exit(0);
                    await toDisk(tobe);
                }
                //await this.processOmitFile(thefile);
                //expand 'grouped' pages a sub-process them
            } else {
                await toDisk(thefile);
            }
            //this.x_console.out({ message:'pages debug', data:this.x_state.pages });
            await this.setImmediatePromise(); //@improved
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
        await this.createSystemFiles(processedNodes);
        //@todo 23nov22 create method for declaring default mf files structure
        //declare required plugins
        //-await this.installRequiredPlugins();
        //create NuxtJS plugin definition files
        //-let nuxt_plugs = await this.createNuxtPlugins(); //return plugin array list for nuxt.config.js
        //-this.x_state.nuxt_config.plugins = nuxt_plugs.nuxt_config;
        //-this.x_state.nuxt_config.css = nuxt_plugs.css_files;
        //create package.json
        await this.createPackageJSON();
        //create storybook related files
        //await this.createStorybookFiles();
        //create VSCode helpers
        await this.createVSCodeHelpers();
        //create serverless.yml for deploy:sls - cfc:12881
        //-await this.createServerlessYML();
        // execute deploy (npm install, etc) - moved to onEnd
        // copy assets
        //this.debug('DEBUG assets',this.x_state.assets);
         if (Object.keys(this.x_state.assets).length>0) {
             this.debug({ message: `Copying assets`, color:'cyan'});
             let copy = require('recursive-copy');
             for (let i in this.x_state.assets) {
                 //@TODO add support for i18n assets
                 let asset = this.x_state.assets[i];
                 if (!asset.i18n) {
                     let source = path.join(this.x_state.dirs.base, asset.original);
                     let target = path.join(this.x_state.dirs.assets,asset.original.split('/').slice(-1)[0]);
                     //this.debug({ message: `Copying asset`, data:{source,target}, color:'cyan'});
                     try { await copy(source, target, { overwrite:true }); } catch(e) {}
                 }
                 await this.setImmediatePromise(); //@improved
             }
             this.debug({ message:`Copying assets ready`, color:'cyan'});
         }
         //
        
    }

    // ************************
    // INTERNAL HELPER METHODS 
    // ************************

    /*
     * Returns true if a local server is running on the DSL defined port
     */
    async _isLocalServerRunning() {
        let is_reachable = require('is-port-reachable');
        let resp = await is_reachable(this.x_state.central_config.port);
        return resp;
    }

    /*
     * Reads the node called modelos and creates tables definitions and managing code (alias:database).
     */
    async _readModels() {
        // @IDEA this method could return the insert/update/delete/select 'function code generators'
        // @TODO refactor this for react - AlaSQL in react; should live within a ContextProvider
        this.debug('_readModels');
        this.debug_time({ id: 'readModels' });
        let modelos = await this.dsl_parser.getNodes({ text: 'models', level: 2, icon: 'desktop_new', recurse: true }); //nodes_raw:true	
        let tmp = { appname: this.x_state.config_node.name },
            fields_map = {};
        let resp = {
            tables: {},
            attributes: {},
            length: 0,
            doc: ''
        };
        // map our values to real database values 
        let type_map = {
            id: { value: 'INT AUTOINCREMENT PRIMARY KEY', alias: ['identificador', 'autoid', 'autonum', 'key'] },
            string: { value: 'STRING', alias: ['varchar', 'string', 'text'] },
            int: { value: 'INTEGER', alias: ['numero chico', 'small int', 'numero'] },
            float: { value: 'FLOAT', alias: ['decimal', 'real'] },
            boolean: { value: 'BOOLEAN', alias: ['boleano', 'true/false'] },
            date: { value: 'DATEONLY', alias: ['fecha'] },
            datetime: { value: 'DATETIME', alias: ['fechahora'] },
            blob: { value: 'BLOB', alias: ['binario', 'binary'] }
        };
        // expand type_map into fields_map
        Object.keys(type_map).map(function(x) {
            let aliases = type_map[x].alias;
            aliases.push(x);
            aliases.map(y => { fields_map[y] = type_map[x].value });
        });
        // parse nodes into tables with fields
        if (modelos.length > 0) {
            //modelos[0].attributes.map(x=>{ resp.attributes={...resp.attributes,...x} }); //modelos attributes
            resp.attributes = {...modelos[0].attributes };
            resp.doc = modelos[0].text_note;
            resp.length = modelos[0].nodes.length;
            for (let table of modelos[0].nodes) {
                let fields = {...table.attributes }; //table.attributes.map(x=>{ fields={...fields,...x} }); //table attributes
                resp.tables[table.text] = { fields: {} }; //create table
                tmp.sql_fields = [];
                for (let field in fields) {
                    resp.tables[table.text].fields[field] = fields_map[fields[field]]; //assign field with mapped value
                    tmp.sql_fields.push(field + ' ' + fields_map[fields[field]]);
                }
                resp.tables[table.text].sql = `CREATE TABLE ${table.text}(${tmp.sql_fields.join(',')})`;
                await this.setImmediatePromise(); //@improved
            }
        }
        this.debug_timeEnd({ id: 'readModels' });
        // install alaSQL plugin and define tables
        if (resp.length > 0) {
            // get tables sql create
            let ala_create = [];
            for (let table in resp.tables) {
                ala_create.push(`alasqlJs('${resp.tables[table].sql}');`);
            }
            // set custom install code
            let ala_custom =
                `const alasql = {
				install (v) {
					// create tables from models
					${ala_create.join('\n')}
					Vue.prototype.alasql = alasqlJs;
				}
			}`;
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
    }

    /*
     * Reads main theme node, and returns object with info
     */
    async _readTheme() {
        let resp = { palette:{} },
            path = require('path');
        this.debug('_readTheme');
        this.debug_time({ id: '_readTheme' });
        
        let theme = await this.dsl_parser.getNodes({ text: 'theme', level: 2, icon: 'desktop_new', recurse: true }); //nodes_raw:true
        if (theme.length > 0) {
            theme = theme[0];
            resp.palette = theme.attributes;
            for (let child of theme.nodes) {
                if (child.bgcolor!='') {
                    // assume it's a color
                    // & merge with child attributes (ex. dark:another_color )
                    resp.palette[child.text] = deepMerge({ main:child.bgcolor.toUpperCase() },child.attributes);
                }
            }
        } 
        this.debug_timeEnd({ id: '_readTheme' });
        return resp;
    }

    /*
     * Reads main style node, and returns object with info
     */
    async _readStyle() {
        let resp = {},
            path = require('path');
        this.debug('_readStyle');
        this.debug_time({ id: '_readStyle' });
        
        let style = await this.dsl_parser.getNodes({ text: 'styles', level: 2, icon: 'desktop_new', recurse: true }); //nodes_raw:true
        if (style.length > 0) {
            style = style[0];
            for (let child of style.nodes) {
                if (child.link!='') {
                    // if it's a link, test if it's a font -> extensions: .ttf, .otf, .woff, .woff2
                    let ext = path.extname(child.link);
                    if (['.ttf', '.otf', '.woff', '.woff2'].indexOf(ext) > -1) {
                        // it's a font; add style to resp object
                        if (!resp['@font-face']) resp['@font-face'] = [];
                        // get file from path
                        let file = path.basename(child.link);
                        resp['@font-face'].push({
                            fontFamily: child.text,
                            src: `url('../assets/${file}')`
                        });
                        // add to this.x_state.assets object (original) to be copied to dist
                        this.x_state.assets[child.link] = {
                            original: child.link, // needs to be relative
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
        this.debug_timeEnd({ id: '_readStyle' });
        return resp;
    }

    /*
     * Reads assets node, and returns object with info
     */
    async _readAssets() {
        let resp = {},
            path = require('path');
        this.debug('_readAssets');
        this.debug_time({ id: '_readAssets' });
        let assets = await this.dsl_parser.getNodes({ text: 'assets', level: 2, icon: 'desktop_new', recurse: true }); //nodes_raw:true
        let sep = path.sep;
        //
        //this.debug('assets search',assets);
        if (assets.length > 0) {
            assets = assets[0];
            // 15ms full
            for (let child of assets.nodes) {
                if (child.nodes.length == 1 && child.nodes[0].image != '') {
                    // if there is just 1 grand-child and has an image defined
                    resp[child.text.toLowerCase()] = {
                        i18n: false,
                        original: child.nodes[0].image,
                        css: '~assets' + sep + path.basename(child.nodes[0].image),
                        js: '~' + sep + 'assets' + sep + path.basename(child.nodes[0].image)
                    }

                } else if (child.nodes.length > 1) {
                    // if child has more than 1 child (grandchild), we'll assume its an image with i18n alternatives
                    let key = child.text.toLowerCase();
                    resp[key] = { i18n: true, i18n_keys: [] };
                    for (let i18n_node of child.nodes) {
                        // expand node attributes
                        let attrs = {...i18n_node.attributes };
                        /*i18n_node.attributes.map(function(x) {
                        	attrs = {...attrs,...x};
                        });*/
                        if (attrs.idioma && i18n_node.image != '') {
                            let lang = attrs.idioma.toLowerCase();
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
        this.debug_timeEnd({ id: '_readAssets' });
        return resp;
    }

    /* 
     * Grabs central node configuration information
     */
    async _readCentralConfig() {
        this.debug('_readCentralConfig');
        let central = await this.dsl_parser.getNodes({ level: 1, recurse: false });
        //this.debug('central search',central);
        // set defaults
        let resp = {
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
            ':cache': this.x_config.cache,
            ':mode': 'spa',
            ':keywords': '',
            ':author': 'Punto Origen SpA',
            ':license': 'MIT',
            ':github': '',
            ':version': '1.0.0',
            ':description': central[0].text_note,
            default_face: central[0].font.face,
            default_size: central[0].font.size,
            apptitle: central[0].text.replace(' ','_'),
        };
        // overwrite default resp with info from central node
        //resp = {...resp, ...central[0].attributes };
        //bit slower but transforms string booleans (19-4-21)
        let values = {};
        for (let xz in central[0].attributes) {
            let x = central[0].attributes[xz];
            if (x=='true') { 
                x=true;
            } else if (x=='false') {
                x=false;
            }
            values = {...values,...{[xz]:x}};
        }
        resp = {...resp, ...values };
        /*central[0].attributes.map(function(x) {
        	resp = {...resp,...x};
        });*/
        if (resp.dominio) {
            resp.service_name = resp.dominio.replace(/\./g, '').toLowerCase();
        } else {
            resp.service_name = resp.apptitle;
        }
        if (!resp[':cache']) this.x_config.cache = false; // disables cache when processing nodes (@todo)
        // test if whole project is 'shared' (has a star on the central node)
        if (central[0].icons.includes('bookmark')==true) resp.shared = true;
        // return
        return resp;
    }


    /* helper for readConfig and secrets extraction */
    configFromNode(resp,key) {
        if (key.icons.includes('button_cancel')==false) {                
            if (Object.keys(key.attributes).length > 0) {
                // prepare config key
                let config_key = key.text.toLowerCase().replace(/ /g, '');
                //alt1 let values = {...key.attributes }; 
                //alt2, bit slower but considers booleans as string
                let values = {};
                for (let xz in key.attributes) {
                    let x = key.attributes[xz];
                    if (x=='true') { 
                        x=true;
                    } else if (x=='false') {
                        x=false;
                    }
                    values = {...values,...{[xz]:x}};
                }
                resp[config_key] = values;
                // mark secret status true if contains 'password' icon
                if (key.icons.includes('password')) {
                    resp[config_key][':secret'] = true;
                    if (!resp['::secrets']) resp['::secrets']=[];
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
            if (key.text==':secrets' && key.icons.includes('password')) {
                resp[':secrets'] = key.text_note.replaceAll('\n','').trim();
            }
        }
        return resp;
    }

    /*
     * Grabs the configuration from node named 'config'
     */
    async _readConfig(delete_secrets=true) {
        this.debug('_readConfig');
        let resp = { id: '', meta: [], seo: {}, secrets: {} },
            config_node = {};
        let search = await this.dsl_parser.getNodes({ text: 'config', level: 2, icon: 'desktop_new', recurse: true });
        //this.debug({ message:'search says',data:search, prefix:'_readConfig,dim' });
        //
        if (search.length > 0) {
            config_node = search[0];
            // define default font_face
            if (!delete_secrets) resp[':id'] = config_node.id;
            resp.default_face = config_node.font.face;
            resp.default_size = config_node.font.size;
            // apply children nodes as keys/value for resp
            for (let key of config_node.nodes) {
                if (key.text.toLowerCase() == 'meta') {
                    for (let meta_child of key.nodes) {
                        // apply grand_childs as meta tags
                        if (meta_child.text.toLowerCase() == 'keywords') {
                            resp.seo['keywords'] = meta_child.nodes.map(x => x.text);
                            resp.meta.push({ hid: (await this.hash(meta_child.nodes[0].text)), name: 'keywords', content: resp.seo['keywords'].join(',') });

                        } else if (meta_child.text.toLowerCase() == 'language') {
                            resp.seo['language'] = meta_child.nodes[0].text;
                            resp.meta.push({ hid: (await this.hash(meta_child.nodes[0].text)), lang: meta_child.nodes[0].text });

                        } else if (meta_child.text.toLowerCase() == 'charset') {
                            resp.seo['charset'] = meta_child.nodes[0].text;
                            resp.meta.push({ charset: meta_child.nodes[0].text });

                        } else {
                            resp.seo['charset'] = meta_child.nodes[0].text;
                            if (meta_child.text.indexOf(':') != -1) {
                                resp.meta.push({ property: meta_child.text, vmid: meta_child.text, content: meta_child.nodes[0].text });
                            } else {
                                resp.meta.push({ hid: (await this.hash(meta_child.nodes[0].text)), name: meta_child.text, content: meta_child.nodes[0].text });
                            }
                        }
                        //
                    }
                } else {
                    // apply keys as config keys (standard config node by content types)
                    resp = {...resp,...this.configFromNode(resp,key)};
                    //
                }
            }
            //map values that reference other nodes[attr]
            let safe_eval = require('safe-eval');
            const resp2 = JSON.parse(JSON.stringify(resp));
            const central2 = JSON.parse(JSON.stringify(this.x_state.central_config));
            for (let key in resp) {
                if (typeof resp[key] === 'object') {
                    for (let key2 in resp[key]) {
                        if (typeof resp[key][key2] === 'string' && resp[key][key2].indexOf('${')!=-1 && resp[key][key2].indexOf('}')!=-1) {
                            let to_eval = resp[key][key2];
                            to_eval = to_eval.replaceAll('${',"'+").replaceAll('}',"+'");
                            to_eval = "'"+to_eval+"'";
                            if (central2.deploy!='local') central2.deploy='deploy';
                            const eval_ = safe_eval(to_eval,{
                                config:resp2,
                                central:central2
                            });
                            resp[key][key2] = eval_;
                            //console.log('config evaluated',{ to_eval,raw:resp[key][key2], eval_ });
                        }
                    }
                }
            }
        }
        // assign dsl file folder name+filename if node.name is not given
        if (!resp.name) {
            let path = require('path');
            let dsl_folder = path.dirname(path.resolve(this.x_flags.dsl));
            let parent_folder = path.resolve(dsl_folder, '../');
            let folder = dsl_folder.replace(parent_folder, '');
            resp.name = folder.replace('/', '').replace('\\', '') + '_' + path.basename(this.x_flags.dsl, '.dsl');
            //console.log('folder:',{folder,name:resp.name});
            //this.x_flags.dsl
        }
        // create id if not given
        if (!resp.id) resp.id = 'com.puntorigen.' + resp.name;
        // *********************************************
        if (delete_secrets==true) delete resp[':secrets'];
        return resp;
    }

    async getParentNodes(id = this.throwIfMissing('id'), exec = false) {
        let parents = await this.dsl_parser.getParentNodesIDs({ id, array: true });
        let resp = [];
        for (let parent_id of parents) {
            let node = await this.dsl_parser.getNode({ id: parent_id, recurse: false });
            let command = await this.findValidCommand({ node, object: exec });
            if (command) resp.push(command);
            await setImmediatePromise(); //@improved
        }
        return resp;
    }

    //gets the asset code for a given string like: assets:assetname
    getAsset(text = this.throwIfMissing('text'), type = 'js') {
        //this.x_state.assets
        let resp = text.replaceAll('assets:',''),
            type_o = type.replaceAll('jsfunc', 'js').toLowerCase();
        if (text.includes('assets:')) {
            if (resp in this.x_state.assets) {
                if (this.x_state.central_config.idiomas.indexOf(',') != -1 && this.x_state.assets[resp].i18n == true) {
                    let first_key = this.x_state.assets[resp].i18n_keys.split(',')[0];
                    resp = this.x_state.assets[resp][first_key][type_o];
                    if (type.toLowerCase() == 'js') {
                        resp = resp.replaceAll(`/${first_key}/`, `/' + $i18n.locale + '/`);
                        resp = `require('${resp}')`;
                    } else if (type.toLowerCase() == 'jsfunc') {
                        resp = resp.replaceAll(`/${first_key}/`, `/' + this.$i18n.locale + '/`);
                        resp = `require('${resp}')`;
                    }

                } else if (resp in this.x_state.assets && type_o in this.x_state.assets[resp]) {
                    resp = this.x_state.assets[resp][type_o];
                    if (type_o=='js') {
                        resp = `require('${resp}')`;
                    }

                } else {
                    // throw error: invalid type of asset (valid values: css,js - given: ${type})
                }
            }
        }
        return resp;
    }

    //vue attributes tag version
    struct2params(struct = this.throwIfMissing('id')) {
        let resp = [],
            tmp = {...struct };
        // pre-process
        if ('aos' in tmp) {
            let aos_p = struct['aos'].split(',');
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
        for (let [key, value] of Object.entries(tmp)) {
            if (value == null) {
                //needed cause cheerio assigns empty values to props, and vue props don't have values
                //little hack that works together with writeFile method
                resp.push(`${key}="xpropx"`); 
            } else if (typeof value !== 'object' && typeof value !== 'function' && typeof value !== 'undefined') {
                //this.debug('typeof value',typeof value);
                if (key[0] == ':') {
                    //serialize value
                    //this.debug('struct2params',{key,value});
                    let encrypt = require('encrypt-with-password');
                    const val = encrypt.encryptJSON(value,'123');
                    resp.push(`${key.replaceAll(':','')}_encrypt="${val}"`);
                } else if (typeof value === 'string' && (value.indexOf('$params.')!=-1 || value.indexOf('$styles.')!=-1 || value.indexOf('$variables.')!=-1)) {
                    //serialize value
                    //this.debug('struct2params',{key,value});
                    let encrypt = require('encrypt-with-password');
                    const val = encrypt.encryptJSON(value,'123');
                    resp.push(`${key}_encrypt="${val}"`);
                } else {
                    resp.push(`${key}="${value}"`);
                }
            } else if (typeof value === 'object') {
                //serialize value
                let encrypt = require('encrypt-with-password');
                const val = encrypt.encryptJSON(this.jsDump(value),'123');
                resp.push(`${key}_encrypt="${val}"`);
            }
        }
        return resp.join(' ');
    }

    //serializes the given obj escaping quotes from values containing js code
    jsDump(obj) {
        let resp='';
        let isNumeric = function(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        };
        let escape = function(obi) {
            let nuevo = '', ob = obi;
            //special escapes first
            if (typeof ob === 'string' && ob=='{null}') ob = null;
            if (typeof ob === 'string') ob = ob.replaceAll('{now}','new Date()');
            //
            if (typeof ob === 'number') {
                nuevo += ob;
            } else if (ob == null) {
                nuevo = null;
            } else if (typeof ob === 'boolean') {
                nuevo += ob;
            } else if (typeof ob === 'string' &&
                ob.substr(0,2)=='**' && ob.substr(ob.length-2)=='**') {
                nuevo += ob.replaceAll('**',''); //escape single ** vars 21-abr-21
            } else if ((typeof ob === 'string') && (
                ob.charAt(0)=='!' || 
                ob.indexOf('this.')!=-1 || 
                ob.indexOf('new ')!=-1 || 
                ob.indexOf('require(')!=-1 || 
                ob.indexOf(`'`)!=-1 || 
                ob.indexOf('`')!=-1 ||
                (ob.charAt(0)!='0' && isNumeric(ob)) ||
                (ob.charAt(0)=='[' && ob.charAt(ob.length-1)==']') ||
                ob=='0' || 
                ob=='true' || ob=='false')
                ) {
                nuevo += ob;
            } else if (!isNaN(ob) && ob.toString().indexOf('.') != -1) {
                nuevo += ob;
            } else if (typeof ob === 'string') {
                nuevo += `'${ob}'`;
            } else {
                nuevo += ob;
            }
            return nuevo;
        };
        if (Array.isArray(obj)) {
            let tmp = [];
            let resx = '[';
            for (let item in obj) {
                tmp.push(this.jsDump(obj[item]));
                if (resx=='[') {
                    resx += tmp[item];
                } else {
                    resx += ','+tmp[item];
                }
            }
            resp = resx+']';
            //resp = `[${tmp.join(',')}]`;
        } else if (typeof obj === 'object' && obj!=null) {
            let tmp=[];
            //23feb22 test if object if regEx type
            if (obj.toString()[0]=='/' && obj.toString()[obj.toString().length-1]=='/') {
                //regEx type
                resp = obj.toString();
            } else {            
                //
                for (let llave in obj) {
                    let llavet = llave;
                    if (llavet.includes('-') && llavet.includes(`'`)==false) llavet = `'${llave}'`;
                    if (llavet.includes('&') && llavet.includes(`'`)==false) llavet = `'${llave}'`;
                    if (llavet.includes(':') && llavet.includes(`'`)==false) llavet = `'${llave}'`;
                    let nuevo = `${llavet}: `;
                    let valor = obj[llave];
                    if (typeof valor === 'object' || Array.isArray(valor)) {
                        nuevo += this.jsDump(valor);
                    } else {
                        nuevo += escape(valor);
                    }
                    tmp.push(nuevo);
                }
                resp = `{\n${tmp.join(',')}\n}`;
            }
        } else if (typeof(obj) === 'string') {
            resp = escape(obj);
        } else {
            resp = obj;
        }
        return resp;
    }

    // hash helper method
    async hash(thing) {
        let resp = await this.dsl_parser.hash(thing);
        /*const {sha1} = require('crypto-hash');
        let resp = await sha1(thing,{ outputFormat:'hex' });*/
        return resp;
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
        const n = process.versions.node.split('.').map(x => parseInt(x, 10));
        r = r.split('.').map(x => parseInt(x, 10));
        return n[0] > r[0] || (n[0] === r[0] && (n[1] > r[1] || (n[1] === r[1] && n[2] >= r[2])));
    }

    setImmediatePromise() {
        //for preventing freezing node thread within loops (fors)
        return new Promise((resolve) => {
          setImmediate(() => resolve());
        });
    }
}