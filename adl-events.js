// =============================
// ACDL Core Events
// =============================

// Page Load
adl.pageLoad = function(pageName,pageType){
  const ev = {
    event:"pageLoad",
    xdm:{
      web:{ webPageDetails: { pageName, pageType, pageUrl: location.href } }
    },
    custData:{ platform:"desktop web", loginStatus:"guest", language:"en", customerID:"" },
    timestamp:new Date().toISOString()
  };
  adl.push(ev);
};

// Link Click
adl.trackLinkClick = function(linkName, linkType, linkPosition, linkPageName){
  const ev = {
    event:"linkClicked",
    xdm:{
      web:{ webInteraction:{ linkName, linkType, linkPosition, linkPageName } }
    },
    timestamp:new Date().toISOString()
  };
  adl.push(ev);
};

// Cart / Thank You logging helper
adl.logCartArrays = function(cart){
  if(cart && cart.length>0){
    cart.forEach(p=>{
      console.log({id:p.id,name:p.name,color:p.color,price:p.price});
    });
  }
};