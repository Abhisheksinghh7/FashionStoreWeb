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
  "Watch": { productCategory: "electronics", productMaterial: "fiber", productRating: 4.7 },
  "Sunglasses": { productCategory: "accessories", productMaterial: "plastic", productRating: 4.2 },
  "Cap": { productCategory: "accessories", productMaterial: "cotton", productRating: 4.1 },
  "Backpack": { productCategory: "bags", productMaterial: "nylon", productRating: 4.5 }
};

// Normalize product safely
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
// ===== KING CODE ORIGINAL FUNCTIONS =====
// =======================================
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(product) {
  let cart = getCart();
  const existing = cart.find(i => i.id === product.id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      img: product.img,
      qty: 1,
      color: product.color || '',
      coupon: product.coupon || '',
      discount: product.discount || 0,
      category: product.category || '',
      sku: product.sku || 'SKU-' + product.id,
      size: product.size || ''
    });
  }

  saveCart(cart);

  window.adobeDataLayer = window.adobeDataLayer || [];
  const discountAmount = product.discount ? (product.price * product.discount / 100) : 0;

  window.adobeDataLayer.push({
    event: "addToCart",
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
          brand: "Fashion Store",
          _caterpillarsigns: product._caterpillarsigns || {}
        }]
      }
    },
    timestamp: new Date().toISOString()
  });

  // ⏳ allow AEP to process
  setTimeout(() => location.href = "cart.html", 300);
}

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
// 🛒 CART VIEW EVENT (ADDITIVE)
// =======================================
document.addEventListener("DOMContentLoaded", function () {
  if (!location.pathname.includes("cart.html")) return;

  const cart = getCart();
  if (!cart.length) return;

  const items = cart.map(i => {
    const p = normalizeProduct(i);
    return {
      SKU: p.sku || "SKU-" + p.id,
      name: p.name,
      priceTotal: p.price * p.qty,
      quantity: p.qty,
      currencyCode: "INR",
      productImageUrl: p.productImageUrl,
      _caterpillarsigns: p._caterpillarsigns
    };
  });

  window.adobeDataLayer.push({
    event: "cartView",
    xdm: {
      commerce: {
        productListItems: items
      }
    },
    timestamp: new Date().toISOString()
  });
});

// ===================================================
// ===== CHECKOUT PAGE FINAL VALIDATION & REDIRECT ====
// ===================================================
function validateCheckoutAndRedirect() {
  const cart = getCart();

  const custName = document.getElementById("custName");
  const custPhone = document.getElementById("custPhone");
  const custEmail = document.getElementById("custEmail");

  const modal = document.getElementById("modal");
  const mTitle = document.getElementById("mTitle");
  const mText = document.getElementById("mText");
  const okBtn = document.getElementById("okBtn");

  if (!modal) return;

  const name = custName?.value.trim();
  const phone = custPhone?.value.trim();
  const email = custEmail?.value.trim();
  const payment = document.querySelector('input[name="payment"]:checked');

  if (cart.length === 0) {
    mTitle.textContent = "Empty Cart";
    mText.textContent = "Please add products before checkout";
    modal.style.display = "flex";
    okBtn.onclick = () => location.href = "products.html";
    return;
  }

  if (!name || !phone || !email) {
    mTitle.textContent = "Missing Details";
    mText.textContent = "Please fill Name, Phone and Email";
    modal.style.display = "flex";
    okBtn.onclick = () => modal.style.display = "none";
    return;
  }

  if (!payment) {
    mTitle.textContent = "Payment Required";
    mText.textContent = "Please select a payment method";
    modal.style.display = "flex";
    okBtn.onclick = () => modal.style.display = "none";
    return;
  }

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
        productListItems: cart.map(i => {
          const p = normalizeProduct(i);
          return {
            SKU: p.sku || "SKU-" + p.id,
            name: p.name,
            priceTotal: p.price * p.qty,
            quantity: p.qty,
            productImageUrl: p.productImageUrl,
            currencyCode: "INR",
            _caterpillarsigns: p._caterpillarsigns
          };
        })
      }
    },
    timestamp: new Date().toISOString()
  });

  setTimeout(() => location.href = "payment-gateway.html", 300);
}

document.getElementById("placeOrderBtn")
  ?.addEventListener("click", validateCheckoutAndRedirect);


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


// =======================================
// 👀 PRODUCT VIEW (COMMERCE EVENT)
// =======================================
document.addEventListener("DOMContentLoaded", function () {
  if (!location.pathname.includes("product.html")) return;
  if (typeof window.currentProduct === "undefined") return;

  const p = normalizeProduct(window.currentProduct);

  window.adobeDataLayer.push({
    event: "prodView",
    xdm: {
      commerce: {
        productListItems: [{
          _id: p._id || "prod_" + p.id,
          SKU: p.sku || "SKU-" + p.id,

          name: p.name || "",
          product: "Default Product",

          brand: "Fashion Store",
          category: p.category || "",
          color: p.color || "",
          size: p.size || "",
          coupon: p.coupon || "",

          currencyCode: "INR",
          priceTotal: Number(p.price) || 0,
          quantity: 1,

          discountAmount: p.discount
            ? Number((p.price * p.discount) / 100)
            : 0,
          discountPercent: p.discount || 0,

          productAddMethod: "view",
          productImageUrl: p.productImageUrl || "",

          refundAmount: 0,
          unitOfMeasureCode: "EA",

          // ✅ custom nested object
          _caterpillarsigns: p._caterpillarsigns
        }]
      }
    },
    timestamp: new Date().toISOString()
  });
});
