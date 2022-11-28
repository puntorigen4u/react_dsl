const Icons = require('@mui/icons-material');

export const autocomplete = async(parent) =>{
    // insert associated ui autocompletion calls here
    const types = {
        // type = system, component (user, gets erased on each cache clear) - refers to a subfolder on .autocomplete
        type: 'system', 
        colors: [
            'primary','secondary','tertriary',
            'success', 'action', 'disabled'
        ],
        sizes: [
            'lg','md','sm','xs'
        ],
        variant: [
            'outline','ghost','link','solid','unstyled'
        ],
        all_levels: [3,4,5,6,7,8,9,10],
    };
    types.base = {
        type:  types.type,
        icons: ['idea'],
        level: types.all_levels,
    }
    const systemProp = {
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
            hint: `The CSS align-content property sets the distribution of space between and around content items along a flexbox's cross-axis or a grid's block axis.`
        },
        alignItems: {
            type: 'flex-start, flex-end, center, baseline, stretch',
            hint: `The CSS align-items property sets the align-self value on all direct children as a group. The align-self property sets the alignment of an item within its containing block.`
        },
        alignSelf: {
            type: 'auto, normal, center, start, end, self-start, self-end, flex-start, flex-end, baseline, first baseline, last baseline, stretch, safe center, unsafe center',
            hint: `The align-self CSS property overrides a grid or flex item's align-items value.`
        },
        flex: {

        },
        flexDirection: {

        },
        flexGrow: {

        },
        flexShrink: {
        },
        flexWrap: {
        },
        justifyContent: {
        },
        order: {

        },
        gap: {

        },
        columnGap: {
        
        },
        rowGap: {
        },
        gridColumn: {

        },
        gridRow: {

        },
        gridAutoFlow: {

        },
        marginBottom: {
            type: 'number',
            hint: 'The margin-bottom of the Box. It accepts any value that the CSS margin-bottom accepts.'
        },
    };
    const components = {};
    // ****************************
    // LAYOUT:
    components.Box = {
        ...types.base,
        ...{
            hint: `The Box component serves as a wrapper component for most of the CSS utility needs.`,
            attributes: {...systemProp,...{
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
            }}
        }
    };

    // ****************************
    // ICON: dynamic import from @mui/icons-material
    // also adds the x_command 'icon:Outlined:name' support
    // console.log('material-icons',Object.keys(Icons));
    // variation 3: grouped by styles -> icon:Outlined:x, icon:Rounded:x, icon:Sharp:x, icon:TwoTone:x
    // ****************************
    let icons_grouped_by_style = {}; 
    const icons_styles = ['Outlined','Rounded','Sharp','TwoTone'];
    Object.keys(Icons).forEach(icon=>{
        for (let style of icons_styles){
            if (icon.indexOf(style)>-1) {
                if (!icons_grouped_by_style[style]) icons_grouped_by_style[style] = []
                icons_grouped_by_style[style].push(icon.replace(style,''));
            }
        }
    });
    //console.log('icons_grouped_by_style',icons_grouped_by_style);
    for (let style in icons_grouped_by_style){
        components['icon:'+style+':'] = {
            ...types.base,
            ...{
                hint: `<b>Material UI Icon</b> - style <b>${style}</b>\n
                       \n<u>Use any of these icons:</u>\n\n 
                       ${icons_grouped_by_style[style].join(', ')}\n\n`,
                attributes: {
                    '{icon:list}sx': {
                        type: 'object',
                        hint: 'The sx prop is a shortcut for defining custom styles that has access to the theme.'
                    },
                    color: {
                        type: types.colors.join(', '),
                        hint: 'The color of the icon.'
                    },
                    fontSize: {
                        type: types.sizes.join(', '),
                        hint: 'The fontSize applied to the icon.',
                    }
                }
            }
        };
        //add the dynamic x_command support
        await parent.addCommand({
            [`def_icon_${style.toLowerCase()}`]: {
                x_level: '>3',
                x_icons: 'idea',
                x_text_contains: `icon:${style}:`,
                x_or_hasparent: 'def_page,def_componente,def_layout',
                hint: `Adds an ${style} Material UI Icon`,
                func: async function(node, state) {
                    let resp = parent.context.reply_template({ state });
                    let icon = node.text.replace(`icon:${style}:`,'');
                    let attrs = { refx:node.id };
                    if (resp.state.current_page && resp.state.current_page in parent.context.x_state.pages) {
                        // add import to page (if its a page)
                        parent.context.x_state.pages[resp.state.current_page].imports[icon] = parent.context.x_state.ui.iconNPM;   
                    }
                    Object.keys(node.attributes).forEach(attr=>{
                        attrs[attr] = node.attributes[attr];
                    });
                    resp.open += parent.context.tagParams(icon, attrs, false) + '\n';
                    resp.close += `</${icon}>\n`;
                    resp.state.friendly_name = icon;
                    //resp.state.from_script = false;
                    //console.log(`def_icon_${style}`,attrs);
                    return resp;
                }
            }
        });
        //
    }

    // ****************************
    // FORMS:
    components.Button = {
        ...components.Box,
        ...{
            hint:'Button component is used to trigger an action or event, such as submitting a form, opening a Dialog, canceling an action, or performing a delete operation.', 
            attributes:{
                'colorScheme': { 
                    //all keys are optional - empty by default
                    type: types.colors.join(', '), 
                    default: 'grey', 
                    hint: '' 
                },
                'iconSpacing': {
                    //type: systemProp["marginRight"].type,
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
                '{icon:list}{icon:idea}leftIcon': {
                    type: '{icon:idea}icon:x', //{icon:x} -> is replaced by autocomplete with the icon name
                    hint: `If added, the button will show an icon before the button's label`,
                },
                loadingText: {
                    type: 'string',
                    hint: `The label to show in the button when isLoading is true If no text is passed, it only shows the spinner`,
                },
                '{icon:list}{icon:idea}rightIcon': {
                    type: `{icon:idea}icon:x`,
                    hint: `If added, the button will show an icon after the button's label.`
                },
                size: {
                    type: types.sizes.join(', '),
                    default: 'md'
                },
                '{icon:list}{icon:idea}spinner': {
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
        }
    };
    components.ButtonGroup = {
        ...components.Box,
        ...{
            hint:`Component that groups buttons together`,
            attributes: {
                variant: {
                    type: types.variant.join(', '),
                    default: 'solid',
                },
                spacing: {
                    type: 'integer',
                    default: 0,
                    hint: `Adds spacing between the buttons`
                }   
            }
        }
    };
    components.Checkbox = {
        ...components.Box,
        ...{
            hint:'The Checkbox component is used in forms when a user needs to select multiple values from several options.',
            attributes:{
                'colorScheme': { 
                    //all keys are optional - empty by default
                    type: types.colors.join(', '), 
                    default: 'grey', 
                    hint: '' 
                },
                defaultIsChecked: {
                    type: 'boolean',
                    default: '',
                    hint: 'If `true`, the checkbox will be initially checked.',
                },
                '{icon:list}{icon:idea}icon': {                        
                    type: `{icon:idea}icon:x`,
                    default: 'CheckboxIcon',
                    hint: `The checked icon to use.`
                },
                iconColor: {
                    type: types.colors.join(', ')
                },
                iconSize: {
                    type: types.sizes.join(', '),
                },
                isChecked: {
                    type: 'boolean',
                    hint: 'If `true`, the checkbox will be checked.',
                },
                isDisabled: {
                    type: 'boolean',
                    hint: 'If `true`, the checkbox will be disabled.',
                },
                isFocusable: {
                    type: 'boolean',
                    hint: 'If `true` and `isDisabled` is passed, the checkbox will remain tabbable but not interactive',
                },
                isIndeterminate: {
                    type: 'boolean',
                    hint: 'If `true`, the checkbox will be indeterminate.',
                },
                isInvalid: {
                    type: 'boolean',
                    hint: 'If `true`, the checkbox will be marked as invalid.',
                },
                isReadOnly: {
                    type: 'boolean',
                    hint: 'If `true`, the checkbox will be readonly.',
                },
                isRequired: {
                    type: 'boolean',
                    hint: 'If `true`, the checkbox will be required.',
                },
                name: {
                    type: 'string',
                    hint: 'The name of the input field in a checkbox (useful for form submission).',
                },
                onChange: {
                    type: '{icon:help}event',
                    hint: 'The callback fired when the state is changed.',
                },
                size: {
                    type: types.sizes.join(', '),
                },
                spacing: {
                    type: 'SystemProps["marginLeft"]',
                    hint: 'The spacing between the checkbox and its label.',
                },
                value: {
                    type: 'string, number',
                    hint: 'The value to be used in the checkbox input. This is the value that will be returned on form submission.'
                },
                variant: {
                    type: types.variant.join(', '),
                }
            }
        }
    };
    //****************************
    return components;
}