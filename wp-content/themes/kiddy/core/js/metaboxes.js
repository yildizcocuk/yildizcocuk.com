var map;
var marker;

window.initMap = function() {
	var coords_input = jQuery('.inside .row.coordinates input');
	var coords = {lat: -34.397, lng: 150.644};
	var zoom = 8;
	if (coords_input && coords_input[0].value.length > 0 ) {
		var a_coords = coords_input[0].value.split(';');
		coords = {lat: parseFloat(a_coords[0]), lng: parseFloat(a_coords[1])};
		zoom = parseInt(a_coords[2]);
	}
	map = new google.maps.Map(document.getElementById('map'), {
		center: coords,
		zoom: zoom
	});

	// add marker if we restore saved coords
	if (undefined !== a_coords) {
		addMarker(new google.maps.LatLng(parseFloat(a_coords[0]), parseFloat(a_coords[1])));
	}

	map.addListener('click', function(event) {
		addMarker(event.latLng);
	});

	function addMarker(location) {
		if (marker)
			marker.setMap(null); // remove previous one
		marker = new google.maps.Marker({
			position: location,
			map: map
		});
		var coords_input = jQuery('.inside .row.coordinates input');
		if (coords_input) {
			coords_input[0].value = location.lat() + ';' + location.lng() + ';' + map.zoom;
		}
		if (map.zoom > 13 ) {
			// let's asyncronousely ask google where we at
			request = new XMLHttpRequest();
			var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+location.lat()+','+location.lng()+'&key=AIzaSyD1RDKEdo4eaJ7wHuGC812E2QfWQd0Ojnc&result_type=street_address';
			if (request) {
				request.onreadystatechange = function() {
					if (request.readyState == 4) { //Numeric 4 means DONE
						var data = JSON.parse(request.responseText);
						if ('OK' === data.status) {
							console.log(data.results[0].formatted_address);
						}
					}
				}
			};
			request.open("GET", url, true);
			request.send();
		}
	}
}

var loc;

