"use strict";

/********************************* CWS_TB_MODAL *********************************/

window.cws_tb = [];

jQuery( document ).ready( function (){
	document.onkeydown = function(evt) {
	    evt = evt || window.event;
	    if ( evt.keyCode == 27 && window.cws_tb.length ) {
	       cws_last_tb_modal_close();
	    }
	};
	window.onresize = function (){
		var container, modal_w, modal_w_content, new_height, new_width;
		for ( var i=0; i<window.cws_tb.length; i++ ){
			container = jQuery( '#' + window.cws_tb[i]['id'] );
			modal_w = container.find( '.cws_tb_modal_window' );
			modal_w_content = container.find( '.cws_tb_modal_content' );
			new_height = window.innerHeight - ( modal_w.outerHeight() - modal_w_content.outerHeight() ) - ( window.cws_tb[i]['offset'] * 2 );
			new_width = window.innerWidth - ( modal_w.outerWidth() - modal_w_content.outerWidth() ) - ( window.cws_tb[i]['offset'] * 2 );
			modal_w_content.css( { 'max-height' : new_height + 'px', 'max-width' : new_width } );
		}
	}
});

function cws_tb_modal_create ( args ){
	var id, modal_index, container, source, method, data, title, offset;
	source = args['source'] || '#';
	method = args['method'] || 'post';
	title = args['title'] || '';
	data = args['data'] || '';
	offset = parseInt( args['offset'] ) || 10;
	modal_index = window.cws_tb.length;
	id = "cws_tb_modal_" + String( modal_index );
	jQuery("body").append("<section class='cws_tb_modal' id='" + id + "' style='z-index:" + String(100050+modal_index) + "'><div class='cws_tb_modal_overlay'></div><div class='cws_tb_modal_window' style='opacity:0;'><div class='cws_tb_modal_header'>" + title + "<div class='cws_tb_modal_close'></div></div></div></section>");
	container = jQuery( '#' + id );
	jQuery.ajax( source, {
		'method' : method,
		'data' : data,
		'success' : function ( data ){
			cws_tb_modal_show( id, data, modal_index, offset );
		},
		'error' : function (){
			container.remove();
		}
	});
}

function cws_tb_modal_show( id, data, modal_index, offset ){
	var container, modal_w, modal_w_content, max_height, max_width;
	if ( !id || !data || modal_index == undefined ) return;
	container = jQuery( "#" + id );
	modal_w = container.find( ".cws_tb_modal_window" );
	max_height = window.innerHeight - modal_w.outerHeight() - ( offset * 2 );
	max_width = window.innerWidth - modal_w.outerWidth() - ( offset * 2 );
	modal_w.append( "<div class='cws_tb_modal_content' style='max-height:" + max_height + "px; max-width:" + max_width + "px;'></div>" );
	modal_w_content = modal_w.find( ".cws_tb_modal_content" );
	modal_w_content.append( data );
	modal_w.animate( { 'opacity' : '1' }, 300 );
	window.cws_tb[modal_index] = { 'id' : id, 'offset' : offset };
}

function cws_tb_close (){
	var container = jQuery( this );
	var id = container.attr( 'id' );
	container.fadeOut('fast', function (){
		container.remove();
		for ( var i=0; i<window.cws_tb.length; i++ ){
			if ( window.cws_tb[i]['id'] == id ){
				window.cws_tb.splice( i, 1 );
			}
		}
	});
}

function cws_tb_modal_close (){
	jQuery(this).parents(".cws_tb_modal").cws_tb_close();
}

function cws_last_tb_modal_close (){
	jQuery( '#' + cws_tb[ cws_tb.length - 1 ] ).cws_tb_close();
}

function is_cws_tb_modal (){
	return Boolean(jQuery(this).parents(".cws_tb_modal").length);
}

jQuery.fn.cws_tb_close = cws_tb_close;
jQuery.fn.is_cws_tb_modal = is_cws_tb_modal;
jQuery.fn.cws_tb_modal_close = cws_tb_modal_close;
jQuery(".cws_tb_modal_close").live("click",cws_tb_modal_close);

/********************************* \CWS_TB_MODAL *********************************/

/* POST FORMATS */
jQuery( document ).ready( function (){
	var options = jQuery('#post-formats-select input[type="radio"][name="post_format"]');
	var cur_p_f = options.filter('[checked="checked"]').val();
	post_format_mb_controller( cur_p_f, function ( cur, other ){ other.css( 'display', 'none' ); } );
	options.change( function (){
		var cur_p_f = jQuery( this ).val();
		post_format_mb_controller( cur_p_f, function ( cur, other ){
			other.fadeOut( 'medium', function (){
				cur.fadeIn( 'medium' );
			})
		});
	});
});
function post_format_mb_controller ( pf, act ){
	var mb_tr, cur, other;
	cur = jQuery( '#cws_mb_post_format_options .redux-container-group#cws_mb_post_format_options-' + pf ).closest( 'tr' );
	other = jQuery( '#cws_mb_post_format_options .redux-container-group:not(#cws_mb_post_format_options-' + pf + ')' ).closest( 'tr' );
	act( cur, other );
}

