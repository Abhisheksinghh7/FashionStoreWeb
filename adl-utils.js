// =============================
// ACDL Utilities
// =============================

// Initialize namespace
window.adl = window.adl || {};

window.adobeDataLayer = window.adobeDataLayer || [];

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
// Test Mode
// =============================
adl.testMode = false;
adl.enableTestMode = function(){adl.testMode=true; console.warn("ACDL Test Mode Enabled");};
adl.disableTestMode = function(){adl.testMode=false; console.warn("ACDL Test Mode Disabled");};


(function () {
  if (!window.adobeDataLayer) return;

  const originalPush = window.adobeDataLayer.push;

  window.adobeDataLayer.push = function () {
    for (let i = 0; i < arguments.length; i++) {
      const eventObj = arguments[i];

      // 🔍 Only log pageLoad events
      if (eventObj && eventObj.event === "pageLoad" && eventObj.xdm) {
        console.log("pageLoad event (XDM):", eventObj);
      }
    }

    return originalPush.apply(window.adobeDataLayer, arguments);
  };
})();