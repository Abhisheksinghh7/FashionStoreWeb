// ===== PRODUCT CATALOG WITH EXTENDED DETAILS =====
const productCatalog = {
  1: { id: 1, name: "T-Shirt", price: 799, discount: 10, coupon: "TSHIRT10", img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800", color: "Red", category: "Apparel", productCategory: "fashion", productMaterial: "cotton", productRating: 4 },
  2: { id: 2, name: "Jeans", price: 1999, discount: 5, coupon: "JEANS5", img: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800", color: "Blue", category: "Apparel", productCategory: "fashion", productMaterial: "denim", productRating: 5 },
  3: { id: 3, name: "Jacket", price: 3499, discount: 15, coupon: "JACKET15", img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800", color: "Black", category: "Apparel", productCategory: "fashion", productMaterial: "polyester", productRating: 4.7 },
  4: { id: 4, name: "Shoes", price: 2499, discount: 20, coupon: "SHOES20", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800", color: "White", category: "Footwear", productCategory: "footwear", productMaterial: "leather", productRating: 4.4 },
  5: { id: 5, name: "Shirt", price: 1499, discount: 0, coupon: "", img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800", color: "Grey", category: "Apparel", productCategory: "fashion", productMaterial: "cotton", productRating: 4.2 },
  6: { id: 6, name: "Camera", price: 45999, discount: 5, coupon: "CAMERA5", img: "https://images.unsplash.com/photo-1516724562728-afc824a36e84?w=800", color: "Black", category: "Electronics", productCategory: "electronics", productMaterial: "plastic", productRating: 4.8 },
  7: { id: 7, name: "Headphone", price: 2999, discount: 10, coupon: "HEAD10", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800", color: "Blue", category: "Electronics", productCategory: "electronics", productMaterial: "plastic", productRating: 4.6 },
  8: { id: 8, name: "Smartwatch", price: 9999, discount: 0, coupon: "", img: "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800", color: "Black", category: "Electronics", productCategory: "electronics", productMaterial: "metal", productRating: 4.5 }
};

// ===== PRODUCT LIST ITEMS CONSOLE LOGGING =====
function logProductListItems() {
  const dataLayer = window.adobeDataLayer || [];
  if (dataLayer.length === 0) return;

  // Get the last entry in dataLayer
  const lastEntry = dataLayer[dataLayer.length - 1];
  const productItems = lastEntry?.xdm?.commerce?.productListItems || [];

  if (productItems.length > 0) {
    const logData = productItems.map(item => ({
      SKU: item.SKU,
      name: item.name,
      priceTotal: item.priceTotal,
      quantity: item.quantity,
      _caterpillarsigns: item._caterpillarsigns
    }));

    console.log("📦 Captured Product List Items:", logData);
    console.table(logData);
  }
}

// ===== KING CODE ORIGINAL FUNCTIONS =====
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(product) {
  // Parse product if it's a string (from JSON.stringify in onclick)
  if (typeof product === 'string') {
    product = JSON.parse(product);
  }

  // Merge with catalog details to get extended product info
  const catalogProduct = productCatalog[product.id] || {};
  const completeProduct = {
    ...product,
    productCategory: catalogProduct.productCategory || product.category || '',
    productMaterial: catalogProduct.productMaterial || '',
    productRating: catalogProduct.productRating || 0
  };

  // Ensure product has all required fields
  if (!completeProduct.id) {
    console.error("ERROR: Product missing ID", completeProduct);
    alert("Invalid product. Please try again.");
    return;
  }

  console.log("✅ addToCart called with product:", completeProduct);

  let cart = getCart();
  const existing = cart.find(i => i.id === completeProduct.id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: completeProduct.id,
      name: completeProduct.name,
      price: completeProduct.price,
      img: completeProduct.img,
      qty: 1,
      color: completeProduct.color || '',
      coupon: completeProduct.coupon || '',
      discount: completeProduct.discount || 0,
      category: completeProduct.category || '',
      sku: completeProduct.sku || 'SKU-' + completeProduct.id,
      size: completeProduct.size || '',
      productCategory: completeProduct.productCategory,
      productMaterial: completeProduct.productMaterial,
      productRating: completeProduct.productRating
    });
  }

  saveCart(cart);
  console.log("✅ Product saved to cart. Updated cart:", cart);

  window.adobeDataLayer = window.adobeDataLayer || [];
  const discountAmount = completeProduct.discount ? (completeProduct.price * completeProduct.discount / 100) : 0;
  
  const productListItem = {
    SKU: completeProduct.sku || 'SKU-' + completeProduct.id,
    currencyCode: "INR",
    discountAmount: discountAmount,
    discountPercent: completeProduct.discount || 0,
    name: completeProduct.name,
    priceTotal: completeProduct.price,
    product: "Default Product",
    productAddMethod: "cart",
    productImageUrl: completeProduct.img || completeProduct.productImageUrl || '',
    quantity: 1,
    refundAmount: 0,
    unitOfMeasureCode: "EA",
    color: completeProduct.color || '',
    coupon: completeProduct.coupon || '',
    category: completeProduct.category || '',
    size: completeProduct.size || '',
    brand: "Fashion Store",
    _caterpillarsigns: {
      productCategory: completeProduct.productCategory,
      productMaterial: completeProduct.productMaterial,
      productRating: completeProduct.productRating
    }
  };

  console.log("📦 ProductListItem being pushed:", productListItem);
  
  window.adobeDataLayer.push({
    event: "addToCart",
    xdm: {
      commerce: {
        productListItems: [productListItem]
      }
    },
    timestamp: new Date().toISOString()
  });

  console.log("✅ DataLayer event pushed");
  logProductListItems();
  location.href = "cart.html";
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
  localStorage.setItem("checkoutPaymentMethod", payment.value);
  localStorage.setItem("checkoutCustomerEmail", email);
  localStorage.setItem("checkoutCustomerName", name);
  localStorage.setItem("checkoutCustomerPhone", phone);

  /* ❌ OLD getProductListItems - COMMENTED (using new XDM version instead)
  function getProductListItems() {
    return cart.map(i => ({
      SKU: String(i.id),
      name: i.name,
      priceTotal: i.price * i.qty,
      quantity: i.qty
    }));
  }
  */

  window.adobeDataLayer = window.adobeDataLayer || [];
  window.adobeDataLayer.push({
    event: "orderPlaced",
    xdm: {
      commerce: {
        order: {
          orderID: transactionId,
          priceTotal: totalAmount
        },
        productListItems: cart.map(i => {
          const discountAmount = i.discount ? (i.price * i.discount / 100) : 0;
          return {
            SKU: i.sku || 'SKU-' + i.id,
            currencyCode: "INR",
            discountAmount: discountAmount,
            discountPercent: i.discount || 0,
            name: i.name,
            priceTotal: i.price * i.qty,
            product: "Default Product",
            productAddMethod: "cart",
            productImageUrl: i.img || i.productImageUrl || '',
            quantity: i.qty,
            refundAmount: 0,
            unitOfMeasureCode: "EA",
            color: i.color || '',
            coupon: i.coupon || '',
            category: i.category || '',
            size: i.size || '',
            brand: "Fashion Store",
            _caterpillarsigns: {
              productCategory: i.productCategory || '',
              productMaterial: i.productMaterial || '',
              productRating: i.productRating || 0
            }
          };
        })
      }
    },
    timestamp: new Date().toISOString()
  });

  logProductListItems();
  location.href = "payment-gateway.html";
}

document
  .getElementById("placeOrderBtn")
  ?.addEventListener("click", validateCheckoutAndRedirect);


// ================================
// GLOBAL CLICK TRACKING (XDM-ONLY)
// ================================
document.addEventListener("DOMContentLoaded", function () {

  document.body.addEventListener("click", function (e) {
    const el = e.target.closest("a,button");
    if (!el) return;

    let linkPosition = "body";
    if (el.closest("header")) linkPosition = "header";
    else if (el.closest("footer")) linkPosition = "footer";
    else if (el.closest(".hero")) linkPosition = "hero";
    else if (el.closest(".products")) linkPosition = "product_listing";
    else if (el.closest(".cart-item")) linkPosition = "cart";
    else if (el.closest(".container")) linkPosition = "content";

    window.adobeDataLayer = window.adobeDataLayer || [];

    window.adobeDataLayer.push({
      event: "linkClicked",
      xdm: {
        web: {
          webInteraction: {
            linkName: el.innerText?.trim() || "",
            linkType: el.tagName,
            linkPosition: linkPosition,
            linkPageName: document.title,
            linkURL: el.getAttribute("href") || ""
          }
        }
      },
      timestamp: new Date().toISOString()
    });

  });


});
