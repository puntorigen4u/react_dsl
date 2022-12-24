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
    const components = {};
    let systemProp_ = {
        // also equivalent to components.sx = { attributes:systemProp_ };
        //Properties: https://mui.com/system/properties/
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
            type: 'number',
        },
        flexDirection: {
            type: 'row, row-reverse, column, column-reverse',
            hint: `The CSS flex-direction property sets how flex items are placed in the flex container defining the main axis and the direction (normal or reversed).`
        },
        flexGrow: {
            type: 'number',
            hint: `The CSS flex-grow property sets the flex grow factor of a flex item main size. It specifies how much of the remaining space in the flex container should be assigned to the item (the flex grow factor).`
        },
        flexShrink: {
            type: 'number',
            hint: `The CSS flex-shrink property sets the flex shrink factor of a flex item. If the size of all flex items is larger than the flex container, items shrink to fit according to flex-shrink.`
        },
        flexWrap: {
            type: 'nowrap, wrap, wrap-reverse',
            hint: `The CSS flex-wrap property sets whether flex items are forced in a single line or can be wrapped onto multiple lines. If wrapping is allowed, it sets the direction that lines are stacked.`
        },
        justifyContent: {
            type: 'flex-start, flex-end, center, space-between, space-around, space-evenly',
            hint: `The CSS justify-content property defines how the browser distributes space between and around content items along the main-axis of a flex container, and the inline axis of a grid container.`
        },
        order: {
            type: 'number',
            hint: `The CSS order property sets the order to lay out an item in a flex or grid container. Items in a container are sorted by ascending order value and then by their source code order.`
        },
        gap: {
            type: 'number',
            hint: `The gap CSS property sets the gaps (gutters) between rows and columns. It is a shorthand for row-gap and column-gap.`
        },
        columnGap: {
            type: 'number',
            hint: `The column-gap CSS property sets the size of the gap (gutter) between an element's columns.`
        },
        rowGap: {
            type: 'number',
            hint: `The row-gap CSS property sets the size of the gap (gutter) between an element's rows.`
        },
        gridColumn: {
            type: 'number',
            hint: `The grid-column CSS property is a shorthand property for grid-column-start and grid-column-end specifying a grid item's size and location within the grid column by contributing a line, a span, or nothing (automatic) to its grid placement, thereby specifying the inline-start and inline-end edge of its grid area.`
        },
        gridRow: {
            type: 'number',
            hint: `The grid-row CSS property is a shorthand property for grid-row-start and grid-row-end specifying a grid item's size and location within the grid row by contributing a line, a span, or nothing (automatic) to its grid placement, thereby specifying the inline-start and inline-end edge of its grid area.`
        },
        gridAutoFlow: {
            type: 'row, column',
            hint: `The grid-auto-flow CSS property controls how the auto-placement algorithm works, specifying exactly how auto-placed items get flowed into the grid.`
        },
        gridAutoColumns: {
            type: 'number',
            hint: `The grid-auto-columns CSS property specifies the size of an implicitly-created grid column track.`
        },
        gridAutoRows: {
            type: 'number',
            hint: `The grid-auto-rows CSS property specifies the size of an implicitly-created grid row track.`
        },
        gridTemplateColumns: {
            type: 'number',
            hint: `The grid-template-columns CSS property defines the line names and track sizing functions of the grid columns.`
        },
        gridTemplateRows: {
            type: 'number',
            hint: `The grid-template-rows CSS property defines the line names and track sizing functions of the grid rows.`
        },
        gridArea: {
            type: 'number',
            hint: `The grid-area property allows you to give an item a name so that it can be referenced by a template created with the grid-template-areas property.`
        },
        bgcolor: {
            type: types.colors.join(','),
            hint: `The background-color CSS property sets the background color of an element.`
        },
        color: {
            type: types.colors.join(','),
            hint: `The color CSS property sets the foreground color of an element's text content and text decorations, and sets the currentColor value.`
        },
        bottom: {
            type: 'number',
            hint: `The bottom CSS property participates in specifying the position of positioned elements.`
        },
        left: {
            type: 'number',
            hint: `The left CSS property participates in specifying the position of positioned elements.`
        },
        position: {
            type: 'static, relative, absolute, fixed, sticky',
            hint: `The top, right, bottom, and left properties determine the final location of positioned elements.`
        },
        right: {
            type: 'number',
            hint: `The right CSS property participates in specifying the position of positioned elements.`
        },
        top: {
            type: 'number',
            hint: `The top CSS property participates in specifying the position of positioned elements.`
        },
        zIndex: {
            type: 'number',
            hint: `The z-index CSS property sets the z-order of a positioned element and its descendants or flex items. Overlapping elements with a larger z-index cover those with a smaller one.`
        },
        height: {
            type: 'number',
            hint: `The height CSS property specifies the height of an element. By default, the property defines the height of the content area. If box-sizing is set to border-box, however, it instead determines the height of the border area.`
        },
        maxHeight: {
            type: 'number',
            hint: `The max-height CSS property sets the maximum height of an element. It prevents the used value of the height property from becoming larger than the value specified for max-height.`
        },
        maxWidth: {
            type: 'number',
            hint: `The max-width CSS property sets the maximum width of an element. It prevents the used value of the width property from becoming larger than the value specified for max-width.`
        },
        minHeight: {
            type: 'number',
            hint: `The min-height CSS property sets the minimum height of an element. It prevents the used value of the height property from becoming smaller than the value specified for min-height.`
        },
        minWidth: {
            type: 'number',
            hint: `The min-width CSS property sets the minimum width of an element. It prevents the used value of the width property from becoming smaller than the value specified for min-width.`
        },
        width: {
            type: 'number',
            hint: `The width CSS property sets an element's width. By default, it sets the width of the content area. If box-sizing is set to border-box, however, it sets the width of the border area.`
        },
        boxSizing: {
            type: 'content-box, border-box',
            hint: `The box-sizing CSS property sets how the total width and height of an element is calculated. The default behavior of the box model is to include the padding and border in the width and height.`
        },
        margin: {
            type: 'number',
            hint: `The margin CSS property sets the margin area on all four sides of an element.`
        },
        marginBottom: {
            type: 'number',
            hint: 'The margin-bottom of the element. It accepts any value that the CSS margin-bottom accepts.'
        },
        marginLeft: {
            type: 'number',
            hint: 'The margin-left of the element. It accepts any value that the CSS margin-left accepts.'
        },
        marginRight: {
            type: 'number',
            hint: 'The margin-right of the element. It accepts any value that the CSS margin-right accepts.'
        },
        marginTop: {
            type: 'number',
            hint: 'The margin-top of the element. It accepts any value that the CSS margin-top accepts.'
        },
        marginX: {
            type: 'number',
            hint: 'The margin-left and margin-right of the element.'
        },
        marginY: {
            type: 'number',
            hint: 'The margin-top and margin-bottom of the element.'
        },
        marginInline: {
            type: 'number',
            hint: `The margin-inline CSS property is a logical property that sets all logical inline start/end margins of an element at once, such as margin-inline-start and margin-inline-end.`
        },

    };
    types.base = {
        type: 'view',
        icons: ['idea'],
        level: types.all_levels,
        attributes: {}
    }
    components['-private-systemProperties'] = {...types.base, ...{ //hidden AC if contains -private- keyword
        type: 'system',
        icons: [],
        attributes: systemProp_
    }};
    // dynamically add 'sx' attribute and system props as children attributes
    
    components.sx = {
        type: 'attribute',
        icons: ['list'],
        text: 'sx',
        parents: ['Box','Container'],
        level: [],
        childrenTypes: ['attribute'],
        hint: 'The sx prop is a shortcut for defining custom styles that has access to the theme.',
        //attributes: systemProp_
        attributes: (()=>{
            let sx = {};
            for (let i in systemProp_) {
                sx['{icon:list}'+i] = systemProp_[i];
                if (systemProp_[i].type!='object') {
                    sx['{icon:list}'+i].hint += `<br/><br/><b>posible values</b>: ${systemProp_[i].type}`;
                }
                if (sx['{icon:list}'+i].childrenTypes && sx['{icon:list}'+i].childrenTypes.length>0) {
                    sx['{icon:list}'+i].childrenTypes.push(i+'-value');
                } else {
                    sx['{icon:list}'+i].childrenTypes = [i+'-value'];
                }

            }
            return sx;
        })()
    };
    // add an option for each 'parent' prop that contains 'type' prop
    for (let i in systemProp_) {
        let params = systemProp_[i].type.split(',');
        if (systemProp_[i].type.length>0 && params.length>1) {        
            //console.log('SX ATTRIB',i,params);
            for (let j in params) {
                let param = params[j].trim();
                if (param!='number' && param!='boolean' && param!='%') {                
                    //create an AC item for each param
                    if (!components['sx-attribute-'+i+'-'+param]) {
                        let obj = {
                            type: i+'-value',
                            text: param,
                            childrenTypes: ['none'],
                            level: [],
                            icons: [],
                            parents: [i],
                            hint: `The ${param} value for the ${i} prop.`,
                            attributes: {}
                        }
                        //console.log('SX ATTRIB!!! '+'sx-attribute-'+i+'-'+param, obj);
                        components['sx-attribute-'+i+'-'+param] = obj;
                    } else {
                        components['sx-attribute-'+i+'-'+param].parents.push(i);
                    }

                }
            };
        }
    }
    // ****************************
    // ** LAYOUTS:
    // ****************************
    components.Box = parent.extend(components['-private-systemProperties'],
        {
            type: 'view',
            icons: ['idea'],
            level: types.all_levels,
            extends_: '-private-systemProperties',
            hint: `The Box component serves as a wrapper component for most of the CSS utility needs.`,
            attributes: {
                '{icon:list}sx': {
                    type: 'object',
                    hint: 'The sx prop is a shortcut for defining custom styles that has access to the theme.',
                },
                '{icon:list}component': {
                    type: 'string',
                    default: 'div',
                    hint: 'The component used for the root node. Either a string to use a HTML element or a component.'
                },
                h: {
                    type: 'number, %',
                    hint: 'The height of the Box. It accepts any value that the CSS height accepts.'
                }
            }
        }
    );
    components.Container = parent.extend(types.base,
        {
            type: 'view-layout',
            hint: `The Container component centers your content horizontally. It's the most basic layout element.`,
            attributes: {
                '{icon:list}sx': {
                    type: 'object',
                    hint: 'The sx prop is a shortcut for defining custom styles that has access to the theme.',
                },
                '{icon:list}classes': {
                    type: 'object',
                    hint: 'Override or extend the styles applied to the component.',
                },
                '{icon:list}component': {
                    type: 'string',
                    default: 'div',
                    hint: 'The component used for the root node. Either a string to use a HTML element or a component.'
                },
                '{icon:list}maxWidth': {
                    type: 'xs,sm,md,lg,xl,false,number',
                    default: '',
                    hint: 'The max-width of the container. Set to false to disable maxWidth'
                },
                '{icon:list}disableGutters': {
                    type: 'boolean',
                    default: 'false',
                    hint: 'If true, the left and right padding is removed.'
                },
                '{icon:list}fixed': {
                    type: 'boolean',
                    default: 'false',
                    hint: `Set the max-width to match the min-width of the current breakpoint. This is useful if you'd prefer to design for a fixed set of sizes instead of trying to accommodate a fully fluid viewport. It's fluid by default.`
                },

            }
        }
    );
    components.Grid = parent.extend(types.base,
        {
            text: 'Grid',
            type: 'view-layout',
            hint: `The Material Design responsive layout grid adapts to screen size and orientation, ensuring consistency across layouts.`,
            childrenTypes: ['grid-item','script*','attribute*'],
            attributes: {
                '{icon:list}sx': {
                    type: 'object',
                    hint: 'The sx prop is a shortcut for defining custom styles that has access to the theme.',
                },
                '{icon:list}classes': {
                    type: 'object',
                    hint: 'Override or extend the styles applied to the component.',
                },
                '{icon:list}component': {
                    type: 'string',
                    default: 'div',
                    hint: 'The component used for the root node. Either a string to use a HTML element or a component.'
                },
                '{icon:list}columns': {
                    type: 'number',
                    default: '12',
                    hint: `The number of columns.`
                },
                '{icon:list}ColumnSpacing': {
                    type: 'number,object,array',
                    default: '',
                    hint: `Defines the horizontal space between the type item components.`
                },
                '{icon:list}container': {
                    type: 'boolean',
                    default: 'false',
                    hint: `If true, the component will have the flex container behavior. You should be wrapping items with a container.`
                },
                '{icon:list}item': {
                    type: 'boolean',
                    default: 'false',
                    hint: `If true, this grid is an item of the 'container'.`
                },
                '{icon:list}direction': {
                    type: 'row,row-reverse,column,column-reverse',
                    default: 'row',
                    hint: `Defines the flex-direction style property. It is applied for all screen sizes.`
                }
            }
        }
    );
    components.GridItem = parent.extend(components.Grid,
        {
            type: 'grid-item',
            text: 'Grid',
            parents: ['Grid'],
            childrenTypes: ['view','script*','attribute*'],
            hint: 'Grid item. Ensure to set attribute item=true.',
        }
    );
    components.Stack = parent.extend(types.base,
        {
            type: 'view-layout',
            hint: `The Stack component manages layout of immediate children along the vertical or horizontal axis with optional spacing and/or dividers between each child.`,
            attributes: {
                '{icon:list}sx': {
                    type: 'object',
                    hint: 'The sx prop is a shortcut for defining custom styles that has access to the theme.',
                },
                '{icon:list}component': {
                    type: 'string',
                    default: 'div',
                    hint: 'The component used for the root node. Either a string to use a HTML element or a component.'
                },
                '{icon:list}direction': {
                    type: 'row,row-reverse,column,column-reverse',
                    default: 'column', // vertical
                    hint: `Defines the flex-direction style property. It is applied for all screen sizes.`
                },
                '{icon:list}{icon:view}divider': {
                    type: 'view',
                    default: '',
                    hint: `Adds an element between each child.`
                },
                '{icon:list}spacing': {
                    type: 'number',
                    default: '0',
                    hint: `Defines the space between immediate children.`
                },
            }
        }
    );
    components.ImageList = parent.extend(types.base,
        {
            type: 'view-layout',
            hint: `The Image List displays a collection of images in an organized grid.`,
            childrenTypes: ['imagelist-item','script*','attribute*'],
            attributes: {
                '{icon:list}classes': {
                    type: 'object',
                    hint: 'Override or extend the styles applied to the component.',
                },
                '{icon:list}sx': {
                    type: 'object',
                    hint: 'The sx prop is a shortcut for defining custom styles that has access to the theme.',
                },
                '{icon:list}component': {
                    type: 'string',
                    default: 'div',
                    hint: 'The component used for the root node. Either a string to use a HTML element or a component.'
                },
                '{icon:list}cols': {
                    type: 'number',
                    default: '2',
                    hint: `The number of columns.`
                },
                '{icon:list}gap': {
                    type: 'number',
                    default: '4',
                    hint: `The gap between items in px.`
                },
                '{icon:list}rowHeight': {
                    type: 'number',
                    default: '180',
                    hint: `The height of one row in px.`
                },
                '{icon:list}variant': {
                    type: 'masonry,quilted,standard,woven',
                    childrenTypes: ['imagelist-variant'],
                    default: 'standard',
                    hint: `The variant to use.`
                }
            }
        }
    );
    components.ImageListItem = parent.extend(types.base,
        {
            type: 'imagelist-item',
            text: 'ImageListItem',
            parents: ['ImageList'],
            childrenTypes: ['imagelist-itembar','script*','attribute*','event'],
            hint: `Corresponds to an item of ImageList layout.`,
            attributes: {
                '{icon:list}classes': {
                    type: 'object',
                    hint: 'Override or extend the styles applied to the component.',
                },
                '{icon:list}sx': {
                    type: 'object',
                    hint: 'The sx prop is a shortcut for defining custom styles that has access to the theme.',
                },
                '{icon:list}component': {
                    type: 'string',
                    default: 'div',
                    hint: 'The component used for the root node. Either a string to use a HTML element or a component.'
                },
                '{icon:list}cols': {
                    type: 'number',
                    default: '2',
                    hint: `The number of columns.`
                },
                '{icon:list}rows': {
                    type: 'number',
                    default: '1',
                    hint: `The number of rows.`
                },
            }
        }
    );
    components.ImageListItemBar = parent.extend(types.base,
        {
            type: 'imagelist-itembar',
            text: 'ImageListItemBar',
            parents: ['ImageListItem'],
            childrenTypes: ['view','script*','attribute*','event'],
            hint: `Corresponds to a title bar shown within an ImageListItem.`,
            attributes: {
                '{icon:list}classes': {
                    type: 'object',
                    hint: 'Override or extend the styles applied to the component.',
                },
                '{icon:list}sx': {
                    type: 'object',
                    hint: 'The sx prop is a shortcut for defining custom styles that has access to the theme.',
                },
                '{icon:list}{icon:idea}title': {
                    type: 'view',
                    hint: 'Title to be displayed.',
                },
                '{icon:list}{icon:idea}subtitle': {
                    type: 'view',
                    hint: 'String or element serving as subtitle (support text).',
                },
                '{icon:list}position': {
                    type: 'below,bottom,top',
                    default: 'bottom',
                    hint: 'Position of the title bar.',
                },
                '{icon:list}{icon:idea}actionIcon': {
                    type: 'view,icon',
                    hint: 'An IconButton element to be used as secondary action target (primary action target is the item itself).',
                },
                '{icon:list}actionPosition': {
                    type: 'left,right',
                    default: 'right',
                    hint: 'Position of secondary action IconButton.',
                },
            }
        }
    );
    // ****************************
    // ** DATA DISPLAY:
    // ****************************
    components.Avatar = parent.extend(types.base,
        {
            type: 'view-avatar',
            text: 'Avatar',
            hint: `Avatars are found throughout material design with uses in everything from tables to dialog menus.`,
            childrenTypes: ['script*','attribute*','event'],
            attributes: {
                '{icon:list}classes': {
                    type: 'object',
                    hint: 'Override or extend the styles applied to the component.',
                },
                '{icon:list}sx': {
                    type: 'object',
                    hint: 'The sx prop is a shortcut for defining custom styles that has access to the theme.',
                },
                '{icon:list}component': {
                    type: 'string',
                    default: 'div',
                    hint: 'The component used for the root node. Either a string to use a HTML element or a component.'
                },
                '{icon:list}alt': {
                    type: 'string',
                    hint: `Used in combination with src or srcSet to provide an alt attribute for the rendered img element.`
                },
                '{icon:list}imgProps': {
                    type: 'object',
                    hint: `Attributes applied to the img element if the component is used to display an image.`,
                    attributes: {
                        '{icon:list}src': {
                            type: 'string',
                            hint: `The src attribute for the img element.`
                        },
                        '{icon:list}srcset': {
                            type: 'string',
                            hint: `The srcSet attribute for the img element.`
                        },
                        '{icon:list}sizes': {
                            type: 'string',
                            hint: `The sizes attribute for the img element.`
                        },
                        '{icon:list}loading': {
                            type: 'eager,auto',
                            default: 'auto',
                            hint: `The loading attribute for the img element to use for lazy loading with a placeholder.`
                        },
                        '{icon:list}width': {
                            type: 'number',
                            hint: `The width attribute for the img element.`
                        }
                    }
                },
                '{icon:list}sizes': {
                    type: 'string',
                    hint: `The sizes attribute for the img element.`
                },
                '{icon:list}src': {
                    type: 'string',
                    hint: `The src attribute for the img element.`
                },
                '{icon:list}srcSet': {
                    type: 'string',
                    hint: `The srcSet attribute for the img element.`
                },
                '{icon:list}variant': {
                    type: 'circular,rounded,square',
                    default: 'circular',
                    hint: `The shape of the avatar.`
                },
            }
        }
    );
    components.AvatarGroup = parent.extend(types.base,
        {
            type: 'view',
            text: 'AvatarGroup',
            hint: `Avatars are found throughout material design with uses in everything from tables to dialog menus.`,
            childrenTypes: ['view-avatar','script*','attribute*','event'],
            attributes: {
                '{icon:list}classes': {
                    type: 'object',
                    hint: 'Override or extend the styles applied to the component.',
                },
                '{icon:list}sx': {
                    type: 'object',
                    hint: 'The sx prop is a shortcut for defining custom styles that has access to the theme.',
                },
                '{icon:list}component': {
                    type: 'string',
                    default: 'div',
                    hint: 'The component used for the root node. Either a string to use a HTML element or a component.'
                },
                '{icon:list}max': {
                    type: 'number',
                    default: '5',
                    hint: `Max avatars to show before +x.`
                },
                '{icon:list}slotProps': {
                    type: 'object',
                    hint: `The extra props for the slot components. You can override the existing props or add new ones.`
                },
                '{icon:list}spacing': {
                    type: 'medium,small,number',
                    default: 'medium',
                    hint: `The spacing between avatars.`
                },
                '{icon:list}total': {
                    type: 'number',
                    hint: `The total number of avatars in the group.`
                },
                '{icon:list}variant': {
                    type: 'circular,rounded,square,string',
                    default: 'circular',
                    hint: `The variant to use.`
                }
            }
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
                        if (parent.context.x_state.ui.viewNPMSingle==true) {
                            parent.context.x_state.pages[resp.state.current_page].imports[icon] = parent.context.x_state.ui.iconNPM+'/'+icon;  
                        } else {
                            parent.context.x_state.pages[resp.state.current_page].imports[icon] = parent.context.x_state.ui.iconNPM;   
                        }
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
            type: 'button-view',
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
            childrenTypes: ['button-view'],
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