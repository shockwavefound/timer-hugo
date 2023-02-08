$(document).ready(function () {
    "use strict";

    // Initialize AOS animations
    AOS.init({
        disable: 'mobile',
        once: true
    });

    // looks like this reduces/hides the brand link after a scroll?
    // I think this is dead/redundant code
    $(window).scroll(function () {
        if ($(window).scrollTop() > 50) {
            $(".navbar-brand a").css("color", "#fff");
            $(".top-bar").removeClass("animated-header");
        } else {
            $(".navbar-brand a").css("color", "inherit");
            $(".top-bar").addClass("animated-header");
        }
    });

    // slick (for partials/clients slider)
    $('.clients-logo-slider').slick({
        autoplay: true,
        autoplaySpeed: 1000,
        slidesToShow: 5,
        slidesToScroll: 1,
        arrows: false,
        mobileFirst: false,
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 3,
              slidesToScroll: 1
            }
          },
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 1
            }
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1
            }
          }
        ]
    });

    // contact form validation
    $('#contact-form').validate({
        submitHandler: function (form) {
            $(form).ajaxSubmit({
                dataType: "json",
                success: function () {
                    $('#contact-form #success').fadeIn();
                },
                error: function () {
                    $('#contact-form #error').fadeIn();
                }
            });
            return false; // prevent normal browser submit/navigation
        }
    });

});


$(function() {
    'use strict';

    $('.sort-btn').on('click', '[data-sort]', function(event) {
        event.preventDefault();
        var $this = $(this);
        var mode = $this.data('sort');
        var items = $(".sort-item");
        $(".sort-item *").removeAttr('data-aos');  // AOS breaks sorting so just turn it off --pst
        switch(mode) {
            case 'alpha':
                items.sort(function(a, b) {
                    return String.prototype.localeCompare.call($(a).data('sort-name').toLowerCase(), $(b).data('sort-name').toLowerCase());
                });
                break;
            case 'newest':
                items.sort(function(b, a) {
                    return $(a).data("sort-time")-$(b).data("sort-time");
                });
                break;
            case 'oldest':
                items.sort(function(a, b) {
                    return $(a).data("sort-time")-$(b).data("sort-time");
                });
                break;
        };
        $("#sort-items").html(items);
    });
});

/*
 * Override bootstrap and allow us to click on a dropdown menu parent
 * Don't do this on touch-screen devices.
 */
/*
 jQuery(function($) {
     if($(window).width() > 769) {
         $('.navbar .dropdown').hover(function() {
             $(this).find('.dropdown-menu').first().stop(true, true).delay(250).slideDown();
         }, function() {
             $(this).find('.dropdown-menu').first().stop(true, true).delay(100).slideUp();
         });
         $('.navbar .dropdown > a').click(function(){
             location.href = this.href;
         });
     }
 });
 */