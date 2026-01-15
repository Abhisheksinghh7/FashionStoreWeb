// =============================
// Adobe Data Layer Core Events
// =============================

// ✅ Page Loaded Event
// Fires on every page with page-level metadata only
adl.firePageLoaded = function(pageName, pageType, brand = "aurora") {
  window.adl.trackPageLoaded(pageName, pageType, brand);
};

// ✅ Link Clicked Event
// Tracks navigation links, CTAs, banners (NOT Add to Cart)
adl.fireLinkClicked = function(linkName, linkType, linkPosition, linkPageName) {
  window.adl.trackLinkClick(linkName, linkType, linkPosition, linkPageName);
};

// ✅ Add to Cart Event
// Tracks when a product is added to cart (commerce event)
adl.fireAddToCart = function(product) {
  window.adl.trackAddToCart(product);
};

// ✅ Remove from Cart Event
// Tracks when a product is removed from cart
adl.fireRemoveFromCart = function(product) {
  // 1. Fire linkClicked with removeFromCart linkType
  window.adl.trackLinkClick(
    'remove ' + (product.name || product.productName),
    'removeFromCart',
    'cart-table',
    'cart'
  );
  
  // 2. Fire removeFromCart commerce event
  window.adl.trackRemoveFromCart(product);
};

// ✅ Shopping Cart View Event
// Fires when cart page loads with all cart contents
adl.fireShoppingCartView = function(cart) {
  window.adl.trackShoppingCartView(cart, 'cart');
};

// ✅ Begin Checkout Event
// Tracks when user begins checkout process
adl.fireBeginCheckout = function(cart) {
  window.adl.trackBeginCheckout(cart);
};

// ✅ Checkout View Event
// Fires on checkout page with cart contents
adl.fireCheckoutView = function(cart) {
  window.adl.trackCheckout(cart);
};

// ✅ Purchase Event
// Tracks successful order completion with full order details
adl.firePurchase = function(order) {
  window.adl.trackPurchase(order);
};