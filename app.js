// =======================================
// 🔥 GLOBAL ADOBE DATA LAYER INIT (ADDITIVE)
// =======================================
window.adobeDataLayer = window.adobeDataLayer || [];

// Debug logger (non-breaking)
(function () {
  const originalPush = window.adobeDataLayer.push;
  window.adobeDataLayer.push = function () {
    console.log("🟢 adobeDataLayer.push →", arguments[0]);
    return originalPush.apply(this, arguments);
  };
})();

// =======================================
// 🧠 PRODUCT ENRICHMENT (ALL 8 PRODUCTS)
// =======================================
const PRODUCT_ENRICHMENT_MAP = {
  "T-Shirt": { productCategory: "fashion", productMaterial: "cotton", productRating: 4.4 },
  "Jeans": { productCategory: "fashion", productMaterial: "denim", productRating: 4.5 },
  "Shoes": { productCategory: "footwear", productMaterial: "leather", productRating: 4.6 },
  "Jacket": { productCategory: "fashion", productMaterial: "polyester", productRating: 4.3 },
  "Smartwatch": { productCategory: "electronics", productMaterial: "fiber", productRating: 4.7 },
  "Shirt": { productCategory: "fashion", productMaterial: "cotton", productRating: 4.2 },
  "Camera": { productCategory: "electronics", productMaterial: "fiber", productRating: 4.1 },
  "Headphone": { productCategory: "electronics", productMaterial: "fiber", productRating: 4.5 }
};

// =======================================
// 🧩 NORMALIZE PRODUCT (GLOBAL)
// =======================================
function normalizeProduct(product) {
  const name = product.name || product.productName || "";
  const img = product.img || product.productImageUrl || "";

  const enrich = PRODUCT_ENRICHMENT_MAP[name] || {};

  return {
    ...product,
    name,
    img,
    productImageUrl: img,
    _caterpillarsigns: {
      productCategory: enrich.productCategory || "unknown",
      productMaterial: enrich.productMaterial || "unknown",
      productRating: enrich.productRating || 0
    }
  };
}

// =======================================
// ♻️ ENSURE DATA EXISTS (ALL PAGES)
// =======================================
function ensureCaterpillarData(item) {
  if (!item._caterpillarsigns) {
    const enriched = normalizeProduct(item);
    item._caterpillarsigns = enriched._caterpillarsigns;
  }

  if (!item.productImageUrl) {
    item.productImageUrl = item.img || "";
  }

  if (!item.name) {
    item.name = item.productName || "";
  }

  return item;
}

// =======================================
// ===== KING CODE ORIGINAL FUNCTIONS =====
// =======================================
function getCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.forEach(ensureCaterpillarData);
  return cart;
}

function saveCart(cart) {
  cart.forEach(ensureCaterpillarData);
  localStorage.setItem("cart", JSON.stringify(cart));
}

// =======================================
// 🛒 ADD TO CART (SAFE + ENRICHED)
// =======================================
function addToCart(product) {
  let cart = getCart();
  const existing = cart.find(i => i.id === product.id);

  if (existing) {
    existing.qty += 1;
  } else {
    const enriched = normalizeProduct(product);

    cart.push({
      id: product.id,
      name: enriched.name,
      price: product.price,
      img: enriched.img,
      qty: 1,
      color: product.color || '',
      coupon: product.coupon || '',
      discount: product.discount || 0,
      category: product.category || '',
      sku: product.sku || 'SKU-' + product.id,
      size: product.size || '',
      productImageUrl: enriched.productImageUrl,
      _caterpillarsigns: enriched._caterpillarsigns
    });
  }

  saveCart(cart);

  const discountAmount = product.discount ? (product.price * product.discount / 100) : 0;

  window.adobeDataLayer.push({
    event: "addToCart",
    xdm: {
      commerce: {
        productListItems: [{
          SKU: product.sku || 'SKU-' + product.id,
          name: product.name || '',
          quantity: 1,
          priceTotal: product.price || 0,
          currencyCode: "INR",
          discountAmount: discountAmount,
          productImageUrl: product.img || '',
          _caterpillarsigns: normalizeProduct(product)._caterpillarsigns
        }]
      }
    },
    timestamp: new Date().toISOString()
  });

  setTimeout(() => location.href = "cart.html", 300);
}

