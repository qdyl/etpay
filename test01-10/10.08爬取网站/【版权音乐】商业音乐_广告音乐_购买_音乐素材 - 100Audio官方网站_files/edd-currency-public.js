jQuery(document).ready( function($) {
	
	//show popup for selecting currency
	$( document ).on( 'click', '.edd-select-currency-menu-item', function(){
		$( '.edd-currency-popup-overlay' ).fadeIn();
        $( '.edd-currency-popup-content' ).fadeIn();
        return false;
	});
	
	//close popup window 
	$( document ).on( 'click', '.edd-currency-popup-close, .edd-currency-popup-overlay', function(){
		$( '.edd-currency-popup-overlay' ).fadeOut();
        $( '.edd-currency-popup-content' ).fadeOut();
	});
	
	//close popup window 
	$( document ).on( 'click', '.edd-currency-close-popup', function(){
		edd_currency_erase_cookie( 'edd-currency-saved-msg' );
		$( '.edd-currency-bottom-popup' ).fadeOut();
	});
	
	//on click of currency in popup
	$( document ).on( 'click', '.edd-list-item', function(){
		
	  	$('.edd-list-item-selected').removeClass('edd-list-item-selected');
	  	$(this).addClass('edd-list-item-selected');

	  	$('.edd-selected-currency').text($(this).children('.edd-currency-name').text());

	  	// update the selected currency for select form
	  	$('.edd-currencies-select').val($(this).data('code'));
	  	
	});
	
	//save currency to cookie when user click save button
	$( document ).on( 'click', '.edd-currency-button-save', function(){
		
		if( $( '.edd-currencies-mb-select' ).is(':visible') ) {
			var currency = $( '.edd-currencies-mb-select' ).val();
		} else {
			var currency = $( '.edd-list-item-selected' ).attr( 'data-code' );
		}
		edd_currency_save_currency( currency );
	});
	
	//save currency to cookie when user click save button
	$( document ).on( 'click', '.edd-currency-save-button', function(){
		var currency_parent = $( this ).parents( '.edd-currency-wrap' );
		var currency = currency_parent.find( '.edd-currencies-select' ).val();
		edd_currency_save_currency( currency );
	});
	
	//reset currency from cookie when user click reset button
	$( document ).on( 'click', '.edd-currency-button-reset', function(){
		edd_currency_erase_cookie( 'edd-currency' );
		edd_currency_erase_cookie( 'edd-currency-detected' );
		edd_currency_create_cookie( 'edd-currency-saved-msg', 'reset' );
  		edd_currency_reload();
	});
	
	//show popup for detection popup
	if( $( '.edd-currency-detection-prompt-popup' )[0] ) {
		$( '.edd-currency-detection-prompt-popup' ).delay( 1000 ).addClass( 'edd-currency-detection-popup-visible' );
	  	$( '.edd-currency-detection-prompt-popup .edd-currency-close-popup' ).click(function() {
  			$( '.edd-currency-detection-prompt-popup' ).removeClass( 'edd-currency-detection-popup-visible' );
		});
	}
	
	//user currency detection popup no
	$( document ).on( 'click', '.edd-currency-button-convert-no', function() {
		edd_currency_create_cookie( 'edd-currency-detected', 'true', 30 );
		$('.edd-currency-detection-prompt-popup').removeClass('edd-currency-detection-popup-visible');
		$( '.edd-currency-popup-overlay' ).fadeIn();
        $( '.edd-currency-popup-content' ).fadeIn();
	});
	
	//user currency detection popup yes
	$( document ).on( 'click', '.edd-currency-button-convert-yes', function() {
		edd_currency_create_cookie( 'edd-currency-detected', 'true', 30 );
		$('.edd-currency-detection-prompt-popup').removeClass( 'edd-currency-detection-popup-visible' );
		edd_currency_save_currency( EDDCurrency.detected_currency );
	});
});

function edd_currency_save_currency(currency) {
	// remove edd cart widget cache, so cart reloads
	$edd_supports_html5_storage = ( 'eddSessionStorage' in window && window['eddSessionStorage'] !== null );
	if( $edd_supports_html5_storage ) {
		eddSessionStorage.removeItem( 'edd_fragments' );
		eddSessionStorage.removeItem( 'edd_cart_hash' );
	}
	
  	edd_currency_create_cookie('edd-currency', currency, 30);
  	edd_currency_create_cookie('edd-currency-saved-msg', 'save', 1);
  	edd_currency_reload();
}

function edd_currency_create_cookie(name,value,days) {
	var expires = "";
	if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
	}
	document.cookie = name + "=" + value + expires + "; path=/";
}

function edd_currency_erase_cookie(name) {
	edd_currency_create_cookie(name, "", -1);
}

// Function to reload
function edd_currency_reload( redirect_url ) {
	
	var redirect_url = redirect_url || window.location.href;
  	
  	if(EDDCurrency.curr_cache == 'true') {
  		
  		// Check ? is exist in url or not
		var strexist = redirect_url.indexOf("?");
		
		if( strexist >= 0 ) {
			url_joiner = '&';
		} else {
			url_joiner = '?';
		}
		
		var nocache_exist = redirect_url.indexOf( 'nocache=true' );
		
		if( nocache_exist < 0 ) {
			redirect_url = redirect_url + url_joiner + 'nocache=true';
		}
  	}
  	window.location = redirect_url;
  	//window.location.reload(true);
}