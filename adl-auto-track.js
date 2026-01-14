// =============================
// Auto Tracking via HTML
// =============================
document.addEventListener("DOMContentLoaded",function(){

  // Auto track all data-track-link elements
  document.body.addEventListener("click",function(e){
    const el = e.target.closest("[data-track-link]");
    if(!el) return;

    const linkName = el.dataset.trackLink || "";
    const linkType = el.dataset.linkType || el.tagName;
    let linkPosition="content";

    if(el.closest("header")) linkPosition="header";
    else if(el.closest("footer")) linkPosition="footer";
    else if(el.closest(".hero")) linkPosition="hero";
    else if(el.closest(".products")) linkPosition="product_listing";
    else if(el.closest(".cart-item")) linkPosition="cart";

    const linkPageName = document.title;

    adl.trackLinkClick(linkName, linkType, linkPosition, linkPageName);
  });

});