// =======================================
// MINI CART
// =======================================
function updateMiniCart() {
  const cart = getCart();
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  const el = document.getElementById("miniCartCount");
  if (el) el.textContent = count;
}

function goToCart() {
  location.href = "cart.html";
}

document.addEventListener("DOMContentLoaded", updateMiniCart);

// =======================================
// 🛒 CART VIEW EVENT
// =======================================
document.addEventListener("DOMContentLoaded", function () {
  if (!location.pathname.includes("cart.html")) return;

  const cart = getCart();
  if (!cart.length) return;

  window.adobeDataLayer.push({
    event: "cartView",
    xdm: {
      commerce: {
        productListItems: cart.map(i => ({
          SKU: i.sku,
          name: i.name,
          quantity: i.qty,
          priceTotal: i.price * i.qty,
          currencyCode: "INR",
          productImageUrl: i.productImageUrl,
          _caterpillarsigns: i._caterpillarsigns
        }))
      }
    },
    timestamp: new Date().toISOString()
  });
});

// ===================================================
// ===== CHECKOUT PAGE FINAL EVENT ====================
// ===================================================
function validateCheckoutAndRedirect() {
  const cart = getCart();
  if (!cart.length) return;

  const transactionId = "TXN" + Date.now();
  const totalAmount = cart.reduce((s, i) => s + i.price * i.qty, 0);

  localStorage.setItem("checkoutCart", JSON.stringify(cart));
  localStorage.setItem("checkoutTransactionId", transactionId);

  window.adobeDataLayer.push({
    event: "orderPlaced",
    xdm: {
      commerce: {
        order: {
          orderID: transactionId,
          priceTotal: totalAmount
        },
        productListItems: cart.map(i => ({
          SKU: i.sku,
          name: i.name,
          quantity: i.qty,
          priceTotal: i.price * i.qty,
          currencyCode: "INR",
          productImageUrl: i.productImageUrl,
          _caterpillarsigns: i._caterpillarsigns
        }))
      }
    },
    timestamp: new Date().toISOString()
  });

  setTimeout(() => location.href = "payment-gateway.html", 300);
}

document
  .getElementById("placeOrderBtn")
  ?.addEventListener("click", validateCheckoutAndRedirect);

// =======================================
// 🎉 THANK YOU PAGE EVENT
// =======================================
document.addEventListener("DOMContentLoaded", function () {
  if (!location.pathname.includes("thankyou")) return;

  const cart = JSON.parse(localStorage.getItem("checkoutCart")) || [];
  if (!cart.length) return;

  cart.forEach(ensureCaterpillarData);

  window.adobeDataLayer.push({
    event: "purchase",
    xdm: {
      commerce: {
        productListItems: cart.map(i => ({
          SKU: i.sku,
          name: i.name,
          quantity: i.qty,
          priceTotal: i.price * i.qty,
          currencyCode: "INR",
          productImageUrl: i.productImageUrl,
          _caterpillarsigns: i._caterpillarsigns
        }))
      }
    },
    timestamp: new Date().toISOString()
  });
});

// ================================
// GLOBAL CLICK TRACKING (UNCHANGED)
// ================================
document.addEventListener("DOMContentLoaded", function () {
  document.body.addEventListener("click", function (e) {
    const el = e.target.closest("a,button");
    if (!el) return;

    window.adobeDataLayer.push({
      event: "linkClicked",
      xdm: {
        web: {
          webInteraction: {
            linkName: el.innerText?.trim() || "",
            linkType: el.tagName,
            linkPosition: "body",
            linkPageName: document.title,
            linkURL: el.getAttribute("href") || ""
          }
        }
      },
      timestamp: new Date().toISOString()
    });
  });
});

