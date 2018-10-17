function createCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    }
    else var expires = "";

    document.cookie = name + "=" + value + expires + "; domain=" + hdadParams.domain + "; path=" + hdadParams.path;
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}

jQuery(document).ready(function($){
    var hdadObj = {
        favorites: decodeURIComponent(readCookie('edd_wl_favorites')).split('|'),
        showLikeButton: function() {
            $('.content-grid-download__entry-image .edd-wl-favorite, .mobile-download-toolbar .like').each(function(){
                var download        = $(this).data('download-id');

                if (hdadObj.favorites.indexOf(download.toString()) > -1) {
                    $(this).addClass('favorited');
                }
            })
        },
        updateCartQuantity: function() {
            if ( ! readCookie( 'edd_cart_quantity' ) ) {
                return;
            }

            var cart = readCookie( 'edd_cart_quantity' );

            if ( ! cart ) {
                return;
            }

            $( '.edd-cart-quantity' ).html( cart );
        }
    };

    hdadObj.updateCartQuantity();

    $('.mobile-download-toolbar .like').on('click', function(e){
        $(this).parent().parent().find('.edd-wl-favorite').trigger('click');

        if ( $(this).hasClass('favorited') ) {
            $(this).removeClass('favorited');
        } else {
            $(this).addClass('favorited');
        }

        e.preventDefault();
    });

    if ( $('.edd-wish-list').length > 0 ) {
        hdadObj.showLikeButton();
    } else {
        $(document).on('facetwp-loaded', function() {
            hdadObj.showLikeButton();
        });
    }

    $('.edd-wl-license').on('click', function(){
        var license = $('.edd-wl-add-all-to-cart a'),
            url = license.attr('href'),
            originalUrl = license.data('url'),
            newUrl = ( originalUrl !== undefined ) ? originalUrl : url;

        newUrl += '&price_id=' + $(this).val();

        license.attr('href', newUrl);
        if ( originalUrl === undefined ) {
            license.data('url', url);
        }
    });

    $('body').on('click.eddFavorite', '.edd-wl-favorite', function (e) {
        e.preventDefault();

        var download        = $(this).data('download-id');

        if ( null === hdadObj.favorites || '' === hdadObj.favorites ) {
            hdadObj.favorites = download;
        } else {
            var index = hdadObj.favorites.indexOf(download.toString());
        }

        if ( $(this).hasClass('favorited') ) {
            if ( index > -1 ) {
                hdadObj.favorites.splice(index, 1);
            }
        } else {
            hdadObj.favorites.push(download);
        }

        createCookie('edd_wl_favorites', encodeURIComponent(hdadObj.favorites.join('|')), 30);
    });

    $('.edd-wl-action-disabled').on('click', function(e){
        var r = confirm(hdadParams.loginToLike);

        if ( r ) {
            location.href = hdadParams.loginUrl;
        }

        e.preventDefault();
        return false;
    });

    if ( $('.fes-profile-form-div').length > 0 ) {
        $('.fes-el.license, .fes-el.fes-yingyezhizhao').remove();
        $('.fes-el.user_avatar .fes-avatar-image-btn, .fes-remove-avatar-image, .fes-el.fes-hezuofangshi').remove();

        $('.fes-el.country select').attr('disabled', 'disabled');
        $('.fes-el.fes-paypal input').attr('disabled', 'disabled');
        $('.fes-el.fes-payoneer input').attr('disabled', 'disabled');
        $('.fes-el.user_bio textarea').attr('disabled', 'disabled');
    }

    $('#menu-mobile-footer li.more a').on('click', function(e){
        e.preventDefault();

        $('#responsive-menu-pro-button').trigger('click');
    });

    $('body').on('edd_quantity_updated', function(e, quantity){
        $('.hdad-cart-quantity').text(quantity);
    });

    $('#edd-gateway-option-wallet').on('click', function(e){
        var allowWallet = true;

        $('.edd-variable-pricing-switcher').each(function( i, e ){
            if ( $(this).children('option').length > 1 ) {
                console.log('5 licences!');

                if ( $(this).find('option:selected').val() < 2 ) {
                    allowWallet = false;
                }
            }
        });

        if ( ! allowWallet ) {
            alert( hdadParams.walletNotAllowed );
            e.preventDefault();
        }
    });

    if ( $('.facetwp-pager').length > 0 ) {
        var dlListTop = $('.edd_downloads_list').offset().top-100, pagerClicked = 0;

        $(document).on('click', '.facetwp-page', function() {
            pagerClicked = 1;
            $('.facetwp-pager').prepend('<div class="facetwp-loading" style="margin: 0 auto;"></div>');
            $('.facetwp-page, .facetwp-pager-label').css('visibility', 'hidden');
        });

        $(document).on('facetwp-loaded', function() {
            if ( $(window).width() <= 768 ) {
                dlListTop = 0;
            }
            if ( pagerClicked > 0 ) {
                $('html, body').animate({
                    scrollTop: dlListTop
                }, 500);
            }
        });
    }
});

