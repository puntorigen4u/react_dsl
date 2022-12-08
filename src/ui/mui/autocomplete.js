const Icons = require('@mui/icons-material');

export const autocomplete = async(parent) =>{
    // insert associated ui autocompletion calls here
    const types = {
        // type = system, component (user, gets erased on each cache clear) - refers to a subfolder on .autocomplete
        type: 'system', 
        colors: [
            'primary','secondary','tertriary',
            'success', 'error', 'info', 'warning'
        ],
        sizes: [
            'small, medium, large'
        ],
        variant: [
            'contained','outlined','text'
        ],
        all_levels: [3,4,5,6,7,8,9,10],
    };
    types.base = {
        type:  'view',
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
    components.Box = parent.extend(types.base,
        {
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
    );

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
        components['icon:'+style+':*'] = parent.extend(types.base,
            {
                hint: `<b>Material UI Icon</b> - style <b>${style}</b>\n
                       \n<u>Use any of these icons:</u>\n\n 
                       ${icons_grouped_by_style[style].join(', ')}\n\n`,
                type: 'view-icon',
                childrenTypes: ['attribute*','event*'],
                attributes: {
                    '{icon:list}sx': {
                        type: 'object',
                        hint: 'The sx prop is a shortcut for defining custom styles that has access to the theme.'
                    },
                    '{icon:list}color': {
                        type: types.colors.join(', '),
                        hint: 'The color of the icon, specified as the bgcolor of the node.'
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
        );
        //add the dynamic x_command support
        await parent.addCommand({
            [`mui_icon_${style.toLowerCase()}`]: {
                x_level: '>3',
                x_icons: 'idea',
                x_text_contains: `icon:${style}:`,
                x_or_hasparent: 'def_page,def_componente,def_layout',
                hint: `Adds an ${style} Material UI Icon`,
                func: async function(node, state) {
                    let resp = parent.context.reply_template({ state });
                    let icon = node.text.replace(`icon:${style}:`,'')+style;
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
    // basic event attributes
    const event_attributes = {
        ':stop': {
            type: 'boolean',
            default: 'true',
            hint: 'if false prevents stopping event propagations'
        }
    };

    // ****************************
    // INPUTS:
    components.ButtonBase = parent.extend(types.base,
        {
            hint: `The ButtonBase component is used to create a button based component.`,
            attributes: {
                action: {
                    type: 'ref',
                    hint: `A ref for imperative actions. It currently only supports focusVisible() action`
                },
                centerRipple: {
                    type: 'boolean',
                    default: 'false',
                    hint: `If true, the ripples will be centered. They won't start at the cursor interaction position.`
                },
                '{icon:list}classes': {
                    type: 'object',
                    hint: `Override or extend the styles applied to the component. See CSS API below for more details.`   
                },
                component: {
                    type: 'string',
                    default: 'Button',
                    hint: `The component used for the root node. Either a string to use a HTML element or a component.`
                },
                disabled: {
                    type: 'boolean',
                    default: 'false',
                    hint: `If true, the base button will be disabled.`
                },
                disableRipple: {
                    type: 'boolean',
                    default: 'false',
                    hint: `If true, the ripple effect is disabled. Without a ripple there is no styling for :focus-visible by default. `
                },
                disableTouchRipple: {
                    type: 'boolean',
                    default: 'false',
                    hint: `If true, the touch ripple effect is disabled.`
                },
                focusRipple: {
                    type: 'boolean',
                    default: 'false',
                    hint: `If true, the base button will have a keyboard focus ripple.`
                },
                focusVisibleClassName: {
                    type: 'string',
                    hint: `This prop can help identify which element has keyboard focus. The class name will be applied when the element gains the focus through keyboard interaction. It's a polyfill for the CSS :focus-visible selector.`,
                },
                '{icon:idea}LinkComponent': {
                    type: '{icon:idea}Element',
                    default: 'a',
                    hint: `The component used to render a link when the href prop is provided.`
                },
                '{icon:list}{icon:help}onFocusVisible': {
                    type: 'function',
                    hint: `Callback fired when the component is focused with a keyboard. We trigger a onFocus callback too.`,
                },
                '{icon:list}sx': {
                    type: 'object',
                    hint: `The sx prop is a shortcut for defining custom styles that has access to the theme.`
                },
                '{icon:list}TouchRippleProps': {
                    type: 'object',
                    hint: `Props applied to the TouchRipple element.`
                },
                '{icon:list}{icon:help}touchRippleRef': {
                    type: 'function',
                    hint: `A ref that points to the TouchRipple element.`
                },
            },
            events: {
                focusVisible: {
                    hint: `Callback fired when the component is focused with a keyboard. Also triggers a 'focus' event.`,
                    attributes: event_attributes
                },
                focus: {
                    hint: `Callback fired when the component is focused.`,
                    attributes: event_attributes
                },
                click: {
                    params: 'event',
                    hint: `Callback fired when the button is clicked.`,
                    attributes: event_attributes
                }
            }
        }
    );
    components.Button = parent.extend(components.ButtonBase,
        {
            extends_: 'ButtonBase',
            //parents: ["ButtonGroup","*"],
            hint:'Buttons allow users to take actions, and make choices, with a single tap.', 
            attributes:{
                'color': { 
                    //all keys are optional - empty by default
                    type: types.colors.join(', '), 
                    default: 'primary', 
                    hint: 'The color of the component. It supports both default and custom theme colors.' 
                },
                '{icon:list}classes': {
                    //type: systemProp["marginRight"].type,
                    type: 'object',
                    hint: `Override or extend the styles applied to the component.`
                },
                'component': {
                    type: 'string',
                    hint: `The component used for the root node. Either a string to use a HTML element or a component.`,
                    default: 'Button'
                },
                'disabled': {
                    type: 'boolean',
                    default: false,
                    hint: `If true, the button will be disabled.`
                },
                'disableElevation': {
                    type: 'boolean',
                    default: false,
                    hint: `If true, no elevation is used.`
                },
                'disableFocusRipple': {
                    type: 'boolean',
                    default: false,
                    hint: `If true, the keyboard focus ripple will be disabled.`
                },
                'disableRipple': {
                    type: 'boolean',
                    default: false,
                    hint: `If true, the ripple effect is disabled.`,
                },
                '{icon:list}{icon:idea}endIcon': {
                    type: '{icon:idea}icon:x',
                    hint: `Element placed after the children.`
                },
                'fullWidth': {
                    type: 'boolean',
                    default: false,
                    hint: `If true, the button will take up the full width of its container.`,
                },
                'href': {
                    type: 'string',
                    hint: `The URL to link to when the button is clicked. If defined, an 'a' element will be used as the root node.`,
                },
                'size': {
                    type: types.sizes.join(', '),
                    default: 'medium',
                    hint: `The size of the button.`
                },
                '{icon:list}{icon:idea}startIcon': {
                    type: '{icon:idea}icon:x',
                    hint: `Element placed before the children.`
                },
                '{icon:list}sx': {
                    type: 'object',
                    hint: `The sx prop is a shortcut for defining custom styles that has access to the theme.`
                },
                variant: {
                    type: types.variant.join(', '),
                    default: 'text',
                    hint: `The variant to use.`
                }
            }
        }
    );
    components.LoadingButton = parent.extend(components.Button,
        {
            extends_: 'Button',
            hint:'The loading buttons can show loading state and disable interactions.',
            attributes:{
                'loading': {
                    type: 'boolean',
                    default: false,
                    hint: `If true, the button will be in a loading state.`
                },
                '{icon:list}loadingIndicator': {
                    type: '{icon:idea}Element',
                    default: '{icon:idea}CircularProgress[color="inherit" size={16}]',
                    hint: `Element placed before the children if the button is in loading state.`
                },
                'loadingPosition': {
                    type: 'start, end, center',
                    default: 'center',
                    hint: `The loading indicator can be positioned on the start, end, or the center of the button.`
                },
            }
        }
    );
    components.ButtonGroup = parent.extend(types.base,
        {
            hint:`Component that groups buttons together`,
            attributes: {
                '{icon:list}classes': {
                    //type: systemProp["marginRight"].type,
                    type: 'object',
                    hint: `Override or extend the styles applied to the component.`
                },
                'color': { 
                    //all keys are optional - empty by default
                    type: types.colors.join(', '), 
                    default: 'primary', 
                    hint: 'The color of the component. It supports both default and custom theme colors.' 
                },
                'component': {
                    type: 'string',
                    hint: `The component used for the root node; a string with the HTML element.`,
                    default: 'Button'
                },
                '{icon:list}{icon:idea}component': {
                    type: '{icon:idea}Element',
                    hint: `The component used for the root node; a component with the Element.`,
                    default: '{icon:idea}Button'
                },
                'disabled': {
                    type: 'boolean',
                    default: false,
                    hint: `If true, the component is disabled.`
                },
                'disableElevation': {
                    type: 'boolean',
                    default: false,
                    hint: `If true, no elevation is used.`
                },
                'disableFocusRipple': {
                    type: 'boolean',
                    default: false,
                    hint: `If true, the button keyboard focus ripple is disabled.`
                },
                'disableRipple': {
                    type: 'boolean',
                    default: false,
                    hint: `If true, the button ripple effect is disabled.`
                },
                fullWidth: {
                    type: 'boolean',
                    default: false,
                    hint: `If true, the buttons will take up the full width of its container.`
                },
                orientation: {
                    type: 'horizontal, vertical',
                    default: 'horizontal',
                    hint: `The component orientation (layout flow direction).`
                },
                'size': {
                    type: types.sizes.join(', '),
                    default: 'medium',
                    hint: `The size of the component. small is equivalent to the dense button styling.`
                },
                '{icon:list}sx': {
                    type: 'object',
                    hint: `The sx prop is a shortcut for defining custom styles that has access to the theme.`
                },
                variant: {
                    type: types.variant.join(', '),
                    default: 'solid',
                }
            }
        }
    );
    components.Checkbox = parent.extend(components.ButtonBase,
        {
            extends_: 'ButtonBase', //@todo to be used to extend ourselfs without using the 'extend' method, and identify which attribs are inherited (to colour them differently on the tables)
            hint:'Checkboxes allow the user to select one or more items from a set.',
            childrenTypes: ['attribute*','event*'],
            attributes:{
                'checked': {
                    type: 'boolean',
                    default: false,
                    hint: `If true, the component is checked.`
                },
                '{icon:list}{icon:idea}icon': {
                    type: '{icon:idea}Element,{icon:idea}icon:',
                    default: '{icon:idea}CheckBoxOutlineBlankIcon',
                    hint: `The icon to display when the component is checked.`,
                },
                '{icon:list}{icon:idea}checkedIcon': {
                    type: '{icon:idea}Element,{icon:idea}icon:',
                    default: '{icon:idea}CheckBoxIcon',
                    hint: `The icon to display when the component is checked.`,
                    childrenTypes: ['icon*','view*'],
                },
                '{icon:list}classes': {
                    //type: systemProp["marginRight"].type,
                    type: 'object',
                    hint: `Override or extend the styles applied to the component.`
                },
                'color': { 
                    //all keys are optional - empty by default
                    type: types.colors.join(', '), 
                    default: 'primary', 
                    hint: 'The color of the component. It supports both default and custom theme colors.' 
                },
                defaultChecked: {
                    type: 'boolean',
                    default: false,
                    hint: `The default checked state. Use when the component is not controlled.`,
                },
                id: {
                    type: 'string',
                    hint: `The id of the input element.`,
                },
                indeterminate: {
                    type: 'boolean',
                    default: false,
                    hint: `If true, the component appears indeterminate. This does not set the native input element to indeterminate due to inconsistent behavior across browsers. However, we set a data-indeterminate attribute on the input.`,
                },
                '{icon:list}{icon:idea}indeterminateIcon': {
                    type: '{icon:idea}Element',
                    default: '{icon:idea}IndeterminateCheckBoxIcon',
                    hint: `The indeterminate icon to display when the component is indeterminate.`,
                },
                '{icon:list}inputProps': {
                    type: 'object',
                    hint: `Attributes applied to the input element.`,
                },

            }
        }
    );
    //****************************
    return components;
}