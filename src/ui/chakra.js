
/*
* CHAKRA UI: A class that adds support for CHAKRA-UI Framework on React DSL
* @name 	chakra
* @module 	chakra
**/
import { base_ui } from './base_ui'

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
        // insert associated ui autocompletion calls here
        const types = {
            colors: [
                'whiteAlpha','blackAlpha','gray','red','orange','yellow','green','teal','blue','cyan','purple','pink',
                'linkedin','facebook','messenger','whatsapp','twitter','telegram'
            ],
            sizes: [
                'lg','md','sm','xs'
            ],
            variant: [
                'outline','ghost','link','solid','unstyled'
            ]
        }
        return [{   
            text:'Button',
            type:'system', // system, component (user, gets erased on each cache clear) - refers to a subfolder on .autocomplete
            icons:['idea'],
            level:[3,4,5,6,7,8],
            hint:'Button component is used to trigger an action or event, such as submitting a form, opening a Dialog, canceling an action, or performing a delete operation.',
            attributes:{
                //all keys are optional - empty by default
                'colorScheme': { 
                    type: types.colors.join(', '), 
                    default: 'grey', 
                    hint: '' 
                },
                'iconSpacing': {
                    type: 'SystemProps["marginRight"]',
                    hint: `The space between the button icon and label`
                },
                isActive: {
                    type: 'boolean',
                    hint: 'If true, the button will be styled in its active state.',
                },
                isDisabled: {
                    type: 'boolean',
                    hint: 'If true, the button will be disabled.',
                },
                isLoading: {
                    type: 'boolean',
                    hint: 'If true, the button will show a spinner.',
                },
                '{icon:list}leftIcon': {
                    type: '{icon:idea}icon:x', //{icon:x} -> is replaced by autocomplete with the icon name
                    hint: `If added, the button will show an icon before the button's label`,
                },
                loadingText: {
                    type: 'string',
                    hint: `The label to show in the button when isLoading is true If no text is passed, it only shows the spinner`,
                },
                '{icon:list}rightIcon': {
                    type: `{icon:idea}icon:x`,
                    hint: `If added, the button will show an icon after the button's label.`
                },
                size: {
                    type: types.sizes.join(', '),
                    default: 'md'
                },
                '{icon:list}spinner': {
                    type: '{icon:idea}icon:x',
                    hint: `Replace the spinner component when isLoading is set to true`
                },
                spinnerPlacement: {
                    type: 'end, start',
                    default: 'start',
                    hint: `It determines the placement of the spinner when isLoading is true`
                },
                variant: {
                    type: types.variant.join(', '),
                    default: 'solid',
                }
            } 
        }];
    }

    async defaultState() {
        // overwrites defaults for UI libraries as global state
        this.context.x_state.ui = { ...this.context.x_state.ui, ...{ 
            'textTag': 'Text',
            'viewNPM': '@chakra-ui/react',
            'iconNPM': '@chakra-ui/icons',
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