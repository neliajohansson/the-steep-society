const STORAGE_KEY = "steepSocietyCart";

/* Product data (base). */
const PRODUCTS = [
  {
    id: "juniper-01",
    name: "Lady Juniper",
    subtitle: "The Highland Wanderer",
    notes: "Earthy, floral, lightly smoked — with grounding elderflower.",
    price: 109,
    image: "Images/juniper.JPG", // Original illustration
  },
  {
    id: "marigold-01",
    name: "Miss Marigold",
    subtitle: "The Golden Trickster",
    notes: "Citrusy, vibrant, spiced — a spirited twist on Darjeeling.",
    price: 109,
    image: "Images/marigold.JPG", // Original illustration
  },
  {
    id: "nocturne-01",
    name: "Madam Nocturne",
    subtitle: "The Velvet Oracle",
    notes: "Calming, creamy, floral — a soothing herbal night blend.",
    price: 109,
    image: "Images/nocturne.JPG", // Original illustration
  },
  {
    id: "camellia-01",
    name: "Miss Camellia Rose",
    subtitle: "The Garden Poet",
    notes: "Delicate, floral, slightly spiced — an elegant white tea.",
    price: 109,
    image: "Images/camellia.PNG", // Original illustration
  },
  {
    id: "wisteria-01",
    name: "Lady Wisteria White",
    subtitle: "The Quiet Aristocrat",
    notes: "Floral, delicate, softly sweet — an ethereal take on white tea.",
    price: 109,
    image: "Images/wisteria.jpg", // AI generated example image
  },
  {
    id: "bergamot-01",
    name: "Madam Bergamot Grey",
    subtitle: "The Afternoon Hostess",
    notes:
      "Citrusy, refined, gently floral — and elegant Earl Grey with character.",
    price: 109,
    image: "Images/bergamot.jpg", // AI generated example image
  },
  {
    id: "jasmine-01",
    name: "Lady Jasmine Vale",
    subtitle: "The Graceful Diplomat",
    notes: "Fragrant, smooth, lightly sweet — a graceful jasmine green.",
    price: 109,
    image: "Images/jasmine.jpg", // AI generated example image
  },
  {
    id: "honeybloom-01",
    name: "Miss Honeybloom",
    subtitle: "The Warm Hostess",
    notes: "Honeyed, mellow, softly floral — a comforting rooibos embrace.",
    price: 109,
    image: "Images/honeybloom.jpg", // AI generated example image
  },
];

/* Storage helpers */

function readCart() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    // If storage is corrupted, reset it safely.
    return [];
  }
}

function writeCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

/* Cart structure */
function addToCart(productId) {
  const cart = readCart();
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: productId, qty: 1 });
  }

  writeCart(cart);
  updateCartCount();
}

function removeFromCart(productId) {
  const cart = readCart().filter((item) => item.id !== productId);
  writeCart(cart);
  updateCartCount();
  renderCart(); // Safe to call even if not on cart page.
}

function getCartCount() {
  return readCart().reduce((sum, item) => sum + item.qty, 0);
}

function updateCartCount() {
  const countEl = document.getElementById("cartCount");
  if (!countEl) return;
  countEl.textContent = String(getCartCount());
}

/* Rendering */

function renderProductsGrid() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  grid.innerHTML = PRODUCTS.map(
    (p) => `
  <article class="card">

    <img class="product-image"
         src="${p.image}"
         alt="${p.name} tea blend">

    <div>
      <h3>${p.name}</h3>
      <p class="muted">${p.subtitle}</p>
    </div>

    <p>${p.notes}</p>

    <div class="row">
      <strong>${formatPrice(p.price)}</strong>

      <div class="actions">
        <a class="button" href="product.html?id=${p.id}">View</a>
        <button class="button primary" data-add="${p.id}">
          Add
        </button>
      </div>
    </div>

  </article>
`
  ).join("");

  grid.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset.add));
  });
}

function renderProductDetail() {
  const detailEl = document.getElementById("productDetail");
  if (!detailEl) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const product = PRODUCTS.find((p) => p.id === id) || PRODUCTS[0];

  document.title = `The Steep Society | ${product.name}`;

  detailEl.innerHTML = `
  <img class="product-detail-image"
       src="${product.image}"
       alt="${product.name} tea blend">

  <h1>${product.name}</h1>
  <p class="muted">${product.subtitle}</p>

  <p>${product.notes}</p>

  <p><strong>${formatPrice(product.price)}</strong></p>

  <button class="button primary" id="addDetail">
    Add to cart
  </button>
`;

  const addBtn = document.getElementById("addDetail");
  addBtn.addEventListener("click", () => addToCart(product.id));
}

function renderCart() {
  const cartEl = document.getElementById("cartView");
  if (!cartEl) return;

  const cart = readCart();

  if (cart.length === 0) {
    cartEl.innerHTML = `
      <p>Your cart is empty.</p>
      <a class="btn" href="products.html">Browse blends</a>
    `;
    return;
  }

  const lines = cart
    .map((item) => {
      const product = PRODUCTS.find((p) => p.id === item.id);
      if (!product) return null;

      const lineTotal = product.price * item.qty;

      return `
      <div class="cart-item">
        <strong>${escapeHtml(product.name)}</strong>
        <span class="muted">${escapeHtml(product.subtitle)}</span>
        <div class="row">
          <span>Qty: ${item.qty}</span>
          <span><strong>${formatPrice(lineTotal)}</strong></span>
        </div>
        <button class="button" data-remove="${escapeAttr(
          product.id
        )}" type="button">Remove</button>
      </div>
    `;
    })
    .filter(Boolean)
    .join("");

  const total = cart.reduce((sum, item) => {
    const p = PRODUCTS.find((x) => x.id === item.id);
    return p ? sum + p.price * item.qty : sum;
  }, 0);

  cartEl.innerHTML = `
    ${lines}
    <div class="cart-summary">
      <strong>Total: ${formatPrice(total)}</strong>
      <a class="button" href="products.html">Continue shopping</a>
    </div>
  `;

  cartEl.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => removeFromCart(btn.dataset.remove));
  });
}

/* Utilities */

function formatPrice(sek) {
  return `${sek} SEK`;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(str) {
  // Attribute-safe escaping.
  return escapeHtml(str).replaceAll("`", "&#096;");
}

/* Init */

function init() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  updateCartCount();
  renderProductsGrid();
  renderProductDetail();
  renderCart();
}

document.addEventListener("DOMContentLoaded", init);
