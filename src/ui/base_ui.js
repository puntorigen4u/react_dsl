/**
* Base UI: A class to define ui frameworks within React DSL
* @name 	base_ui
* @module 	base_ui
**/
import css from './css-properties.json'

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
            childrenTypes: ['event*','view*','styles'],
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
            childrenTypes: ['view*','attribute*','config','image','styles'],
            attributes: {
                'params': {
                    type: 'string',
                    default: '',
                    hint: 'Comma delimited list of parameters that the component can receive. You can use their value anywhere within the component, using $params.name.'
                }
            }
        };
        shared['file_styles'] = {
            type: 'styles',
            text: 'styles',
            hint: 'Represents a css file to be created related to a file',
            level: [3,4],
            icons: ['desktop_new'],
            childrenTypes: ['style-class*'],
            attributes: {}
        };
        // create a style-class for each html tag
        let tags = Object.keys(css.tags);
        //@TODO restrict tags to only the ones used within the diagram
        for (let i of tags) {
            const tag = css.tags[i];
            shared['style-class-'+i] = {
                type: 'style-class',
                text: tag,
                hint: 'Defines styling CSS attributes for HTML tag '+tag,
                level: [4,5,6,7,8],
                icons: [],
                childrenTypes: ['css-property*'],
                attributes: {}
            };
        }
        // create types 'css-property'
        let props = Object.keys(css.properties);
        for (let i of props) {
            const prop = css.properties[i];
            shared['css-prop-'+i] = {
                type: 'css-property',
                text: i,
                hint: prop.description,
                level: [5,6,7,8,9],
                icons: ['list'],
                childrenTypes: ['css-'+i+'-value'],
                attributes: {}
            };
            // generate AC items for each value of current prop
            for (let type_ of prop.values) {
                shared['css-'+i+'-value-'+type_] = {
                    type: 'css-'+i+'-value',
                    text: type_,
                    hint: `Value for css property <b>${i}</b>.`,
                    level: [6,7,8,9,10],
                    icons: [],
                    childrenTypes: ['none'],
                    attributes: {}
                };
            }
        }
        //console.log('css properties',css.properties);
        return shared;
    }

    async generateAutoComplete() {
        const main = await this.sharedAutocomplete();
        const custom = await this.autocomplete();
        let auto = this.extend(main, custom);
        await this.context.generateAutoComplete(auto);
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
            viewNPMSingle: false, //false -> import { view } from 'viewNPM'; false -> import view from 'viewNPM/view';
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
        // we now use @stitches/stringify
        return {
            body: {
                fontFamily: 'Arial, Helvetica, sans-serif',
            },
            '.container': {
                fontSize: '3rem',
                margin: 'auto',
                maxWidth: '800px',
                marginTop: '20px',
            }
        }
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