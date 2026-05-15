function getInputs() {
  const wraps = document.querySelectorAll('.gpo-group__childs');
  const result = new Set();

  wraps.forEach(wrap => {
    const elements = wrap.querySelectorAll('.gpo-element');
    elements.forEach(el => {
      const btnValEl = el.querySelector('.dropdown-button__value');
      if (!btnValEl) return;
      const text = btnValEl.textContent.trim();
      if (!text) return;

      if (text.includes(',')) {
        const vals = text.split(',').map(v => v.trim());
        vals.forEach(v => {
          const inp = el.querySelector(`input[value="${v}"][gpo-data-variant-id]`);
          if (inp) result.add(inp);
        });
      } else {
        const inp = el.querySelector(`input[value="${text}"][gpo-data-variant-id]`);
        if (inp) result.add(inp);

        const checked = el.querySelector('input[previous-value="checked"][gpo-data-variant-id]');
        if (checked) result.add(checked);
      }
    });
  });

  return Array.from(result);
}

document.querySelectorAll('form[action="/cart/add"]').forEach(function(form) {
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType !== 1) return;
        const submitBtn = node.matches('button[type="submit"]') ? node : node.querySelector('button[type="submit"]');
        if (submitBtn && !submitBtn.dataset.cloneCreated) {
          submitBtn.style.display = 'none';
          submitBtn.dataset.cloneCreated = 'true';
          const newBtn = document.createElement('button');
          newBtn.setAttribute('type', 'button');
          newBtn.className = submitBtn.className;
          newBtn.innerHTML = submitBtn.innerHTML;
          newBtn.addEventListener('click', function() {
            const inputs = getInputs();

            console.log("Inputs: ", inputs);

            const mainVariant = form.querySelector('input[name="id"]')?.value;
            const qtyInput = form.querySelector('input[name="quantity"]');
            const quantity = qtyInput && qtyInput.value ? parseInt(qtyInput.value) : 1;
            const items = [];
            
            if (mainVariant) items.push({ id: parseInt(mainVariant), quantity });
            inputs.forEach(input => {
              const id = input.getAttribute('gpo-data-variant-id');
              if (id) items.push({ id: parseInt(id), quantity });
            });
            
            if (items.length) {
              fetch(window.Shopify.routes.root + 'cart/add.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items })
              }).then(() => {
                if (window.Spurit && window.Spurit.OneClickCheckout3 && window.Spurit.OneClickCheckout3.cartDrawer) {
                  const c = window.Spurit.OneClickCheckout3.cartDrawer;
                  c.show();
                  c.refresh();
                }
              });
            }
          });
          submitBtn.insertAdjacentElement('afterend', newBtn);
        }
      });
    });
  });
  observer.observe(form, { childList: true, subtree: true });
});

function updateCartCount() {
  fetch(window.Shopify.routes.root + 'cart.js')
    .then(r => r.json())
    .then(d => {
      const c = document.querySelector('#cart-counter .cart-count-badge');
      if (c) c.textContent = d.item_count;
    });
}
document.addEventListener('click', updateCartCount);
updateCartCount();