/* ========================================================================
 * Bootstrap: tab.js v3.3.7
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


(function ($) {
    'use strict';

    // TAB CLASS DEFINITION
    // ====================

    var Tab = function (element) {
        // jscs:disable requireDollarBeforejQueryAssignment
        this.element = $(element)
        // jscs:enable requireDollarBeforejQueryAssignment
    }

    Tab.VERSION = '3.3.7'

    Tab.TRANSITION_DURATION = 150

    Tab.prototype.show = function () {
        var $this    = this.element
        var $ul      = $this.closest('ul:not(.dropdown-menu)')
        var selector = $this.data('target')

        if (!selector) {
            selector = $this.attr('href')
            selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
        }

        if ($this.parent('li').hasClass('active')) return

        var $previous = $ul.find('.active:last a')
        var hideEvent = $.Event('hide.bs.tab', {
            relatedTarget: $this[0]
        })
        var showEvent = $.Event('show.bs.tab', {
            relatedTarget: $previous[0]
        })

        $previous.trigger(hideEvent)
        $this.trigger(showEvent)

        if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return

        var $target = $(selector)

        this.activate($this.closest('li'), $ul)
        this.activate($target, $target.parent(), function () {
            $previous.trigger({
                type: 'hidden.bs.tab',
                relatedTarget: $this[0]
            })
            $this.trigger({
                type: 'shown.bs.tab',
                relatedTarget: $previous[0]
            })
        })
    }

    Tab.prototype.activate = function (element, container, callback) {
        var $active    = container.find('> .active')
        var transition = callback
            && $.support.transition
            && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length)

        function next() {
            $active
                .removeClass('active')
                .find('> .dropdown-menu > .active')
                .removeClass('active')
                .end()
                .find('[data-toggle="tab"]')
                .attr('aria-expanded', false)

            element
                .addClass('active')
                .find('[data-toggle="tab"]')
                .attr('aria-expanded', true)

            if (transition) {
                element[0].offsetWidth // reflow for transition
                element.addClass('in')
            } else {
                element.removeClass('fade')
            }

            if (element.parent('.dropdown-menu').length) {
                element
                    .closest('li.dropdown')
                    .addClass('active')
                    .end()
                    .find('[data-toggle="tab"]')
                    .attr('aria-expanded', true)
            }

            callback && callback()
        }

        $active.length && transition ?
            $active
                .one('bsTransitionEnd', next)
                .emulateTransitionEnd(Tab.TRANSITION_DURATION) :
            next()

        $active.removeClass('in')
    }


    // TAB PLUGIN DEFINITION
    // =====================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data  = $this.data('bs.tab')

            if (!data) $this.data('bs.tab', (data = new Tab(this)))
            if (typeof option == 'string') data[option]()
        })
    }

    var old = $.fn.tab

    $.fn.tab             = Plugin
    $.fn.tab.Constructor = Tab


    // TAB NO CONFLICT
    // ===============

    $.fn.tab.noConflict = function () {
        $.fn.tab = old
        return this
    }


    // TAB DATA-API
    // ============

    var clickHandler = function (e) {
        e.preventDefault()
        Plugin.call($(this), 'show')
    }

    $(document)
        .on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler)
        .on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler)

})(jQuery);
