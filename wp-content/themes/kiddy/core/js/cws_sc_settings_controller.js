function cws_clone_object ( obj ){
	var buf, new_obj = {};
	for ( buf in obj ){
		new_obj[buf] = obj[buf];
	}
	return new_obj;
}
function cws_sc_settings_controller (){
	this.sc_name = jQuery( '#cws_sc_name' ).length ?  jQuery( '#cws_sc_name' ).val() : '';
	this.sc_selection = jQuery( '#cws_sc_selection' ).length ?  jQuery( '#cws_sc_selection' ).val() : '';
	this.def_content = jQuery( '#cws_sc_def_content' ).length ? jQuery( '#cws_sc_def_content' ).val() : '';
	this.sc_prefix = jQuery( '#cws_sc_prefix' ).length ?  jQuery( '#cws_sc_prefix' ).val() : '';
	this.ins_button = jQuery( '#cws_insert_button' );
	this.paired = jQuery( '#cws_sc_paired' ).val() == '1' ? true : false;
	this.sc_atts = {};
	this.sc_fields = {};
	this.opening_tag = '';
	this.closing_tag = '';
	this.insert_handler_init = sc_insert_handler_init;
	this.insert = sc_insert;
	/**************************************/
	this.insert_handler_init();
}

function sc_insert_handler_init (){
	var c_obj = this;
	c_obj.ins_button.on( 'click', function (){
		c_obj.sc_fields = jQuery( '[name^="' + c_obj.sc_prefix + '"]' );
		if ( c_obj.sc_fields.length ){
			c_obj.insert();
		}
		else{
			return false;
		}
	});
}

function saveShortcodeArgs(data) {
	var out = '';
	for (var key in data) {
		if (data.hasOwnProperty(key)) {
			if ('object' === typeof data[key]) {
				out += ' ' + key + '=\'{"@":{' + saveShortcodeArgsJ(data[key], 0).trim() + '}}\'';
			} else {
				if (data[key].length) {
					out += ' ' + key + '=\'' + data[key] + '\'';
				}
			}
		}
	}
	return out;
}

function saveShortcodeArgsJ(data) {
	var out = '';
	for (var key in data) {
		if (data.hasOwnProperty(key)) {
			if ('object' === typeof data[key]) {
				out += '"' + key + '":{"@":{' + saveShortcodeArgsJ(data[key]).trim() + '}},';
			} else if (data[key].length) {
				out += '"' + key + '":"' + data[key] + '",';
			}
		}
	}
	if (out.length) {
		out = out.substr(0, out.length-1);
	}
	return out;
}

function sc_insert (){
	if( window.tinyMCE ) {

		var parent = document.getElementsByClassName('cws_sc_settings_container')[0];
		if (this.sc_name == 'custom_list') {
			var editor = window.tinyMCE.activeEditor;
			var value = jQuery(parent).find('.row.list_style select').val();
			var icon = ('custom_icon_style' === value) ? jQuery(parent).find('.row.icon select').val() : null;
			var ul = editor.selection.getNode().parentNode;

			ul.setAttribute('class',value);
			if ((value == 'custom_icon_style') && !icon) {
				ul.setAttribute('class','dot_style');
			};
			var node_len = ul.children.length;
			if (icon) {
				for (var i = node_len - 1; i >= 0; i--) {
					ul.children[i].setAttribute('class','fa-'+icon)
				};
			} else {
				for (var i = node_len - 1; i >= 0; i--) {
					ul.children[i].removeAttribute("class");
				};
			}
			this.ins_button.cws_tb_modal_close();
		} else {
			var that = this;
			jQuery(parent).find('.row').each(function(k, row) {
				if (!/disable/.test(row.className)) {
					jQuery(row).find('input[name^="'+that.sc_prefix+'"],select[name^="'+that.sc_prefix+'"],textarea[name^="'+that.sc_prefix+'"]').each(function(t,el) {
						var name = el.name.substr(that.sc_prefix.length);
						var name_s = name.split('[');
						var curr_atts_lvl = that.sc_atts;
						if (name_s.length > 1) {
							for (var i=1;i<name_s.length;i++) {
								name_s[i] = name_s[i].substring(0,name_s[i].length - 1);
								if (undefined === curr_atts_lvl[name_s[i-1]]) {
									curr_atts_lvl[name_s[i-1]] = {};
								}
								curr_atts_lvl = curr_atts_lvl[name_s[i-1]]
							}
							name = name_s[name_s.length - 1];
						}
						switch (el.type) {
							case 'text':
							case 'number':
							case 'hidden':
							case 'select-one':
							case 'textarea':
								curr_atts_lvl[name] = el.value;
								break;
							case 'radio':
								if (el.checked) {
									curr_atts_lvl[name] = el.value;
								}
								break;
							case 'checkbox':
								if (el.checked) {
									that.sc_atts[el.name.substr(that.sc_prefix.length)] = '1';
								}
								break;
						}
					});
				}
			});

			var args = saveShortcodeArgs(that.sc_atts);
			var sc = '[' + that.sc_prefix + that.sc_name + args + ']';
			if (that.paired) {
				var content = that.sc_selection.length ? that.sc_selection : that.def_content;
				sc += content + '[/' + that.sc_prefix + that.sc_name + ']';
			}
			window.tinyMCE.activeEditor.selection.setContent( sc );
			if ( this.ins_button.is_cws_tb_modal() ) {
				this.ins_button.cws_tb_modal_close();
			}
			else{
				tb_remove();
			}
		}

	}
}