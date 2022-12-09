module.exports = async function(context) {
	// context.x_state; shareable var scope contents between commands and methods.
    String.prototype.replaceAll = function(strReplace, strWith) {
        // See http://stackoverflow.com/a/3561711/556609
        var esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        var reg = new RegExp(esc, 'ig');
        return this.replace(reg, strWith);
    };
    
    String.prototype.cleanLines = function() {
        var esc = '\n'.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        var reg = new RegExp(esc, 'ig');
        return this.replace(reg, '').trim();
    };
    
    String.prototype.contains = function(test) {
        if (typeof this === 'string' && this.indexOf(test) != -1) {
            return true;
        } else {
            return false;
        }
    };
    
    String.prototype.right = function(chars) {
        return this.substr(this.length-chars);
    };
    
    function setImmediatePromise() {
        //for preventing freezing node thread within loops (fors)
        return new Promise((resolve) => {
          setImmediate(() => resolve());
        });
    }
    //
    let null_template = {
        hint: 'Allowed node type that must be ommited',
        func: async function(node, state) {
            return context.reply_template({
                hasChildren: false,
                state
            });
        }
    };
    const deepMerge = require('deepmerge');
    const parseInputOutput = async function(node,state) {
        //get vars and attrs
        let tmp = { var:'', original:'' };
        if (node.text.includes(',')) tmp.var = node.text.split(',').pop().trim();
        //prepare new var
        if (tmp.var.includes('$')) {
            if (state.from_server) {
                tmp.var = tmp.var.replaceAll('$variables.', 'resp.')
                                .replaceAll('$vars.', 'resp.')
                                .replaceAll('$params.', 'resp.');
            } else {
                tmp.var = tmp.var.replaceAll('$variables.', 'this.')
                                .replaceAll('$vars.', 'this.')
                                .replaceAll('$params.', 'this.')
                                .replaceAll('$config.', 'this.$config.')
                                .replaceAll('$store.', 'this.$store.state.');
                if (tmp.var=='this.') tmp.var='this';
            }
        }
        //prepare original var
        tmp.original = context.dsl_parser.findVariables({
            text: node.text,
            symbol: `"`,
            symbol_closing: `"`
        });
        if (tmp.original.includes('**') && node.icons.includes('bell')) {
            tmp.original = getTranslatedTextVar(tmp.original);
        } else if (tmp.original.includes('$')) {
            if (state.from_server) {
                tmp.original = tmp.original.replaceAll('$variables.', 'resp.')
                                            .replaceAll('$vars.', 'resp.')
                                            .replaceAll('$params.', 'resp.');
            } else {
                tmp.original = tmp.original.replaceAll('$variables.', 'this.')
                                            .replaceAll('$vars.', 'this.')
                                            .replaceAll('$params.', 'this.')
                                            .replaceAll('$config.', 'this.$config.')
                                            .replaceAll('$store.', 'this.$store.state.');
                if (tmp.original=='this.') tmp.original='this';
            }
        }
        return { input:tmp.original, output:tmp.var };
    };

    const getTranslatedTextVar = function(text,keep_if_same=false) {
        let vars = context.dsl_parser.findVariables({
            text,
            symbol: `**`,
            symbol_closing: `**`
        });
        //console.log('translated text:'+text,vars);
        let new_vars = context.dsl_parser.replaceVarsSymbol({
            text,
            from: {
                open: `**`,
                close: `**`
            },
            to: {
                open: '${',
                close: '}'
            }
        });
        //console.log('translated new_vars text:'+text,new_vars);
        if ('${' + vars + '}' == new_vars) {
            if (keep_if_same==true) return text;
            return vars;
        } else {
            return `\`${new_vars}\``;
        }
    };
    // process our own attributes_aliases to normalize node attributes
    const aliases2params = function(x_id, node, escape_vars, variables_to='') {
        let params = {
                refx: node.id
            },
            attr_map = {};
        // read x_id attributes aliases
        if ('attributes_aliases' in context.x_commands[x_id]) {
            let aliases = context.x_commands[x_id].attributes_aliases;
            Object.keys(aliases).map(function(key) {
                aliases[key].split(',').map(alternative_key => {
                    attr_map[alternative_key] = key
                });
            });
        }
        // process mapped attributes
        Object.keys(node.attributes).map(function(key) {
            let value = node.attributes[key];
            let key_use = key.trim();
            if (key_use.charAt(0)==':') key_use = key_use.right(key_use.length-1);
            let keytest = key_use.toLowerCase();
            let tvalue = value.toString().replaceAll('$variables.', variables_to)
                .replaceAll('$vars.', variables_to)
                .replaceAll('$params.', variables_to)
                .replaceAll('$config.', variables_to+'$config.')
                .replaceAll('$store.', variables_to+'$store.state.').trim();
            if (tvalue.charAt(0)=='$' && tvalue.includes('$store')==false && tvalue.includes('$event')==false && tvalue.includes('$config')==false) {
                tvalue = tvalue.right(tvalue.length-1);
            }
            //
            //tvalue = getTranslatedTextVar(tvalue);
            if (keytest == 'props') {
                value.split(' ').map(x => {
                    params[x] = null
                });
            } else if (keytest in attr_map && value != tvalue) {
                // value contains a variable
                if (attr_map[keytest]=='v-model') {
                	params[attr_map[keytest]] = tvalue;
                } else {
                	params[`:${attr_map[keytest]}`] = tvalue;
            	}
            } else if (tvalue=='$event') {
                params[key_use] = tvalue;

            } else if (keytest in attr_map) {
                // literal value
                params[attr_map[keytest]] = tvalue;
            } else {
                // this is an attribute key that is not mapped
                if (value != tvalue || value[0]=="$" || value[0]=="!" || key.charAt(0)==':' ) {
                    if (escape_vars && escape_vars==true) {
                        tvalue = tvalue.replaceAll('{{','').replaceAll('}}','');
                    }
                    if (keytest!='v-model') {
                        params[`:${key_use}`] = tvalue;
                    } else {
                        params[key_use] = tvalue;
                    }
                } else {
                    params[key_use] = tvalue;
                }
            }
            //@todo remove : if tvalue is $event
        });
        //
        return params;
    };
    
    return {
        //'cancel': {...null_template,...{ x_icons:'button_cancel'} },
        'meta': {...null_template, ...{
                name: 'ReactJS / MF',
                version: '0.0.1',
                x_level: '2000',
                language: 'en',
                autocomplete: {
                    theme: {
                        table_bgcolor: "#AAD3F3",
                        tr0_bgcolor: "#AAD3F3",
                        tr_bgcolor: "#AAD3F3",
                        tr_inherited_bgcolor: "#D2D2D2",
                        cellpadding: 2,
                        cellspacing: 0,
                    }
                }
            }
        },
        'def_config': {...null_template,
            ... {
                x_icons: 'desktop_new',
                x_level: '2',
                x_text_contains: 'config'
            }
        },
        'def_modelos': {...null_template,
            ... {
                x_icons: 'desktop_new',
                x_level: '2',
                x_text_contains: 'model'
            }
        },
        'def_assets': {...null_template,
            ... {
                x_icons: 'desktop_new',
                x_level: '2',
                x_text_contains: 'assets'
            }
        },
        'def_theme': {...null_template,
            ... {
                x_icons: 'desktop_new',
                x_level: '2',
                x_text_contains: 'theme'
            }
        },

        // *******************************
        //  React Pages and View Elements
        // *******************************

        //def_view
        //*def_page
        //*def_page_seo
        //*def_page_styles
        //*def_page_styles_class

        'def_page': {
            x_level: '2,3',
            x_not_icons: 'button_cancel,desktop_new,list,help,xmag,penguin,clanbomber,idea',
            x_not_text_contains: 'componente:,component:',
            hint: 'React page',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                if (node.level>3) return {...resp,valid:false };
                resp.state.current_page = node.text;
                // set global page defaults for current page
                if (!context.x_state.pages[resp.state.current_page]) {
                    context.x_state.pages[resp.state.current_page] = {
                        type: 'page',
                        acceso: '*',
                        params: '',
                        layout: '',
                        defaults: {},
                        imports: {},
                        components: {},
                        directives: {},
                        variables: {},
                        seo: {},
                        meta: [],
                        link: [],
                        head: {
                            script: [],
                            meta: [],
                            seo: {}
                        },
                        var_types: {},
                        proxies: '',
                        return: '',
                        styles: {},
                        script: {},
                        mixins: {},
                        stories: { '_default':{ events:{} } },
                        track_events: {},
                        path: '/' + resp.state.current_page
                    };
                }
                if (resp.state.from_def_layout) context.x_state.pages[resp.state.current_page].type = 'layout';
                if (resp.state.from_def_componente) {
                    context.x_state.pages[resp.state.current_page].type = 'component';
                    if (resp.state.for_export) {
                        context.x_state.pages[resp.state.current_page].for_export = resp.state.for_export;
                    }
                }
                // is this a 'home' page ?
                if (node.icons.includes('gohome')) context.x_state.pages[resp.state.current_page].path = '/';
                // attributes overwrite anything
                let params = {};
                Object.keys(node.attributes).map(async function(key) {
                    let value = node.attributes[key];
                    // preprocess value
                    value = value.replaceAll('$variables.', '')
                        .replaceAll('$vars.', '')
                        .replaceAll('$params.', '')
                        .replaceAll('$store.', '$store.state.');
                    // query attributes
                    if (['proxy'].includes(key.toLowerCase())) {
                        context.x_state.pages[resp.state.current_page].proxies = value;

                    } else if (['acceso', 'method'].includes(key.toLowerCase())) {
                        context.x_state.pages[resp.state.current_page].acceso = value;

                    } else if (['path', 'url', 'ruta'].includes(key.toLowerCase())) {
                        context.x_state.pages[resp.state.current_page].path = value;

                    } else if (['layout'].includes(key.toLowerCase())) {
                        context.x_state.pages[resp.state.current_page].layout = value;

                    } else if (['meta:title', 'meta:titulo'].includes(key.toLowerCase())) {
                        context.x_state.pages[resp.state.current_page].xtitle = node.attributes[key].replaceAll('$variables.', 'this.');

                    } else if (['meta:keywords', 'meta:keyword'].includes(key.toLowerCase())) {
                        context.x_state.pages[state.current_page].meta.push({
                            hid: await context.hash(node.attributes[key]),
                            name: 'keywords',
                            content: node.attributes[key].replaceAll('$variables.', 'this.')
                        });

                    } else if (['background', 'fondo'].includes(key.toLowerCase())) {
                        params.id = 'tapa';
                        let background = context.getAsset(value, 'css');
                        context.x_state.pages[resp.state.current_page].styles['#tapa'] = {
                            'background-image': `url('${background}')`,
                            'background-repeat': 'no-repeat',
                            'background-size': '100vw'
                        };

                    } else {
                        if (key.charAt(0) != ':' && value != node.attributes[key]) {
                            params[':' + key] = value;
                        } else {
                            params[key] = value;
                        }
                        //context.x_state.pages[resp.state.current_page].xtitle = value;
                        
                    }
                    if (resp.state.from_def_layout || resp.state.from_def_componente) {
                        if (key=='params') {
                            context.x_state.pages[resp.state.current_page].params=value;
                        } else if (key.includes('params:') || key.includes('param:')) {
                            let tmpo = key.replaceAll('params:','').replaceAll('param:','').trim();
                            context.x_state.pages[resp.state.current_page].defaults[tmpo] = value;
                        }
                        //console.log('PABLO COMPONENTE!! o LAYOUT!!',{ key, value });
                    }
                }.bind(this));
                // has comments ?
                if (node.text_note != '') {
                    resp.open = `<!-- ${node.text_note.cleanLines()} -->\n`;
                }
                // set code
                /*
                resp.open += `<template>\n`;
                if ('from_def_componente' in resp.state === false) {
                    if (context.x_state.pages[resp.state.current_page]['layout'] == '') {
                        resp.open += '\t' + context.tagParams('v-app', params, false) + '\n';
                        resp.close += '\t</v-app>\n';
                    }
                }
                resp.close += `</template>\n`;
                */
                if (state.from_def_dummy_group) {
                    resp.open = context.tagParams('react_file',{ title:resp.state.current_page,node_id:node.id,node_text:node.text },false)+`\n` + resp.open;
                    resp.close += `</react_file>\n`;
                }
                // return
                return resp;
            }
        },
        'def_page_seo': {
            x_level: '3,4',
            x_icons: 'desktop_new',
            x_text_contains: 'seo',
            hint: 'Definicion local de SEO',
            func: async function(node, state) {
                // @TODO check this node runs correctly (currently without testing map aug-20-20)
                let resp = context.reply_template({
                    state
                });
                // process children nodes
                let subnodes = await node.getNodes();
                subnodes.map(async function(item) {
                    let test = item.text.toLowerCase().trim();
                    let key_nodes = await item.getNodes();
                    // test by subnode names.
                    if (test == 'keywords') {
                        // get an array of childrens node text
                        let keys = [];
                        if (typeof key_nodes === 'object') {
                            key_nodes.map(x => {
                                keys.push(x.text)
                            });
                            // set into current_page state
                            context.x_state.pages[state.current_page].seo[test] = keys;
                            keys = keys.join(',');
                        } else {
                            keys = key_nodes.replaceAll('$variables.','this.');
                            // set into current_page state
                            context.x_state.pages[state.current_page].seo[test] = keys.split(',');
                        }
                        context.x_state.pages[state.current_page].meta.push({
                            hid: await context.hash(keys.split(',')),
                            name: 'keywords',
                            content: keys
                        });

                    } else if (test == 'language' && key_nodes.length > 0) {
                        //@TODO check this meta statement output format, because its not clear how it's supposed to work aug-20-20
                        context.x_state.pages[state.current_page].seo[test] = key_nodes[0].text;
                        context.x_state.pages[state.current_page].meta.push({
                            hid: await context.hash(keys),
                            lang: key_nodes[0].text.toLowerCase().trim(),
                            content: key_nodes[0].text
                        });

                    } else if (key_nodes.length > 0) {
                        context.x_state.pages[state.current_page].seo[test] = key_nodes[0].text;
                        if (test.includes(':')) {
                            context.x_state.pages[state.current_page].meta.push({
                                property: test,
                                vmid: test,
                                content: key_nodes[0].text
                            });
                        } else {
                            context.x_state.pages[state.current_page].meta.push({
                                hid: await context.hash(keys),
                                name: item.text.trim(),
                                content: key_nodes[0].text
                            });
                        }

                    }
                }.bind(this));
                // return
                return resp;
            }
        },
        'def_page_css': {
            x_priority: 10,
            x_level: '3,4',
            x_icons: 'desktop_new',
            x_text_exact: 'css',
            hint: 'Import external CSS files within page/component',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state,
                    hasChildren:false
                });
                // process children nodes
                let subnodes = await node.getNodes();
                subnodes.map(function(item) {
                    context.x_state.pages[state.current_page].link.push({ rel:'stylesheet', href:item.text.trim() });
                });
                // return
                return resp;
            }
        },
        'def_page_styles': {
            x_level: '3,4',
            x_icons: 'desktop_new',
            x_text_contains: 'styles',
            x_or_hasparent: 'def_page,def_componente,def_layout',
            hint: 'Definicion de estilos/clases locales',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let params = {...{scoped:true}, ... aliases2params('def_page_styles', node)};
                resp.open = context.tagParams('page_styles', params, false);
                resp.close = '</page_styles>';
                resp.state.from_estilos=true;
                return resp;
            }
        },
        'def_page_styles_class': {
            x_level: '4,5',
            x_empty: 'icons',
            x_all_hasparent: 'def_page_styles',
            hint: 'Styles classes defined within react page/component',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let left_char = node.text.trim().charAt(0);
                if (['#', '.', '|'].includes(left_char) === false) {
                    resp.open = `.${node.text.trim()} {\n`;
                } else if (left_char == '|') {
                    resp.open = `${node.text.trim().substring(1)} {\n`; //removed | from start.
                } else {
                    resp.open = `${node.text.trim()} {\n`;
                }
                // output attributes
                // @TODO improve this; I believe this could behave more like def_variables_field instead, and so support nested styles.
                // currently this works as it was in the CFC
                Object.keys(node.attributes).map(function(key) {
                    let value = node.attributes[key];
                    if (context.x_state.es6 && !value.includes('!important') && value.slice(-1)!=';') {
                        resp.open += `\t${key}: ${value} !important;\n`;    
                    } else if (context.x_state.es6 && !value.includes('!important')) {
                        resp.open += `\t${key}: ${value.slice(0,-1)} !important;\n`;
                    } else {
                        resp.open += `\t${key}: ${value};\n`;
                    }
                });
                resp.open += '}\n';
                return resp;
            }
        },

        //*def_componente
        //*def_componente_view (instancia)
        //*def_componente_emitir (ex: def_llamar_evento, script)

        'def_dummy_group': {
            x_level: 2,
            x_not_icons: 'button_cancel,desktop_new,help,idea',
            x_icons: 'list',
            x_watch: 'def_page,def_componente', 
            hint: 'Nodo dummy para agrupar archivos visualmente',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state,
                    hasChildren: true
                });
                //console.log('dummy node',resp);
                resp.state.from_def_dummy_group=true;
                return resp;
            }
        },

        'def_componente': {
            x_level: '2,3',
            x_not_icons: 'button_cancel,desktop_new,list,help,idea',
            x_text_contains: 'component:',
            x_empty: 'icons',
            // if def_page,def_assets code changes, also recompile def_componente nodes 
            x_watch: 'def_page,def_assets', 
            hint: 'ReactJS component',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let new_state = {...state,
                    ... {
                        from_def_componente: true
                    }
                };
                /* */
                if (node.attributes.export) {
                    let for_export_import = { name:node.text.replace('component:','').trim() };
                    if (node.attributes.export!='') {
                        for_export_import.name = node.attributes.export;
                    }
                    // save node code for bit re-import
                    for_export_import.source = await context.dsl_parser.getNode({ id:node.id, nodes_raw:false, recurse:true });                    
                    // extract assets defined within source
                    let search_assets = function(node) {
                        let assets = [];
                        for (let att in node.attributes) {
                            if (node.attributes[att].includes('assets:')) {
                                assets.push(node.attributes[att].replace('assets:',''));
                            }
                        }
                        for (let no in node.nodes) {
                            assets = [...assets,...search_assets(node.nodes[no])];
                        }
                        return assets;
                    };
                    let tmp_assets = search_assets(for_export_import.source);
                    // get real file for assets
                    for_export_import.assets = {};
                    for (let as in tmp_assets) {
                        let asset_ = tmp_assets[as];
                        if (asset_ in context.x_state.assets) {
                            for_export_import.assets[asset_] = context.x_state.assets[asset_];
                        }
                    }
                    // export
                    new_state.for_export = JSON.stringify(for_export_import);
                }
                // call def_page for functionality informing we are calling from def_componente using state.
                resp = await context.x_commands['def_page'].func(node, new_state);
                delete resp.state.from_def_componente;
                delete resp.state.for_bit;
                return resp;
            }
        },
        'def_componente_view': {
            x_level: '>2',
            x_icons: 'idea',
            x_text_contains: 'component:',
            hint: 'ReactJS component view instance',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                // prepare vars
                let file_name = node.text.trim().split(':').pop();
                //let tag_name = `c-${file_name}`;
                let tag_name = `Custom${file_name}`;
                let var_name = file_name.replaceAll('-', '');
                // add import to page
                context.x_state.pages[state.current_page].imports[`${var_name} as ${tag_name}`] = `../components/${file_name}`;
                context.x_state.pages[state.current_page].components[tag_name] = var_name;
                // process attributes and write output
                let params = aliases2params('def_componente_view', node);
                //translate asset if defined
                for (let x in params) {
                    if (params[x] && params[x].includes('assets:')) {
                        let pre_x = x, valu = params[x];
                        delete params[x];
                        if (pre_x.charAt(0)!=':') pre_x = ':'+pre_x;
                        params[pre_x] = context.getAsset(valu, 'js');
                    }
                    await setImmediatePromise(); //@improved
                }
                // transform numeric valuas as :key
                let isNumeric = function(n) {
                    return !isNaN(parseFloat(n)) && isFinite(n);
                };
                for (let key in params) {
                    if (key.charAt(0)!=':' && (params[key].charAt(0)!='0' || params[key]=='0') && (
                        isNumeric(params[key])==true || params[key]=='true' || params[key]=='false')) {
                        params[':'+key] = params[key];
                        delete params[key];
                    }
                }
                //
                if (node.text_note != '') resp.open = `<!-- ${node.text_note.cleanLines()} -->\n`;
                if (!params.refx) params.refx=node.id;
                resp.open += context.tagParams(tag_name, params, false) + '\n';
                resp.close = `</${tag_name}>\n`;
                resp.state.friendly_name = tag_name.split('-').splice(-1)[0].trim();
                resp.state.from_component=true;
                return resp;
            }
        },
        'def_componente_emitir': {
            //@oldname: def_llamar_evento
            x_level: '>2',
            x_icons: 'desktop_new',
            x_text_contains: 'llamar evento|emitir evento|emit event',
            //@idea x_text_contains: `llamar evento "{evento}"|emitir evento "{evento}"`,
            x_all_hasparent: 'def_componente',
            hint: 'Triggers an from the component to their instances',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let event_name = context.dsl_parser.findVariables({
                    text: node.text,
                    symbol: '"',
                    symbol_closing: '"'
                }).trim();
                // pass attributes as data to parent of component
                let params = [];
                Object.keys(node.attributes).map(function(key) {
                    let value = node.attributes[key];
                    // preprocess value
                    if (value.includes('**') && node.icons.includes('bell')) {
                        value = getTranslatedTextVar(value);
                    } else if (value == 'true' || value == 'false') {
                        value = (value == 'true') ? true : value;
                        value = (value == 'false') ? false : value;
                    } else if (value.includes('$')) {
                        value = value.replaceAll('$variables.', 'this.')
                            .replaceAll('$vars.', 'this.')
                            .replaceAll('$params.', 'this.')
                            .replaceAll('$store.', 'this.$store.state.');
                    } else if (value.includes('this.') == false) {
                        //@TODO add i18n support here
                        if (value.includes(`'`) == false) {
                            value = `'${value}'`;
                        }
                    }
                    params.push(`${key}: ${value}`);
                });
                // add event name to _default story
                context.x_state.pages[resp.state.current_page].stories['_default'].events[event_name]=''; //@todo add capitalized name as value
                // write output and return
                if (node.text_note != '') resp.open = `// ${node.text_note.cleanLines()}\n`;
                resp.open += `this.$emit('${event_name}',{${params.join(',')}});\n`;
                return resp;
            }
        },

        // GENERIC REACJS VIEW
        'def_view': {
            x_level: '>2',
            x_icons: 'idea',
            x_not_icons: 'list',
            x_not_text_contains: ':',
            hint: 'ReactJS view instance',
            autocomplete: (()=>{
                // this method needs to return an Object
                // add support for 'UnDraw*' icons
                let ac = {};
                let icons = 'AboutUsPage,AcceptTerms,Account,ActiveSupport,ADayAtThePark,AddFiles,Address,AddToCart,AddUser,Agreement,Airport,AirSupport,Alert,AlienScience,Analysis,Android,AppInstallation,Appreciation,ArtificialIntelligence,ArtLover,Astronaut,AtWork,Autumn,Baby,BackInTheDay,BackToSchool,Basketball,Beach,BeerCelebration'.split(',');
                // for each icon 
                for (let icon of icons) {
                    // add a new autocomplete item
                    ac['UnDraw'+icon] = {
                        type: 'view',
                        icons: ['idea'], // should be by default the x_command icon
                        text: `UnDraw${icon}`,
                        hint: `UnDraw ${icon} icon`,
                        childrenTypes: ['attribute*'],
                        attributes: {
                            '{icon:list}class':{
                                type:'string',
                                default:'',
                                hint:'Defines the class for the svg'
                            },
                            '{icon:list}height':{
                                type:'string, number',
                                default:'250px',
                                hint:'Defines the height for the svg; can also be a percentage'
                            },
                            '{icon:list}primaryColor':{
                                type:'string',
                                default:'#6c68fb',
                                hint:'Defines the primary color for the svg'
                            }
                        }
                    };
                    // modify special cases
                    if (icon == 'Designer') {
                        ac['UnDraw'+icon].attributes = {...ac['UnDraw'+icon].attributes,...{
                            '{icon:list}skinColor':{
                                type:'string',
                                default:'#F2F2F2',
                                hint:'Defines the skin color for the svg'
                            },
                            '{icon:list}hairColor':{
                                type:'string',
                                default:'#A97842',
                                hint:'Defines the hair color for the svg'
                            },
                            '{icon:list}accentColor':{
                                type:'string',
                                default:'#6c68fb',
                                hint:'Defines the accent color for the svg'
                            }
                        }};
                    }
                }
                return ac;
            })(),
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                if (node.text_note != '') resp.open = `{/* ${node.text_note.cleanLines()} */}`;
                let params = aliases2params('def_view', node);
                //
                let tmp = { install:{ config:{}, npm_version:'*', extra_imports:[] }, tag:node.text.trim(), customcode:'' };
                //params
                let attrs = {
                    mode:'client',
                    config:{},
                    extra_imports: []
                };
                let npms = {};
                //special case if node contains 'UnDraw' icon
                if (node.text.indexOf('UnDraw') != -1) {
                    let image = node.text.trim();
                    context.x_state.npm = {...context.x_state.npm,...{
                        'react-undraw-illustrations': '*'
                    }};
                    if (resp.state.current_page && resp.state.current_page in context.x_state.pages) {
                        context.x_state.pages[resp.state.current_page].imports[image] = `react-undraw-illustrations/lib/components/${image}`;   
                    }
                }
                //
                Object.keys(node.attributes).map(function(key) {
                    let keytest = key.toLowerCase().trim();
                    let value = node.attributes[key].trim();
                    if (node.icons.includes('bell') && value.includes('**')) {
                        value = getTranslatedTextVar(value,true);
                    } else if (value.includes('assets:')) {
                        value = context.getAsset(value, 'js');
                    } else {
                        // normalize 
                        value = value.replaceAll('$variables.', '')
                                    .replaceAll('$vars.', '')
                                    .replaceAll('$params.', '')
                                    .replaceAll('$store.', '$store.state.');
                    }
                    if (keytest == 'props') {
                        value.split(' ').map(x => {
                            attrs[x] = null
                        });
                    }
                    //
                    if (keytest.includes(':option:') || keytest.includes(':config:')) {
                        let tkey = key.replaceAll(':option:','').replaceAll(':config:','').trim();
                        attrs.config[tkey]=value;
                    } else if (keytest.includes(':use')) {
                        attrs.use = value;
                    } else if (keytest.includes(':import')) {
                        attrs.extra_imports = value.split(',');
                    } else if (keytest.includes(':mode')) {
                        attrs.mode = value;
                    } else if (keytest==':npm') {
                        let parseNPM = function(keyvalue) {
                            let original = keyvalue;
                            let value = { npm:keyvalue, version:'*' };
                            if (original.includes(',')) {
                                value.npm = original.split(',')[0].trim();
                                value.version = original.split(',').pop().trim();
                            }
                            if (value.npm.includes('/')) {
                                if (value.npm.includes('#')) {
                                    let wbranch = value.npm.split('#');
                                    value.npm = wbranch[0];
                                    value.version = `https://github.com/${value.npm}.git#${wbranch[1]}`;
                                    value.npm = value.npm.split('/').pop().trim();
                                } else {
                                    value.version = `https://github.com/${value.npm}.git`;
                                    value.npm = value.npm.split('/').pop().trim();
                                }
                            }
                            return value;
                        }
                        if (value.includes('|')) {
                            value.split('|').map(x => {
                                let tmpn = parseNPM(x);
                                npms[tmpn.npm] = tmpn.version;
                            });
                        } else {
                            attrs.npm = parseNPM(value);
                            npms[attrs.npm.npm] = attrs.npm.version;
                        }
                    } else {
                        attrs[key] = value;
                    }
                });
                //assign child node as custom code
                /*let sons = await node.getNodes();
                if (sons.length>0) {
                    tmp.customcode=trim(sons[0].text);
                    //context.x_console.outT({ message:`DEBUG child of def_tag says`, color:'cyan', data:sons });
                }*/
                //if (Object.keys(npms).length==0) throw `the required attribute :npm is missing! Please specify it.`;
                // install plugin
                if (Object.keys(npms).length>0) {
                    context.x_state.npm = {...context.x_state.npm,...npms};
                }
                /*tmp.xn = npms[Object.keys(npms)[0]];
                attrs.npm = {
                    [Object.keys(npms)[0]]: tmp.xn
                };*/
                let f_npm = Object.keys(npms)[0];
                attrs.npm = npms[f_npm];
                context.x_state.plugins[f_npm] = {
                    global: true,
                    npm: npms,
                    mode: attrs.mode,
                    extra_imports: attrs.extra_imports,
                    config: attrs.config,
                    tag: tmp.tag
                };
                if (node.text_note.trim()!='') {
                    let he = require('he');
                    context.x_state.plugins[f_npm].customcode = he.decode(node.text_note.trim()).replaceAll('\n\n','');
                }
                //context.x_console.outT({ message:'plugin', data:context.x_state.plugins[f_npm] });
                
                if (attrs.use) context.x_state.plugins[f_npm].customvar = attrs.use.replaceAll('-','')
                                                                                            .replaceAll('_','')
                                                                                            .replaceAll('/','')
                                                                                            .replaceAll('.css','')
                                                                                            .replaceAll('.','_')
                                                                                            .toLowerCase().trim();
                if (Object.keys(attrs.config)=='') delete context.x_state.plugins[f_npm].config;
                if (resp.state.current_page && resp.state.current_page in context.x_state.pages && node.text.indexOf('UnDraw')==-1) {
                        let assign_ = tmp.tag.trim();
                        //@idea maybe we could check if assign_ exists on given imports package
                        /*let assign_ = tmp.tag   .replaceAll('-','')
                                                .replaceAll('_','')
                                                .replaceAll('/','')
                                                .replaceAll('.css','')
                                                .replaceAll('.','_')
                                                .trim();*/
                        if (!f_npm && context.x_state.ui.viewNPM != '') {
                            //@todo: replace hardcoded mui with value from central config
                            context.x_state.pages[resp.state.current_page].imports[assign_] = context.x_state.ui.viewNPM;
                        } else {
                            context.x_state.pages[resp.state.current_page].imports[assign_] = f_npm;
                        }
                        for (let value_ of attrs.extra_imports) {
                            context.x_state.pages[resp.state.current_page].imports[value_] = f_npm;
                        }
                        //context.x_state.pages[resp.state.current_page].components[tmp.tag] = assign_;
                    
                }
                //code
                //if (node.text_note != '') resp.open = `<!-- ${node.text_note.cleanLines()} -->`;
                delete attrs.npm; delete attrs.mode; delete attrs.use;
                delete attrs.extra_imports; delete attrs.config;
                attrs.refx = node.id;
                resp.open += context.tagParams(tmp.tag, attrs, false) + '\n';
                resp.close += `</${tmp.tag}>\n`;
                resp.state.friendly_name = tmp.tag.split('-').splice(-1)[0].trim();
                resp.state.from_script = false;
                resp.state.text_simple = false;
                if (context.x_state.ui.textSimpleIfParentView.includes(node.text)) {
                    //context.debug('SETTING TEXT_SIMPLE BEFORE PARENT FRAMEWORK SAYS SO',{ ui:context.x_state.ui.textSimpleIfParentView, node:node.text });
                    resp.state.text_simple = true;                    
                }
                return resp;
                // write tag
                //resp.open += context.tagParams(node.text, params, false) + '\n';
                //resp.close += `</${node.text}>\n`;
                //return resp;
            }
        },

        // FORMs
        'def_form': {
            x_level: '>2',
            x_icons: 'idea',
            x_text_exact: 'form',
            attributes_aliases: {
                'v-model': 'valid,value'
            },
            hint: 'Formulario de vuetify',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                if (node.text_note != '') resp.open = `<!-- ${node.text_note.cleanLines()} -->`;
                let params = aliases2params('def_form', node);
                resp.open += context.tagParams('v-form', params, false) + '\n';
                resp.close += `</v-form>\n`;
                return resp;
            }
        },
        'def_form_field': {
            x_level: '>2',
            x_icons: 'pencil',
            x_not_icons: 'calendar,clock,attach,freemind_butterfly',
            x_not_text_contains: 'google:',
            attributes_aliases: {
                'placeholder': 'hint,ayuda',
                'mask': 'mask,mascara,formato',
                'prepend-icon': 'pre:icon',
                'append-icon': 'post:icon',
                'type': 'type,tipo',
                'value': 'value,valor',
                'counter': 'counter,maxlen,maxlength,max'
            },
            hint: 'Campo de entrada (text,textarea,checkbox,radio,combo,select,switch,toogle,autocomplete) para usar en formulario vuetify',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let tmp = {};
                if (node.text_note != '') resp.open = `<!-- ${node.text_note.cleanLines()} -->`;
                let params = aliases2params('def_form_field', node);
                tmp = {... {
                        type: 'text'
                    },
                    ...params
                };
                // add v-model as node.text.
                if (node.text.includes('$')) {
                    let vmodel = node.text.trim();
                    vmodel = vmodel.replaceAll('$variables.', '')
                        .replaceAll('$vars.', '')
                        .replaceAll('$params.', '')
                        .replaceAll('$store', '$store.state.');
                    params['v-model'] = vmodel;
                } else if (node.text.trim()!='') {
                    params['v-model'] = node.text.trim();
                }
                // render by type
                delete params.type;
                if (tmp.type == 'combo') {
                    resp.open += context.tagParams('v-combobox', params, false) + '\n';
                    resp.close += `</v-combobox>\n`;
                } else if (tmp.type == 'toggle') {
                    resp.open += context.tagParams('v-btn-toggle', params, false) + '\n';
                    resp.close += `</v-btn-toggle>\n`;
                } else if ('textarea,checkbox,radio,switch'.split(',').includes(tmp.type)) {
                    resp.open += context.tagParams(`v-${tmp.type}`, params, false) + '\n';
                    resp.close += `</v-${tmp.type}>\n`;
                } else if ('autocomplete,autocompletar,auto,select'.split(',').includes(tmp.type)) {
                    // item-text
                    if ('item-text' in params && params['item-text'].includes('{{')) {
                        // suppport for values like '{{ name }} - ({{ tracks.total }})'
                        let new_val = params['item-text'];
                        let vars = context.dsl_parser.findVariables({
                            text: params['item-text'],
                            symbol: '{{',
                            symbol_closing: '}}',
                            array: true
                        });
                        // replace {{ x }} with {{ item.x }}
                        vars.map(old => {
                            let oldt = old.trim();
                            new_val = new_val.replaceAll(oldt, `item.${oldt}`);
                        });
                        // if starts with "{{ ", remove
                        if (new_val.slice(0, 3) == '{{ ') new_val = new_val.slice(3);
                        // if ends with " }}", remove
                        if (new_val.slice(-3) == ' }}') {
                            new_val = new_val.slice(0, -3);
                        } else {
                            // add quote at the end
                            new_val += `'`;
                        }
                        // replace " }}" with "+'" and replace "{{ " with "'+"
                        new_val = new_val.replaceAll(' }}', `+'`).replaceAll('{{ ', `'+`);
                        // ready
                        new_val = new_val.replaceAll('{{','').replaceAll('}}','');
                        params[':item-text'] = `(item)=>${new_val}`;
                        delete params['item-text'];

                    } else if ('item-text' in params && params['item-text'].includes(' ')) {
                        let new_val = [];
                        params['item-text'].split(' ').map(nv => {
                            new_val.push(`item.${nv}`);
                        });
                        params[':item-text'] = '(item)=>' + new_val.join(`+' '+`);
                        delete params['item-text'];
                    }
                    // item-value
                    if ('item-value' in params && params['item-value'].includes(' ')) {
                        let new_val = [];
                        params['item-value'].split(' ').map(nv => {
                            new_val.push(`item.${nv}`);
                        });
                        params[':item-value'] = '(item)=>' + new_val.join(`+' '+`);
                        delete params['item-value'];
                    }
                    //
                    if ('autocomplete,autocompletar,auto'.split(',').includes(tmp.type)) {
                        resp.open += context.tagParams('v-autocomplete', params, false) + '\n';
                        resp.close += `</v-autocomplete>\n`;
                    } else if (tmp.type == 'select') {
                        if ('item-value' in params === false &&
                            'return-object' in params === false && ':return-object' in params === false) {
                            params[':return-object'] = true;
                        }
                        resp.open += context.tagParams('v-select', params, false) + '\n';
                        resp.close += '</v-select>\n';
                    }
                } else {
                    // text type or any other type
                    let mask_map = {
                        'tarjeta,visa,mastercard,credito':              '****-****-****-****',
                        'fechahora,datetime':                           '**/**/**** **:**',
                        'telefono,phone':                               '(***)****-****',
                        'rut':                                          '**.***.***-N',
                        'hora,time':                                    '**:**',
                        'hora-seg,hora-segs,hora-s,time-secs,time-s':   '**:**:**'
                    };
                    let getRealMask = function(key) {
                        let resp = key;
                        let mask_keys = Object.keys(mask_map).join(',').split(',');
                        if (mask_keys.includes(key)) {
                            for (let mask_key in mask_map) {
                                if (key==mask_key) {
                                    resp = mask_map[mask_key];
                                    break;
                                }
                            }
                        }
                        return key.replaceAll('*','#');
                    };
                    if (tmp[':mask']) {
                        tmp['v-mask'] = getRealMask(tmp[':mask']);
                        delete tmp[':mask']; delete params[':mask'];
                    } else if (tmp.mask) {
                        tmp['v-mask'] = `'${getRealMask(tmp['mask'])}'`;
                        delete tmp.mask;
                        delete params.mask;
                    }
                    tmp = {...tmp, ...params};
                    if (tmp[':type']) delete tmp.type;
                    resp.open += context.tagParams('v-text-field', tmp, false) + '\n';
                    resp.close += `</v-text-field>\n`;
                }
                //event friendly name
                if (params.label) resp.state.friendly_name = params.label;
                // return
                return resp;
            }
        },
        'def_form_field_image': {
            x_level: '>2',
            x_icons: 'pencil,attach',
            x_not_icons: 'calendar,clock,freemind_butterfly',
            x_not_text_contains: 'google:',
            hint: 'Campo de entrada de imagen (subir imagen) para usar en formulario vuetify',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                if (node.text_note != '') resp.open = `<!-- ${node.text_note.cleanLines()} -->`;
                let params = aliases2params('def_form_field', node);
                params = {...params,...aliases2params('def_form_field_image', node)};
                params['refx'] = node.id;
                // add node.text (var) as image prefill
                if (node.text.trim() != '-') {
                    if (node.text.includes('$')) {
                        let vmodel = node.text.trim();
                        vmodel = vmodel.replaceAll('$variables.', '')
                            .replaceAll('$vars.', '')
                            .replaceAll('$params.', '')
                            .replaceAll('$store', '$store.state.');
                        params[':prefill'] = vmodel;
                    } else {
                        params['prefill'] = node.text.trim();
                    }
                }
                // image defaults
                params[':removable'] = false;
                params[':hideChangeButton'] = true;
                if (params.placeholder) {
                    params[':customStrings'] = { drag: params.placeholder };
                    delete params.placeholder;
                }
                // transform numeric valuas as :key
                let isNumeric = function(n) {
                    return !isNaN(parseFloat(n)) && isFinite(n);
                };
                for (let key in params) {
                    if (key.charAt(0)!=':' && 
                        (params[key].charAt(0)!='0' || params[key]=='0') && (
                            isNumeric(params[key])==true || 
                            params[key]=='true' || 
                            params[key]=='false'
                        )
                    ) {
                        params[':'+key] = params[key];
                        delete params[key];
                    } else if (!isNaN(params[key]) && params[key].toString().indexOf('.') != -1) {
                        params[':'+key] = params[key];
                        delete params[key];
                    }
                }
                // add plugin
                context.x_state.plugins['vue-picture-input'] = {
                    global: true,
                    mode: 'client',
                    npm: {
                        'vue-picture-input': '*'
                    },
                    tag: 'picture-input'
                };
                if (params.type) delete params.type;
                // write output
                resp.open += context.tagParams('picture-input', params, false) + '\n';
                resp.close = `</picture-input>\n`;
                if (params.placeholder) {
                    resp.state.friendly_name = params.placeholder;
                } else if (params.ref && params.ref.includes('ID_')==false) {
                    resp.state.friendly_name = params.ref;
                }
                return resp;
            }
        },
        'def_form_field_galery': {
            x_level: '>2',
            x_icons: 'pencil,freemind_butterfly',
            x_not_icons: 'calendar,clock,attach',
            x_not_text_contains: 'google:',
            attributes_aliases: {
                'dataImages':   'imagenes,images,fotos'
            },
            hint: 'Campo de entrada de galeria de imagenes (elegir una o varias imagenes) para usar en formulario vuetify',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                if (node.text_note != '') resp.open = `<!-- ${node.text_note.cleanLines()} -->`;
                let params = aliases2params('def_form_field', node);
                params = {...params,...aliases2params('def_form_field_galery', node)};
                params['refx'] = node.id;
                // add node.text (var) as image prefill
                if (node.text.trim() != '') {
                    let vmodel = node.text.trim();
                    if (node.text.includes('$')) {
                        //vmodel = vmodel.split(',').pop();
                        vmodel = vmodel.replaceAll('$variables.', '')
                            .replaceAll('$vars.', '')
                            .replaceAll('$params.', '')
                            .replaceAll('$store', '$store.state.');
                    }
                    params['@onselectimage'] = `(item)=>${vmodel}=[item]`;
                    params['@onselectmultipleimage'] = `(item)=>${vmodel}=item`;
                    params[':selectedImages'] = vmodel;
                }
                // add plugin
                context.x_state.plugins['vue-select-image'] = {
                    global: true,
                    mode: 'client',
                    npm: {
                        'vue-select-image': '*'
                    },
                    tag: 'vue-select-image',
                    requires: ['vue-select-image/dist/vue-select-image.css']
                };
                if (params.type) delete params.type;
                // write output.
                resp.open += context.tagParams('vue-select-image', params, false) + '\n';
                resp.close = `</vue-select-image>\n`;
                return resp;
            }
        },
        'def_form_field_date': {
            x_level: '>2',
            x_icons: 'pencil,calendar',
            x_not_icons: 'clock,attach,freemind_butterfly',
            x_not_text_contains: 'google:',
            attributes_aliases: {
                'okText':       'ok,aceptar,accept',
                'clearText':    'clear,cancel,cancelar'
            },
            hint: 'Campo de entrada con selector de fecha (sin hora) para usar en formulario vuetify',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                if (node.text_note != '') resp.open = `<!-- ${node.text_note.cleanLines()} -->`;
                let params = aliases2params('def_form_field_date', node);
                if (node.text.trim() != '') {
                    let vmodel = node.text.trim();
                    if (node.text.includes('$')) {
                        //vmodel = vmodel.split(',').pop();
                        vmodel = vmodel.replaceAll('$variables.', '')
                            .replaceAll('$vars.', '')
                            .replaceAll('$params.', '')
                            .replaceAll('$store', '$store.state.');
                    }
                    params['v-model'] = vmodel;
                }
                // add plugin
                context.x_state.npm['luxon'] = '*'; // for i18n support
                context.x_state.plugins['vue-datetime'] = {
                    global: true,
                    mode: 'client',
                    npm: {
                        'vue-datetime': '*'
                    }
                };
                params.type = 'date';
                // write output.datetime
                resp.open += context.tagParams('datetime', params, false) + '\n';
                resp.close = `</datetime>\n`;
                return resp;
            }
        },
        'def_form_field_datetime': {
            x_level: '>2',
            x_icons: 'pencil,calendar,clock',
            x_not_icons: 'attach,freemind_butterfly',
            x_not_text_contains: 'google:',
            hint: 'Campo de entrada con selector de fecha y hora para usar en formulario vuetify',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                if (node.text_note != '') resp.open = `<!-- ${node.text_note.cleanLines()} -->`;
                let params = aliases2params('def_form_field_datetime', node);
                if (node.text.trim() != '') {
                    let vmodel = node.text.trim();
                    if (node.text.includes('$')) {
                        //vmodel = vmodel.split(',').pop();
                        vmodel = vmodel.replaceAll('$variables.', '')
                            .replaceAll('$vars.', '')
                            .replaceAll('$params.', '')
                            .replaceAll('$store', '$store.state.');
                    }
                    params['v-model'] = vmodel;
                }
                // add plugin
                context.x_state.plugins['vuetify-datetime-picker'] = {
                    global: true,
                    npm: {
                        'vuetify-datetime-picker': '2.0.3'
                    },
                    styles: [{
                        file: 'dtpicker.styl',
                        lang: 'styl',
                        content: `@require '~vuetify-datetime-picker/src/stylus/main.styl'`
                    }]
                };
                if (params.type) delete params.type;
                // write output
                resp.open += context.tagParams('v-datetime-picker', params, false) + '\n';
                resp.close = `</v-datetime-picker>\n`;
                return resp;
            }
        },
        'def_form_google_autocomplete': {
            x_level: '>2',
            x_icons: 'pencil',
            x_text_contains: 'google:autocomplet',
            attributes_aliases: {
                'apiKey': 'key,llave',
                'language': 'lang,language,lenguaje',
                'id': 'id',
                'placeholder': 'hint,ayuda'
            },
            hint: 'Campo autocompletar para direcciones en formulario vuetify',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let config = {
                    language: 'es'
                };
                let params = aliases2params('def_form_google_autocomplete', node);
                if (params.apiKey) {
                    config.apiKey = params.apiKey;
                    delete params.apiKey;
                }
                if (params.language) {
                    config.language = params.language;
                    delete params.language;
                }
                context.x_state.plugins['vuetify-google-autocomplete'] = {
                    global: true,
                    npm: {
                        'vuetify-google-autocomplete': '*'
                    },
                    config: JSON.stringify(config)
                };
                // return output
                if (node.text_note != '') resp.open = `<!-- ${node.text_note.cleanLines()} -->`;
                resp.open += context.tagParams('vuetify-google-autocomplete', params, false) + '\n';
                resp.close = `</vuetify-google-autocomplete>\n`;
                return resp;
            }
        },
        //*def_form
        //*def_form_field (ex. def_textfield)
        //*def_form_field_image
        //*def_form_field_galery
        //*def_form_field_date
        //*def_form_field_datetime
        //*def_form_google_autocomplete (ex. def_google_autocomplete) - IN @PROGRESS

        'def_center': {
            x_icons: 'idea',
            x_text_contains: 'center',
            hint: 'Aligns children node to the center',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let params = {
                    refx: node.id,
                    class: 'text-center'
                };
                if (node.text_note != '') resp.open = `<!-- ${node.text_note.cleanLines()} -->`;
                resp.open = context.tagParams('div', params, false) + '<center>\n';
                resp.close += '</center></div>\n';
                return resp;
            }
        },

        'def_html': {
            x_icons: 'idea',
            x_text_contains: 'html:',
            hint: 'html:x, donde x es cualquier tag',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let params = aliases2params('def_html', node);
                // parse attributes
                if (node.text_note != '') resp.open = `<!-- ${node.text_note.cleanLines()} -->`;
                let tag = node.text.replace('html:', '');
                if (node.nodes_raw && node.nodes_raw.length > 0) {
                    let tmp = await node.getNodes({ recurse:false });
                    let has_only_events = true;
                    for (let x of tmp) {
                        if (x.icons.includes('help')==false) {
                            has_only_events = false;
                            break;
                        } else {
                            if (x.text.includes('condicion ') || x.text.includes('otra condicion')) {
                                has_only_events = false;
                                break;
                            }
                        }
                        await setImmediatePromise(); //@improved
                    }
                    if (!has_only_events) {
                        // this tag has real children
                        resp.open += context.tagParams(tag, params, false) + '\n';
                        resp.close += `</${tag}>\n`;
                    } else {
                        // has only ghost childs (self-close)
                        resp.open += context.tagParams(tag, params, true)+'\n';                        
                    }
                } else {
                    // doesn't have children nodes (self-close)
                    resp.open += context.tagParams(tag, params, true)+'\n';
                }
                resp.state.friendly_name = tag;
                return resp;
            }
        },
        'def_left': {
            x_icons: 'idea',
            x_text_contains: 'align:left',
            hint: 'Alinea sus nodos hijos a la izquierda',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let params = {
                    refx: node.id,
                    class: 'text-left'
                };
                if (node.text_note != '') resp.open = `<!-- ${node.text_note.cleanLines()} -->`;
                resp.open = context.tagParams('div', params, false) + '\n';
                resp.close += '</div>\n';
                return resp;
            }
        },
        'def_right': {
            x_icons: 'idea',
            x_text_contains: 'align:right',
            hint: 'Alinea sus nodos hijos a la derecha',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let params = {
                    refx: node.id,
                    class: 'text-right'
                };
                if (node.text_note != '') resp.open = `<!-- ${node.text_note.cleanLines()} -->`;
                resp.open = context.tagParams('div', params, false) + '\n';
                resp.close += '</div>\n';
                return resp;
            }
        },
        'def_textonly': {
            x_level: '>2',
            x_empty: 'icons',
            x_priority: -5,
            x_or_hasparent: 'def_page,def_componente,def_layout',
            // @TODO (idea) x_not_hasparent: 'def_toolbar+!def_slot,def_variables,def_page_styles,def_page_styles', 
            hint: 'Textonly node',
            func: async function(node, state) {
                let resp = context.reply_template({
                        state
                    }),
                    params = {
                        refx: node.id,
                        class: []
                    },
                    tmp = {};
                let base_text = node.text;
                if (node.text_rich!='') {
                    base_text = node.text_rich;
                }
                let text = base_text.replaceAll('$variables.', '')
                .replaceAll('$vars.', '')
                .replaceAll('$params.', '')
                .replaceAll('$store.', '$store.state.');
                if (text == '') text = '&nbsp;';
                // some extra validation
                /*
                @todo use this again, after fixing inherited x_states
                if (state.from_toolbar && !state.from_slot) {
                    return {...resp,...{ valid:false }};
                } else if (state.from_datatable_headers && !state.from_slot && !state.from_datatable_fila) {
                    return {...resp,...{ valid:false }};
                } else if (state.from_variables) {
                    return {...resp,...{ valid:false }};
                } else if (state.from_estilos) {
                    return {...resp,...{ valid:false }}; */
                if (false) {
                    /*
                if ((await context.hasParentID(node.id, 'def_toolbar'))==true && (await context.hasParentID(node.id, 'def_slot'))==false) {
                    return {...resp,...{ valid:false }};
                } else if ((await context.hasParentID(node.id, 'def_datatable_headers'))==true && 
                            (await context.hasParentID(node.id, 'def_slot'))==false && 
                            (await context.hasParentID(node.id, 'def_datatable_fila'))==false) {
                    return {...resp,...{ valid:false }};
                } else if ((await context.hasParentID(node.id, 'def_variables'))==true) {
                    return {...resp,...{ valid:false }};
                } else if ((await context.hasParentID(node.id, 'def_page_styles'))==true || (await context.hasParentID(node.id, 'def_page_css'))==true) {
                    return {...resp,...{ valid:false }};*/
                } else {
                    if (node.text_note != '') resp.open += `{/* ${node.text_note.cleanLines()} */}\n`;
                    //
                    if (node.text.indexOf('..lorem..') != -1 && node.text.indexOf(':') != -1) {
                        //lorem ipsum text
                        let lorem = node.text.split(':');
                        tmp.lorem = lorem[lorem.length - 1];
                    }
                    /*
                    if (node.text.indexOf('numeral(') != -1) {
                        //numeral() filter
                        context.x_state.plugins['vue-numeral-filter'] = {
                            global: true,
                            npm: {
                                'vue-numeral-filter': '*'
                            },
                            mode: 'client',
                            config: `{ locale: 'es-es' }`
                        };
                    }*/
                    //node styles
                    //console.log('x_state.ui',context.x_state.ui);
                    if (node.text_rich=='') {
                        if (node.font.bold == true) {
                            if (context.x_state.ui.bold.class) {
                                params.class.push(context.x_state.ui.bold.class);
                            } else {
                                params = deepMerge(params,context.x_state.ui.bold);
                            }
                        }  
                        if (node.font.size <= 10) {
                            if (context.x_state.ui.small.class) {
                                params.class.push(context.x_state.ui.small.class);
                            } else {
                                params = deepMerge(params,context.x_state.ui.small);
                            }
                        }
                        if (node.font.italic == true) {
                            if (context.x_state.ui.italic.class) {
                                params.class.push(context.x_state.ui.italic.class);
                            } else {
                                params = deepMerge(params,context.x_state.ui.italic);
                            }
                        }
                    }
                    // - process attributes
                    Object.keys(node.attributes).map(function(key) {
                        let keytest = key.toLowerCase().trim();
                        let value = node.attributes[key];
                        if (keytest == 'class') {
                            params.class.push(value);
                        } else if (keytest == ':span') {
                            tmp.span = true;
                        } else if (keytest == ':omit') {
                            tmp.omit = true;
                        } else if (keytest == ':ntag') {
                            tmp.ntag = true;
                        } else if (':length,:largo,len,length,largo'.split(',').includes(key)) {
                            tmp.lorem = value;
                        } else if (key == 'small') {
                            tmp.small = true;
                        } else if ('ucase,mayusculas,mayuscula'.split(',').includes(key)) {
                            if (value == 'true' || value == true) params.class.push('text-uppercase');
                        } else if ('capitales,capitalize,capital'.split(',').includes(key)) {
                            if (value == 'true' || value == true) params.class.push('text-capitalize');
                        } else if ('lcase,minusculas,minuscula'.split(',').includes(key)) {
                            if (value == 'true' || value == true) params.class.push('text-lowercase');
                        } else if (key == 'truncate') {
                            if (value == 'true' || value == true) params.class.push('text-truncate');
                        } else if (key == 'no-wrap') {
                            if (value == 'true' || value == true) params.class.push('text-no-wrap');
                        } else if ('weight,peso,grosor'.split(',').includes(key)) {
                            let valuetest = value.toLowerCase();
                            if ('thin,fina,100'.split(',').includes(valuetest)) {
                                params.class.push('font-weight-thin');
                            } else if ('light,300'.split(',').includes(valuetest)) {
                                params.class.push('font-weight-light');
                            } else if ('regular,400'.split(',').includes(valuetest)) {
                                params.class.push('font-weight-light');
                            } else if ('medium,500'.split(',').includes(valuetest)) {
                                params.class.push('font-weight-medium');
                            } else if ('bold,700'.split(',').includes(valuetest)) {
                                params.class.push('font-weight-bold');
                            } else if ('black,gruesa,900'.split(',').includes(valuetest)) {
                                params.class.push('font-weight-black');
                            }

                        } else if (key == 'color') {
                            if (value.indexOf(' ') != -1) {
                                // uses classes if multiple colors defined
                                let color_values = value.split(' ');
                                params.class.push(`${color_values[0]}--text text--${color_values[1]}`);
                            } else {
                                params.color = value;
                                //params.class.push(`${value}--text`);
                            }
                        } else if (key == 'align') {
                            let valuetest = value.toLowerCase();
                            if ('center,centro,centrar'.split(',').includes(valuetest)) {
                                params.class.push('text-center');
                            } else if ('right,derecha'.split(',').includes(valuetest)) {
                                params.class.push('text-right');
                            } else if ('left,izquierda,izquierdo'.split(',').includes(valuetest)) {
                                params.class.push('text-left');
                            } else if ('justify,justificar,justificado'.split(',').includes(valuetest)) {
                                tmp.jstyle = 'text-align: justify; text-justify: inter-word;';
                                if (params.style) {
                                    params.style = params.style.split(';').push(tmp.jstyle).join(';');
                                } else {
                                    params.style = tmp.jstyle;
                                }
                            }

                        } else if (key == 'style') {
                            if (!params.style) params.styles = [];
                            params.styles.push(value);
                        } else {
                            if (key.charAt(0) != ':' && node.text != '' && text != node.text && key!='v-on') {
                                params[':' + key] = value;
                            } else {
                                params[key] = value;
                            }
                        }
                    });
                    // - generate lorem.. ipsum text if within text
                    if (tmp.lorem) {
                        let loremIpsum = require('lorem-ipsum').loremIpsum;
                        text = loremIpsum({
                            count: parseInt(tmp.lorem),
                            units: 'words'
                        });
                    }
                    // - @TODO i18n here
                    // - tmp.small
                    if (tmp.small) {
                        if (resp.state.text_simple) {
                           //text = `<small>${text}</small>`;
                        } else {
                            text = `<small refx="${node.id}">${text}</small>`;
                        }
                    }
                    // - normalize class values (depending on vuetify version)
                    /*
                    params.class = params.class.map(function(x) {
                        let resp = x;
                        resp.replaceAll('text-h1', 'display-4')
                            .replaceAll('text-h2', 'display-3')
                            .replaceAll('text-h3', 'display-2')
                            .replaceAll('text-h4', 'display-1')
                            .replaceAll('text-h5', 'headline')
                            .replaceAll('text-subtitle-1', 'subtitle-1')
                            .replaceAll('text-subtitle-2', 'subtitle-2')
                            .replaceAll('text-h6', 'title')
                            .replaceAll('text-body-1', 'body-1')
                            .replaceAll('text-body-2', 'body-2')
                            .replaceAll('text-caption', 'caption')
                            .replaceAll('text-overline', 'overline')
                        return resp;
                    });*/
                    //normalize params
                    if (params.class && params.class.length==0) delete params.class;
                    if (params.class && params.class.length > 0) params.class = params.class.join(' ');
                    if (params.style) params.styles = params.styles.join(';');
                    //write code
                    let dad_card_title = false; //await context.isExactParentID(node.id, 'def_card_title');
                    let dad_hastextonly = await context.hasParentID(node.id, 'def_textonly');
                    if (tmp.omit==undefined) {
                        //context.debug('DEBUGGING TEXT',{tmp, params, state:resp.state });
                        if (tmp.ntag && !params.class) {
                            resp.open += text;
                        } else {
                            if (dad_hastextonly==true || (tmp.span && tmp.span==true)) {
                                let tag_ = context.x_state.ui.textTag;
                                if (context.x_state.ui.span.tag_) {
                                    tag_ = context.x_state.ui.span.tag_;
                                } else {
                                    params = deepMerge(params,context.x_state.ui.span);
                                }
                                if (context.x_state.ui.viewNPM!='') {
                                    context.x_state.pages[resp.state.current_page].imports[context.x_state.ui.textTag] = context.x_state.ui.viewNPM;
                                }
                                if (resp.state.text_simple==false) {
                                    resp.open += context.tagParams(tag_, params) + text + '</'+tag_+'>\n';
                                } else {
                                    resp.open += text+'\n';
                                }
                            /*} else if (dad_card_title && dad_card_title==true && !params.class) {
                                resp.open += text + '\n';*/
                            } else {
                                //previously context.x_state.ui.textTag was 'div'

                                if (resp.state['text_simple'] && resp.state.text_simple==false || !resp.state['text_simple']) {
                                    //add import if required
                                    if (context.x_state.ui.viewNPM!='') {
                                        context.x_state.pages[resp.state.current_page].imports[context.x_state.ui.textTag] = context.x_state.ui.viewNPM;
                                    }
                                    resp.open += context.tagParams(context.x_state.ui.textTag, params) + text + '</'+context.x_state.ui.textTag+'>\n';
                                } else {
                                    resp.open += text+'\n';
                                }
                            }
                        }
                    }
                    //
                }
                // return
                resp.state.friendly_name=text.replaceAll('@','.');
                resp.state.from_textonly=true;
                return resp;
            }
        },

        'def_slot': {
        	x_level: '>2',
        	x_icons: 'list',
            x_or_hasparent: 'def_view',
        	hint: 'Attribute object/function to assign to parent view node',
        	func: async function(node, state) {
                let resp = context.reply_template({ state });
                //code
                //if (node.text_note != '') resp.open = `{/* ${node.text_note.cleanLines()} */}`;
                let params = aliases2params('def_slot', node);
                if (Object.keys(params).length > 1) {
                    //rename params with prefix 'attr_'
                    for (let key in params) {
                        if (key != 'refx') {
                            params['attr_' + key] = params[key];
                            delete params[key];
                        }
                    }
                    params.is_object = true;
                }
                if (node.nodes_raw.length>0) {
                    if (node.icons.includes('help')) {
                        //if node includes icons list+help, children are included as the content of a function
                        params.is_function = true;
                        resp.state.from_script=true; //or from_function=true
                        resp.hasChildren = true;
                    } else if (node.icons.includes('idea')) {
                        params.is_view = true;
                        resp.state.from_script=false;
                        resp.hasChildren = true;
                    } else if (node.icons.includes('list')) {
                        params.is_view = false;
                        params.is_object = true;
                        resp.state.from_script=false;
                        resp.hasChildren = false;
                        // process children with ourselfs 
                        let children = await node.getNodes();
                        if (children.length==1 && children[0].icons.length==0) {
                            // has a single child without icons (means it's a single value)
                            //context.debug('def_slot with single value node',children[0].text);
                            params['x_attr_'+node.text] = context.jsDump(children[0].text.trim());
                        } else {
                            // has several children                        
                            for (let i=0; i<children.length; i++) {
                                let child = children[i];
                                let obj = await context.x_commands['def_struct'].func(child, { ...state, ...{
                                    as_object:true
                                }});
                                // asign child as param
                                let tmpkey = child.text.replaceAll('&:','-').replaceAll('.','$');
                                //context.debug('def_slot params BEFORE',params);
                                if (obj.state.array) {
                                    let mainkey = Object.keys(obj.state.object)[0];
                                    params['attr_' + tmpkey] = context.jsDump(obj.state.array);
                                    //context.debug('def_slot array',context.jsDump(obj.state.array));
                                } else {
                                    params['attr_' + tmpkey] = context.jsDump(obj.state.object);
                                    // test if object is empty, if so, test special cases
                                    if (Object.keys(obj.state.object).length==0) {
                                        if (child.bgcolor!='') {
                                            //add as 'special' node attributes
                                            params['attr_' + tmpkey] = child.bgcolor.toUpperCase();
                                        } else if (child.color!='') {
                                            //add as 'special' node attributes
                                            params['attr_' + tmpkey] = child.color.toUpperCase();
                                        }
                                    }
                                    //context.debug('def_slot child:',params);
                                }
                                //context.debug('def_slot params AFTER',params);
                            }
                        }
                        //context.debug('def_slot params',params);
                    }
                }
                params.param_name = node.text; 
                let parent = await context.dsl_parser.getParentNode({ id:node.id });
                if (parent) {
                    params.target_id = parent.id;
                    /*let targetparent = await context.dsl_parser.getParentNode({ id:parent.id });
                    if (targetparent) {
                        params.targetparent_id = targetparent.id;
                    }*/
                }
                if (node.bgcolor!='') {
                    //add as 'special' node attributes
                    params.x_attr_bgcolor = node.bgcolor.toUpperCase();
                }
                if (node.color!='') {
                    //add as 'special' node attributes
                    params.x_attr_color = node.color.toUpperCase();
                }
                //params.refx = node.id;
                resp.open += context.tagParams('def_param',params,false)+'\n';
                resp.close = '</def_param>\n';
                //context.debug('def_param',resp);
                if (node.getNodes().length>1 && node.icons.includes('idea')) {
                    // if there's more than 1 child and icon idea, then wrap within a React.Fragment
                    resp.open += '<>';
                    resp.close = '</>'+resp.close;
                }
                resp.state.from_slot=true;
                resp.state.params = params;
                return resp;
            }
        },


        'def_icon': {
        	x_level: '>3',
        	x_icons: 'idea',
            x_text_exact: 'icon:',
            x_or_hasparent: 'def_page,def_componente,def_layout',
            attributes_aliases: {
                'icon':          'icon,icono'
            },
            hint: 'Agrega el icono definido en el lugar.',
        	func: async function(node, state) {
                let resp = context.reply_template({ state });
                let params = aliases2params('def_icono', node);
                let tmp={};
                //params
                if (params.icon) {
                    tmp.icon = params.icon;
                    if (tmp.icon.charAt(0)=='$') {
                        tmp.icon = tmp.icon.right(tmp.icon.length-1);
                        tmp.icon = `{{ ${tmp.icon} }}`;
                    } else {
                        resp.state.friendly_name = tmp.icon.replaceAll(' ','');
                    }
                    delete params.icon;
                }
                if (params[':icon']) {
                    tmp.icon = params[':icon'];
                    tmp.icon = `{{ ${tmp.icon} }}`;
                    delete params[':icon'];
                }
                if (params.class) params.class=params.class.split(' ');
                if (params.color) {
                    if (params.color.includes('#')) {
                        if (params.style) params.style=params.style.split(';');
                        if (!params.style) params.style=[];
                        params.style.push(`color:${params.color}`);
                    } else {
                        if (!params.class) params.class=[];
                        if (params.color.includes(' ')) {
                            let name = params.color.split(' ')[0];
                            let tint = params.color.split(' ').splice(-1)[0];
                            params.class.push(`${name}--text text--${tint}`);
                        } else {
                            params.class.push(`${params.color.trim()}--text`);
                        }
                    }
                }
                //code
                if (params.style) params.style = params.style.join(';');
                if (params.class) params.class = params.class.join(' ');
                if (node.text_note != '') resp.open += `<!-- ${node.text_note.cleanLines()} -->`;
                let from_toolbar = await context.isExactParentID(node.id, 'def_toolbar');
                if (tmp.icon) {
                    if (from_toolbar && from_toolbar==true) {
                        resp.open += context.tagParams('v-btn',{ 'icon':null },false);
                        resp.open += context.tagParams('v-icon',params,false);
                        resp.open += tmp.icon;
                        resp.open += '</v-icon>';
                        resp.open += '</v-btn>';
                    } else {
                        resp.open += context.tagParams('v-icon',params,false)+tmp.icon+'</v-icon>';
                        resp.open += '</v-icon>';
                    }
                } else {
                    if (from_toolbar && from_toolbar==true) {
                        resp.open += context.tagParams('v-app-bar-nav-icon',params,true);
                    } else {
                        //icon must be a child node
                        resp.open += context.tagParams('v-icon',params,false)+'\n';
                        resp.close += '</v-icon>';
                    }
                }
                return resp;
            }
        },

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
        },

        'def_qrcode': {
        	x_level: '>3',
        	x_icons: 'idea',
            x_text_contains: 'qrcode',
            //x_not_empty: 'attributes[:src]',
            x_or_hasparent: 'def_page,def_componente,def_layout',
            hint: 'Agrega un codigo QR en el lugar.',
        	func: async function(node, state) {
                let resp = context.reply_template({ state });
                let options = aliases2params('def_qrcode', node);
                //code.
                if (node.text_note != '') resp.open += `<!-- ${node.text_note.cleanLines()} -->`;
                //translate asset if defined
                for (let x in options) {
                    if (options[x] && options[x].includes('assets:')) {
                        options[x] = context.getAsset(options[x], 'js');
                    }
                    await setImmediatePromise(); //@improved
                }
                let params = {};
                if (options.value) params.value = options.value;
                if (options[':value']) params[':value'] = options[':value'];
                if (options.ref) params.ref = options.ref;
                delete options.value; delete options[':value'];
                delete options.refx;
                delete options.ref;
                params[':options'] = options;
                // install plugin
                context.x_state.plugins['@chenfengyuan/vue-qrcode'] = {
                    global:true,
                    npm: { '@chenfengyuan/vue-qrcode':'*' },
                    tag: 'qrcode',
                    mode: 'client'
                };
                // code
                resp.open += context.tagParams('qrcode',params,false)+'\n';
                resp.close = '</qrcode>';
                resp.state.friendly_name = 'qrcode';
                return resp;
            }
        },

        /* . SCRIPTING .  */

        'def_xcada_registro_view': {
            x_icons: 'penguin',
            x_text_contains: `por cada registro en`,
            x_level: '>2',
            attributes_aliases: {
                'use_index':        'index',
                'unique':           'unique,id',
                'target':           'template,target'
            },
            hint:  `Repite sus hijos por cada elemento entrecomillas, dejando el item en curso en la variable luego de la coma.`,
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let padre = await context.dsl_parser.getParentNode({ id:node.id });
                let hijos = await node.getNodes();
                if (!padre.icons.includes('idea') && !padre.icons.includes('list')) {
                    //console.log('state y padre',{state,padre});
                    if (hijos.length>0 && !hijos[0].icons.includes('idea')) {
                        resp.valid=false;
                        resp.state.from_script=false;
                        return resp;
                    } else if (padre.icons.includes("help") && padre.text.indexOf('condicion')==-1) {
                        resp.valid=false;
                        resp.state.from_script=true;
                        return resp;
                    }
                }
                /*
                if (state.from_script && state.from_script==true) {
                    resp.valid=false;
                    return resp;
                }*/
                let params = (await context.x_commands['def_xcada_registro'].func(node, {...state,...{ get_params:true, from_xcada_view:true } })).state.params;
                //code
                if (node.text_note != '') resp.open += `<!-- ${node.text_note.cleanLines()} -->\n`;
                resp.open += context.tagParams('vue_for', params, false) + '\n';
                resp.close = '</vue_for>';
                return resp;
            }
        },

        //**def_xcada_registro_view

        'def_event_mounted': {
            x_icons: 'help',
            x_level: '3,4',
            x_text_contains: ':mounted',
            hint: 'Evento especial :mounted en pagina vue',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state,
                    hasChildren: true
                });
                if (node.nodes_raw.length==0) return resp;
                let params = {};
                resp.open = context.tagParams('vue_mounted', {}, false)+'<!--';
                if (node.text_note != '') resp.open += `/*${node.text_note.cleanLines()}*/\n`;
                resp.close = '--></vue_mounted>';
                resp.state.from_script=true;
                return resp;
            }
        },

        'def_event_created': {
            x_icons: 'help',
            x_level: '3,4',
            x_text_contains: ':created',
            hint: 'Evento especial :created en pagina vue',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state,
                    hasChildren: true
                });
                if (node.nodes_raw.length==0) return resp;
                let params = {};
                resp.open = context.tagParams('vue_created', {}, false)+'<!--';
                if (node.text_note != '') resp.open += `/*${node.text_note.cleanLines()}*/\n`;
                resp.close = '--></vue_created>';
                resp.state.from_script=true;
                return resp;
            }
        },

        'def_event_server': {
            x_icons: 'help',
            x_level: '3,4',
            x_text_contains: ':server',
            hint: 'Evento especial :server en pagina vue',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state,
                    hasChildren: true
                });
                if (node.nodes_raw.length==0) return resp;
                let params = aliases2params('def_event_server',node);
                resp.open = context.tagParams('server_asyncdata', {}, false)+'<!--';
                if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                if (!params.return) resp.open += `let resp={};`;
                resp.close = '--></server_asyncdata>';
                resp.state.from_server=true;
                resp.state.from_script=true;
                return resp;
            }
        },

        'def_event_method': {
            x_icons: 'help',
            x_level: '3,4',
            x_not_text_contains: ':,condicion si,otra condicion',
            x_or_isparent: 'def_page,def_componente',
            attributes_aliases: {
                'm_params':     ':params,params',
                'timer_time':   'timer:time,interval,intervalo,repetir',
                'async':        ':async,async'
            },
            hint: 'Funcion tipo evento en pagina vue',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state,
                    hasChildren: true
                });
                if (node.nodes_raw.length==0) return resp;
                let params = aliases2params('def_event_method',node);
                params.type='async';
                params.name=node.text.trim();
                /*if (params.name.charAt(0)==params.name.toUpperCase()) {
                    params.friendly_name = params.name;
                }*/
                if (params.async && params.async=='false') params.type='sync';
                if (params.async) delete params.async;
                //code
                resp.open = context.tagParams('vue_event_method', params, false)+'<!--';
                if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                //write default value params code
                for (let param in params) {
                    if (param.includes('param:')) {
                        let def_param = param.replaceAll('param:','').trim();
                        resp.open += `if (!param.${def_param}) param.${def_param} = ${(params[param].includes('this.'))?params[param]:"'"+params[param]+"'"};\n`;
                    }
                }
                resp.close = '--></vue_event_method>';
                resp.state.from_script=true;
                return resp;
            }
        },
        'def_event_method_call': {
            x_text_contains: 'llamar funcion',
            x_icons: 'desktop_new',
            x_not_empty: 'link',
            x_or_hasparent: 'def_page,def_componente',
            hint: `Llama la funcion enlazada, traspasando sus atributos como parametros, y asignando opcionalmente su respuesta a la var definida luego de la coma`,
            func: async function(node, state) {
                let resp = context.reply_template({
                    state,
                    hasChildren: true
                });
                let tmp = { link:'x', return:null };
                // create obj from current node as js obj
                let obj = await context.x_commands['def_struct'].func(node, { ...state, ...{
                    as_object:true
                }});
                let params = obj.state.object;
                if (node.text.includes(',')) tmp.return = node.text.split(',').pop().trim();
                //get target function name
                if (node.link.includes('ID_')) {
                    tmp.link_id = node.link;
                    let link_node = await context.dsl_parser.getNode({ id:node.link, recurse:false });
                    if (link_node && link_node.valid==true) {
                        if (link_node.icons.includes('help')) {
                            tmp.link = link_node.text;
                        } else if (link_node.icons.includes('idea')) {
                            let func_name_ = context.dsl_parser.findVariables({
                                text: node.text,
                                symbol: `"`,
                                symbol_closing: `"`
                            }).trim();
                            tmp.link = "$refs."+link_node.id+'.'+func_name_;
                        }
                    }
                    delete params.refx;
                } else {
                    return {...resp,valid:false};
                }
                // write code convertjs(params)
                let data = context.jsDump(params).replaceAll("'`","`").replaceAll("`'","`");
                if (tmp.return) resp.open += `let ${tmp.return} = `;
                if (Object.keys(params).length==0) data='';
                if (tmp.link.includes('$refs')) {
                    resp.open += `(this.${tmp.link.split('.').slice(0,-1).join('.')})?(await this.${tmp.link}(${data})):null;`;
                } else {
                    resp.open += `(await this.${tmp.link}(${data}));`;
                }
                //
                return resp;
            }
        },

        /**
         * 
         */

        'def_event_element': {
            x_icons: 'help',
            x_level: '>2',
            x_not_icons: 'desktop_new,list',
            x_not_text_contains: ':server,:mounted,if ",else, ',
            hint:  `Event for a view element (ej. imagen->?click).
                    Support defining a link to another event on the same file, in which case its attributes are copied as parameters.`,
            func: async function(node, state) {
                let resp = context.reply_template({
                    state,
                    hasChildren: true
                });
                // this is like controlled alias for def_param virtual tag (def_slot)
                const ccase = require('fast-case');
                node.text = ccase.camelize('on-'+node.text);
                // call def_slot
                let slot = await context.x_commands['def_slot'].func(node, { ...state, ...{
                    as_object:true
                }});

                return slot;
            }
        },

        'def_script': {
            x_icons: 'desktop_new',
            x_level: '>2',
            x_text_exact: 'script',
            x_or_hasparent: 'def_page,def_componente,def_layout',
            hint:   `Representa un tag script inyectado en el lugar indicado. Permite escribir y ejecutar código en la posición definida.
                     Si se define un link, el link se especifica con atributo src y en sus hijos el script se ejecuta luego de cargarlo.`,
            func: async function(node, state) {
                let resp = context.reply_template({
                    state,
                    hasChildren: true
                });
                let params = aliases2params('def_script',node);
                if (node.link!='') params.src = node.link;
                //add packages
                context.x_state.npm['vue-script2'] = '*';
                context.x_state.plugins['vue-script2'] = { global:true, mode: 'client', npm: { 'vue-script2':'*' }};
                //code
                resp.open = context.tagParams('script2', params, false);
                if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                resp.close = '</script2>';
                resp.state.from_script=true;
                return resp;
            }
        },

        //*def_script
        //*def_event_server
        //*def_event_mounted
        //*def_event_method
        //*def_event_element

        'def_condicion_view': {
            x_icons: 'help',
            x_level: '>2',
            x_text_contains: 'condicion si',
            x_text_pattern: [
            `condicion si "*" +(es|no es|es menor a|es menor o igual a|es mayor a|es mayor o igual a|es menor que|es menor o igual que|es mayor que|es mayor o igual que|esta entre|contiene registro|contiene|contiene item) "*"`,
            `condicion si "*" no es "*/*"`,
            `condicion si "*" es +(objeto|array|struct|string|texto)`,
            `condicion si "*" es +(numero|entero|int|booleano|boleano|boolean|fecha|date|email|rut|nulo|nula)`,
            `condicion si "*" no es +(numero|entero|int|booleano|boleano|boolean|fecha|date|email|rut)`,
            `condicion si "*" +(esta vacia|esta vacio|is empty|existe|exists|no es indefinido|no es indefinida|esta definida|no esta vacio|existe|esta definida|no es nula|no es nulo|es nula|not empty)`,
            `condicion si "*" +(no contiene registros|contiene registros)`,
            `condicion si "*" esta entre "*" inclusive`
            ],
            x_or_hasparent: 'def_page,def_componente,def_layout',
            hint:   `Declara que la/s vista/s hija/s deben cumplir la condicion indicada para ser visibles.`,
            func: async function(node, state) {
                let resp = context.reply_template({
                    state,
                    hasChildren: true
                });
                let isNumeric = function(n) {
                    return !isNaN(parseFloat(n)) && isFinite(n);
                };
                if (resp.state.from_script && resp.state.from_script==true) return {...resp,...{ valid:false }};
                // detect which pattern did the match
                let match = require('minimatch');
                let which = -1, did_match=false;
                let text_trim = node.text.trim();
                for (let x of context.x_commands['def_condicion_view'].x_text_pattern) {
                    which+=1;
                    let test = match(text_trim,x);
                    if (test==true) {
                        did_match=true;
                        break;
                    }
                    await setImmediatePromise(); //@improved
                };
                if (!did_match) throw `no matching pattern 'condicion' node for case!`;

                // extract the values
                let extract = require('extractjs')();
                let defaults = { variable:'', operator:'es', value:'' };
                let patterns = [
                    `condicion si "{variable}" {operator} "{value}"`,
                    `condicion si "{variable}" {operator} "{value}"`,
                    `condicion si "{variable}" {operator}`,
                    `condicion si "{variable}" {operator}`,
                    `condicion si "{variable}" {operator}`,
                    `condicion si "{variable}" {operator}`,
                    `condicion si "{variable}" {operator}`,
                    `condicion si "{variable} esta entre "{value}" inclusive`
                ];
                
                let elements = {...defaults,...extract(patterns[which],text_trim)};
                // pre-process elements
                let original_value = elements.value;
                if (typeof elements.variable === 'string' && elements.variable.includes('**') && node.icons.includes('bell')) elements.variable = getTranslatedTextVar(elements.variable);
                if (typeof elements.value === 'string' && elements.value.includes('**') && node.icons.includes('bell')) elements.value = getTranslatedTextVar(elements.value);
                if (typeof elements.variable === 'string' && (elements.variable.includes('$variables.') || 
                    elements.variable.includes('$vars.') ||
                    elements.variable.includes('$params.') ||
                    elements.variable.includes('$store.') ||
                    elements.variable.includes('$route.'))
                    ) {
                } else if (typeof elements.variable === 'string' && elements.variable.charAt(0)=='$') {
                    elements.variable = elements.variable.right(elements.variable.length-1);
                }
                // test for siblings conditions
                elements.type = 'v-if';
                let before_me = await context.dsl_parser.getBrotherNodesIDs({ id:node.id, before:true, after:false, array:true });
                if (before_me.length>0) {
                    if (before_me[0].TEXT && before_me[0].TEXT.includes('condicion si')) {
                        elements.type = 'v-else-if'
                    }
                }
                let escape_value = function(value2) {
                    let value = value2;
                    if (typeof value !== 'undefined') {
                        if ((typeof value === 'string' && isNumeric(value) && value.charAt(0)!='0') ||
                            !isNaN(value) || 
                            (typeof value === 'string' && (value=='true' || value=='false')) ||
                            (typeof value === 'string' && (value.charAt(0)=='$') || value.includes('this.'))
                            ) {
                            //value = value;
                        } else if (original_value.includes('**') && value!=original_value) {
                        } else {
                            value = `'${value}'`;
                        }
                    }
                    return value;
                };
                // tag params
                let params = aliases2params('def_condicion_view',node);
                params = {...params, ...{
                    target: 'template',
                    tipo: elements.type,
                    operador: elements.operator,
                    valor: elements.value
                }};
                let sons = await node.getNodes();
                if (sons.length==1) params.target=sons[0].id; //.id
                if (params.individual && (params.individual==true || params.individual=='true')) {
                    params.tipo = 'v-if'; elements.type = 'v-if';
                    delete params.individual;
                }
                // get full expression, depending on operator
                if (elements.operator=='idioma es') {
                    params.expresion = `this.$i18n && this.$i18n.locale=='${elements.variable}'`;
                } else if (['es','=','eq'].includes(elements.operator)) {
                    if (elements.value==true && elements.value!=1) {
                        params.expresion = elements.variable;
                    } else if (elements.value==false && elements.value!=0) {
                        params.expresion = '!'+elements.variable;
                    } else if (typeof elements.value === 'string' && (
                        elements.value.includes('$variables.') || 
                        elements.value.includes('$vars.') ||
                        elements.value.includes('$params.') ||
                        elements.value.includes('$store.') ||
                        elements.value.includes('this.')
                    )) {
                        params.expresion = `${elements.variable} == ${elements.value}`;
                    } else if (typeof elements.value === 'number') {
                        params.expresion = `${elements.variable} == ${elements.value}`;
                    } else if (typeof elements.value === 'string' &&
                                elements.value.charAt(0)=='(' && elements.value.right(1)==')') {
                        let temp = elements.value.substr(1,elements.value.length-2);
                        params.expresion = `${elements.variable} == ${temp}`;
                    } else if (typeof elements.value === 'string' &&
                        elements.value.charAt(0)=='$' && elements.value.includes(`$t('`)==false) {
                        let temp = elements.value.right(elements.value.length-1);
                        params.expresion = `${elements.variable} == ${temp}`;
                    } else if (typeof elements.value === 'string' && (elements.value=='true' || elements.value=='false' || isNumeric(elements.value))) {
                        params.expresion = `${elements.variable} == ${elements.value}`;
                    } else if (original_value.includes('**') && elements.value!=original_value) {
                        //means it had variables
                        params.expresion = `${elements.variable} == ${elements.value}`;
                    } else {
                        params.expresion = `${elements.variable} == ${escape_value(elements.value)}`;
                    }

                } else if ('es string,es texto,string,texto'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isString(${elements.variable})`;

                } else if ('es numero,es int,numero,int'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isNumber(${elements.variable})`;

                } else if ('es boolean,es boleano,es booleano,booleano,boleano,boolean'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isBoolean(${elements.variable})`;
                
                } else if ('es fecha,es date,fecha,date'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isDate(${elements.variable})`;
                
                } else if ('es entero,es int,entero,int'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isFinite(${elements.variable})`;
                
                } else if ('es array,array'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isArray(${elements.variable})`;

                } else if ('es struct,struct'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isObject(${elements.variable}) && !_.isArray(${elements.variable}) && !_.isFunction(${elements.variable})`;

                } else if ('es objeto,objeto'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isObject(${elements.variable})`;
                
                } else if ('es correo,es email,email,correo'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isString(${elements.variable}) && /\\S+@\\S+\\.\\S+/.test(${elements.variable})`;

                } else if ('no es correo,no es email'.split(',').includes(elements.operator)) {
                    params.expresion = `!(_.isString(${elements.variable}) && /\\S+@\\S+\\.\\S+/.test(${elements.variable}))`;

                } else if ('es rut'.split(',').includes(elements.operator)) {
                    params.expresion = `(validarRUT(${elements.variable})==true)`;

                } else if ('no es rut'.split(',').includes(elements.operator)) {
                    params.expresion = `(!validarRUT(${elements.variable}))`;

                //numeric testings
                } else if ('es menor o igual a,es menor o igual que'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isNumber(${elements.variable}) && _.isNumber(${elements.value}) && ${elements.variable} <= ${elements.value}`;
                
                } else if ('es menor a,es menor que'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isNumber(${elements.variable}) && _.isNumber(${elements.value}) && ${elements.variable} < ${elements.value}`;

                } else if ('es mayor o igual a,es mayor o igual que'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isNumber(${elements.variable}) && _.isNumber(${elements.value}) && ${elements.variable} >= ${elements.value}`;

                } else if ('es mayor a,es mayor que'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isNumber(${elements.variable}) && _.isNumber(${elements.value}) && ${elements.variable} > ${elements.value}`;

                } else if ('esta entre'==elements.operator && elements.value.includes(',')) {
                    let from = elements.value.split(',')[0];
                    let until = elements.value.split(',').pop();
                    params.expresion = `${elements.variable} >= ${from} && ${elements.variable} <= ${until}`;

                // strings
                } else if ('no esta vacio,not empty'.split(',').includes(elements.operator)) {
                    params.expresion = `(_.isObject(${elements.variable}) || (_.isString(${elements.variable})) &&  !_.isEmpty(${elements.variable})) || _.isNumber(${elements.variable}) || _.isBoolean(${elements.variable})`;

                } else if ('esta vacio,is empty,esta vacia'.split(',').includes(elements.operator)) {
                    params.expresion = `(_.isObject(${elements.variable}) ||_.isString(${elements.variable})) &&  _.isEmpty(${elements.variable})`;

                // other types
                } else if ('existe,exists,no es indefinido,no es indefinida,esta definida'.split(',').includes(elements.operator)) {
                    params.expresion = `!_.isUndefined(${elements.variable})`;

                } else if ('no existe,doesnt exists,es indefinido,es indefinida,no esta definida'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isUndefined(${elements.variable})`;

                } else if ('no es nula,no es nulo'.split(',').includes(elements.operator)) {
                    params.expresion = `!_.isNull(${elements.variable})`;

                } else if ('es nula,es nulo'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isNull(${elements.variable})`;

                } else if ('no es,!=,neq'.split(',').includes(elements.operator)) {
                    params.expresion = `${elements.variable}!=${escape_value(elements.value)}`;

                // records
                } else if ('no contiene registros,contains no records'.split(',').includes(elements.operator)) {
                    params.expresion = `${elements.variable} && ${elements.variable}.length==0`;

                } else if ('contiene registros,contains records'.split(',').includes(elements.operator)) {
                    params.expresion = `${elements.variable} && ${elements.variable}.length`; //@todo check if this needs to be .length>0

                } else if ('contiene registro,contiene item'.split(',').includes(elements.operator)) {
                    params.expresion = `_.contains(${elements.variable},${escape_value(elements.value)})`;

                } else if ('contiene,contains'.split(',').includes(elements.operator)) {
                    params.expresion = `${elements.variable}.toLowerCase().indexOf(${escape_value(elements.value)}.toLowerCase())!=-1`;

                } else {
                    //operator not defined
                    context.x_console.outT({ message:`Operator (${elements.operator}) not defined in 'condicion si' x_command`, color:'red', data:{elements,params,which} });
                    throw `Operator ${elements.operator} not defined in '${node.text}'`;
                    //params.expresion = `(AQUI VAMOS: ${node.text})`;
                }

                //comments?
                if (node.text_note != '') resp.open += `<!-- ${node.text_note.cleanLines()} -->\n`;
                // prepare expressions
                let expresion_js = params.expresion. replaceAll('$variables.','this.')
                                                    .replaceAll('$vars.','this.')                                   
                                                    .replaceAll('$params.','this.');
                let expresion_view = params.expresion.   replaceAll('$variables.','')
                                                        .replaceAll('$vars.','')
                                                        .replaceAll('$params.','');
                if (state.current_proxy) {
                    expresion_js = expresion_js.replaceAll('$store.','store.state.');
                    expresion_view = expresion_view.replaceAll('$store.','store.state.');
                    expresion_js = expresion_js.replaceAll('this.$config.','$config.');
                    expresion_view = expresion_view.replaceAll('this.$config.','$config.');
                } else {
                    expresion_js = expresion_js.replaceAll('$store.','this.$store.state.');
                    expresion_view = expresion_view.replaceAll('$store.','$store.state.');
                    expresion_js = expresion_js.replaceAll('$config.','this.$config.');
                    expresion_view = expresion_view.replaceAll('this.$config.','$config.');
                }
                resp.state.meta = { if_js:expresion_js, if_view:expresion_view, params, elements };
                // add support for validar-rut npm library
                if (params.expresion && params.expresion.includes('validarRUT')) {
                    context.x_state.npm['validar-rut']='*';
                    //create virtual var 'computed' with underscore
                    resp.open += context.tagParams('vue_computed', {
                        name: `validarRUT`,
                        type: 'computed'
                    }, false)+'<!--';
                    resp.open += `const { validarRUT } = require('validar-rut');`;
                    resp.open += `return validarRUT;`;
                    resp.open += `--></vue_computed>`;
                    resp.state.meta.script = `let { validarRUT } = require('validar-rut');\n`;
                }
                // prepare virtual vars for underscore support
                if (params.expresion && params.expresion.includes('_.')) {
                    if (state.current_page) {
                        context.x_state.pages[state.current_page].imports['underscore'] = '_';
                    } else if (state.current_proxy) {
                        context.x_state.proxies[state.current_proxy].imports['underscore'] = '_';
                    } else if (state.current_store) {
                        context.x_state.stores[state.current_store].imports['underscore'] = '_';
                    }
                    //create virtual var 'computed' with underscore
                    resp.open += context.tagParams('vue_computed', {
                        name: `_`,
                        type: 'computed'
                    }, false)+'<!--';
                    resp.open += `return _;`;
                    resp.open += `--></vue_computed>`;
                    /*resp.open += context.tagParams('vue_computed', {
                        name: `${node.id}_if`,
                        type: 'computed'
                    }, false)+'<!--';
                    resp.open += `return (${expresion_js});`;
                    resp.open += `--></vue_computed>`;*/
                    //@todo seems the expresion should be the new var here... (was not on the cfc)
                    //params.expresion = `${node.id}_if`;
                }
                //create vue_if or template tag code (in tags, this. don't go)
                if (!(params.expresion.includes('_if'))) params.expresion = expresion_view;
                if (params.target=='template') {
                    // code
                    resp.open += context.tagParams('template', {
                        [params.tipo]: params.expresion
                    }, false);
                    resp.close = `</template>`;
                } else {
                    // code
                    resp.open += context.tagParams('vue_if', params, false);
                    resp.close = `</vue_if>`;
                }
                return resp;
            }
        },

        'def_otra_condicion_view': {
            x_icons: 'help',
            x_level: '>2',
            x_text_exact: 'otra condicion',
            hint:   `Visibiliza sus hijos en caso de no cumplirse la condicion anterior.`,
            func: async function(node, state) {
                let resp = context.reply_template({
                    state,
                    hasChildren: true
                });
                if (resp.state.from_script && resp.state.from_script==true) return {...resp,...{ valid:false }};
                //code
                let sons = await node.getNodes();
                if (sons.length>1) {
                    if (node.text_note != '') resp.open = `// ${node.text_note.cleanLines()}\n`;
                    resp.open += context.tagParams('template', { 'v-else': null }, false);
                } else if (sons.length==1) {
                    if (node.text_note != '') resp.open = `// ${node.text_note.cleanLines()}\n`;
                    resp.open += context.tagParams('vue_if', { 
                        'expresion':'',
                        'tipo':'v-else',
                        'target': sons[0].id 
                    }, false);
                    resp.close = `</vue_if>`;
                } else {
                    // dont write if we dont have children
                }
                return resp;
            }
        },

        'def_condicion': {
            x_icons: 'help',
            x_level: '>2',
            x_text_contains: 'condicion si',
            x_watch: 'def_condicion_view',
            hint:   `Declara que los hijo/s deben cumplir la condicion indicada para ser ejecutados.`,
            func: async function(node, state) {
                let resp = context.reply_template({
                    state,
                    hasChildren: true
                });
                if (!resp.state.from_script || (resp.state.from_script && resp.state.from_script==false)) return {...resp,...{ valid:false }};
                let condicion = await context.x_commands['def_condicion_view'].func(node, { ...state, ...{
                    from_script:false
                }});
                //code.
                if (node.text_note != '') resp.open = `/* ${node.text_note.cleanLines()} */\n`;
                if (condicion.state.meta.script) {
                    resp.open += condicion.state.meta.script;
                }
                if (condicion.state.meta.params.tipo=='v-if') {
                    resp.open += `if (${condicion.state.meta.if_js}) {\n`;
                } else {
                    resp.open += `else if (${condicion.state.meta.if_js}) {\n`;
                }
                resp.close = `}\n`;
                return resp;
            }
        },

        'def_otra_condicion': {
            x_icons: 'help',
            x_level: '>2',
            x_text_exact: 'otra condicion',
            hint:   `Ejecuta sus hijos en caso de no cumplirse la condicion anterior.`,
            func: async function(node, state) {
                let resp = context.reply_template({
                    state,
                    hasChildren: true
                });
                if (!resp.state.from_script || (resp.state.from_script && resp.state.from_script==false)) return {...resp,...{ valid:false }};
                //code
                if (node.text_note != '') resp.open = `// ${node.text_note.cleanLines()}\n`;
                resp.open += `else {\n`;
                resp.close = `}\n`;
                return resp;
            }
        },

        //*def_condicion_view
        //*def_otra_condicion_view
        //*def_condicion (def_script_condicion)
        //*def_otra_condicion (def_script_otra_condicion)


        // *************
        // 	 VARIABLES
        // *************

        'def_variables': {
            x_icons: 'xmag',
            x_level: '3,4',
            x_or_hasparent: 'def_page,def_componente,def_layout',
            x_text_contains: 'variables',
            hint: 'Definicion local de variables observadas',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let params = {};
                // process attributes as variables
                // set vars
                if (typeof state.current_page !== 'undefined') {
                    if (typeof context.x_state.pages[state.current_page] === 'undefined') context.x_state.pages[state.current_page] = {};
                    if ('variables' in context.x_state.pages[state.current_page] === false) context.x_state.pages[state.current_page].variables = {};
                    if ('types' in context.x_state.pages[state.current_page] === false) context.x_state.pages[state.current_page].types = {};
                }
                resp.state.from_variables=true;
                return resp;
            }
        },

        'def_variables_field': {
            x_priority: 1,
            x_empty: 'icons',
            x_level: '>3',
            x_all_hasparent: 'def_variables',
            hint: 'Campo con nombre de variable observada y tipo',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                if (node.icons.includes('bookmark')==true) return {...resp,...{ valid:false }};
                if (resp.state.vars_path) resp.state.vars_last_level = resp.state.vars_path.length;
                //console.log('FIRST CALL var state',resp.state );
                let params = {},
                    tmp = {
                        type: 'string',
                        field: node.text.trim(),
                        level: node.level - 3
                    };
                let padres = await context.getParentIDs(node.id, false);
                if (padres.split(',').includes('def_variables_mock')==true) {
                    return {...resp,...{ valid:false }};
                }
                //console.log('padres test dummy_group',padres);
                if (padres.split(',').includes('def_dummy_group')==true) {
                    tmp.level -= 1;
                    //console.log('DEBUG this has a dummy parent - def_dummy_group',tmp);
                }
                //
                if ((tmp.field.includes('[') && tmp.field.includes(']')) ||
                    (tmp.field.includes('{') && tmp.field.includes('}'))) {
                    // this is a script node
                    tmp.type = 'script';
                    tmp.field = `script${node.id}`;

                } else if (tmp.field.includes(':')) {
                    tmp.type = tmp.field.split(':').pop().toLowerCase().trim(); //listlast
                    tmp.field = tmp.field.split(':')[0].trim();
                } else if (node.nodes_raw && node.nodes_raw.length > 0) {
                    // get children nodes, and test that they don't have a help icon.
                    let subnodes = await node.getNodes();
                    let has_event = false;
                    for (let i of subnodes) {
                        if (i.icons.includes('help') && i.text=='change') {
                            has_event = true;
                        }
                        await setImmediatePromise(); //@improved
                    }
                    if (has_event == false) {
                        tmp.type = 'object';
                    }
                } else {
                    tmp.type = 'string';
                }
                // process attributes (and overwrite types if needed)
                Object.keys(node.attributes).map(function(keym) {
                    let keytest = keym.toLowerCase().trim();
                    let value = node.attributes[keym];
                    //console.log(`${tmp.field} attr key:${keytest}, value:${value}`);
                    if ('type,tipo,:type,:tipo'.split(',').includes(keytest)) {
                        tmp.type = value.toLowerCase().trim();
                    } else if ('valor,value,:valor,:value'.split(',').includes(keytest)) {
                        let t_value = value.replaceAll('$variables', 'this.')
                            .replaceAll('$vars.', 'this.')
                            .replaceAll('$params.', 'this.')
                            .replaceAll('$store.', 'this.$store.state.');
                        if (t_value.toLowerCase().trim() == '{now}') t_value = 'new Date()';
                        if (t_value.includes('assets:')) {
                            t_value = context.getAsset(t_value, 'js');
                        }
                        params.value = t_value;
                    } else {
                        if (keytest.includes(':')) {
                            params[keym.trim()] = value.trim();
                        }
                    }
                });
                // assign default value for type, if not defined
                if ('string,text,texto'.split(',').includes(tmp.type)) {
                    if ('value' in params === false) {
                        params.value = '';
                    } else {
                        params.value = params.value.toString();
                    }
                } else if ('script' == tmp.type) {
                    params.value = node.text.trim().replaceAll('&#xa;', '')
                        .replaceAll('&apos;', '"')
                        .replaceAll('&#xf1;', 'ñ');
                    let copy_test = [...resp.state.vars_types];
                    if (params.value.charAt(0) != '[' && params.value.charAt(0) != '{') {
                        params.value = '[' + params.value + ']';
                    } else if (copy_test.pop()=='array' && params.value.charAt(0) != '[') {
                        params.value = '[' + params.value + ']';
                    }
                    let convertjs = require('safe-eval');
                    try {
                        params.value = convertjs(params.value);
                    } catch (cjerr) {
                        params.value = [{
                            error_in_script_var: cjerr
                        }];
                    }
                    //params.value = JSON.parse('['+params.value+']');

                } else if ('date,datetime'.split(',').includes(tmp.type)) {
                    if ('value' in params === false) {
                        params.value = new Date();
                    } else {
                        let convertjs = require('safe-eval');
                        try {
                            params.value = convertjs(params.value);
                        } catch (cjerr) {
                        }
                    }

                } else if ('int,numeric,number,numero'.split(',').includes(tmp.type)) {
                    if ('value' in params === false) {
                        params.value = 0;
                    } else {
                        params.value = parseInt(params.value);
                    }
                } else if ('float,real,decimal'.split(',').includes(tmp.type)) {
                    if ('value' in params === false) {
                        params.value = 0.0;
                    } else {
                        params.value = parseFloat(params.value);
                    }
                } else if ('boolean,boleano,booleano'.split(',').includes(tmp.type)) {
                    if ('value' in params === false) {
                        if (tmp.field == 'true') {
                            // ex value of an array (true/false)
                            params.value = true;
                        } else if (tmp.field == 'false') {
                            params.value = false;
                        } else {
                            params.value = false;
                        }
                    } else {
                        if (params.value == 'true') {
                            // ex value of an array (true/false)
                            params.value = true;
                        } else if (params.value == 'false') {
                            params.value = false;
                        }
                    }
                } else if ('array'.split(',').includes(tmp.type)) {
                    tmp.type = 'array';
                    if ('value' in params === false) {
                        params.value = [];
                    } else {
                        params.value = JSON.parse(params.value);
                    }

                } else if ('struct,object'.split(',').includes(tmp.type)) {
                    tmp.type = 'object';
                    if ('value' in params === false) {
                        params.value = {};
                    } else {
                        params.value = JSON.parse(params.value);
                    }
                } else if ('null,nulo'.split(',').includes(tmp.type)) {
                    tmp.type = 'null';
                    if ('value' in params === false) {
                        params.value = null;
                    } else {
                        params.value = JSON.parse(params.value);
                    }
                }
                // check and prepare global state
                if (typeof state.current_page !== 'undefined') {
                    if (state.current_page in context.x_state.pages === false) context.x_state.pages[state.current_page] = {};
                    if ('variables' in context.x_state.pages[state.current_page] === false) context.x_state.pages[state.current_page].variables = {};
                    if ('var_types' in context.x_state.pages[state.current_page] === false) context.x_state.pages[state.current_page].var_types = {};
                }
                // assign var info to page state
                if (tmp.level == 1) {
                    // this is a single variable (no dad); eq. variables[field] = value/children
                    context.x_state.pages[state.current_page].var_types[tmp.field] = tmp.type;
                    context.x_state.pages[state.current_page].variables[tmp.field] = params.value;
                    resp.state.vars_path = [tmp.field];
                    resp.state.vars_types = [tmp.type];
                    resp.state.vars_last_level = tmp.level;
                } else {
                    // variables[prev_node_text][current_field] = value
                    //console.log(`testing ${tmp.level} (current level) with ${resp.state.vars_last_level} (last var level)`);
                    if (tmp.level>resp.state.vars_last_level) {
                        //current is son of prev
                        //console.log(`current var '${tmp.field}' (${tmp.level}) is SON of '${resp.state.vars_path.join('.')}' (${resp.state.vars_last_level})`);
                        resp.state.vars_path.push(tmp.field); // push new var to paths
                        resp.state.vars_types.push(tmp.type);
                        //console.log(`trying to set: ${resp.state.vars_path.join('.')} on context.x_state.pages['${state.current_page}'].variables as ${tmp.type}`);

                    } else if (tmp.level==resp.state.vars_last_level) {
                        //current is brother of prev
                        //console.log(`current var '${tmp.field}' (${tmp.level}) is BROTHER of '${resp.state.vars_path.join('.')}' (${resp.state.vars_last_level})`);
                        resp.state.vars_path.pop(); // remove last field from var path
                        resp.state.vars_types.pop(); // remove last field type from vars_types
                        //console.log(`vars_path AFTER pop: `,resp.state.vars_path);
                        resp.state.vars_path.push(tmp.field); // push new var to paths
                        resp.state.vars_types.push(tmp.type);
                        //console.log(`trying to set: ${resp.state.vars_path.join('.')} on context.x_state.pages['${state.current_page}'].variables as ${tmp.type}`);

                    } else {
                        //current path is smaller than last
                        //console.log(`current var '${tmp.field}' (${tmp.level}) is UPPER of '${resp.state.vars_path.join('.')}' (${resp.state.vars_last_level})`);
                        //console.log(`new var has higher hierarchy than last! ${resp.state.vars_last_level} > ${tmp.level}`);
                        //console.log('error dump',{ last_level:resp.state, tmp});
                        let amount=new Array(resp.state.vars_last_level-tmp.level+1);
                        for (let t of amount) {
                            //console.log(`vars_path before pop: `,resp.state.vars_path);
                            resp.state.vars_path.pop(); // remove last field from var path
                            resp.state.vars_types.pop(); // remove last field type from vars_types
                            await setImmediatePromise(); //@improved
                        }
                        //console.log(`vars_path AFTER pops: `,resp.state.vars_path);
                        resp.state.vars_path.push(tmp.field); // push new var to paths
                        resp.state.vars_types.push(tmp.type);
                        //console.log(`trying to set: ${resp.state.vars_path.join('.')} on context.x_state.pages['${state.current_page}'].variables as ${tmp.type}`);
                    }
                    //console.log('MY DAD TYPE:'+resp.state.vars_types[resp.state.vars_types.length - 2]);
                    if (resp.state.vars_types[resp.state.vars_types.length - 2] == 'object') {
                        // dad was an object
                        let copy_dad = [...resp.state.vars_path];
                        if (typeof params.value == 'object' && resp.state.vars_types[resp.state.vars_types.length-1] == 'script') {
                            copy_dad.pop();
                        }
                        try {
                            setToValue(context.x_state.pages[state.current_page].variables, params.value, copy_dad.join('.'));
                        } catch(err_setv) {
                            console.log('error setting var to parent obj',{value:params.value, copy_dad:copy_dad.join('.') });
                        }
                    } else if (resp.state.vars_types[resp.state.vars_types.length - 2] == 'array') {
                        //console.log('dad was an array',{ type:resp.state.vars_types[resp.state.vars_types.length-1], path:resp.state.vars_path});
                        // dad is an array.. 
                        let copy_dad = [...resp.state.vars_path];
                        copy_dad.pop();
                        //console.log('my dad path is '+copy_dad.join('.'));
                        let daddy = getVal(context.x_state.pages[state.current_page].variables, copy_dad.join('.'));
                        //console.log('daddy says:',daddy);
                        if (tmp.type == 'script') {
                            // if we are a script node, just push our values, and not ourselfs.
                            if (Array.isArray(params.value)) {
                                params.value.map(i => {
                                    daddy.push(i);
                                });
                            }

                        } else if (tmp.field != params.value) {
                            // push as object (array of objects)
                            let tmpi = {};
                            tmpi[tmp.field] = params.value;
                            daddy.push(tmpi);
                        } else {
                            // push just the value (single value)
                            daddy.push(params.value);
                        }
                        // re-set daddy with new value
                        setToValue(context.x_state.pages[state.current_page].variables, daddy, copy_dad.join('.'));
                    }
                    //*resp.state.vars_types.push(tmp.type); // push new var type to vars_types
                    context.x_state.pages[state.current_page].var_types[resp.state.vars_path.join('.')] = tmp.type;
                    resp.state.vars_last_level = resp.state.vars_path.length;
                    //console.log('BEFORE close: state for next var (cur level: '+tmp.level+', last_level:'+resp.state.vars_last_level+')',resp.state);
                    //resp.state.vars_last_level = tmp.level;
                }
                return resp;
            }
        },

        'def_variables_watch': {
            x_icons: 'help',
            x_level: '>4',
            x_text_contains: 'change',
            x_all_hasparent: 'def_variables,def_variables_field',
            hint: 'Monitorea los cambios realizados a la variable padre',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                if (node.nodes_raw.length==0) return resp;
                let params = {
                    name: node.text.trim(),
                    type: 'watched',
                    oldvar: 'old',
                    newvar: 'new'
                };
                // process attributes
                Object.keys(node.attributes).map(function(keym) {
                    let keytest = keym.toLowerCase().trim();
                    let value = node.attributes[keym];
                    if (':old,old'.split(',').includes(keytest)) {
                        params.oldvar = value;
                    } else if (':new,new'.split(',').includes(keytest)) {
                        params.newvar = value;
                    } else if (':deep,deep'.split(',').includes(keytest)) {
                        params.deep = value;
                    }
                });
                //get parent node (for deep vars)@todo
                if (resp.state.vars_path.length>1) {
                    //search real parent var tree
                    let parents = await context.dsl_parser.getParentNodesIDs({ id:node.id, array:true });
                    let parents_ = [];
                    for (let parent_id of parents) {
                        let node = await context.dsl_parser.getNode({ id:parent_id, recurse:false });
                        if (node.icons.length>0) break;
                        parents_.push(node.text.split(':')[0]);
                    }
                    //console.log('parents_: ',parents_.reverse().join('.'));
                    params.flat = parents_.reverse().join('.'); 
                } else {
                    params.flat = resp.state.vars_path.join('.'); // inherit parent var from def_variables_field last state
                }
                // write tag
                resp.open = context.tagParams('vue_watched_var', params, false)+'<!--';
                if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                resp.close = '--></vue_watched_var>';
                resp.state.from_script=true;
                return resp;
            }
        },

        'def_variables_func': {
            x_icons: 'help',
            x_level: '4,5',
            x_not_text_contains: ':server,condicion si,otra condicion',
            x_all_hasparent: 'def_variables',
            hint: 'Variable tipo funcion',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let params = {
                    name: node.text.trim(),
                    type: 'computed'
                };
                let tmp = {
                    type: 'async'
                };
                // process attributes
                Object.keys(node.attributes).map(function(key) {
                    let keytest = key.toLowerCase().trim().replaceAll(':', '');
                    let value = node.attributes[key].trim();
                    if ('default' == keytest) {
                        params.valor = value;
                    } else if ('valor,value'.split(',').includes(keytest)) {
                        params.valor = value;
                    } else if ('lazy' == keytest) {
                        params.lazy = (value == 'true') ? true : false;
                    } else if ('observar,onchange,cambie,cambien,modifiquen,cuando,monitorear,watch'.split(',').includes(keytest)) {
                        params.watch = value;
                    } else if ('async' == keytest) {
                        tmp.type = (value == 'true') ? 'async' : 'sync';
                    }
                });
                // built response
                if (tmp.type == 'async') {
                    // add async plugin to app
                    context.x_state.plugins['vue-async-computed'] = {
                        global: true,
                        npm: {
                            'vue-async-computed': '*'
                        }
                    };
                    resp.open = context.tagParams('vue_async_computed', params, false)+'<!--\n';
                    if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                    resp.close = '--></vue_async_computed>\n';
                } else {
                    resp.open = context.tagParams('vue_computed', params, false)+'<!--\n';
                    if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                    resp.close = '--></vue_computed>\n';
                }
                resp.state.from_script=true;
                // return
                return resp;
            }
        },

        'def_variables_mock': {
            x_icons: 'bookmark',
            x_level: '4,5',
            x_not_text_contains: ':server,condicion si,otra condicion',
            x_all_hasparent: 'def_variables',
            hint: 'Variable tipo mockup',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let params = {
                    name: node.text.split(':')[0].trim(),
                    type: 'computed'
                };
                let tmp = {
                    type: 'computed',
                    repeat: 1,
                    template: '',
                    _min:null,
                    _max:null,
                    seed:null
                };
                // process attributes
                Object.keys(node.attributes).map(function(key) {
                    let keytest = key.toLowerCase().trim().replaceAll(':', '');
                    let value = node.attributes[key].trim();
                    if ('default' == keytest) {
                        params.valor = value;
                    } else if ('valor,value'.split(',').includes(keytest)) {
                        params.valor = value;
                    } else if ('lazy' == keytest) {
                        params.lazy = (value == 'true') ? true : false;
                    } else if ('observar,onchange,cambie,cambien,modifiquen,cuando,monitorear,watch'.split(',').includes(keytest)) {
                        params.watch = value;
                    } else if ('async' == keytest) {
                        tmp.type = (value == 'true') ? 'async' : 'sync';
                    } else if ('min' == keytest) {
                        tmp._min = value;
                    } else if ('max' == keytest) {
                        tmp._max = value;
                    } else if ('seed' == keytest) {
                        tmp.seed = value;
                    } else if ('cantidad' == keytest) {
                        tmp.repeat = value;
                    }
                });
                // build transform method
                let translate = async function(child) {
                    let full = child.text.split(':');
                    let key = full.shift();
                    let cmd = ['random']; //default cmd
                    let value = '';
                    if (full.length>0) {
                        cmd = full.shift().split(' ');
                    }
                    if (cmd[0]=='placeholder') {
                        value = 'https://via.placeholder.com/';
                        if (cmd[1]) value+= cmd[1]+'/';
                        if (child.attributes.hexColor) {
                            if (child.attributes.hexColor=='random') {
                                value += '{{hexColor websafe=true withHash=false}}';
                            } else {
                                value += ''+child.attributes.hexColor;
                            }
                        }
                        value = `"${value}"`;
                    } else if (cmd[0]=='picture') {
                        value = 'https://api.lorem.space/image/face?';
                        if (cmd[1]) {
                            let tmp_w = cmd[1].split('x');
                            value+= `w=${tmp_w[0]}&h=${tmp_w[1]}&rnd={{int 0 999999}}`;
                        }
                        value = `"${value}"`;
                        //https://api.lorem.space/image/face?w=150&h=150
                    } else if (cmd[0]=='random') {
                        //use children as posible values
                        let grandChildren = await child.getNodes();
                        if (grandChildren.length==0) {
                            //use lorem if no children
                            value = '"{{lorem 20}}"';
                        } else {
                            let gchilds = [];
                            for (gchild of grandChildren) {
                                if (gchild.valid==true) {
                                    gchilds.push(`'${gchild.text.replaceAll("'","\'")}'`);
                                }
                            }
                            value = `"{{random ${gchilds.join(' ')}}}"`;
                        }
                    } else if (cmd[0]=='lorem') {
                        if (cmd[1]) {
                            value+= `"{{lorem ${cmd[1].trim()}}}"`;
                        } else {
                            value = '"{{lorem 20}}"';
                        }
                    } else if (cmd[0]=='boolean') {
                        value = '{{boolean}}';
                    } else if (cmd[0]=='id' || cmd[0]=='@index') {
                        value = '{{@index}}';
                    } else if (cmd[0]=='nombre' || cmd[0]=='firstname') {
                        value = '"{{firstName}}"';
                    } else if (cmd[0]=='apellido' || cmd[0]=='lastname') {
                        value = '"{{lastName}}"';
                    } else if (cmd[0]=='empresa' || cmd[0]=='company') {
                        value = '"{{company}}"';
                    } else if (cmd[0]=='email' || cmd[0]=='correo') {
                        value = '"{{email}}"';
                    } else if (cmd[0]=='ciudad' || cmd[0]=='city') {
                        value = '"{{city}}"';
                    } else if (cmd[0]=='calle' || cmd[0]=='street') {
                        value = '"{{street}}"';
                    } else if (cmd[0]=='pais' || cmd[0]=='country') {
                        value = '"{{country}}"';
                    } else if (cmd[0]=='latitud' || cmd[0]=='latitude') {
                        value = '{{lat}}';
                    } else if (cmd[0]=='longitud' || cmd[0]=='longitude') {
                        value = '{{long}}';
                    } else if (cmd[0]=='dominio' || cmd[0]=='domain') {
                        value = '"{{domain}}"';
                    } else if (cmd[0]=='telefono' || cmd[0]=='phone') {
                        cmd[0] = 'phone';
                        if (cmd.length>1) {
                            value = `{{${cmd.join(' ')}}}`;
                        } else {
                            value = `{{phone "+56x xxxx xxxx"}}`;
                        }
                    } else if (cmd[0]=='int') {
                        if (cmd.length>1 && cmd.length<4) {
                            value = `{{${cmd.join(' ')}}}`;
                        } else if (cmd.length==4) {
                            // if includes formatting, declare as string
                            value = `"{{${cmd.join(' ')}}}"`;
                        } else {
                            value = `{{int 0 999999}}`;
                        }
                    } else if (cmd[0]=='float') {
                        if (cmd.length>1) {
                            value = `{{${cmd.join(' ')}}}`;
                        } else {
                            value = `{{float 0 999999 '0.00'}}`;
                        }
                    } else if (cmd[0]=='date' || cmd[0]=='fecha') {
                        if (cmd.length>1) {
                            cmd[0]='date';
                            if (cmd.length==4 && cmd[3].includes('unix')) {
                                value = `{{${cmd.join(' ')}}}`;
                            } else {
                                value = `"{{${cmd.join(' ')}}}"`;
                            }
                        } else {
                            value = `"{{date '1970-1-1' '2022-1-1'}}"`;
                        }
                    } else if (cmd[0]=='time' || cmd[0]=='hora') {
                        if (cmd.length>1) {
                            cmd[0]='time';
                            if (cmd.length==4 && cmd[3].includes('unix')) {
                                value = `{{${cmd.join(' ')}}}`;
                            } else {
                                value = `"{{${cmd.join(' ')}}}"`;
                            }
                        } else {
                            value = `"{{time '00:00' '23:59'}}"`;
                        }
                    } else if (cmd[0].includes('$variables.')) {
                        value = '${JSON.stringify('+cmd[0].replaceAll('$variables.','this.')+')}';
                    } else if (cmd[0].includes('{{')) {
                        //custom type {{int 0 10}} {{ciudad}}
                        value = `"${cmd.join(' ')}"`;
                    }
                    return {
                        key,
                        value
                    };
                };
                // build template
                if (node.nodes_raw && node.nodes_raw.length > 0) {
                    // get children nodes to build template.
                    let children = await node.getNodes();
                    //console.log(children);
                    let rows = [];
                    for (child of children) {
                        let new_ = await translate(child);
                        //console.log('new_',new_);
                        rows.push(`\t\t\t"${new_.key}":${new_.value}`);
                    }
                    tmp.template = "{ " + rows.join(',').replaceAll(`",\t`,`",\n\t`).replaceAll(`},\t`,`},\n\t`) + " }";
                    //console.log('future template',rows);
                } else {
                    // single mock variable
                    let new_ = await translate(node);
                    //console.log('single mock var',new_);
                    tmp.template = new_.value;
                }
                if (tmp._min && tmp._max) {
                    tmp.template = `[
    {{#repeat min=${tmp._min} max=${tmp._max}}}
${tmp.template}
    {{/repeat}}
]`;
                } else {
                    tmp.template = `[
    {{#repeat ${tmp.repeat}}}
${tmp.template}
    {{/repeat}}
]`;
                }
                //
                // build response
                let code = '';
                //for each watch, add a virtual code, so vue monitors changes
                if (params.watch) {
                    let watched = params.watch.split(',');
                    code += `//hack triggering update using watched vars\n`;
                    for (let value_ of watched) {
                        value_r = value_.replaceAll('$params.', 'this.')
                                        .replaceAll('$variables.', 'this.')
                                        .replaceAll('$config.', 'this.$config.')
                                        .replaceAll('$store.', 'this.$store.state.');
                        code += `if (${value_r}) { let _x_=${value_r}; }\n`;
                    }
                    code += `//end hack\n`;
                }
                //
                code += `let dummy_json = require('dummy-json');\n`;
                if (tmp.seed) code += `dummyjson.seed = '${tmp.seed}';\n`;
                code += `let template = \`${tmp.template}\`;\n`;
                code += `return JSON.parse(dummy_json.parse(template));\n`;
                //
                if (tmp.type == 'async') {
                    // add async plugin to app
                    context.x_state.plugins['vue-async-computed'] = {
                        global: true,
                        npm: {
                            'vue-async-computed': '*',
                            'dummy-json': '*'
                        }
                    };
                    resp.open = context.tagParams('vue_async_computed', params, false)+'<!--\n';
                    if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                    resp.open += code;
                    resp.close = '--></vue_async_computed>\n';
                } else {
                    context.x_state.npm['dummy-json'] = '*';
                    resp.open = context.tagParams('vue_computed', params, false)+'<!--\n';
                    if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                    resp.open += code;
                    resp.close = '--></vue_computed>\n';
                }
                resp.state.from_script=true;
                // return
                return resp;
            }
        },
        // *************************
        //  Scriptable definitions
        // *************************

        //..scripts..
        'def_responder': {
            x_icons: 'desktop_new',
            //x_text_pattern: `responder "*"`,
            x_text_contains: `responder "`,
            x_or_hasparent: 'def_variables,def_event_element,def_event_method',
            x_level: '>3',
            hint: 'Emite una respuesta para la variable de tipo funcion o evento :rules',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                if (node.text_note != '') resp.open = `// ${node.text_note.cleanLines()}\n`;
                let text = context.dsl_parser.findVariables({
                    text: node.text,
                    symbol: `"`,
                    symbol_closing: `"`
                });
                // tests return types
                if (text.includes('$')) {
                    text = text.replaceAll('$params.', 'this.')
                               .replaceAll('$variables.', 'this.');
                }
                if (text.includes('**') && node.icons.includes('bell')) {
                    let new_vars = getTranslatedTextVar(text);
                    resp.open += `return ${new_vars};\n`;
                } else if (node.text.includes('$')) {
                    resp.open += `return ${text};\n`;
                } else if (text.includes('assets:')) {
                    text = context.getAsset(text, 'js');
                    resp.open += `return ${text};\n`;
                } else if (text == '') {
                    resp.open += `return '';\n`;
                } else if (text.charAt(0) == '(' && text.slice(-1) == ')') {
                    text = text.slice(1).slice(0, -1);
                    resp.open += `return ${text};\n`;
                } else {
                    if (context.x_state.central_config.langs && context.x_state.central_config.langs.includes(',')) {
                        // @TODO add support for i18m
                    } else {
                        resp.open += `return '${text}';\n`;
                    }
                }
                return resp;
            }
        },

        'def_struct': {
            x_icons: 'desktop_new',
            x_text_contains: 'struct,,',
            x_not_text_contains: 'traducir',
            x_level: '>3',
            hint: 'Creates an object with the attributes/values defined within the node.',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state,
                    hasChildren:false
                });
                let tmp = {};
                let tempArray = [];
                // parse output var
                tmp.var = node.text.split(',').pop().trim(); //last comma element                
                tmp.var = tmp.var.replaceAll('$variables.', '')
                    .replaceAll('$store.', 'this.$store.state.')
                    .replaceAll('$config.', 'this.$config.')
                    .replaceAll('$params.', '');
                tmp.var = (tmp.var == 'this.') ? 'this' : tmp.var;
                // process attributes
                let attrs = {...node.attributes
                };
                //context.debug('def_struct START',{ text:node.text, attrs:attrs, var:tmp.var });
                Object.keys(node.attributes).map(function(key) {
                    let keytest = key.toLowerCase().trim();
                    let value = node.attributes[key].trim();
                    if (node.icons.includes('bell') && value.includes('**')) {
                        value = getTranslatedTextVar(value,true);
                    } else if (value.indexOf('{node.')!=-1) {
                        const extract = require('extractjs')({
                            startExtract: '-',
                            endExtract: '-',
                        });
                        let elems_ = extract('{node.-key-}',value);
                        if (elems_.key && elems_.key in node) {
                            //context.debug('elems_.key: '+elems_.key+' value: '+node[elems_.key]+'');
                            value = value.replaceAll('{node.'+elems_.key+'}',node[elems_.key]);
                        }
                    } else if (value.includes('assets:')) {
                        value = context.getAsset(value, 'js');
                    } else {
                        // normalize vue type vars
                        value = value.replaceAll('$variables.', '')
                            .replaceAll('$vars.', '')
                            .replaceAll('$params.', '')
                            .replaceAll('$store.', 'this.$store.state.');
                    }
                    attrs[key] = value; //.replaceAll('{now}','new Date()');
                });
                // process children as attributes
                if (node.nodes_raw.length > 0) {
                    let children = await node.getNodes();
                    let isArray = true;
                    for (let child of children) {
                        if (Object.keys(child.attributes).length!=0) {
                            //context.debug('child attributes',child.attributes);
                            isArray = false;
                            break;
                        }
                    }
                    for (let child of children) {
                        if (child.nodes_raw.length>0) {
                            //if node has grandchildren, its also an object
                            isArray = false;
                            break;
                        }
                    }
                    //context.debug('def_struct IS_ARRAY',isArray);
                    for (let child of children) {
                        if (!isArray) {
                            let child_ = await context.x_commands['def_struct'].func(child, { ...state, ...{
                                as_object:true
                            }});
                            //context.debug('child_',child_);
                            if (child_.state.array) {
                                attrs[child.text] = child_.state.array;
                            } else {
                                attrs[child.text] = child_.state.object;
                                // if empty, check special node attributes (from def_slot)
                                if (Object.keys(child_.state.object).length==0) {
                                    if (child.bgcolor!='') {
                                        attrs[child.text] = child.bgcolor.toUpperCase();
                                    } else if (child.color!='') {
                                        attrs[child.text] = child.color.toUpperCase();
                                    }
                                }
                                //
                            }
                        } else {
                            //preprocess child.text
                            let tmpval = child.text;
                            if (tmpval.indexOf('{node.')!=-1) {
                                const extract = require('extractjs')({
                                    startExtract: '-',
                                    endExtract: '-',
                                });
                                let elems_ = extract('{node.-key-}',tmpval);
                                if (elems_.key && elems_.key in child) {
                                    tmpval = tmpval.replaceAll('{node.'+elems_.key+'}',child[elems_.key]);
                                }
                            }
                            tempArray.push(tmpval);
                        }
                    }
                    if (tempArray.length>0) {
                        //context.debug('assigning array to attrs['+node.text+'] = ',tempArray);
                        attrs[node.text] = tempArray;
                    }
                }
                // write output
                if (resp.state.as_object) {
                    resp.state.object = attrs;
                    if (tempArray.length>0) {
                        resp.state.array = attrs[node.text];
                        resp.open = context.jsDump(resp.state.array).replaceAll("'`","`").replaceAll("`'","`");
                    } else {
                        resp.open = context.jsDump(attrs).replaceAll("'`","`").replaceAll("`'","`");
                    }
                    //delete resp.state.as_object;
                } else {
                    if (node.text_note != '') resp.open = `// ${node.text_note.cleanLines()}\n`;
                    resp.open += `let ${tmp.var.trim()} = ${context.jsDump(attrs).replaceAll("'`","`").replaceAll("`'","`")};\n`;
                }
                
                //context.debug('def_struct END',resp);
                return resp;
            }
        },

        'def_extender': {
            x_level: '>3',
            x_text_contains: `extender "`,
            x_icons: 'desktop_new',
            hint: 'Extiende los atributos de un objeto con los datos dados en los atributos.',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                // create obj from current node as js obj
                let obj = await context.x_commands['def_struct'].func(node, { ...state, ...{
                    as_object:true
                }});
                // get var name
                let tmp = {};
                tmp.var = context.dsl_parser.findVariables({
                    text: node.text,
                    symbol: '"',
                    symbol_closing: '"'
                }).trim();
                // clean given varname $variables, etc.
                if ((await context.hasParentID(node.id, 'def_event_server'))==true) { //@todo change after checking (revision) concepto inherited states; if (resp.state.from_server) {
                    tmp.var = tmp.var.replaceAll('$variables.', 'resp.')
                                     .replaceAll('$vars.', 'resp.').replaceAll('$params.', 'resp.');
                    tmp.var = (tmp.var == 'resp.') ? 'resp' : tmp.var;
                } else {
                    tmp.var = tmp.var.replaceAll('$variables.', 'this.').replaceAll('$params.', 'this.').replaceAll('$store.', 'this.$store.state.').replaceAll('$config.', 'this.$config.');
                    tmp.var = (tmp.var == 'this.') ? 'this' : tmp.var;
                }
                // extend given var with 'extend_node' content
                // support attr = !attr - 13may21
                for (let x in obj.state.object) {
                    if (typeof obj.state.object[x] === 'string' && obj.state.object[x].charAt(0)=='!' &&
                        obj.state.object[x].includes('this.')==false) {
                            obj.state.object[x] = obj.state.object[x].replaceAll('!',`!${tmp.var}.`);
                    }
                }
                tmp.nobj = context.jsDump(obj.state.object);
                //underscore (seems necesary because vue doesn't detect spreads)
                if (state.current_page) {
                    context.x_state.pages[resp.state.current_page].imports['_'] = 'underscore';
                } else if (state.current_proxy) {
                    context.x_state.proxies[resp.state.current_proxy].imports['_'] = 'underscore';
                } else if (state.current_store) {
                    context.x_state.stores[resp.state.current_store].imports['_'] = 'underscore';
                }
                if (node.text_note != '') resp.open = `// ${node.text_note.cleanLines()}\n`;
                //resp.open = `${tmp.var} = {...${tmp.var},...${tmp.nobj}};\n`;
                resp.open += `${tmp.var} = _.extend(${tmp.var}, ${tmp.nobj});\n`;
                return resp;
            }
        },

        'def_literal_js': {
            x_icons: 'penguin',
            x_not_text_contains: 'por cada registro en',
            x_level: '>1',
            hint: 'Nodo JS literal; solo traduce $variables y referencias de refrescos a metodos async.',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let tmp = { text:node.text };
                if (node.icons.includes('idea')) {
                    resp.valid=false;
                    return resp;
                }
                if (node.text.includes('$variables.') && node.text.right(2)=='()') {
                    tmp.text = tmp.text .replaceAll('$variables.','this.$asyncComputed.')
                                        .replaceAll('()','.update();')
                                        .replaceAll(';;',';');
                } else if (node.text.includes('$vars.') && node.text.right(2)=='()') {
                    tmp.text = tmp.text .replaceAll('$vars.','this.$asyncComputed.')
                                        .replaceAll('()','.update();')
                                        .replaceAll(';;',';');
                } else if (node.text.includes('$params.') && node.text.right(2)=='()') {
                    //@TODO check this, doesn't look right
                    tmp.text = tmp.text .replaceAll('$params.','this.$asyncComputed.')
                                        .replaceAll('()','.update();')
                                        .replaceAll(';;',';');
                } else if (node.text.includes('$store.') && node.text.includes('this.$store.state')==false) {
                    tmp.text = tmp.text .replaceAll('$store.','this.$store.state.')
                                        .replaceAll('this.$nuxt.this.$store.','this.$nuxt.$store.');
                } else if (node.text.includes('assets:')) {
                    let extract = require('extractjs')();
                    let elements = extract(`'assets:{name}'`,node.text);
                    let value_ = context.getAsset('assets:'+elements.name, 'jsfunc');
                    tmp.text = tmp.text.replaceAll(`'assets:${elements.name}'`,value_);
                } else {
                    tmp.text = tmp.text .replaceAll('$variables.','this.')
                                        .replaceAll('$vars.','this.')
                                        .replaceAll('$params.','this.');
                }
                //scrollTo plugin?
                if (tmp.text.includes('this.$scrollTo')) {
                    context.x_state.plugins['vue-scrollto'] = {
                        global:true,
                        mode: 'client',
                        npm: {
                            'vue-scrollto': '*'
                        }
                    };
                }
                //vuescript2
                if (tmp.text.includes('vuescript2')) tmp.text = tmp.text.replaceAll('vuescript2.',`require('vue-script2').`);
                //
                if (tmp.text.includes('_.')) {
                    context.x_state.pages[resp.state.current_page].imports['underscore'] = '_';
                }
                /*if (tmp.text.includes('google.')) {
                    context.x_state.pages[resp.state.current_page].imports['gmapApi'] = 'vue2-google-maps';
                    resp.open += 'if (!google) var google = gmapApi;\n';
                }*/
                //code
                if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                resp.open += tmp.text;
                if (resp.open.right(1)!=';') resp.open += ';';
                resp.open += '\n';
                resp.state.from_script=true;
                return resp;
            }
        },

        'def_console': {
            x_icons: 'clanbomber',
            x_not_icons: 'desktop_new',
            x_level: '>1',
            hint: 'Emite su texto a la consola. Soporta mostrar los datos/variables de sus atributos.',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let tmp = { text:node.text };
                if (node.icons.includes('bell')) {
                    tmp.text = getTranslatedTextVar(tmp.text);
                } else {
                    tmp.text = `'${tmp.text}'`;
                }
                //attr
                // process attributes
                let attrs = {...node.attributes
                };
                Object.keys(node.attributes).map(function(key) {
                    let keytest = key.toLowerCase().trim();
                    let value = node.attributes[key].trim();
                    let valuet = getTranslatedTextVar(value);
                    if (value.includes('assets:')) {
                        value = context.getAsset(value, 'jsfunc');
                    } else {
                        // normalize vue type vars                        
                        value = value.replaceAll('$variables.', 'this.')
                            .replaceAll('$vars.', 'this.')
                            .replaceAll('$params.', 'this.')
                            .replaceAll('$store.', 'this.$store.state.');
                    }
                    //bell
                    if (node.icons.includes('bell') && value.replaceAll('**','')!=valuet) { // && value!=`**${valuet}**`) {
                        value = getTranslatedTextVar(value);
                    } else if (!node.icons.includes('bell') && value.includes('**')) {
                        value = `'${value}'`;
                    }
                    // modify values to copy
                    attrs[key] = value;
                });
                //code
                if (node.text_note != '') resp.open = `// ${node.text_note.cleanLines()}\n`;
                resp.open += `console.log(${tmp.text},${context.jsDump(attrs)});\n`;
                return resp;
            }
        },

        'def_npm_instalar': {
            x_icons: 'desktop_new',
            x_text_pattern: [`npm:+(install|instalar) "*"`,`npm:+(install|instalar) "*",*`,
                             `npm:+(install|instalar) "*/*"`,`npm:+(install|instalar) "*/*",*`],
            x_level: '>2',
            hint: 'Instala el paquete npm indicado entrecomillas y lo instancia en la página (import:true) o función actual, o lo asigna a la variable indicada luego de la coma.',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let defaults = { text:node.text, tipo:'import', tipo_:'', version:'*', git:'', init:'' };
                let attr = aliases2params('def_npm_instalar', node);  
                attr = {...defaults, ...attr};
                if (attr.import && attr.import!='true') attr.tipo_ = attr.import;
                attr.text = context.dsl_parser.findVariables({
                    text: node.text,
                    symbol: '"',
                    symbol_closing: '"'
                }).trim();
                attr.var = attr.tipo_ = node.text.split(',').pop();
                //code
                if (node.text_note != '') resp.open = `// ${node.text_note.cleanLines()}\n`;
                if (!attr.require) {
                    if ('current_func' in resp.state) {
                        context.x_state.functions[resp.state.current_func].imports[attr.tipo_] = attr.text;
                    } else {
                        context.x_state.pages[resp.state.current_page].imports[attr.tipo_] = attr.text;
                    }
                    context.x_state.npm[attr.text] = attr.version;
                } else {
                    //add support for user/repo
                    let pkg_name = attr.text; 
                    if (attr.text.substr(0,1)!='@' && attr.text.includes('/') && !attr.text.includes('http') && !attr.text.includes('github.com')) {
                        pkg_name = pkg_name.split('/')[1];
                        context.x_state.npm[pkg_name] = `https://github.com/${attr.text}.git`;
                    } else {
                        context.x_state.npm[attr.text] = attr.version;
                    }
                    resp.open += `let ${attr.var} = require('${pkg_name}');\n`;
                }
                return resp;
            }
        },

        'def_crear_id_unico': {
            x_icons: 'desktop_new',
            x_text_contains: 'crear id unico,,', //,,=requires comma
            x_level: '>2',
            hint: 'Obtiene un id unico (en 103 trillones) y lo asigna a la variable luego de la coma.',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let tmp = { var:node.text.split(',').pop() };
                //code
                if (node.text_note != '') resp.open = `// ${node.text_note.cleanLines()}\n`;
                context.x_state.npm['nanoid']='2.1.1';
                resp.open += `let ${tmp.var} = require('nanoid')();\n`;
                return resp;
            }
        },

        'def_aftertime': {
            x_icons: 'desktop_new',
            x_text_pattern: `ejecutar en "*" +(segundos|minutos|horas)`,
            x_level: '>2',
            hint: 'Ejecuta su contenido desfasado en los segundos especificados.',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let time = context.dsl_parser.findVariables({
                    text: node.text,
                    symbol: `"`,
                    symbol_closing: `"`
                }).trim();
                //code
                let amount = node.text.split(' ').pop();
                if (amount=='minutos') time += `*60`;
                if (amount=='horas') time += `*60*60`;
                if (node.text_note != '') resp.open = `// ${node.text_note.cleanLines()}\n`;
                resp.open += `setTimeout(function q() {\n`;
                resp.close = `}.bind(this), 1000*${time});\n`;
                return resp;
            }
        },

        'def_probar': {
            x_icons: 'broken-line',
            x_text_exact: 'probar',
            x_level: '>2',
            hint: 'Encapsula sus hijos en un try/catch.',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                //test if there is an error node child
                let subnodes = await node.getNodes();
                let has_error = false;
                subnodes.map(async function(item) {
                    if (item.text=='error' && item.icons.includes('help')) has_error=true;
                }.bind(this));
                //code
                if (node.text_note != '') resp.open = `// ${node.text_note.cleanLines()}\n`;
                resp.open += 'try {\n';
                if (has_error==false) {
                    resp.close += `} catch(e${node.id}) {\n console.log('error en comando probar: recuerda usar evento ?error como hijo para controlarlo.');\n`;
                }
                resp.close += '}';
                return resp;
            }
        },

        'def_probar_error': {
            x_icons: 'help',
            x_text_exact: 'error',
            x_all_hasparent: 'def_probar',
            x_level: '>2',
            hint: 'Ejecuta sus hijos si ocurre un error en el nodo padre.',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                //code
                resp.open += `} catch(e${node.id}) {\n`;
                resp.open += `let error = e${node.id};\n`;
                if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                return resp;
            }
        },

        'def_insertar_modelo': {
            x_icons: 'desktop_new',
            x_text_pattern: `insertar modelo "*"`,
            x_level: '>2',
            hint:  `Inserta los atributos (campos) y sus valores en el modelo indicado entrecomillas. 
                    Si especifica una variable luego de la coma, asigna el resultado de la nueva insercion en esa variable.`,
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let tmp = { var:node.id, data:{}, model:'' };
                if (node.text.includes(',')) tmp.var=node.text.split(',').splice(-1)[0].trim();
                tmp.model = context.dsl_parser.findVariables({
                    text: node.text,
                    symbol: `"`,
                    symbol_closing: `"`
                }).trim();
                //get attributes and values as struct
                tmp.data = (await context.x_commands['def_struct'].func(node, { ...state, ...{
                    as_object:true
                }})).open;
                //code
                if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                resp.open += `this.alasql('INSERT INTO ${tmp.model} VALUES ?', [${tmp.data}]);\n`;
                return resp;
            }
        },

        'def_consultar_modelo': {
            x_icons: 'desktop_new',
            x_text_contains: `consultar modelo "`,
            x_level: '>2',
            hint:  `Realiza una consulta a una base de datos virtual (en memoria).
                    Sus atributos corresponden a los campos y datos a filtrar.
                    Se asigna el resultado a la variable luego de la coma.`,
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let tmp = { var:node.id+'_', data:{}, model:'' };
                if (node.text.includes(',')) tmp.var=node.text.split(',').splice(-1)[0].trim();
                tmp.model = context.dsl_parser.findVariables({
                    text: node.text,
                    symbol: `"`,
                    symbol_closing: `"`
                }).trim();
                //get attributes and values as struct
                tmp.data = (await context.x_commands['def_struct'].func(node, { ...state, ...{
                    as_object:true
                }}));
                //code
                if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                if (tmp.data.state.object && Object.keys(tmp.data.state.object)!='') {
                    resp.open += `let ${node.id} = { keys:[], vals:[], where:${tmp.data.open} };
                    for (let ${node.id}_k in ${node.id}.where) {
                        ${node.id}.keys.push(${node.id}_k + '=?');
                        ${node.id}.vals.push(${node.id}.where[${node.id}_k]);
                    }
                    let ${tmp.var} = this.alasql(\`SELECT * FROM ${tmp.model} WHERE \${${node.id}.keys.join(' AND ')}\`,${node.id}.vals);\n`;
                } else {
                    resp.open += `let ${tmp.var} = this.alasql('SELECT * FROM ${tmp.model}', []);\n`;
                    resp.open += `let ${node.id} = { where:{} };`;
                }
                return resp;
            }
        },

        'def_modificar_modelo': {
            x_icons: 'desktop_new',
            x_text_exact: `modificar modelo`,
            x_not_empty: 'link',
            x_level: '>2',
            hint:  `Modifica los datos de la consulta de modelo enlazada, aplicando los datos definidos en sus atributos.`,
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let tmp = { data:{}, model:'' };
                //if (node.link=='') return {...resp,...{ valid:false }};
                //get target node
                let link_node = await context.dsl_parser.getNode({ id:node.link, recurse:false });
                if (link_node && link_node.valid==true) {
                    if (link_node.text.includes('consultar modelo')==false) {
                        throw 'modificar modelo requires an arrow pointing to a consultar modelo node'
                    } else {
                        //get linked info
                        tmp.model = context.dsl_parser.findVariables({
                            text: link_node.text,
                            symbol: `"`,
                            symbol_closing: `"`
                        }).trim();
                        tmp.model_where = link_node.id + '.where';
                        //get attributes and new values as struct
                        tmp.data = (await context.x_commands['def_struct'].func(node, { ...state, ...{
                            as_object:true
                        }})).open;
                        //code
                        if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                        //write update statement
                        resp.open += `let ${node.id} = { keys:[], vals:[], from:[], data:${tmp.data} };\n`;
                        resp.open += `for (let ${node.id}_k in ${node.id}.data) {
                            ${node.id}.keys.push(${node.id}_k+'=?');
                            ${node.id}.vals.push(${node.id}.data[${node.id}_k]);
                        }\n`;
                        //write where requirements
                        resp.open += `for (let ${node.id}_k in ${tmp.model_where}) {
                            ${node.id}.from.push(${node.id}_k+'=?');
                            ${node.id}.vals.push(${tmp.model_where}[${node.id}_k]);
                        }\n`;
                        //statement
                        resp.open += `this.alasql(\`UPDATE ${tmp.model} SET \${${node.id}.keys.join(',')} WHERE \${${node.id}.from.join(' AND ')}\`,${node.id}.vals);\n`;
                    }
                } else {
                    throw 'modificar modelo requires an arrow pointing to an active consultar modelo node (cannot be cancelled)'
                }            
                //
                return resp;
            }
        },

        'def_eliminar_modelo': {
            x_icons: 'desktop_new',
            x_text_exact: `eliminar modelo`,
            x_not_empty: 'link',
            x_level: '>2',
            hint:  `Elimina los datos de la consulta de modelo enlazada.`,
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let tmp = { model:'' };
                //if (node.link=='') return {...resp,...{ valid:false }};
                //get target node
                let link_node = await context.dsl_parser.getNode({ id:node.link, recurse:false });
                if (link_node && link_node.valid==true) {
                    if (link_node.text.includes('consultar modelo')==false) {
                        throw 'eliminar modelo requires an arrow pointing to a consultar modelo node; link points to node ('+node.link+'): '+link_node.text;
                    } else {
                        //get linked info
                        tmp.model = context.dsl_parser.findVariables({
                            text: link_node.text,
                            symbol: `"`,
                            symbol_closing: `"`
                        }).trim();
                        tmp.model_where = link_node.id + '.where';
                        //code
                        if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                        resp.open += `let ${node.id} = { keys:[], vals:[] };\n`;
                        resp.open += `for (let ${node.id}_k in ${tmp.model_where}) {
                            ${node.id}.keys.push(${node.id}_k+'=?');
                            ${node.id}.vals.push(${tmp.model_where}[${node.id}_k]);
                        }\n`;
                        resp.open += `if (${node.id}.keys.length>0) {
                            this.alasql(\`DELETE FROM ${tmp.model} WHERE \${${node.id}.keys.join(' AND ')}\`,${node.id}.vals);
                        } else {
                            this.alasql(\`DELETE FROM ${tmp.model}\`,[]);
                        }\n`;
                    }
                } else {
                    throw 'eliminar modelo requires an arrow pointing to an active consultar modelo node (cannot be cancelled)'
                }            
                //
                return resp;
            }
        },

        //def_consultar_web
        'def_consultar_web': {
            x_icons: 'desktop_new',
            x_text_contains: 'consultar web,,',
            x_level: '>3',
            attributes_aliases: {
                'method':       '_method,:metodo,:method,_metodo',
                'response':     'responsetype,response,:responsetype,:response'
            },
            hint: 'Realiza una llamada a la url indicada enviando los datos definidos en sus atributos. Entrega resultados en variable definida luego de coma.',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                if (!state.from_script) return {...resp,...{ valid:false }};
                //prepare
                let isProxySon = ('current_proxy' in resp.state)?true:false;
                let isServerSon = ('current_func' in resp.state)?true:false;
                let tmp = {
                    var:node.id,
                    meta:false,
                    simple:true,
                    proxy:isProxySon,
                    progress:true,
                    axios_call:(isProxySon==true)?'$axios':'this.$axios',
                    config: {
                        method:'get',
                        url:'',
                        data:{},
                        headers:{},
                        auth: {},
                        timeout:0,
                        response:'json',
                        maxContentLength:5000000
                    }
                };
                if (isServerSon) tmp.axios_call='axios';
                if (node.text.includes(',')) tmp.var=node.text.split(',').splice(-1)[0].trim();
                //attributes
                let attrs = aliases2params('def_consultar_web', node, false, 'this.');
                //prepare attrs
                for (let x in attrs) {
                    if (x.charAt(0)==':') {
                        if (typeof attrs[x] === 'string') {
                            if (x!=':progress' && x!=':method' && attrs[x].includes('.')==false) {
                                attrs[x.right(x.length-1)] = '**'+attrs[x]+'**';
                            } else if (attrs[x].includes('$config.') || attrs[x].includes('$store.') || attrs[x].includes('this.') || attrs[x].includes('process.env.')) {
                                if (state.current_proxy) {
                                    attrs[x.right(x.length-1)] = '**'+attrs[x].replaceAll('this.$store.','store.').replaceAll('this.$config.','$config.')+'**';
                                } else {
                                    attrs[x.right(x.length-1)] = '**'+attrs[x]+'**';
                                }
                            } else {
                                attrs[x.right(x.length-1)] = attrs[x];
                            }
                        } else {
                            attrs[x.right(x.length-1)] = attrs[x];
                        }
                        delete attrs[x];
                    }
                }
                //
                delete attrs.refx;
                if (node.link!='') tmp.config.url = node.link.trim();
                if (attrs.progress) tmp.progress=attrs.progress; delete attrs.progress;
                if (attrs.meta) tmp.meta=true; delete attrs.meta;
                if (attrs.url) tmp.config.url = attrs.url; delete attrs.url; 
                for (let test of 'method,auth-username,auth-password,encoding,maxlength,redirects,timeout,response'.split(',')) {
                    if (attrs[test]) {
                        tmp.simple=false;
                        if (test=='auth-username' || test=='auth-password') {
                            tmp.config.auth[test.replaceAll('auth-','')] = attrs[test];
                        } else if (test=='encoding') {
                            tmp.config.responseEncoding = attrs[test];
                        } else {
                            tmp.config[test] = attrs[test];
                        }
                        delete attrs[test];
                    }
                }
                //extract headers from attrs (and keep data)
                for (let x in attrs) {
                    if (x.length>2 && x.substr(0,3)=='x-:') {
                        tmp.config.headers[x.right(x.length-3)] = attrs[x];
                        delete attrs[x];
                    } else if (x.length>2 && x.substr(0,2)=='x-') {
                        tmp.config.headers[x] = attrs[x];
                        delete attrs[x];
                    }
                }
                tmp.config.data = {...attrs};
                if (tmp.config.method=='get') {
                    tmp.config.data = { params:tmp.config.data };
                } else if (tmp.config.method=='postjson') {
                    tmp.config.method = 'post';
                    tmp.config.data = { params:tmp.config.data };
                }
                //simple or advanced?
                if (tmp.simple) {
                    //add comment
                    if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                    if (tmp.meta) {
                        resp.open += `const ${tmp.var} = await ${tmp.axios_call}.${tmp.config.method}(${tmp.config.url}, ${context.jsDump(tmp.config.data)}, { progress:${tmp.progress} });\n`;
                    } else {
                        resp.open += `const ${tmp.var} = (await ${tmp.axios_call}.${tmp.config.method}(${tmp.config.url}, ${context.jsDump(tmp.config.data)}, { progress:${tmp.progress} })).data;\n`;
                    }
                } else {
                    //advanced?
                    if (tmp.config.response && tmp.config.response!='json') {
                        tmp.config.responseType = tmp.config.response;
                    }
                    delete tmp.config.response;
                    //write data on close to support download/upload child events to config object
                    resp.state.from_consultar_web = node.id + '_config';
                    //add comment
                    if (node.text_note != '') resp.close += `// ${node.text_note.cleanLines()}\n`;
                    resp.close += `let ${node.id}_config = ${context.jsDump(tmp.config)};\n`;
                    //
                    if (tmp.meta) {
                        resp.close += `const ${tmp.var} = await ${tmp.axios_call}.request(${node.id}_config, { progress:${tmp.progress} });\n`;
                    } else {
                        resp.close += `
                        const ${tmp.var}_ = await ${tmp.axios_call}.request(${node.id}_config, { progress:${tmp.progress} });
                        const ${tmp.var} = ${tmp.var}_.data;\n`;
                    }
                }
                //return
                return resp;
            }
        },

        'def_consultar_web_upload': {
            x_icons: 'help',
            x_text_exact: 'upload',
            x_all_hasparent: 'def_consultar_web',
            x_level: '>2',
            hint: 'Evento para ver el progreso del upload de un consultar web padre (axios).',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                if (!state.from_consultar_web) return {...resp,...{ valid:false }};
                if (!state.from_script) return {...resp,...{ valid:false }};
                //code
                if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                resp.open += `${state.from_consultar_web}.onUploadProgress = function(evento) {\n`;
                resp.close += `};\n`;
                return resp;
            }
        },

        'def_consultar_web_download': {
            x_icons: 'help',
            x_text_exact: 'download',
            x_all_hasparent: 'def_consultar_web',
            x_level: '>2',
            hint: 'Evento para ver el progreso del download de un consultar web padre (axios).',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                if (!state.from_consultar_web) return {...resp,...{ valid:false }};
                if (!state.from_script) return {...resp,...{ valid:false }};
                //code
                if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                resp.open += `${state.from_consultar_web}.onDownloadProgress = function(evento) {\n`;
                resp.close += `};\n`;
                return resp;
            }
        },

        'def_xcada_registro': {
            x_icons: 'penguin',
            x_text_contains: `por cada registro en`,
            x_level: '>2',
            attributes_aliases: {
                'use_index':        'index',
                'unique':           'unique,id',
                'target':           'template,target'
            },
            hint:  `Repite sus hijos por cada elemento entrecomillas, dejando el item en curso en la variable luego de la coma.`,
            func: async function(node, state) {
                let resp = context.reply_template({ state });
                let tmp = { key:'', has_await:false, query:node.text, target:'' };
                /*if (!state.from_script && !state.get_params) {
                    resp.valid=false;
                    return resp;
                }*/
                let padre = await context.dsl_parser.getParentNode({ id:node.id });
                if (padre.icons.includes('idea') && !state.from_xcada_view) {
                    //console.log('state y padre',{state,padre});
                    resp.valid=false;
                    resp.state.from_script=false;
                    return resp;
                }
                if (tmp.query.includes('$store.')) tmp.query = tmp.query.replaceAll('$store.','$store.state.');
                if (tmp.query.includes(',')) tmp.key=tmp.query.split(',').splice(-1)[0].trim();
                tmp.iterator = context.dsl_parser.findVariables({
                    text: tmp.query,
                    symbol: `"`,
                    symbol_closing: `"`
                }).trim();
                if (tmp.iterator.charAt(0)=='$' &&
                    !tmp.iterator.includes('$variables.') &&
                    !tmp.iterator.includes('$vars.') &&
                    !tmp.iterator.includes('$store.') &&
                    !tmp.iterator.includes('$params.') &&
                    !tmp.iterator.includes('$route.')) {
                    tmp.iterator = tmp.iterator.right(tmp.iterator.length-1);
                }
                let sons = await node.getNodes();
                if (sons.length==1) {
                    tmp.target = sons[0].id;
                } else if (sons.length>1) {
                    tmp.target = 'template';
                }
                let attrs = aliases2params('def_xcada_registro',node);
                let params = { unique:0, key:0, target:tmp.target, tipo:'v-for', iterator:tmp.iterator, item:tmp.key, use_index:`${tmp.key}_index` };
                if (params[':template']) {
                    params.target = 'template';
                    delete params[':template']; delete params['template'];
                }
                params = {...params,...attrs};
                if (params.unique==0) params.unique = params.use_index;
                if (state.get_params) {
                    resp.state.params = params;
                    delete resp.state.get_params;
                    return resp;
                }
                //code (only from scripting)
                if (node.icons.includes('bell') && params.iterator.includes('**')) {
                    params.iterator = getTranslatedTextVar(params.iterator);
                }
                params.iterator = params.iterator   .replaceAll('$variables.','this.')
                                                    .replaceAll('$vars.','this.')
                                                    .replaceAll('$params.','this.')
                                                    .replaceAll('$store.','this.$store.state.');
                context.x_state.pages[state.current_page].imports['_'] = 'underscore';
                //search consultar web nodes
                if (!params[':each'] && sons.length>0) {
                    for (let x of sons) {
                        if (x.text.includes('consultar web')) {
                            tmp.has_await = true;
                            break;
                        }
                        await setImmediatePromise(); //@improved
                    }
                }
                //write code
                if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                if (tmp.has_await==true) {
                    resp.open += `_.each(${params.iterator}, async function(${params.item},${params.use_index}) {`;
                    resp.close = `}, this);`;
                } else {
                    resp.open += `for (let ${params.use_index}=0;${params.use_index}<${params.iterator}.length;${params.use_index}++) {`;
                    resp.open += `let ${params.item} = ${params.iterator}[${params.use_index}];\n`;
                    resp.close = `}\n`;
                }
                //
                resp.state.from_script=true;
                return resp;
            }
        },

        //*def_responder (@todo i18n)
        //**def_insertar_modelo (@todo test it after adding support for events)
        //**def_consultar_modelo
        //**def_modificar_modelo
        //**def_eliminar_modelo
        //**def_consultar_web
        //**def_consultar_web_upload
        //**def_consultar_web_download
        //*def_aftertime
        //*def_struct
        //*def_extender
        //*def_npm_instalar
        //*def_probar
        //*def_probar_error (ex.def_event_try)
        //*def_literal_js
        //*def_console
        //**def_xcada_registro
        //*def_crear_id_unico

        'def_guardar_nota': {
        	x_level: '>2',
        	x_icons: 'desktop_new',
            x_text_contains: 'guardar nota|capturar nota|note:save|save note',
            attributes_aliases: {
                'strip':      'text,strip,limpio',
                'asis':       'asis,as_it_was'
            },
            meta_type: 'script',
            hint: 'Crea una variable con el contenido HTML indicado en la nota del nodo.',
        	func: async function(node, state) {
                let resp = context.reply_template({ state });
                if (!state.from_script) return {...resp,...{ valid:false }};
                // attrs
                let attrs = {...{ html:true, asis:false },...aliases2params('def_guardar_nota', node, false, 'this.')};
                delete attrs.refx;
                if (attrs[':html']) attrs.html=true;
                if (attrs[':strip']) attrs.html=false;
                //prepare
                let tmp = { content:node.text_note };
                tmp.var = node.text.split(',').pop().trim();
                //context.x_console.out({ message:'DEBUG guardar nota!! ', data:node });
                if (attrs.html) {
                    tmp.content = node.text_note_html; //this has inner of body already
                    //parse content
                    if (!attrs[':asis'] && !attrs.asis) {
                        //transform tags 'p' style:text-align:center to <center>x</center>
                        //transform <p>x</p> to x<br/>
                        let cheerio = require('cheerio');
                        let sub = cheerio.load(tmp.content, { ignoreWhitespace: false, xmlMode:true, decodeEntities:false });
                        let paragraphs = sub('p').toArray();
                        paragraphs.map(function(elem) {
                            let cur = cheerio(elem);
                            let style = cur.attr('style');
                            if (style && style.includes('text-align:center')) {
                                //transform tags 'p' style:text-align:center to <center>x</center>
                                cur.replaceWith(`<center>${cur.html()}</center>`);
                            } else {
                                cur.replaceWith(`${cur.html()}<br/>`);
                            }
                        });
                        tmp.content = sub.html();
                    }
                }
                //escape variables
                if (node.icons.includes('bell')) {
                    tmp.content = getTranslatedTextVar(tmp.content);
                }
                //code
                if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                resp.open += `let ${tmp.var} = ${tmp.content};\n`;
                return resp;
            }
        },

        'def_agregar_campos': {
        	x_level: '>2',
        	x_icons: 'desktop_new',
            x_text_contains: 'agregar campos a',
            meta_type: 'script',
            hint: `Agrega los campos definidos en sus atributos (y valores) a cada uno de los registros de la variable de entrada (array de objetos).\n
                   Si hay una variable definida, se crea una nueva instancia del array con los campos nuevos, en caso contrario se modifican los valores de la variable original.`,
        	func: async function(node, state) {
                let resp = context.reply_template({ state });
                if (!state.from_script) return {...resp,...{ valid:false }};
                //get vars and attrs
                let tmp = { var:'' };
                if (node.text.includes(',')) tmp.var = node.text.split(',').pop().trim();
                tmp.original = context.dsl_parser.findVariables({
                    text: node.text,
                    symbol: `"`,
                    symbol_closing: `"`
                });
                if (state.from_server) {
                    tmp.var = tmp.var.replaceAll('$variables.','resp.')
                                     .replaceAll('$vars.','resp.')
                                     .replaceAll('$params.','resp.');
                    tmp.original = tmp.original.replaceAll('$variables.','resp.')
                                     .replaceAll('$vars.','resp.')
                                     .replaceAll('$params.','resp.');
                } else if (tmp.var!='') {
                    tmp.var = tmp.var.replaceAll('$variables.','this.')
                                     .replaceAll('$vars.','this.')
                                     .replaceAll('$params.','this.')
                                     .replaceAll('$store.','this.$store.state.');pon
                    tmp.original = tmp.original.replaceAll('$variables.','this.')
                                               .replaceAll('$vars.','this.')
                                               .replaceAll('$params.','this.')
                                               .replaceAll('$store.','this.$store.state.');
                }
                if (tmp.original.includes('**') && node.icons.includes('bell')) {
                    tmp.original = getTranslatedTextVar(tmp.original);
                }
                // create obj from current node as js obj
                tmp.attr = await context.x_commands['def_struct'].func(node, { ...state, ...{
                    as_object:true
                }});
                delete tmp.attr.refx;
                //change this to resp if parent is server
                if (state.from_server) tmp.attr.open = tmp.attr.open.replaceAll('this.','resp.');
                //add underscore
                if (state.current_page) {
                    context.x_state.pages[state.current_page].imports['_'] = 'underscore';
                } else if (state.current_proxy) {
                    context.x_state.proxies[state.current_proxy].imports['_'] = 'underscore';
                } else if (state.current_store) {
                    context.x_state.stores[state.current_store].imports['_'] = 'underscore';
                }
                //code
                if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                if (tmp.var.includes('this')) {
                    resp.open += `${tmp.var} = _.map(${tmp.original}, function(element) {
                        element = Object.assign(element,${tmp.attr.open});
                        return _.extend({},element,${tmp.attr.open});
                    });`;
                } else if (tmp.var!='') {
                    resp.open += `let ${tmp.var} = _.map(${tmp.original}, function(element) {
                        element = Object.assign(element,${tmp.attr.open});
                        return _.extend({},element,${tmp.attr.open});
                    });`;
                } else {
                    resp.open += `${tmp.original} = _.each(${tmp.original}, function(element) {
                        element = Object.assign(element,${tmp.attr.open});
                    });`;
                }
                return resp;
            }
        },

        'def_preguntar': {
        	x_level: '>2',
        	x_icons: 'desktop_new',
            x_text_contains: 'preguntar|dialogo:confirm',
            attributes_aliases: {
                'title':                 'titulo,title',
                'message':               'mensaje,contenido,message',
                'buttonTrueText':        'true,aceptar,boton:aceptar',
                'buttonFalseText':       'false,cancel,boton:cancelar',
                'width':                 'ancho,width',
                'icon':                  'icon,icono',
                'persistent':            'persistent,obligatorio,persistente'
            },
            /*x_test_func: function(node) {
                //return true if its a valid match
            },*/
            hint: `Abre un dialogo preguntando lo indicado en sus atributos, respondiendo true o false en la variable indicada luego de la coma.`,
        	func: async function(node, state) {
                let resp = context.reply_template({ state });
                if (!state.from_script) return {...resp,...{ valid:false }};
                //get vars and attrs
                let tmp = { var:'', text:'' };
                if (node.text.includes(',')) tmp.var = node.text.split(',').pop().trim();
                //add plugin
                context.x_state.plugins['vuetify-confirm'] = {
                    global:true,
                    mode: 'client',
                    npm: { 'vuetify-confirm':'*' },
                    extra_imports: ['vuetify'],
                    config: '{ vuetify }'
                };
                //attrs
                let params = aliases2params('def_preguntar', node, false, 'this.');
                delete params.refx;
                //process message attribute
                if (params.message) {
                    /* ex.= 'Estas seguro que deseas borrar {{ x }} ?'
                    'Estas seguro que deseas borrar '+x+' ?'
                    */
                    tmp.text = params.message;
                    let new_val = '';
                    let vars = context.dsl_parser.findVariables({
                        text: params.message,
                        symbol: `{{`,
                        symbol_closing: `}}`,
                        array:true
                    });
                    for (let vr in vars) {
                        if (vars[vr].includes('|')) {
                            //add filter support: 'Estas seguro que deseas agregar {{ monto | numeral('0,0') }} ?'
                            let clean = vars[vr].replaceAll('{{','').replaceAll('}}','');
                            let the_var = clean.split('|')[0].trim();
                            let the_filter = clean.split('|').pop().trim();
                            the_filter = the_filter.replace('(',`(${the_var},`);
                            tmp.text = tmp.text.replace(vars[vr],`'+this.$nuxt.$options.filters.${the_filter}+'`);
                        } else {
                            let n_var = vars[vr].replaceAll('{{',`'+`).replaceAll('}}',`+'`);
                            tmp.text = tmp.text.replace(vars[vr],n_var);
                        }
                    }
                    //
                    tmp.text = `'${tmp.text}'`;
                    delete params.message;
                }
                //code
                if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                if (tmp.text && Object.keys(params)==0) {
                    if (tmp.var.includes('this.')) {
                        resp.open += `${tmp.var} = await this.$confirm(${tmp.text});\n`;
                    } else {
                        resp.open += `let ${tmp.var} = await this.$confirm(${tmp.text});\n`;
                    }
                } else {
                    if (tmp.var.includes('this.')) {
                        resp.open += `${tmp.var} = await this.$confirm(${tmp.text},${context.jsDump(params)});\n`;
                    } else {
                        resp.open += `let ${tmp.var} = await this.$confirm(${tmp.text},${context.jsDump(params)});\n`;
                    }
                }
                return resp;
            }
        },

        'def_var_clonar': {
        	x_level: '>2',
        	x_icons: 'desktop_new',
            x_text_contains: 'clonar variable|copiar variable|variable:clonar|variable:copiar',
            attributes_aliases: {},
            hint: `Crea una copia de la variable indicada, en la variable luego de la coma.`,
        	func: async function(node, state) {
                let resp = context.reply_template({ state });
                if (!state.from_script) return {...resp,...{ valid:false }};
                //get vars and attrs
                let tmp = { var:'', original:'' };
                if (node.text.includes(',')) tmp.var = node.text.split(',').pop().trim();
                //prepare new var
                if (tmp.var.includes('$')) {
                    if (state.from_server) {
                        tmp.var = tmp.var.replaceAll('$variables.', 'resp.')
                                        .replaceAll('$vars.', 'resp.')
                                        .replaceAll('$params.', 'resp.');
                    } else {
                        tmp.var = tmp.var.replaceAll('$variables.', 'this.')
                                        .replaceAll('$vars.', 'this.')
                                        .replaceAll('$params.', 'this.')
                                        .replaceAll('$store.', 'this.$store.state.');
                        if (tmp.var=='this.') tmp.var='this';
                    }
                }
                //prepare original var
                tmp.original = context.dsl_parser.findVariables({
                    text: node.text,
                    symbol: `"`,
                    symbol_closing: `"`
                });
                if (tmp.original.includes('**') && node.icons.includes('bell')) {
                    tmp.original = getTranslatedTextVar(tmp.original);
                } else if (tmp.original.includes('$')) {
                    if (state.from_server) {
                        tmp.original = tmp.original.replaceAll('$variables.', 'resp.')
                                                    .replaceAll('$vars.', 'resp.')
                                                    .replaceAll('$params.', 'resp.');
                    } else {
                        tmp.original = tmp.original.replaceAll('$variables.', 'this.')
                                                    .replaceAll('$vars.', 'this.')
                                                    .replaceAll('$params.', 'this.')
                                                    .replaceAll('$store.', 'this.$store.state.');
                        if (tmp.original=='this.') tmp.original='this';
                    }
                }
                //code
                if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                if (tmp.var.includes('this.')) {
                    resp.open += `${tmp.var} = JSON.parse(JSON.stringify(${tmp.original}));\n`;
                } else {
                    resp.open += `let ${tmp.var} = JSON.parse(JSON.stringify(${tmp.original}));\n`;
                }
                return resp;
            }
        },

        'def_enviarpantalla': {
        	x_level: '>2',
        	x_icons: 'desktop_new',
            x_text_contains: 'enviar a pantalla',
            x_not_empty: 'link',
            attributes_aliases: {
                'event_label':      'tag,tipo,etiqueta,event_label'
            },
            meta_type: 'script',
            hint: 'Envia al usuario a la pantalla enlazada.',
        	func: async function(node, state) {
                let resp = context.reply_template({ state });
                if (!state.from_script) return {...resp,...{ valid:false }};
                if (node.link.includes('ID_')==false) return {...resp,...{ valid:false }};
                if ((await context.hasParentID(node.id, 'def_componente'))==true) {
                    // components should not have links to other pages, only instances
                    throw `Invalid 'enviar a pantalla' origin node! Components can't point to other pages; use the instance for that`;
                }
                // prepare
                let tmp = { link:node.link, target:'' };
                let link_node = await context.dsl_parser.getNode({ id:node.link, recurse:false });
                if (link_node && link_node.valid==true && link_node.text.trim()!='') {
                    tmp.target = `{vuepath:${link_node.text}}`;
                } else {
                    throw `Invalid 'enviar a pantalla' linked node!`;
                }
                //code
                //if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                let isProxySon = ('current_proxy' in resp.state)?true:false;
                if (isProxySon==true) {
                    resp.open += `return redirect('${tmp.target}');\n`;
                } else {
                    // params
                    let params = aliases2params('def_enviarpantalla', node, false, 'this.');
                    delete params.refx;
                    if (Object.keys(params)!='') {
                        if (tmp.target.charAt(0)=='/') tmp.target = tmp.target.right(tmp.target.length-1);
                        if (params[':query']) {
                            resp.open += `this.$router.push({ path:'${tmp.target}', query:${context.jsDump(params)} });\n`;
                        } else {
                            resp.open += `this.$router.push({ name:'${tmp.target}', params:${context.jsDump(params)} });\n`;
                        }    
                    } else {
                        resp.open += `this.$router.push('${tmp.target}');\n`;
                    }
                }
                return resp;
                
            }
        },

        'def_procesar_imagen': {
        	x_level: '>2',
        	x_icons: 'desktop_new',
            x_text_contains: 'procesar imagen|transformar imagen|ajustar imagen|imagen:transform',
            attributes_aliases: {
                'grey':      'greyscale,gris,grises,grey',
                'maxkb':     'maxkb,compress',
                'format':    'format,format,mimetype'
            },
            meta_type: 'script',
            hint: 'Aplica las modificaciones indicadas en sus atributos a la imagen (dataurl) indicada como variables. Retorna un dataurl de la imagen modificada.',
        	func: async function(node, state) {
                let resp = context.reply_template({ state });
                if (!state.from_script) return {...resp,...{ valid:false }};
                // get: cmd 'input', output / prepare params
                let tmp = await parseInputOutput(node,state);
                let params = (await context.x_commands['def_struct'].func(node, { ...state, ...{
                    as_object:true
                }})).state.object;
                //code
                context.x_state.npm['image-js'] = '0.31.4';
                if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                resp.open += `let { Image } = require('image-js');
                let ${node.id} = ${tmp.input};\n`;
                if (params.maxkb) {
                    //compress first
                    context.x_state.npm['browser-image-compression'] = '*';
                    context.x_state.pages[resp.state.current_page].imports['browser-image-compression'] = 'imageCompression';
                    resp.open += `let ${node.id}_f = await imageCompression.getFilefromDataUrl(${tmp.input});
                    let ${node.id}_c = await imageCompression(${node.id}_f, { maxSizeMB: ${params.maxkb}/1000 });
                    ${node.id} = await imageCompression.getDataUrlFromFile(${node.id}_c);\n`;
                }
                //scale and fxs
                resp.open += `let ${tmp.output}_ = await Image.load(${node.id});\n`;
                if (tmp.output.includes('this.')==false) resp.open += `let `;
                resp.open += `${tmp.output} = ${tmp.output}_`;
                // params
                if (params.anchomax) resp.open += `.resize({ width:(${tmp.output}_.width>${params.anchomax})?${params.anchomax}:${tmp.output}_.width })`;
                if (params.altomax) resp.open += `.resize({ height:(${tmp.output}_.height>${params.altomax})?${params.altomax}:${tmp.output}_.height })`;
                if (params.resmax) resp.open += `.resize({ width:(${tmp.output}_.width>${params.resmax})?${params.resmax}:${tmp.output}_.width, height:(${tmp.output}_.height>${params.resmax})?${params.resmax}:${tmp.output}_.height })`;
                if (params.resize && params.resize.includes('x')) {
                    resp.open += `.resize({ width:${params.resize.split('x')[0]}, height:${params.resize.split('x').pop().trim()} })`;
                } else if (params.resize) {
                    resp.open += `.resize({ width:${params.resize}, height:${params.resize} })`;
                }
                if (params.grey || params.greyscale || params.gris || params.grises) resp.open += `.grey()`;
                if (params.format || params.formato || params.mimetype) {
                    if (params.formato) params.format = params.formato;
                    if (params.mimetype) params.format = params.mimetype;
                    if (params.format.includes('/')) {
                        resp.open += `.toDataURL('${params.format.replaceAll("'","")}')`;
                    } else {
                        resp.open += `.toDataURL('image/${params.format.replaceAll("'","")}')`;
                    }
                }
                resp.open += `;\n`;
                //
                return resp;
            }
        },

        'def_array_transformar': {
            x_icons: 'desktop_new',
            x_text_pattern: [`array:+(transformar|manipular)*`],
            x_level: '>2',
            hint:  `Transforma los campos del array de estructuras entregado, restringiendo los campos incluidos, o bien manipulando sus valores.`,
            func: async function(node, state) {
                let resp = context.reply_template({ state });
                let tmp = {};
                if (node.text.includes(',')) tmp.var=node.text.split(',').splice(-1)[0].trim();
                tmp.text = context.dsl_parser.findVariables({
                    text: node.text,
                    symbol: `"`,
                    symbol_closing: `"`
                }).trim();
                if (node.icons.includes('bell') && tmp.text.includes('**')) {
                    tmp.text = getTranslatedTextVar(tmp.text);
                }
                let isNumeric = function(n) {
                    return !isNaN(parseFloat(n)) && isFinite(n);
                };
                //code
                //context.x_state.functions[resp.state.current_func].imports['underscore'] = '_';
                if (state.current_page) {
                    context.x_state.pages[state.current_page].imports['_'] = 'underscore';
                } else if (state.current_store) {
                    context.x_state.stores[state.current_store].imports['_'] = 'underscore';
                }
                if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                if (tmp.var && tmp.var.includes('this.')) {
                    resp.open += `${tmp.var} = _.map(${tmp.text}, function(o${node.level}) {\n`; //})
                } else {
                    resp.open += `let ${tmp.var} = _.map(${tmp.text}, function(o${node.level}) {\n`;
                }
                resp.open += `let ${node.id} = o${node.level};\n`;
                Object.keys(node.attributes).map(function(att) {
                    let name = att.trim();;
                    let value = node.attributes[att];
                    if (name.charAt(0)!=':' && name.charAt(0)!='.') {
                        if (node.icons.includes('bell')) {
                            value = getTranslatedTextVar(value);
                        }
                        if (isNumeric(value) || value.substr(0,2)=='$.') {
                        } else if (value.includes(`'`)) {
                        } else if (value.includes('**') && node.icons.includes('bell')) {
                        } else if (value!=node.attributes[att]) {
                        } else if (value!='') {
                            if (value.charAt(0)=='!') {
                                value = `!${tmp.text}.${name}`;
                            }
                        }
                    }
                    //
                    if (name.toLowerCase()==':campos') {
                        resp.open += `${node.id} = _.pick(o${node.level}, ${context.jsDump(value.split(',')).replaceAll('[','').replaceAll(']','')});\n`;
                    } else {
                        if (value.includes('(') && value.includes(')') && value.includes('?')) {
                            value = value.replaceAll(`(.`,`(o${node.level}.`);
                            value = value.replaceAll(`?.`,`?o${node.level}.`);
                            value = value.replaceAll(`:.`,`:o${node.level}.`);
                            resp.open += `${node.id}.${name} = ${value};\n`;
                        } else {
                            resp.open += `${node.id}.${name} = o${node.level}${value};\n`;
                        }
                    }
                });
                resp.open += `return ${node.id};\n`;
                resp.open += `});\n`;
                //return
                return resp;
            }
        },

        'def_analytics_evento': {
        	x_level: '>2',
        	x_icons: 'desktop_new',
            x_text_contains: 'analytics:event',
            x_or_hasparent: 'def_page,def_componente,def_layout',
            attributes_aliases: {
                'event_label':      'tag,tipo,etiqueta,event_label'
            },
            meta_type: 'script',
            hint: 'Envia el evento indicado al Google Analytics configurado.',
        	func: async function(node, state) {
                let resp = context.reply_template({ state });
                if (!state.from_script) return {...resp,...{ valid:false }};
                //if (!context.x_state.config_node['google:analytics']) return {...resp,...{ valid:false }};
                // params
                let params = aliases2params('def_analytics_evento', node, false, 'this.');
                delete params.refx;
                let details = {...{
                    event_category:state.current_page
                },...params};
                //event name
                let event = context.dsl_parser.findVariables({
                    text: node.text,
                    symbol: `"`,
                    symbol_closing: `"`
                });
                if (event.includes('**') && node.icons.includes('bell')) {
                    event = getTranslatedTextVar(event);
                } else if (event.includes('$')) {
                    event = event.replaceAll('$variables.', 'this.')
                                 .replaceAll('$vars.', 'this.')
                                 .replaceAll('$params.', 'this.')
                                 .replaceAll('$store.', 'this.$store.state.');
                    event = `'${event}'`;
                } else if (event.charAt(0) == '(' && event.slice(-1) == ')') {
                    event = event.slice(1).slice(0, -1);
                } else {
                    event = `'${event}'`;
                }
                //code
                if ('google:analytics' in context.x_state.config_node) {
                    if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                    resp.open += `this.$gtag('event', ${event}, ${context.jsDump(details)});\n`;
                    return resp;
                } else {
                    throw 'analytics:event requires config->google:analytics key!'
                }
            }
        },
    
        //**def_analytics_evento - @todo test
        //def_medianet_ad - @todo think about the script2 code issue with cheerio

        // OTHER node types
        /*'def_imagen': {
        	x_icons:'idea',
        	x_not_icons:'button_cancel,desktop_new,help',
        	x_not_empty:'attributes[:src]',
        	x_empty:'',
        	x_level:'>2',
        	func:async function(node,state) {
        		return context.reply_template({ otro:'Pablo', state });
        	}
        },*/

        //
    }
};

//private helper methods
function setObjectKeys(obj, value) {
    let resp = obj;
    if (typeof resp === 'string') {
        resp = {};
        let keys = obj.split(',');
        for (let i in keys) {
            resp[keys[i]] = value;
        }
    } else {
        for (let i in resp) {
            resp[i] = value;
        }
    }
    return resp;
}

function setToValue(obj, value, path) {
    var i;
    path = path.split('.');
    for (i = 0; i < path.length - 1; i++)
        obj = obj[path[i]];

    obj[path[i]] = value;
}

function getVal(project, myPath) {
    return myPath.split('.').reduce((res, prop) => res[prop], project);
}