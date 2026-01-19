// ===== KING CODE ORIGINAL FUNCTIONS =====
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
          brand: "Fashion Store"
        }]
      }
    },
    timestamp: new Date().toISOString()
  });

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
            name: i.name || '',
            priceTotal: i.price * i.qty,
            product: "Default Product",
            productAddMethod: "cart",
            productImageUrl: i.img || i.productImageUrl || '',
            quantity: i.qty || 1,
            refundAmount: 0,
            unitOfMeasureCode: "EA",
            _id: i._id || 'prod_' + i.id,
            color: i.color || '',
            coupon: i.coupon || '',
            category: i.category || '',
            size: i.size || '',
            brand: "Fashion Store"
          };
        })
      }
    },
    timestamp: new Date().toISOString()
  });

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