jQuery(document).ready(function() {
	function waitfor(test, count, callback) {
		// Check if condition met. If not, re-check later (msec).
		while (test()) {
			count++;
			setTimeout(function() {
				waitfor(test, count, callback);
			}, 50);
			return;
		}
		// Condition finally met. callback() can be executed.
		callback();
	}

	function islocset() {
		return (undefined === loc);
	}

	jQuery('.inside .row.country').each(function(el, k) {
		if (jQuery(k).find('select')[0].selectedIndex === 0) {
			jQuery.getJSON("http://api.wipmania.com/jsonp?callback=?",
				function(data) {
					loc = data;
			});
			var that = k;
			waitfor(islocset, 10, function() {
				var el = jQuery(that).find('select')[0];
				var country_id = loc.address.country_code;
				for (var i=0;i<el.options.length;i++){
					if (country_id === el.options[i].value) {
						el.selectedIndex = i;
						break;
					}
				}
			});
		}
	});

	// tabs
	jQuery('#cws-post-metabox-id .inside .cws_pb_ftabs a').on('click', function(e) {
		var old_tab = jQuery(this).parent().find('a[class="active"]');
		if (jQuery(this)[0] != old_tab[0]) {
			var parent = jQuery(this).parent().parent();
			jQuery(this).toggleClass('active');
			old_tab.toggleClass('active');
			parent.find('.cws_form_tab[data-tabkey]').addClass('closed'); // hide all
			parent.find('.cws_form_tab[data-tabkey="' + jQuery(this).data('tab')+'"]').toggleClass('closed');
		}
		e.stopPropagation();
		e.preventDefault();
	});

	// date-time
	var tp;

	jQuery('.inside .row input[data-cws-type^="datepicker"]').each(function(el, k) {
		var typear = k.dataset.cwsType.split(';');
		switch (typear[1]) {
			case 'periodpicker':
				tp = jQuery(k).periodpicker({
					end: '.inside .row.'+ typear[2] +' input',
					timepicker: true,
					lang: document.body.className.substr(document.body.className.indexOf('locale-')+7, 2),
					timepickerOptions: {
						inputFormat: 'hh:mm'
					},
					cells: [1,3]
				});
			break;
			default:
				jQuery(k).datetimepicker();
			break;
		}
	});

	jQuery('#cws-post-metabox-id .inside input[name="cws_mb_is_allday"]').on('change', function(e) {
		tp.periodpicker('setOption', 'timepicker', !e.target.checked);
	});

	jQuery('#cws-post-metabox-id .inside input[data-default-color],.widget-liquid-right .widget-content input[data-default-color]').each(function(){
		jQuery(this).wpColorPicker();
		jQuery(this).wpColorPicker('color', this.dataset['defaultColor']);
	});

	function addCloseProcessing(node) {
		node.addEventListener('click', function() {
			node.parentNode.removeChild(node);
		}, false);
	}

	jQuery('#cws-post-metabox-id .inside .recurring_events li .close').each(function(e, k) {
		addCloseProcessing(k);
	});

	var mb_prefix = 'cws_mb_';

	jQuery('#cws-post-metabox-id .inside .recurring_events>div>button').on('click', function() {
		var ul = this.parentNode.parentNode;
		var i = ul.getElementsByTagName('li').length;
		var last_li = i ? ul.getElementsByTagName('li')[i-1] : null;
		var start_t = jQuery(ul).find('input[type="text"]')[0].value;
		var end_t = jQuery(ul).find('input[type="text"]')[1].value;
		var key = mb_prefix + ul.dataset['pattern'].substring( mb_prefix.length );
		var lang = ['From', 'till'];
		if (undefined !== ul.dataset['lang']) {
			lang = ul.dataset['lang'].split('|');
		}

		var node_str = '<li class="recdate">'+ lang[0] +' <span>'+ start_t +'</span> '+lang[1]+' <span>'+ end_t +'</span><div class="close"></div>';
		node_str  += '<input type="hidden" name="'+key+'['+i+'][s]" value="'+start_t+'" />';
		node_str  += '<input type="hidden" name="'+key+'['+i+'][e]" value="'+end_t+'" />';
		node_str  += '</li>';
		if (last_li) {
			last_li.insertAdjacentHTML('afterend', node_str);
		} else {
			ul.insertAdjacentHTML('afterbegin', node_str);
		}
		last_li = ul.getElementsByTagName('li')[i];
		addCloseProcessing(last_li.getElementsByClassName('close')[0]); // add close button processing
	});

	/* group add */
	if (undefined !== window.cws_groups) {
		var i = 0;
		for (var key in window.cws_groups) {
			if (window.cws_groups.hasOwnProperty(key)) {
				group = JSON.parse(window.cws_groups[key]);
				window.cws_groups[key] = addGroup(group, key);
				i++;
			}
		}
	}

	function addGroup(group, key) {
		var parent = jQuery('.row.group.' + key)[0];

		var textarea = jQuery(parent).find('textarea[data-templ="group_template"]');
		var template0 = textarea.val();
		var group_key = textarea.data('key');
		var current_id = 0;

		// now we need to assign new values here
		var k = 0;
		for (var gkey in group) {
			if ( group.hasOwnProperty(gkey) ) {
				// since gkey is just a number, we need to get to the items
				var ul = parent.getElementsByTagName('ul')[0];
				var i = ul.getElementsByTagName('li').length;
				var last_li = i ? ul.getElementsByTagName('li')[i-1] : null;

				template = '<li><label class="disable"></label><div class="close"></div><div class="minimize"></div>' + template0.replace(/%d/g, '' + k) + '</li>';
				if (last_li) {
					last_li.insertAdjacentHTML('afterend', template);
				} else {
					ul.insertAdjacentHTML('afterbegin', template);
				}
				last_li = ul.getElementsByTagName('li')[i];


				for (var item in group[gkey]) {
					if (group[gkey].hasOwnProperty(item)) {

						var group_prefix = mb_prefix + key + '[' + k + '][' + item + ']'; // index, because numbers can be deleted and saved as 0,3,4,6
						var input = jQuery(parent).find('input[name="' + group_prefix +'"],select[name="' + group_prefix +'"]')[0];
						// value = group[gkey]
						switch (input.type) {
							case 'text':
								input.value = group[gkey][item];
								break;
							case 'select-one':
								for (var i=0;i<input.options.length;i++){
									if (group[gkey][item] === input.options[i].value) {
										input.selectedIndex = i;
										break;
									}
								}
								break;
						}
					}
				}
				k++;
				processGroupMinimize(last_li); // minimize them on start
				//initWidget(last_li);
			}
		}
		return k;
	}

	jQuery('#cws-post-metabox-id .inside .row.group>div>button').on('click', function(e) {
		var parent = e.target.parentNode;
		var ul = parent.getElementsByTagName('ul')[0];
		var i = ul.getElementsByTagName('li').length;
		var last_li = i ? ul.getElementsByTagName('li')[i-1] : null;
		var textarea = jQuery(parent).find('textarea[data-templ="group_template"]');
		var template = textarea.val();
		var group_key = textarea.data('key');
		var current_id = 0;
		if (undefined !== window.cws_groups) {
			current_id = window.cws_groups[group_key];
		}
		template = '<li><label class="disable"></label><div class="close"></div><div class="minimize"></div>' + template.replace(/%d/g, '' + current_id) + '</li>';
		if (last_li) {
			last_li.insertAdjacentHTML('afterend', template);
		} else {
			ul.insertAdjacentHTML('afterbegin', template);
		}
		last_li = ul.getElementsByTagName('li')[i];
		initWidget(last_li);
		window.cws_groups[group_key] = ++current_id;
	});

	/* control processing */
	window.processEvntInputOptionsLvl = 0;
	var w_counter = 0;
	var g_cws_pb = [];

	jQuery('#cws-post-metabox-id .row_options .image_select .cws_img_select_wrap,\
.widget-liquid-right .widget-content .row_options .image_select .cws_img_select_wrap').on('click', function(el){
		// this one is for clicking on radio images
		processRadioImg(el);
	});

	function processRadioImg(el) {
		var ul_parent = jQuery(el.target).closest('.cws_image_select');
		ul_parent.find('li.checked').toggleClass('checked');
		jQuery(el.target).closest('li').toggleClass('checked');
		var t_input = el.target.getElementsByTagName('input')[0];
		t_input.checked = true;
		var w_id = getWidgetId(el.target);
		g_cws_pb[w_id].length = 0;
		processMbInputOptions(t_input, null, false);
		g_cws_pb[w_id].length = 0;
	}

	function getWidgetId (el) {
		return jQuery(el).closest('.row').length ? jQuery(el).closest('.row').parent().data('w') : jQuery(el).find('.row').parent().data('w');
	}

	jQuery('#cws-post-metabox-id .inside').each(function(e, k){
		initWidget(this, true);
	});

	jQuery('.widget-liquid-right .widget-content').each(function(e, k){
		if (!/__i__/.test(k.name))	{ // skip inactive widgets
			initWidget(this, true);
		}
	});

	function processSelects(k) {
		var parent = jQuery(k).closest('.row')[0];
		if (/\sfai/.test(parent.className)) {
			jQuery(k).select2({
				allowClear: true,
				placeholder: " ",
				formatResult: addIconToSelectFa,
				formatSelection: addIconToSelectFa,
				escapeMarkup: function(m) { return m; }
			});
		}
		else {
			jQuery(k).select2();
		}
	}

	function addIconToSelectFa(icon) {
		if ( icon.hasOwnProperty( 'id' ) ) {
			return "<span><i class='fa fa-" + icon.id + " fa-2x'></i>" + "&nbsp;&nbsp;" + icon.id.toUpperCase() + "</span>";
		}
	}

	function processMbInputOptions (el, params, bIsAssign, bToggleHide) {
		var row = jQuery(el).closest('.row_options')[0]; // this one should be the only one
		var bToggleHide = undefined === bToggleHide ? false : bToggleHide;
		var bDisabled = /disable/.test(row.className);
		if (undefined !== el.getAttribute('data-options') && el.getAttribute('data-options') && ( (!bIsAssign && !bDisabled && !bToggleHide) || (!bIsAssign && bDisabled && bToggleHide) || (bIsAssign && !bDisabled && !bToggleHide) )) {
			if (('checkbox' === el.type && bIsAssign) ||
					('radio' === el.type && !el.checked) ) {
					return;
			}
			var parent = row.parentNode;
			var options_pairs = el.getAttribute('data-options').split(';');
			for (var i=0; i<options_pairs.length; i++) {
				var pair = options_pairs[i].split(':');
				if ('checkbox' === el.type && !el.checked) {
					if ('e' == pair[0]) {
						pair[0] = 'd';
					} else if ('d' == pair[0]) {
						pair[0] = 'e';
					}
				}
				switch (pair[0]) {
					case 'toggle':
					case 't':
						var bElDisabled;
						if (bToggleHide) {
							bElDisabled = false;
						} else {
							bElDisabled = /disable/.test(parent.getElementsByClassName('row '+ pair[1])[0].className);
							if (!el.checked && bElDisabled) {
								bElDisabled = false;
							}
						}
						parent.getElementsByClassName('row '+pair[1])[0].className = parent.getElementsByClassName('row '+pair[1])[0].className.replace(/\s+disable/gm,'') + (bElDisabled ? '' : ' disable');
						if (!bElDisabled) {
							addInputArray(window.processEvntInputOptionsLvl, 'd', pair[1], parent);
							if (params) {
								delete params[pair[1]];
							}
						} else {
							addInputArray(window.processEvntInputOptionsLvl, 'e', pair[1], parent);
						}
						jQuery(parent).find('div.row.'+pair[1]+' select[data-options],div.row.'+pair[1]+' input[data-options]').each( function(el) {
							var bSkipProcess = false;
							switch (this.type) {
								case 'select-one':
									var el = this;
									while ((el = el.parentElement) && !el.classList.contains('row'));

									window.cws_evnt_param_key = el.className.split(' ')[2]; // !!! get p_something from class
									break;
								case 'radio':
									if (!this.checked) {
										bSkipProcess = true;
									}
									break;
								//window.cws_evnt_param_key = el.classList.item(el.classList.length-1);
							}
							if (!bSkipProcess) {
								window.processEvntInputOptionsLvl++;
								processMbInputOptions(this, params, bIsAssign, !bElDisabled);
								window.processEvntInputOptionsLvl--;
							}
						});
						//jQuery(el).closest('#cws-post-metabox-id .inside').find('div.row.'+pair[1]).toggle(300);
					break;
					case 'enable':
					case 'e':
						elProcessEnable(pair[1], params, bToggleHide, false, parent);
						break;
					case 'disable':
					case 'd':
						addInputArray(window.processEvntInputOptionsLvl, 'd', pair[1], parent);
						if (!getStatusInputArray(window.processEvntInputOptionsLvl, pair[1], parent)) {
							if (params && !bIsAssign) {
								delete params[pair[1]];
							}
							elDisable(pair[1], parent, params);
						}
						break;
					case 'select':
						if (bIsAssign) {
							var sel_index = 0;
							if (params && undefined !== window.cws_evnt_param_key) {
								sel_index = undefined !== params[window.cws_evnt_param_key] ? params[window.cws_evnt_param_key] : 0;
							}
							//if ( isNaN(parseInt(sel_index)) ) {
							// most likely string value is here
							// need to assign selectedIndex if they don't match
							// i.e. when this control hasn't been processed yet
							for (var i=0;i<el.options.length;i++){
								if (sel_index === el.options[i].value) {
									el.selectedIndex = i;
									break;
								}
							}
						}
						/*} else if (sel_index != el.selectedIndex) {
							// means, this control has not been assigned yet
							// but we still have to consider its real value
							el.selectedIndex = sel_index;
						}*/
						var op_options = (undefined !== el.options[el.selectedIndex] && undefined !== el.options[el.selectedIndex].dataset.options) ? el.options[el.selectedIndex].dataset.options : '';
						bToggleHide = typeof bToggleHide !== 'undefined' ? bToggleHide : false;
						if (op_options.length) {
							options_pairs = op_options.split(';');
							for (var i=0; i<options_pairs.length; i++) {
								pair = options_pairs[i].split(':');
								switch (pair[0]) {
									case 'enable':
									case 'e':
										elProcessEnable(pair[1], params, bToggleHide, false, parent);
										break;
									case 'disable':
									case 'd':
									//parent.querySelectorAll('select[name^="p_'+pair[1]+'"]')[0].value = [];
										addInputArray(window.processEvntInputOptionsLvl, 'd', pair[1], parent);
										if (!getStatusInputArray(window.processEvntInputOptionsLvl, pair[1], parent)) {
											if (params) {
												delete params[pair[1]];
											}
											elDisable(pair[1], parent, params);
										}
										break;
								}
							}
						}
					break;
				}
			}
		}
	}

	function elProcessEnable (pair_1, params, bToggleHide, bIsAssign, par) {
		var parent = par.parentNode;
		if (!bToggleHide && parent.getElementsByClassName('row '+ pair_1).length == 1) {
			if (getStatusInputArray(window.processEvntInputOptionsLvl, pair_1, par)) {
				addInputArray(window.processEvntInputOptionsLvl, 'e', pair_1, par);
				parent.getElementsByClassName('row '+ pair_1)[0].className = parent.getElementsByClassName('row '+pair_1)[0].className.replace(/\s+disable/gm,'');
				if (!bIsAssign) {
					// need to process data-options if any in case we're just clicking thru form,
					// i.e. not comming from assign
					if ('p_gradient_type' == pair_1) {
						//debugger
					}
					jQuery(parent).find('div.row.'+pair_1+' select[data-options],div.row.'+pair_1+' input').each( function(el) {
						switch (this.type) {
							case 'select-one':
								var el = this;
								while ((el = el.parentElement) && !el.classList.contains('row'));

								window.cws_evnt_param_key = el.className.match(/\w+/i)[0]; // get p_something from class
								break;
							//case 'checkbox':
							//	this.checked = true;
							//	break;
							case 'radio':
								this.checked = (null !== this.getAttribute('checked')) ? true : false;
								break;
							case 'text':
								if (params && undefined !== params[this.name]) {
									this.value = params[this.name];
									if (undefined !== this.dataset['defaultColor']) {
										this.dataset['defaultColor'] = params[this.name];
									}
								}
								break;
						}
						window.processEvntInputOptionsLvl++;
						processMbInputOptions(this, params, true, false);
						//processMbInputOptions(this, params, bIsAssign, false);
						window.processEvntInputOptionsLvl--;
					});
				}
			}
		} else { //if (!getStatusInputArray(window.processEvntInputOptionsLvl, pair_1)) {
			addInputArray(window.processEvntInputOptionsLvl, 'd', pair_1, par);
			if (params) {
				delete params[pair_1];
			}
			elDisable(pair_1, parent, params);
		}
	}

	function getStatusInputArray(lvl, value, parent) {
		var i = 0;
		var w_id = getWidgetId(parent);
		// basically we check if it was enabled (true) or disabled (false) on some higher level
		g_cws_pb[w_id].filter(function(el, k) {
			if (k<=lvl) {
				i += (-1 !== el.e.indexOf(value)) ? 1 : 0;
				i -= (-1 !== el.d.indexOf(value)) ? 1 : 0;
			}
		});
		return i>=0;
	}

	function addInputArray (lvl, op, value, parent) {
		var w_id = getWidgetId(parent);
		if (undefined === g_cws_pb[w_id][lvl]) {
			g_cws_pb[w_id][lvl] = {'e':[],'d':[]};
		}
		g_cws_pb[w_id][lvl][op][g_cws_pb[w_id][lvl][op].length] = value;
	}

	function elDisable (el, parent, params) {
		jQuery(parent).find('div.row.'+el+' select,div.row.'+el+' input,div.row.'+el+' .img-wrapper img').filter(function(k, el){
				if ('s2id' === el.id.substr(0,4) || 'select2-input' === el.className)
					return false;
				return true;
			}).each( function() {
			//debugger
			if ('text' === this.type || 'hidden' === this.type) {
				jQuery(this).val(this.value);
			} else if ('checkbox' === this.type || 'radio' === this.type) {
				if (undefined !== this.getAttribute('data-options')) {
					//debugger
					window.processEvntInputOptionsLvl++;
					processMbInputOptions(this, params, false, true);
					window.processEvntInputOptionsLvl--;
				}
			} else if ('select-one' === this.type) {
				jQuery(this).select2('val', this.value);
				if (undefined !== this.getAttribute('data-options')) {
					//debugger
					window.processEvntInputOptionsLvl++;
					processMbInputOptions(this, params, false, true);
					window.processEvntInputOptionsLvl--;
				}
			} else if (undefined === this.type) {
				jQuery(this).attr("src", this.value);
			}
		});
		if (undefined !== parent && parent.getElementsByClassName('row '+el).length > 0) {
			parent.getElementsByClassName('row '+el)[0].className = parent.getElementsByClassName('row '+el)[0].className.replace(/\s+disable/gm,'') + ' disable';
		}
	}

	jQuery( document ).on( 'widget-added', function( event, widget ){
		if ( /widget-\d+_cws-\w+/.test(widget[0].id) ) {
			initWidget(jQuery(widget).find('.widget-content')[0]);
		}
	});

	function initWidget(parent, forced) {
		var w_local = w_counter;
		if (undefined == parent.dataset['w']) {
			parent.dataset['w'] = w_counter;
		} else {
			w_local = parent.dataset['w'];
		}
		g_cws_pb[w_local] = [{'e':[],'d':[]}];
		w_counter++;

		jQuery(parent).find('div.row select,div.row input').on('change', function(el){
			g_cws_pb[w_local].length = 0;
			processMbInputOptions(el.target, null, false);
			g_cws_pb[w_local].length = 0;
		});
		jQuery(parent).find('input[data-default-color]').each(function(){
			jQuery(this).wpColorPicker();
			var color = this.defaultValue.length ? this.defaultValue : this.dataset['defaultColor'];
			jQuery(this).wpColorPicker('color', color);
		});
		jQuery(parent).find('.row_options .image_select .cws_img_select_wrap').on('click', function(el){
			processRadioImg(el);
		});
		jQuery(parent).find('.row_options input,.row_options select').each(function(e, k){
			var bIsAssign = (undefined !== forced) ? !forced : true;
			processMbInputOptions(k, null, bIsAssign);
		});
		jQuery(parent).find('.row_options select').each(function(e, k){
			processSelects(k);
		});
		initSelectImage(parent);

		jQuery(parent).find('.close').on('click', function(e) {
			var li = e.target.parentNode;
			li.parentNode.removeChild(li);
		});

		jQuery(parent).find('.minimize').on('click', function(e) {
			var li = e.target.parentNode;
			console.log('minimize');
			processGroupMinimize(li);
		});
	}

	function processGroupMinimize(li) {
		var label = jQuery(li).find('>label');
		if ('disable' == label[0].className) {
			var ititle = jQuery(li).find('input[data-role="title"]');
			var title = 'Some social website';
			if (ititle) {
				title = ititle.val();
			}
			label[0].innerText = title;
			jQuery(li).find('>.row').each(function(){
				jQuery(this).hide(500);
			});
		} else {
			jQuery(li).find('>.row').each(function(){
				jQuery(this).show(500);
			});
		}
		jQuery(label[0]).toggleClass('disable');
	}

	jQuery(document).ajaxSuccess(function(e, xhr, settings) {
		if (undefined !== settings.data) {
			var action = settings.data.match(/action=(.+?)($|&)/);
			var isdel = settings.data.match(/delete_widget=(.+?)($|&)/);
			var addnew = settings.data.match(/add_new=(|.+?)($|&)/);
			var wid = settings.data.match(/widget-id=(.+?)($|&)/);
			if (action && 'save-widget' === action[1] && (!isdel || '1' !== isdel[1]) && '' === addnew[1]) {
				initWidget(jQuery('div[id*="'+wid[1]+'"]').find('.widget-content')[0], true); // true, because there might be assigned values
			}
			if (action && 'cws_ajax_sc_settings' === action[1]) {
				var parent = document.getElementsByClassName('cws_tb_modal_window')[0];
				initWidget(jQuery(parent).find('.row').parent()[0]);
			}
		}
	});

	//WP post-formats in Classic editor	
	jQuery('#post-formats-select input').change(function(e){
		var sel = e.target.value;
		var tab = jQuery('#cws-post-metabox-id .inside [data-tabkey="'+sel+'"]');
		jQuery('#cws-post-metabox-id .inside [data-tabkey]').addClass('closed')
		jQuery('#cws-post-metabox-id .inside a').removeClass('active');
		if (tab.length) {
			tab.toggleClass('closed');
			jQuery('#cws-post-metabox-id .inside a[data-tab="'+sel+'"]').addClass('active');
		}
	});

	jQuery('#post-formats-select input:checked').change();

	//WP post-formats in Gutenberg
	jQuery('#editor,#publishing-action').on('change', '.editor-post-format .components-select-control__input', function(e){
		var sel = e.target.value;
		var tab = jQuery('#cws-post-metabox-id .inside [data-tabkey="'+sel+'"]');
		jQuery('#cws-post-metabox-id .inside [data-tabkey]').addClass('closed')
		jQuery('#cws-post-metabox-id .inside a').removeClass('active');
		if (tab.length) {
			tab.toggleClass('closed');
			jQuery('#cws-post-metabox-id .inside a[data-tab="'+sel+'"]').addClass('active');
		}
	});
	setTimeout(function(){
		jQuery('.editor-post-format .components-select-control__input').change();
	},1);	
	

	initSelectImage(document);

	function getGSelection(sc_str) {
		var shortcode = wp.shortcode.next( 'gallery', sc_str );

		var defaultPostId = wp.media.gallery.defaults.id,
			attachments, selection;

		var selection = null;

		if ( shortcode) {
			shortcode = shortcode.shortcode;

			if ( _.isUndefined( shortcode.get('id') ) && ! _.isUndefined( defaultPostId ) )
				shortcode.set( 'id', defaultPostId );

			attachments = wp.media.gallery.attachments( shortcode );

			selection = new wp.media.model.Selection( attachments.models, {
				props: attachments.props.toJSON(),
				multiple: true
			});

			selection.gallery = attachments.gallery;

			selection.more().done(function () {
				// Break ties with the query.
				selection.props.set({ query: false });
				selection.unmirror();
				selection.props.unset('orderby');
			});
		}
		return selection;
	}

	function initSelectImage(parent) {
		jQuery(parent).find('a.pb-gmedia-cws-pb').on('click', function(e) {
			e.preventDefault();
			var parent = e.target.parentNode;
			var input = parent.getElementsByTagName('input');

			var selection = getGSelection(input[0].value);

			var state = selection ? 'gallery-edit' : 'gallery-library';

			var cws_frame = wp.media({
				// Set the title of the modal.
				id:				'cws-frame',
				frame:		'post',
				state:		state,
				title:		wp.media.view.l10n.editGalleryTitle,
				editing:	true,
				multiple:	true,
				selection: selection,

				// Tell the modal to show only images.
				library: { type: 'image' },

				// Customize the submit button.
				button: {	text: 'update',
					close: false
				}
			});
			cws_frame.open();
			cws_frame.on( 'update', function( selection ) {
				input[0].value = wp.media.gallery.shortcode( selection ).string();
				updateGalleryImages(selection.toArray(), parent);
			});
		});

		function updateGalleryImages(sel_arr, parent) {
			var cws_gallery = parent.parentNode.getElementsByClassName('cws_gallery')[0];
			if (cws_gallery) {
				cws_gallery.parentNode.removeChild(cws_gallery);
			}
			var images_html = '<div class="cws_gallery">';
			for (var i = 0; i < sel_arr.length; i++) {
				images_html += '<img src="' + sel_arr[i].attributes.url + '">'
			};
			images_html += '<div class="clear"></div></div>';
			parent.insertAdjacentHTML('afterend',images_html);
		}
/*
		jQuery(parent).find('.img-wrapper input[data-key="gallery"]').each(function(el, k) {
			return;
			var shortcode = wp.shortcode.next( 'gallery', k.value );
			if (shortcode) {
				shortcode = shortcode.shortcode;
				var ids = shortcode.attrs.named.ids.split(',');
				var selection_fake = {};
				for (var i=0;i<ids.length;i++) {
					var attach = wp.media.model.Attachment.get(ids[i]).get('url');
					selection_fake[i]['attributes']['url'] = attach;
				}
				updateGalleryImages(selection_fake, k.parentNode);
			}
		});
*/

		jQuery(parent).find('a.pb-media-cws-pb').on('click', function() {
			var that = this;
			var media_editor_attachment_backup = wp.media.editor.send.attachment;
			wp.media.editor.send.attachment = function(props, attachment) {
				var row = that.parentNode.parentNode;
				var url, thumb;
				switch (attachment.type) {
					case 'image':
						url = attachment.sizes.full.url;
						thumb = (attachment.sizes[props['size']].url || url);
						break;
					case 'video':
						url = attachment.url;
						thumb = attachment.image.src;
						break;
				}
				row.querySelector('input[data-key="img"]').value = url;
				row.getElementsByTagName('img')[0].src = thumb;
				row.querySelector('input[data-key="img-id"]').value = attachment.id;

				jQuery(that).toggle(300);
				jQuery(row).find('a.pb-remov-cws-pb').toggle(300);
				wp.media.editor.send.attachment = media_editor_attachment_backup;
				return;
			}
			//wp.media.editor.remove(this); // this will reset workflow, otherwise first launch settings will be used all the time
			window.original_send_to_editor = window.send_to_editor;
   		window.send_to_editor = function(html) {
   			console.log(html);
   		}
			if (undefined !== this.dataset.media) {
				wp.media.editor.open(this, {library: {type:this.dataset.media}});
			} else {
				wp.media.editor.open(this);
			}
			return false;
		});

		jQuery(parent).find('a.pb-remov-cws-pb').on('click', function(el) {
			var parent = jQuery(el.target).parent();
			parent.find('input[data-key="img"]').attr('value', '');
			parent.find('input[data-key="img-id"]').attr('value', '');
			parent.find('img').attr('src', '');
			jQuery(this).hide(300);
			parent.find('a.pb-media-cws-pb').show(300);
		});

	}

});

