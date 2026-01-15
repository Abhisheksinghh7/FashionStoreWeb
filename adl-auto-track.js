// =============================
// Auto Tracking via HTML Attributes
// =============================
document.addEventListener("DOMContentLoaded",function(){

  // Auto track all data-track-link elements
  document.body.addEventListener("click",function(e){
    const el = e.target.closest("[data-track-link]");
    if(!el) return;

    const linkName = el.dataset.trackLink || "";
    const linkType = el.dataset.linkType || "nav";
    let linkPosition = "content";

    // Determine position based on closest parent
    if(el.closest("header")) linkPosition = "header";
    else if(el.closest("footer")) linkPosition = "footer";
    else if(el.closest(".hero")) linkPosition = "hero";
    else if(el.closest(".products")) linkPosition = "plp-grid";
    else if(el.closest(".cart-items")) linkPosition = "cart-table";
    else if(el.closest(".product-detail")) linkPosition = "pdp";

    // Get page name from document title
    const linkPageName = document.title.toLowerCase().replace("fashion store - ", "").replace("fashionstore", "").trim() || "home";

    // Fire the link click event
    if (window.adl && window.adl.trackLinkClick) {
      window.adl.trackLinkClick(linkName, linkType, linkPosition, linkPageName);
    }
  });

});

// =============================
// Add to Cart Auto Tracking
// =============================
// Override the addToCart function if it exists in app.js
if (typeof addToCart !== 'undefined') {
  const originalAddToCart = window.addToCart;
  window.addToCart = function(id) {
    // Call original function
    originalAddToCart(id);
    
    // Fire ADL Add to Cart event
    const product = getProductById(id);
    if (product && window.adl && window.adl.trackAddToCart) {
      window.adl.trackAddToCart({
        sku: 'SKU-' + product.id,
        productID: 'AUR-' + product.id,
        productName: product.name,
        brand: 'aurora',
        category: 'fashion',
        color: product.color || '',
        size: '',
        price: product.price,
        quantity: 1,
        linkPosition: 'pdp-add-to-cart',
        linkType: 'cta'
      });
    }
  };
}