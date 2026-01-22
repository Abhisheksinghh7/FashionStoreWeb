// ===== KING CODE ORIGINAL FUNCTIONS =====
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

/* ======================================================
   🔵 ADDITION: PRODUCT ATTRIBUTE MASTER (ALL 8 PRODUCTS)
   ====================================================== */
function getProductAttributesById(id) {
  const map = {
    1: { productCategory: "fashion", productMaterial: "cotton", productRating: 4.2 }, // T-Shirt
    2: { productCategory: "fashion", productMaterial: "denim", productRating: 4.3 }, // Jeans
    3: { productCategory: "fashion", productMaterial: "polyester", productRating: 4.5 }, // Jacket
    4: { productCategory: "footwear", productMaterial: "leather", productRating: 4.4 }, // Shoes
    5: { productCategory: "fashion", productMaterial: "cotton", productRating: 4.1 }, // Shirt
    6: { productCategory: "electronics", productMaterial: "plastic", productRating: 4.6 }, // Camera
    7: { productCategory: "electronics", productMaterial: "plastic", productRating: 4.3 }, // Headphone
    8: { productCategory: "electronics", productMaterial: "fiber", productRating: 4.6 } // Smartwatch
  };

  return map[id] || {
    productCategory: "others",
    productMaterial: "",
    productRating: 0
  };
}

/* ======================================================
   🔵 ADDITION: SAFE PRODUCT NORMALIZER
   ====================================================== */
function normalizeProduct(item) {
  const catalog = window.adl?.productCatalog?.[item.id] || {};
  return {
    id: item.id,
    name: item.name || catalog.name || "",
    img: item.img || catalog.img || "",
    price: item.price || catalog.price || 0
  };
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
          productImageUrl: product.img || '',
          quantity: 1,
          refundAmount: 0,
          unitOfMeasureCode: "EA",
          _id: 'prod_' + product.id,
          brand: "Fashion Store"
        }]
      }
    },
    timestamp: new Date().toISOString()
  });

  location.href = "cart.html";
}

/* ======================================================
   🔵 ADDITION: ENRICH productListItems BEFORE ORDER
   ====================================================== */
function enrichProductListItems(cart) {
  return cart.map(i => {
    const normalized = normalizeProduct(i);
    const attrs = getProductAttributesById(i.id);
    const discountAmount = i.discount ? (i.price * i.discount / 100) : 0;

    return {
      _id: 'prod_' + i.id,
      SKU: i.sku || 'SKU-' + i.id,
      name: normalized.name,
      product: "Default Product",
      quantity: i.qty || 1,
      currencyCode: "INR",
      priceTotal: i.price * i.qty,
      discountAmount: discountAmount,
      productAddMethod: "cart",
      productImageUrl: normalized.img,
      unitOfMeasureCode: "EA",
      returnItem: { refundAmount: 0 },
      productCategories: [],
      selectedOptions: [],
      _experience: { standard: {} },

      /* 🔥 CUSTOM NESTED OBJECT */
      _caterpillarsigns: {
        productCategory: attrs.productCategory,
        productMaterial: attrs.productMaterial,
        productRating: attrs.productRating
      }
    };
  });
}

// ===================================================
// ===== CHECKOUT PAGE FINAL VALIDATION & REDIRECT ====
// ===================================================
function validateCheckoutAndRedirect() {
  const cart = getCart();

  if (!cart.length) return;

  const transactionId = "TXN" + Date.now();
  const totalAmount = cart.reduce((s, i) => s + i.price * i.qty, 0);

  localStorage.setItem("checkoutCart", JSON.stringify(cart));
  localStorage.setItem("checkoutTransactionId", transactionId);

  const enrichedItems = enrichProductListItems(cart);

  window.adobeDataLayer = window.adobeDataLayer || [];
  window.adobeDataLayer.push({
    event: "orderPlaced",
    xdm: {
      commerce: {
        order: {
          orderID: transactionId,
          priceTotal: totalAmount
        },
        productListItems: enrichedItems
      }
    },
    timestamp: new Date().toISOString()
  });

  location.href = "payment-gateway.html";
}

document
  .getElementById("placeOrderBtn")
  ?.addEventListener("click", validateCheckoutAndRedirect);