/* SOCIAL NETWORKS */
jQuery( document ).ready( function (){
	jQuery( ".redux-field-container[data-id='social_group']" ).each( function (){
		var field_container = jQuery( this );
		var headers = jQuery( ".ui-accordion-header", field_container );
		headers.each( function (){
			jQuery( this ).set_group_title();
		});
	});
	jQuery( document ).on( "click", ".ui-accordion-header:not(.ui-state-active)", function (){
		jQuery( this ).set_group_title();
	});
});
jQuery.fn.set_group_title = function (){
	var header = jQuery( this );
	var content = header.next( ".ui-accordion-content" );
	if ( content.length ){
		var title_input = jQuery( "#title-text", content );
		var title_text = "";
		if ( title_input.length ){
			title_text = title_input.val();
			if ( title_text.length ){
				header.html( header.html().replace( header.text(), title_text ) );
			}
		}
	}
}

/* REMOVE NEEDLESS FIELD */
jQuery( document ).ready( function (){
	document.addEventListener( "DOMNodeInserted", function ( e ){
		var el = e.target;
		if ( jQuery( el ).hasClass( "cws_tb_modal" ) ){
			el.addEventListener( "DOMNodeInserted", function ( e ){
				var el = e.target;
				var field, selection_field;
				if ( el.className == "cws_sc_settings_container" ){
					field = el.querySelector( "#columns-select" );
					if ( field != null ){
						selection_field = el.querySelector( "#cws_sc_selection" );
						if ( selection_field != null && selection_field.value.length ){
							jQuery( field ).closest( "tr" ).remove();
						}
					}
				}
			}, false );
		}
	}, false);
});

/* Parallax images accordion */
jQuery( document ).ready( function (){
	jQuery( "[data-id='parallax_options'] [data-id='images']  [id$='[img][url]']" ).each( function (){
		var el = jQuery( this );
		var attachment_url = el.val();
		if ( !attachment_url.length ) return;
		var acc_sect = el.closest( ".redux-groups-accordion-group" );
		var acc_sect_header = jQuery( ".ui-accordion-header", acc_sect );
		acc_sect_header.css({
			'background-image' : "url(" + attachment_url + ")",
			'background-size' : 'cover',
			'background-position' : 'center center'
		});
		acc_sect_header.addClass( 'img_bg' );
	});
	jQuery( "[data-id='parallax_options'] [data-id='images']" ).each( function (){
		var i;
		var fieldset = jQuery( this );
		var headers = jQuery( ".ui-accordion-header", fieldset );
		for ( i=0; i<headers.length; i++ ){
			jQuery( headers[i] ).text( "Slide - " + i );
		}
	});

	document.addEventListener("DOMNodeInserted", function ( e ){
		var acc_sect_header, acc_sect_siblings;
		var el = e.target;
		el = jQuery( el );
		if ( !el.hasClass( "redux-groups-accordion-group" ) || !el.closest( "[data-id='parallax_options'] [data-id='images']" ).length ) return;
		acc_sect_siblings = jQuery( el ).siblings( ".redux-groups-accordion-group" );
		acc_sect_header = jQuery( ".ui-accordion-header", el );
		acc_sect_header.text( "Slide - " + acc_sect_siblings.length );
	});
	jQuery( document ).on( 'cws_redux_group_remove', function ( e, groups_container ){
		var headers, i;
		if ( groups_container == undefined || !groups_container.length ) return;
		var headers = jQuery( ".ui-accordion-header", groups_container );
		for ( i=0; i<headers.length; i++ ){
			jQuery( headers[i] ).text( "Slide - " + i );
		}
	});

	jQuery( document ).on( 'cws_media_select', function ( e, frame, el ){
		var acc_sect, acc_sect_header, attachment, attachment_url;
		if ( frame == undefined || el == undefined || !el.closest( "[data-id='parallax_options'] [data-id='images']" ).length ) return;
		acc_sect = el.closest( ".redux-groups-accordion-group" );
		acc_sect_header = jQuery( ".ui-accordion-header", acc_sect );
		attachment = frame.state().get('selection').first();
		attachment_url = attachment.attributes.url;
		acc_sect_header.css({
			'background-image' : "url(" + attachment_url + ")",
			'background-size' : 'cover',
			'background-position' : 'center center'
		});
		acc_sect_header.addClass( 'img_bg' );
	});
	jQuery( document ).on( "click", "[data-id='parallax_options'] [data-id='images'] .remove-image", function (){
		var el = jQuery( this );
		var acc_sect = el.closest( ".redux-groups-accordion-group" );
		var acc_sect_header = jQuery( ".ui-accordion-header", acc_sect );
		acc_sect_header.css({
			'background-image' : 'none',
			'background-size' : 'auto',
			'background-position' : '0% 0%'
		});
		acc_sect_header.removeClass( 'img_bg' );
	});
});