export const openCartModal = () => {
  // Vérifier si nous sommes côté client
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }
  
  const bootstrap = require("bootstrap"); // dynamically import bootstrap
  const modalElements = document.querySelectorAll(".modal.show");
  modalElements.forEach((modal) => {
    const modalInstance = bootstrap.Modal.getInstance(modal);
    if (modalInstance) {
      modalInstance.hide();
    }
  });

  
  // Close any open offcanvas
  const offcanvasElements = document.querySelectorAll(".offcanvas.show");
  offcanvasElements.forEach((offcanvas) => {
    const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvas);
    if (offcanvasInstance) {
      offcanvasInstance.hide();
    }
  });
  
  const cartElement = document.getElementById("shoppingCart");
  if (!cartElement) {
    return;
  }
  
  var myModal = new bootstrap.Modal(cartElement, {
    keyboard: false,
  });

  myModal.show();
  cartElement.addEventListener("hidden.bs.modal", () => {
    myModal.hide();
  });
};
