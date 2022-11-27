
/**
* JOY UI: A class that adds support for JOY UI Framework on React DSL
* @name 	joy
* @module 	joy
**/
import { base_ui } from './base_ui'

export class joy extends base_ui {

    constructor({ context={} }={}) {
        super({ context, name:'joy' });
    }

    //****************************
    // methods to be overwritten
    //****************************

    async logo({ name=this.name, config={} }={}) {
        let cfonts = require('cfonts');
        //cfonts.say(name, {...{ font:'block', gradient:'red,blue' },...config });
    }

    async install() {
        // add anything that needs to be installed
        this.context.x_state.npm['@mui/joy'] = '*';
        this.context.x_state.npm['@emotion/react'] = '*';
        this.context.x_state.npm['@emotion/styled'] = '*';
        this.context.x_state.npm['@fontsource/public-sans'] = '*';
        this.context.x_state.npm['@mui/icons-material'] = '^5.10.14';
    }

    async autocomplete() {
        // insert associated ui autocompletion calls here
        return [{   
            text:'Button',
            icons:['idea'],
            level:[3,4],
            hint:'Adds a JOY button',
            attributes:{
                //all keys are optional - empty by default
                'variant': { type:'string', default:'solid', hint:'' },
            } 
        }];
    }

    async defaultState() {
        // overwrites defaults for UI libraries as global state
        this.context.x_state.ui = { ...this.context.x_state.ui, ...{ 
            'textTag': 'Typography',
            'viewNPM': '@mui/joy',
            'iconNPM': '@mui/icons-material',
            bold: {
                sx: {
                    fontWeight:'bold'
                }
            },
            italic: {
                sx: {
                    fontStyle:'italic'
                }
            },
            small: {
                variant: 'caption'
            },
            span: {
                component:'span'
            },
        } };
    }

    async AppImports() {
        // whatever is returned is added to App.jsx header
        return `import '@fontsource/public-sans';
        import { CssVarsProvider } from '@mui/joy/styles';
        import CssBaseline from '@mui/joy/CssBaseline';
        `;
    }

    async AppWrap() {
        //returns a wrapper for App.jsx template content
        return {
            open:   
            `<CssVarsProvider>
				<CssBaseline />`,
            close:  
            `</CssVarsProvider>`
        }
    }

    async globalCSS() {
        // whatever is returned is added to globals.css
        return `body {
            font-family: Public Sans, Arial, Helvetica, sans-serif;
          }
        `;
    }
    
    async indexHtmlHead() {
        // whatever is returned is added to the 'head' of index.html
        return `<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />`;
    }

    async generateFiles() {
        /**
         * generate theme files within context createSystemFiles()
         * theme data on this.context.x_state.theme
         */
        const g = this.context.g;
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