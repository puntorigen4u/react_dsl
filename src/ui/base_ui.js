/**
* Base UI: A class to define ui frameworks within React DSL
* @name 	base_ui
* @module 	base_ui
**/
export class base_ui {

	constructor({ context={}, name='base_ui' }={}) {
        this.context = context;
        this.name = name;
        this.deepMerge = require('deepmerge');
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

    autocomplete() {
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
        const auto = this.autocomplete();
        const tags = Object.keys(auto).map((tag) => {
            return {
                text: tag,
                icons: auto[tag].icons,
                level: auto[tag].level,
                hint: auto[tag].hint,
                attributes: auto[tag].attributes
            }
        });
        for (let key in tags) {
            await this.context.addAutocompleteDefinition(tags[key]);
        }
    }

    async defaultState() {
        // overwrites defaults for UI libraries as global state
        this.context.x_state.ui = { ...this.context.x_state.ui, ...{
            'textTag': 'div',
            'iconNPM': '',
            'viewNPM': '',
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