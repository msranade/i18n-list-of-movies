/**
 * This module handles the Movie details popover that is shown when user 
 * hovers over the boxart.
 * 
 * @author Manish Ranade
 */

var NF = window.NF || {};

$.extend(NF, { "Lolomo": {} });

NF.Lolomo = (function() {
  
  /**
   * This function returns what to show inside of a popover.
   * It makes use of the data attribute (data-bs-wide) on the image tag to grab
   * the wider version of the boxart and renders it inside of a popover.
   * 
   */
  function getPopoverContent() {
    var wide_img = $(this).data('bs-wide');
    var html = '<img src="' + wide_img + '" width:"350" height="197" />';
    return html; 
  }
  
  /**
   * This function initializes the module.
   * Makes use of Twitter Bootstrap Popover to create an overlay experience.
   * Popover is shown when user hovers over the elements that have ".boxart" css class.
   * 
   */
  function init() {
    $(".boxart").popover({
      content: getPopoverContent,
      trigger: 'hover',
      html: true,
      container: 'body',
      viewport: ".content-wrap",
      placement: "auto"
    });
  }
  
  return {
    init: init
  }
  
}());

$('document').ready(NF.Lolomo.init);
