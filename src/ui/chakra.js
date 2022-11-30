
/*
* CHAKRA UI: A class that adds support for CHAKRA-UI Framework on React DSL
* @name 	chakra
* @module 	chakra
**/
import { base_ui } from './base_ui'
import { autocomplete } from './chakra/autocomplete';
export class chakra extends base_ui {

    constructor({ context={} }={}) {
        super({ context, name:'chakra' });
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
        this.context.x_state.npm['@chakra-ui/react'] = '*';
        this.context.x_state.npm['@chakra-ui/icons'] = '*';
        this.context.x_state.npm['@emotion/react'] = '^11';
        this.context.x_state.npm['@emotion/styled'] = '^11';
        this.context.x_state.npm['framer-motion'] = '^6';
        this.context.x_state.npm['@fontsource/open-sans'] = '*';
        this.context.x_state.npm['@fontsource/raleway'] = '*';
    }

    async autocomplete() {
        // moved contents to external file: chakra/autocomplete.js
        return await autocomplete();
    }

    async defaultState() {
        // overwrites defaults for UI libraries as global state
        this.context.x_state.ui = { ...this.context.x_state.ui, ...{ 
            'textTag': 'Text',
            'viewNPM': '@chakra-ui/react',
            'iconNPM': '@chakra-ui/icons',
            textSimpleIfParentView: [],
            bold: {
                fontWeight: 'bold'
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
                as:'span'
            },
        } };
    }

    async AppImports() {
        // whatever is returned is added to App.jsx header
        return `
        import { extendTheme, ChakraProvider } from '@mui/material';
        import appTheme from './styles/theme/theme';
        `;
    }

    async AppWrap() {
        //returns a wrapper for App.jsx template content
        return {
            open:   
            `<ChakraProvider theme={theme}>`,
            close:  
            `</ChakraProvider>`
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
        return `<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
		<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />`;
    }

    async generateFiles() {
        /**
         * generate theme files within context createSystemFiles()
         * theme data on this.context.x_state.theme
         */
        //create createEmotionCache.js
        const g = this.context.g;
        await this.context.writeFile(g('@utility/createEmotionCache.js'),
        `import createCache from '@emotion/cache';

        const createEmotionCache = () => {
          return createCache({ key: 'css', prepend: true });
        };
        
        export default createEmotionCache;
        `);
        //create styles/theme/theme.js
        let material_theme = `import { createTheme } from '@mui/material/styles';

        const appTheme = createTheme({concepto:theme});
        
        export default appTheme;`;
        let default_theme = {
            palette: {
              mode: 'light',
              primary: {
                main: '#DCED71',
              },
              secondary: {
                main: '#1E1F24'
              },
              tertiary: {
                main: '#34414B'
              }
            },
        };
        default_theme = this.extend(default_theme,this.context.x_state.theme);
        material_theme = material_theme.replaceAll('{concepto:theme}',this.context.jsDump(default_theme));
        await this.context.writeFile(g('@theme/theme.js'),material_theme);


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