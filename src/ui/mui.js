
/*
* MUI UI: A class that adds support for MUI UI Framework on React DSL
* @name 	mui
* @module 	mui
**/
import { base_ui } from './base_ui'

export class mui extends base_ui {

    constructor({ context={} }={}) {
        super({ context, name:'mui' });
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
        this.context.x_state.npm['@emotion/react'] = '^11.10.5';
        this.context.x_state.npm['@emotion/styled'] = '^11.10.5';
        this.context.x_state.npm['@fontsource/roboto'] = '^4.5.8';
        this.context.x_state.npm['@mui/icons-material'] = '^5.10.14';
        this.context.x_state.npm['@mui/material'] = '^5.10.14';
        this.context.x_state.npm['normalize.css'] = '^8.0.1';
    }

    async autocomplete() {
        // insert associated ui autocompletion calls here
        await this.context.addAutocompleteDefinition({   
            text:'AppBar',
            icons:['idea'],
            level:[3,4],
            hint:'Top navigation bar',
            attributes:{
                //all keys are optional - empty by default
                'color': { type:'string', default:'primary', hint:'Defines the color of the AppBar' },
            } 
        });
    }

    async defaultState() {
        // overwrites defaults for UI libraries as global state
        this.context.x_state.ui = { ...this.context.x_state.ui, ...{ 
            'textTag': 'Typography',
            'viewNPM': '@mui/material',
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
        return `import 'normalize.css';
        import '@fontsource/roboto/300.css';
        import '@fontsource/roboto/400.css';
        import '@fontsource/roboto/500.css';
        import '@fontsource/roboto/700.css';
        
        import { CacheProvider } from '@emotion/react';
        import { ThemeProvider, CssBaseline } from '@mui/material';
        import appTheme from './styles/theme/theme';
        import createEmotionCache from './utility/createEmotionCache';

        const clientSideEmotionCache = createEmotionCache();
        `;
    }

    async AppWrap() {
        //returns a wrapper for App.jsx template content
        return {
            open:   
            `<CacheProvider value={clientSideEmotionCache}>
			    <ThemeProvider theme={appTheme}>
				    <CssBaseline />`,
            close:  
            `</ThemeProvider>
            </CacheProvider>`
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
        default_theme = this.deepMerge(default_theme,this.context.x_state.theme);
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