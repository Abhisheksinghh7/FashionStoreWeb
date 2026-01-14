// =======================================
// Cancel Order → Payment Failure Redirect
// SAFE EXTENSION (King Code untouched)
// =======================================

(function () {

  function initCancelOrder() {
    const cancelBtn = document.getElementById("cancelOrderBtn");

    if (!cancelBtn) {
      console.warn("Cancel Order button not found");
      return;
    }

    cancelBtn.addEventListener("click", function (e) {
      e.preventDefault(); // safety

      try {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];

        if (cart.length === 0) {
          location.href = "index.html";
          return;
        }

        const transactionId = "TXN_CANCEL_" + Date.now();

        // Persist data for failure page
        localStorage.setItem("checkoutCart", JSON.stringify(cart));
        localStorage.setItem("checkoutTransactionId", transactionId);
        localStorage.setItem("checkoutFailureReason", "user_cancelled");

        // ACDL event (optional but correct)
        window.adobeDataLayer = window.adobeDataLayer || [];
        window.adobeDataLayer.push({
          event: "orderCancelled",
          xdm: {
            commerce: {
              order: {
                orderID: transactionId,
                priceTotal: cart.reduce((s, i) => s + i.price * i.qty, 0)
              }
            }
          },
          timestamp: new Date().toISOString()
        });

        console.log("Order cancelled → redirecting to payment-failure");

        location.href = "payment-failure.html";

      } catch (err) {
        console.error("Cancel Order failed:", err);
        location.href = "index.html";
      }
    });
  }

  // Ensure DOM is fully ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCancelOrder);
  } else {
    initCancelOrder();
  }

})();

window.adlCancelOrder = function () {
  try {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (!cart.length) {
      console.warn("Cancel Order clicked but cart is empty");
      return;
    }

    const transactionId = localStorage.getItem("checkoutTransactionId") || ("CANCEL_" + Date.now());

    /* ===============================
       ACDL EVENT: orderCancelled
       =============================== */
    window.adobeDataLayer = window.adobeDataLayer || [];
    const eventObj = {
      event: "orderCancelled",
      xdm: {
        commerce: {
          order: {
            orderID: transactionId,
            priceTotal: cart.reduce((s, i) => s + i.price * i.qty, 0)
          }
        }
      },
      custData: {
        products: cart.map(i => ({
          productID: i.id,
          productName: i.name,
          productPrice: i.price,
          productColor: i.color || ""
        }))
      },
      timestamp: new Date().toISOString()
    };

    window.adobeDataLayer.push(eventObj);
    console.log("orderCancelled event:", eventObj);

    /* ===============================
       STORE DATA FOR FAILURE PAGE
       =============================== */
    localStorage.setItem("failedOrderCart", JSON.stringify(cart));
    localStorage.setItem("failedOrderId", transactionId);

    /* ===============================
       REDIRECT
       =============================== */
    location.href = "payment-failure.html";

  } catch (err) {
    console.error("Cancel Order failed:", err);
  }
};