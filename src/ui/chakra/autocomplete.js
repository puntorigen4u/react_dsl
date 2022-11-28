export const autocomplete = () =>{
    // insert associated ui autocompletion calls here
    const types = {
        // type = system, component (user, gets erased on each cache clear) - refers to a subfolder on .autocomplete
        type: 'system', 
        colors: [
            'whiteAlpha','blackAlpha','gray','red','orange','yellow','green','teal','blue','cyan','purple','pink',
            'linkedin','facebook','messenger','whatsapp','twitter','telegram'
        ],
        sizes: [
            'lg','md','sm','xs'
        ],
        variant: [
            'outline','ghost','link','solid','unstyled'
        ],
        all_levels: [3,4,5,6,7,8,9,10]
    };
    const components = {};
    //****************************
    components.Button = {
        type:types.type, 
        icons:['idea'],
        level:types.all_levels,
        hint:'Button component is used to trigger an action or event, such as submitting a form, opening a Dialog, canceling an action, or performing a delete operation.',
        attributes:{
            'colorScheme': { 
                //all keys are optional - empty by default
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
    };
    components.ButtonGroup = {
        text:'ButtonGroup',
        type:types.type,
        icons:['idea'],
        level:types.all_levels,
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
    };
    components.Checkbox = {
        type:types.type, // system, component (user, gets erased on each cache clear) - refers to a subfolder on .autocomplete
        icons:['idea'],
        level:types.all_levels,
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
            '{icon:list}icon': {                        
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
    };
    //****************************
    return components;
}