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

    async generateAutoComplete() {
        const auto = await this.autocomplete();
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
            // for each attribute
            Object.keys(auto[tag].attributes).forEach((attr_) => {
                // remove all {icon:x} strings from attr_
                let attr__ = attr_.replace(/{icon:[^}]*}/g,'');
                let attr = auto[tag].attributes[attr_];
                if (attr && attr['posibleChildren']) {
                    // for each posibleChildren item
                    attr['posibleChildren'].forEach((child) => {
                        // test if 'child' is within the text of any other key of auto
                        Object.keys(auto).forEach((tag_) => {
                            if (tag_.indexOf(child)!=-1) { 
                                // push child into matching auto[tag_] parents array
                                // only add it to parents that already contain something, to make it specific
                                if (auto[tag_].parents && auto[tag_].parents.length>0) auto[tag_].parents.push(attr__);
                                // also create an autocomplete item for the attribute if it doesn't exist
                                if (!auto[attr__]) {
                                    auto[attr__] = {
                                        text: attr__,
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
                }
            });
        });
        //console.log('auto POST',auto);
        //
        let tags = Object.keys(auto).map((tag) => {
            return {
                text: tag,
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