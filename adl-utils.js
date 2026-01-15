// =============================
// Adobe Data Layer Utilities
// =============================

// Initialize namespace
window.adl = window.adl || {};
window.adobeDataLayer = window.adobeDataLayer || [];

// =============================
// Helper: Get website info
// =============================
window.adl.getWebsiteInfo = function() {
  return {
    brand: "Fashion Store",
    platform: "desktop website"
  };
};

// =============================
// Helper: Product Reference Catalog
// =============================
window.adl.productCatalog = {
  1: { id: 1, name: "T-Shirt", price: 799, discount: 10, coupon: "TSHIRT10", img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800", color: "Red", category: "Apparel" },
  2: { id: 2, name: "Jeans", price: 1999, discount: 5, coupon: "JEANS5", img: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800", color: "Blue", category: "Apparel" },
  3: { id: 3, name: "Jacket", price: 3499, discount: 15, coupon: "JACKET15", img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800", color: "Black", category: "Apparel" },
  4: { id: 4, name: "Shoes", price: 2499, discount: 20, coupon: "SHOES20", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800", color: "White", category: "Footwear" },
  5: { id: 5, name: "Shirt", price: 1499, discount: 0, coupon: "", img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800", color: "Grey", category: "Apparel" },
  6: { id: 6, name: "Camera", price: 45999, discount: 5, coupon: "CAMERA5", img: "https://images.unsplash.com/photo-1516724562728-afc824a36e84?w=800", color: "Black", category: "Electronics" },
  7: { id: 7, name: "Headphone", price: 2999, discount: 10, coupon: "HEAD10", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800", color: "Blue", category: "Electronics" },
  8: { id: 8, name: "Smartwatch", price: 9999, discount: 0, coupon: "", img: "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800", color: "Black", category: "Electronics" }
};

// Helper to merge cart item with catalog data
window.adl.getCompleteProductData = function(cartItem) {
  const catalogData = window.adl.productCatalog[cartItem.id] || {};
  return {
    id: cartItem.id,
    name: cartItem.name || catalogData.name || '',
    price: cartItem.price || catalogData.price || 0,
    discount: cartItem.discount !== undefined ? cartItem.discount : (catalogData.discount || 0),
    coupon: cartItem.coupon || catalogData.coupon || '',
    img: cartItem.img || catalogData.img || '',
    color: cartItem.color || catalogData.color || '',
    category: cartItem.category || catalogData.category || '',
    sku: cartItem.sku || ('SKU-' + cartItem.id),
    size: cartItem.size || '',
    qty: cartItem.qty || 1
  };
};

// =============================
// Debug Storage (last 20 events)
// =============================
adl.debug = {
  maxEvents: 20,
  saveEvent: function(ev){
    try{
      let arr = JSON.parse(sessionStorage.getItem("acdl_debug_events"))||[];
      arr.push(ev);
      if(arr.length>this.maxEvents) arr.shift();
      sessionStorage.setItem("acdl_debug_events", JSON.stringify(arr));
    }catch(e){console.error("ACDL Debug Save Error:",e);}
  },
  getAll: function(){return JSON.parse(sessionStorage.getItem("acdl_debug_events"))||[];},
  getLast: function(){let a=this.getAll(); return a[a.length-1]||null;},
  getByEvent: function(name){return this.getAll().filter(ev=>ev.event===name);}
};

// =============================
// Push Event (safe)
// =============================
adl.push = function(ev){
  try{
    window.adobeDataLayer.push(ev);
    adl.debug.saveEvent(ev);
    console.log(ev.event+" event pushed:", ev);
  }catch(e){console.error("ACDL Push Error:",e);}
};

// =============================
// Link Clicked Event
// =============================
window.adl.trackLinkClick = function(linkName, linkType, linkPosition, linkPageName) {
  const websiteInfo = window.adl.getWebsiteInfo();
  const eventData = {
    event: "linkClicked",
    custData: {
      loginStatus: "guest",
      platform: websiteInfo.platform,
      customerID: "",
      lang: "english"
    },
    xdmActionDetails: {
      web: {
        webInteraction: {
          brand: websiteInfo.brand,
          channel: "web|" + linkPageName,
          linkName: linkName,
          linkType: linkType,
          linkPosition: linkPosition,
          linkPageName: linkPageName
        }
      }
    }
  };
  adl.push(eventData);
};

// =============================
// Add to Cart Event
// =============================
window.adl.trackAddToCart = function(product) {
  const websiteInfo = window.adl.getWebsiteInfo();
  const discountAmount = product.discount ? (product.price * product.discount / 100) : 0;
  const eventData = {
    event: "addToCart",
    timestamp: new Date().toISOString(),
    custData: {
      customerID: "",
      lang: "english",
      loginStatus: "guest",
      platform: websiteInfo.platform
    },
    xdm: {
      commerce: {
        productListItems: [{
          SKU: product.sku || 'SKU-' + product.id,
          currencyCode: "INR",
          discountAmount: discountAmount,
          discountPercent: product.discount || 0,
          name: product.name || '',
          priceTotal: product.price || 0,
          product: "Default Product",
          productAddMethod: "cart",
          productImageUrl: product.img || product.productImageUrl || '',
          quantity: product.quantity || 1,
          refundAmount: 0,
          unitOfMeasureCode: "EA",
          _id: product._id || 'prod_' + product.id,
          color: product.color || '',
          coupon: product.coupon || '',
          category: product.category || '',
          size: product.size || '',
          brand: websiteInfo.brand
        }]
      }
    }
  };

  adl.push(eventData);
};

// =============================
// Remove from Cart Event
// =============================
window.adl.trackRemoveFromCart = function(product) {
  const websiteInfo = window.adl.getWebsiteInfo();
  const discountAmount = product.discount ? (product.price * product.discount / 100) : 0;
  const eventData = {
    event: "removeFromCart",
    timestamp: new Date().toISOString(),
    custData: {
      customerID: "",
      lang: "english",
      loginStatus: "guest",
      platform: websiteInfo.platform
    },
    xdm: {
      commerce: {
        productListItems: [{
          SKU: product.sku || 'SKU-' + product.id,
          currencyCode: "INR",
          discountAmount: discountAmount,
          discountPercent: product.discount || 0,
          name: product.name || '',
          priceTotal: product.price || 0,
          product: "Default Product",
          productAddMethod: "cart",
          productImageUrl: product.img || product.productImageUrl || '',
          quantity: product.quantity || 1,
          refundAmount: 0,
          unitOfMeasureCode: "EA",
          _id: product._id || 'prod_' + product.id,
          color: product.color || '',
          coupon: product.coupon || '',
          category: product.category || '',
          size: product.size || '',
          brand: websiteInfo.brand
        }]
      }
    }
  };
  adl.push(eventData);
};

// =============================
// Shopping Cart View Event
// =============================
window.adl.trackShoppingCartView = function(cart, pageName) {
  const websiteInfo = window.adl.getWebsiteInfo();
  const eventData = {
    event: "scView",
    timestamp: new Date().toISOString(),
    custData: {
      customerID: "",
      lang: "english",
      loginStatus: "guest",
      platform: websiteInfo.platform
    },
    xdm: {
      commerce: {
        productListItems: (cart.products || cart || []).map(p => {
          const complete = window.adl.getCompleteProductData(p);
          const discountAmount = complete.discount ? (complete.price * complete.discount / 100) : 0;
          return {
            SKU: complete.sku,
            currencyCode: "INR",
            discountAmount: discountAmount,
            discountPercent: complete.discount,
            name: complete.name,
            priceTotal: complete.price,
            product: "Default Product",
            productAddMethod: "cart",
            productImageUrl: complete.img,
            quantity: complete.qty,
            refundAmount: 0,
            unitOfMeasureCode: "EA",
            _id: 'prod_' + complete.id,
            color: complete.color,
            coupon: complete.coupon,
            category: complete.category,
            size: complete.size,
            brand: websiteInfo.brand
          };
        })
      }
    }
  };
  adl.push(eventData);
};

// =============================
// Begin Checkout Event
// =============================
window.adl.trackBeginCheckout = function(cart) {
  const websiteInfo = window.adl.getWebsiteInfo();
  const eventData = {
    event: "beginCheckout",
    custData: {
      customerID: "",
      lang: "english",
      loginStatus: "guest",
      platform: websiteInfo.platform
    },
    xdmCommerce: {
      checkout: {
        totalQuantity: cart.totalQuantity || 0,
        totalValue: cart.totalValue || 0
      }
    }
  };
  adl.push(eventData);
};

// =============================
// Checkout View Event
// =============================
window.adl.trackCheckout = function(cart) {
  const websiteInfo = window.adl.getWebsiteInfo();
  const eventData = {
    event: "scCheckout",
    timestamp: new Date().toISOString(),
    custData: {
      customerID: "",
      lang: "english",
      loginStatus: "guest",
      platform: websiteInfo.platform
    },
    xdm: {
      commerce: {
        productListItems: (cart.products || cart || []).map(p => {
          const complete = window.adl.getCompleteProductData(p);
          const discountAmount = complete.discount ? (complete.price * complete.discount / 100) : 0;
          return {
            SKU: complete.sku,
            currencyCode: "INR",
            discountAmount: discountAmount,
            discountPercent: complete.discount,
            name: complete.name,
            priceTotal: complete.price * complete.qty,
            product: "Default Product",
            productAddMethod: "cart",
            productImageUrl: complete.img,
            quantity: complete.qty,
            refundAmount: 0,
            unitOfMeasureCode: "EA",
            _id: 'prod_' + complete.id,
            color: complete.color,
            coupon: complete.coupon,
            category: complete.category,
            size: complete.size,
            brand: websiteInfo.brand
          };
        })
      }
    }
  };
  adl.push(eventData);
};

// =============================
// Purchase Event
// =============================
window.adl.trackPurchase = function(order) {
  const websiteInfo = window.adl.getWebsiteInfo();
  const eventData = {
    event: "scPurchase",
    timestamp: new Date().toISOString(),
    custData: {
      customerID: order.customerEmail || "",
      lang: "english",
      loginStatus: "guest",
      platform: websiteInfo.platform
    },
    xdm: {
      commerce: {
        orderID: order.orderID || "",
        productListItems: (order.products || order || []).map(p => {
          const complete = window.adl.getCompleteProductData(p);
          const discountAmount = complete.discount ? (complete.price * complete.discount / 100) : 0;
          return {
            SKU: complete.sku,
            currencyCode: "INR",
            discountAmount: discountAmount,
            discountPercent: complete.discount,
            name: complete.name,
            priceTotal: complete.price * complete.qty,
            product: "Default Product",
            productAddMethod: "cart",
            productImageUrl: complete.img,
            quantity: complete.qty,
            refundAmount: 0,
            unitOfMeasureCode: "EA",
            _id: 'prod_' + complete.id,
            color: complete.color,
            coupon: complete.coupon,
            category: complete.category,
            size: complete.size,
            brand: websiteInfo.brand
          };
        })
      }
    }
  };
  adl.push(eventData);
};

// =============================
// Page Loaded Event
// =============================
window.adl.trackPageLoaded = function(pageName, pageType) {
  const websiteInfo = window.adl.getWebsiteInfo();
  const eventData = {
    event: "pageLoaded",
    xdmPageLoad: {
      custData: {
        customerID: "",
        lang: "english",
        loginStatus: "guest",
        platform: websiteInfo.platform
      },
      web: {
        webPageDetails: {
          brand: websiteInfo.brand,
          channel: "web|" + pageType,
          pageName: pageName,
          pageType: pageType,
          pageUrl: window.location.href
        }
      }
    }
  };
  adl.push(eventData);
};

// =============================
// Test Mode
// =============================
adl.testMode = false;
adl.enableTestMode = function(){adl.testMode=true; console.warn("ACDL Test Mode Enabled");};
adl.disableTestMode = function(){adl.testMode=false; console.warn("ACDL Test Mode Disabled");};

// =============================
// Console Logging (Development)
// =============================
(function () {
  if (!window.adobeDataLayer) return;

  const originalPush = window.adobeDataLayer.push;

  window.adobeDataLayer.push = function () {
    for (let i = 0; i < arguments.length; i++) {
      const eventObj = arguments[i];

      // 🔍 Log all events in development
      if (eventObj && eventObj.event) {
        console.log("ADL Event: " + eventObj.event, eventObj);
      }
    }

    return originalPush.apply(window.adobeDataLayer, arguments);
  };
})();