/**
* Base UI: A class to define ui frameworks within React DSL
* @name 	base_ui
* @module 	base_ui
**/
export class base_ui {

	constructor({ context={}, name='base_ui' }={}) {
        this.context = context;
        this.name = name;
        this.i_commands = {};
        this.extend = require('deepmerge');
    }

    //****************************
    // methods to be overwritten
    //****************************

    async logo({ name=this.name, config={} }={}) {
        let cfonts = require('cfonts');
        //cfonts.say(name, {...{ font:'block', gradient:'red,blue' },...config });
    }

    async install() {
    }

    async autocomplete() {
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
    }

    async sharedAutocomplete() {
        // returns basic autocompletion calls
        // main commands for now; pages, components, models, config node
        let shared = {};
        shared['_centralnode_'] = {
            text: 'appName',
            type: 'config',
            hint: 'Defines the name of the project and its main configuration',
            level: [1],
            icons: [],
            //childrenTypes: ['file','virtual','config','model'],
            attributes: {
                'ui': {
                    type: 'mui,joy,chakra',
                    default: 'mui',
                    hint: 'Name of UI library to use.'
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
        for (let i of ['primary','secondary','error','warning','info','success']) {
            shared[`_themecolor_${i}`] = {
                text: i,
                type: 'theme_color',
                hint: `Defines the ${i} color of the theme. Use the background color of the node to define the color.`,
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
            level: [2,3],
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
            level: [2,3],
            icons: [],
            childrenTypes: ['view*','attribute*','config'],
            attributes: {
                'params': {
                    type: 'string',
                    default: '',
                    hint: 'Comma delimited list of parameters that the component can receive. You can use their value anywhere within the component, using $params.name.'
                }
            }
        };
        return shared;
    }

    async generateAutoComplete() {
        const main = await this.sharedAutocomplete();
        const custom = await this.autocomplete();
        let auto = this.extend(main, custom);
        //console.log('auto pre',auto);
        const extractIcons = (content,icons) => {
            //extracts the icons from the content ({icon:x}{icon:y}z , returns { content:'z', icons:[x,y] })
            let extract = require('extractjs')({
				startExtract: '[',
				endExtract: ']',
			});
            if (!icons) icons=[];
            let new_ = content;
            let resp = { content, icons };
            if (content.indexOf('{icon:')>-1) {            
                let elements = extract(`{icon:[name]}`,new_);
                if (elements.name && !icons.includes(elements.name)) {
                    icons.push(elements.name);
                    new_ = new_.replace(`{icon:${elements.name}}`,''); 
                    resp.content = new_;
                    resp.icons = icons;
                    if (new_.indexOf('{icon:')!=-1) {
                        resp = extractIcons(new_,icons);
                    }
                }
            }
            return resp;
        };
        /* add support for remapping attributes.'posibleChildren' key existance */
        Object.keys(auto).forEach((tag) => {
            // add 'type' to auto[tag] if 'icons' contain 'idea'=view, 'help'=event, 'penguin'=script, 'desktop_new'=command
            if (auto[tag].type.trim()=='') {
                if (auto[tag].icons && auto[tag].icons.includes('idea')) {
                    auto[tag].type = 'view';
                } else if (auto[tag].icons && auto[tag].icons.includes('help')) {
                    auto[tag].type = 'event';
                } else if (auto[tag].icons && auto[tag].icons.includes('penguin')) {
                    auto[tag].type = 'script';
                } else if (auto[tag].icons && auto[tag].icons.includes('desktop_new')) {
                    auto[tag].type = 'command';
                }
            }
            // for each attribute
            Object.keys(auto[tag].attributes).forEach((attr_) => {
                // remove all {icon:x} strings from attr_
                let attr__ = attr_.replace(/{icon:[^}]*}/g,'');
                let attr = auto[tag].attributes[attr_];
                /*
                if (attr && attr['posibleChildren']) {
                    // for each posibleChildren item
                    attr['posibleChildren'].forEach((child) => {
                        // test if 'child' is within the text of any other key of auto
                        Object.keys(auto).forEach((tag_) => {
                            if (tag_.indexOf(child)!=-1) { 
                                // push child into matching auto[tag_] parents array
                                this.context.debug('('+tag+')adding '+child+' to '+tag_+' parents');
                                // only add it to parents that already contain something, to make it specific
                                if (auto[tag_].parents && auto[tag_].parents.length>0) auto[tag_].parents.push(attr__);
                                // also create an autocomplete item for the attribute if it doesn't exist
                                let type__ = (attr_.indexOf('{icon:help}')!=-1)?'event-attribute':'attribute';
                                type__ = (attr_.indexOf('{icon:idea}')!=-1)?'view-attribute':type__;
                                if (!auto[attr__]) {
                                    auto[attr__] = {
                                        text: attr__,
                                        type: type__,
                                        parents: [tag],
                                        icons: extractIcons(attr_).icons,
                                        level: [],
                                        hint: attr.hint,
                                        attributes: {}
                                    };
                                } else {
                                    // if it already existed, add to parents array if it was not there already
                                    if (!auto[attr__].parents.includes(tag)) auto[attr__].parents.push(tag);
                                }
                            }
                        });
                    });
                    delete auto[tag].attributes[attr_]['posibleChildren'];
                }*/
                // also add the attribute to the auto object if it contains {icon:list} within its keyname
                if (attr_.indexOf('{icon:list}')!=-1) {
                    let type__ = (attr_.indexOf('{icon:help}')!=-1)?'event-attribute':'attribute';
                    type__ = (attr_.indexOf('{icon:idea}')!=-1)?'view-attribute':type__;
                    if (!auto[attr__]) {
                        auto[attr__] = {
                            text: attr__,
                            type: type__,
                            parents: [tag],
                            icons: extractIcons(attr_).icons,
                            level: [],
                            hint: attr.hint,
                            childrenTypes: (attr.childrenTypes)?attr.childrenTypes:[],
                            attributes: {}
                        };
                    } else {
                        // if it already existed, add to parents array if it was not there already
                        if (!auto[attr__].parents.includes(tag)) auto[attr__].parents.push(tag);
                    }
                    //
                }
            });
            // for each event, create an auto[tag] item if it doesn't exist, and add 'tag' as a parents item (if it wasn't there already)
            if (auto[tag].events) {
                const params2attr = (params) => {
                    //returns a object with the params as keys, and empty attr object as values
                    let resp = {};
                    if (typeof params=='string') {                    
                        //params is a list string of params, like 'a,b,c'
                        params.split(',').forEach((param) => {
                            resp[param] = {
                                type: 'string',
                                default: '',
                                hint: ''
                            };
                        });
                    } else if (typeof params=='object') {
                        //return params as is, or re-map its keys to match an attr object
                        resp = params;
                    }
                    return resp;
                };
                Object.keys(auto[tag].events).forEach((event) => {
                    if (!auto[event]) {
                        auto[event] = {
                            text: event,
                            type: 'event',
                            parents: [tag],
                            icons: ['help'],
                            level: [],
                            childrenTypes: (auto[tag].events[event].childrenTypes)?auto[tag].events[event].childrenTypes:[],
                            hint: auto[tag].events[event].hint,
                            attributes: (auto[tag].events[event].params)?params2attr(auto[tag].events[event].params):{}
                        };
                    } else {
                        // if it already existed, add to parents array if it was not there already
                        if (!auto[event].parents.includes(tag)) auto[event].parents.push(tag);
                    }
                });
            }
        });
        //console.log('auto POST',auto);
        //
        let tags = Object.keys(auto).map((tag) => {
            return {
                text: (auto[tag].text && auto[tag].text!='')?auto[tag].text:tag, //.replaceAll('*',''),
                //text: tag, //.replaceAll('*',''),
                childrenTypes: (auto[tag].childrenTypes)?auto[tag].childrenTypes:[],
                type: (auto[tag].type)?auto[tag].type:'',
                icons: auto[tag].icons,
                level: auto[tag].level,
                hint: auto[tag].hint,
                attributes: auto[tag].attributes,
                events: (auto[tag].events)?auto[tag].events:{},
                extends_: (auto[tag].extends_)?auto[tag].extends_:'',
                parents: (auto[tag].parents)?auto[tag].parents:[],
            }
        });
        // add to context
        for (let key in tags) {
            await this.context.addAutocompleteDefinition(tags[key]);
        }
    }

    async addCommand(command) {
        this.i_commands = {...this.i_commands, ...command};
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
         */    }
    
    async addCustomCommands() {
        this.context.addCommands(this.i_commands);
    }

    async defaultState() {
        // overwrites defaults for UI libraries as global state
        this.context.x_state.ui = { ...this.context.x_state.ui, ...{
            'textTag': 'div',
            'iconNPM': '',
            'viewNPM': '',
            textSimpleIfParentView: [],
            bold: { //gets merged on textTags
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
        } };
    }

    async AppImports() {
        // whatever is returned is added to App.jsx header
        return '';
    }
    
    async AppWrap() {
        //returns a wrapper for App.jsx template content
        return {
            open:``,
            close:``
        }
    }

    async BabelRC(data) {
        //transforms the given babelrc.json data, before writing it
        return data
    }

    async globalCSS() {
        // whatever is returned is added to globals.css
        return `body {
            font-family: Arial, Helvetica, sans-serif;
          }
          
          .container {
            font-size: 3rem;
            margin: auto;
            max-width: 800px;
            margin-top: 20px;
          }
        `;
    }

    async indexHtmlHead() {
        // whatever is returned is added to the 'head' of index.html
        return '';
    }

    async generateFiles() {
        /**
         * generate theme files within context createSystemFiles()
         * theme data on this.context.x_state.theme
         */
    }

    // HELPER methods
    async exists(dir_or_file) {
        let fs = require('fs').promises;
        try {
            await fs.access(dir_or_file);
            return true;
        } catch(e) {
            return false;
        }
    }

}