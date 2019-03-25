/* global redux_change */
(function($){
	"use strict";

	$.redux.group = $.group || {};

	$(document).ready(function () {
		//Group functionality
		$.redux.group();
	});

	$.redux.group = function(){
		$("div.redux-groups-accordion")
		.accordion({
			header: "> div > h3",
			collapsible: true,
			active: false,
			heightStyle: "content",
			icons: {
				"header": "ui-icon-plus",
				"activeHeader": "ui-icon-minus"
			}
		});

		redux.field_objects.select.init($("div.redux-groups-accordion").closest('fieldset'));

		$('.redux-groups-accordion-group:not(.redux-dummy) input[id^="color-"]').each( function(idx) {
			$(this).wpColorPicker();
		});

		$('.redux-groups-accordion-group.redux-dummy select').each( function(idx) {
			$(this).select2('data', null);
			$(this)[0].style.display = '';
			$(this).parent().find('.select2-container').remove();
			$(this).parent().find('.select2_params').remove();
		});

		$('.redux-groups-accordion-group:not(.redux-dummy) h3').each( function(idx) {
			var fs_id = $(this).closest('fieldset')[0].id.split('-');
			var title = $(this).closest('.redux-groups-accordion-group').find('input[name="' + fs_id[0] + '[' + fs_id[1] + ']['+idx+'][title]"]').val();
			$(this).closest('.redux-groups-accordion-group').find('.slide-title').val(title);
			var h3_inner = $(this).closest('.redux-groups-accordion-group').find('h3').html();
			$(this).closest('.redux-groups-accordion-group').find('h3').html(h3_inner + title);
		});



		function addIconToSelectFa(icon) {
			if ( icon.hasOwnProperty( 'id' ) ) {
				return "<span><i class='fa fa-" + icon.id + " fa-2x'></i>" + "&nbsp;&nbsp;" + icon.id.toUpperCase() + "</span>";
			}
		}

		$('.redux-groups-accordion-group input[data-title="true"]').on('keyup',function(event) {
			$(this).closest('.redux-groups-accordion-group').find('.redux-groups-header').text(event.target.value);
			$(this).closest('.redux-groups-accordion-group').find('.slide-title').val(event.target.value);
		});

		$('.redux-groups-remove').live('click', function () {
			redux_change($(this));
			$(this).parent().find('input[type="text"]').val('');
			$(this).parent().find('input[type="hidden"]').val('');
			$(this).parent().parent().slideUp('medium', function () {
				$(this).remove();
			});
		});

		$('.redux-groups-add').click(function () {
			var newSlide = $(this).prev().find('.redux-dummy').clone(true).show();
			var slideCounter = $(this).parent().find('.redux-dummy-slide-count');
			// Count # of slides
			var slideCount = slideCounter.val();
			// Update the slideCounter
			slideCounter.val(parseInt(slideCount)+1 );
			// REMOVE var slideCount1 = slideCount*1 + 1;

			$(newSlide).find('input[id^="color-"]').each( function(idx) {
				$(this).wpColorPicker(); // mas: apply wp color picker here
			});

			//$(this).prev().append(newSlide);
			$("div.redux-groups-accordion").append(newSlide).accordion('destroy').accordion({
				header: "> div > h3",
				collapsible: true,
				active:slideCount+1,
				heightStyle: "content",
				icons: {
					"header": "ui-icon-plus",
					"activeHeader": "ui-icon-minus"
				}
			});
			$("div.redux-groups-accordion").accordion('refresh');
			//$("div.redux-groups-accordion").accordion('option', 'active', 'h3:last');

			// Remove dummy classes from newSlide
			$(newSlide).removeClass("redux-dummy");

			$(newSlide).find('input[type="text"], input[type="hidden"], textarea , select').each(function(){
				var attr_name = $(this).data('name');
				var attr_id = $(this).attr('id');
				var def_val = $(this).attr('value');
				// For some browsers, `attr` is undefined; for others,
				// `attr` is false.  Check for both.
				if (typeof attr_id !== 'undefined' && attr_id !== false) {
					$(this).attr("id", $(this).attr("id").replace("@", slideCount) );
				}
				if (typeof attr_name !== 'undefined' && attr_name !== false) {
					$(this).attr("name", $(this).data("name").replace("@", slideCount) );
					$(this).removeAttr("data-name"); // mas
				}
				if ('undefined' !== def_val) {
					$(this).removeAttr('value');
					$(this).val(def_val); // mas
				}
				if($(this).prop("tagName") == 'SELECT') {
					$(this).select2({
						allowClear: true,
						placeholder: " ",
						formatResult: addIconToSelectFa,
						formatSelection: addIconToSelectFa,
						escapeMarkup: function(m) { return m; }
					});

					//$.redux.select(); // mas: attach select2 to a new group
				}

				if ($(this).hasClass('slide-sort')){
					$(this).val(slideCount);
				}
			});
		});

	};
})(jQuery);
