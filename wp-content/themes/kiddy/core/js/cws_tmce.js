
/* cws shortcodes buttons for tinymce */

tinymce.PluginManager.add( 'cws_shortcodes', function ( editor, url ){
	var sc_name, sc_title, sc_required, def_content, has_options, conditions;
	conditions = {
		'selection' : function ( editor ){	/* something should be selected */
			return !editor.selection.isCollapsed();
		},
		'single_char_selected' : function ( editor ){	/* single character should be selected */
			return editor.selection.getContent().length == 1;
		},
		'sc_selection' : function ( editor ){	/* single or multiple shortcodes should be selected */
			var selection = editor.selection.getContent();
			return /^((\s|\n|\t|(&nbsp;)|(<p>)|(<\/p>)|(<br \/>))*((\[[^\]]+\](\[\/[^\]]+\])?)|(\[[^\]]+\].+\[\/[^\]]+\]))(\s|\n|\t|(&nbsp;)|(<p>)|(<\/p>)|(<br \/>))*)+$/.test( selection );
		},
		'sc_selection_or_nothing' : function ( editor ){	/* single shortcode or multiple shortcodes or nothing */
			var selection = editor.selection.getContent();
			return !selection.length || /^((\s|\n|\t|(&nbsp;)|(<p>)|(<\/p>)|(<br \/>))*((\[[^\]]+\](\[\/[^\]]+\])?)|(\[[^\]]+\].+\[\/[^\]]+\]))(\s|\n|\t|(&nbsp;)|(<p>)|(<\/p>)|(<br \/>))*)+$/.test( selection );
		},
		'list_selection' : function ( editor ){	/* single shortcode or multiple shortcodes or nothing */
			var selection = editor.selection.getSelectedBlocks();
			if (selection.length) {
				if ( (selection[0].tagName == 'LI' && selection[0].parentNode.tagName == 'UL') || selection[0].tagName == 'UL' ) {
					return true;
				}
			}
			return false;
		}
	}
	for ( var i=0; i<window.cws_sc_data.length; i++ ){
		sc_name = window.cws_sc_data[i]['sc_name'];
		sc_title = window.cws_sc_data[i]['title'];
		sc_icon = window.cws_sc_data[i]['icon'];
		sc_required = window.cws_sc_data[i]['required'];
		def_content = window.cws_sc_data[i]['def_content'];
		has_options = window.cws_sc_data[i]['has_options'];
		editor.addButton( window.cws_sc_data[i]['sc_name'], {
			'title': sc_title,
			'icon': sc_icon,
			'cws_sc_atts': {
				'sc_name': sc_name,
				'sc_title': sc_title,
				'sc_required': sc_required,
				'def_content': def_content,
				'has_options': has_options
			},
			onclick: function (){
				var selection = editor.selection.getContent();
				var sc_name = this.settings.cws_sc_atts.sc_name;
				var def_content = this.settings.cws_sc_atts.def_content;
				var sc_title = this.settings.cws_sc_atts.sc_title;
				var has_options = this.settings.cws_sc_atts.has_options;
				if ( has_options ){
					cws_tb_modal_create( {
						'title' : 'Insert shortcode: ' + sc_title,
						'source' : ajaxurl,
						'data' : {
							'action' : 'cws_ajax_sc_settings',
							'shortcode' : sc_name,
							'selection' : selection,
							'def_content' : def_content
						}
					});
				}
				else{
					if( window.tinyMCE ) {
						window.tinyMCE.activeEditor.selection.setContent( '[' + sc_name + ']' + selection + '[/' + sc_name + ']' );
					}
				}
			},
			onPostRender: function (){
				var ctrl = this;
				var sc_required = this.settings.cws_sc_atts.sc_required;
				if ( sc_required.length && ( Object.keys( conditions ).indexOf( sc_required ) != -1 ) ){
					editor.on( 'NodeChange', function (){
						var match = conditions[sc_required]( editor );
						if ( !match && !ctrl.disabled() ){
							ctrl.disabled( true );
						}
						else if ( match && ctrl.disabled() ){
							ctrl.disabled( false );
						}
					});
				}
			}
		});
	}
});

