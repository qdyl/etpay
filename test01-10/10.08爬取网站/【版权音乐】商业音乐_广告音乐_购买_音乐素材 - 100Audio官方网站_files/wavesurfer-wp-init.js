/**
 * WaveSurfer-WP Init
 * Choose or Define your own rules
 */

// No conflict mod for WordPress
var $j = jQuery.noConflict();


// ====== User-Defined Events ====== //
// https://facetwp.com/documentation/facetwp-loaded/
$j(document).on('facetwp-loaded', function() {
	if (FWP.loaded) {
		wavesurfer=[];
		$j(document).trigger('wavesurfer');
	}
});
