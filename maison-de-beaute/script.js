// =====================================================
// Maison de Beauté - script.js
// Sections: 1 Data | 2 State | 3 Helpers | 4 Storage
// 5 Rendering | 6 Cart | 7 Wishlist | 8 Modal & Panels
// 9 Form | 10 Cookies & Session | 11 Concept demos | 12 Events
// =====================================================

// ---------- 1. DATA (classes, objects, arrays) ----------

// A class is a blueprint used to create product objects
class Product {
  constructor(id, name, brand, category, price, oldPrice, description, image, stock) {
    this.id = id;
    this.name = name;
    this.brand = brand;
    this.category = category;
    this.price = price;
    this.oldPrice = oldPrice; // null when there is no discount
    this.description = description;
    this.image = image;
    this.stock = stock;
  }

  // Conditional statements decide the stock status
  getStockStatus() {
    if (this.stock === 0) {
      return { text: "Out of Stock", css: "out" };
    } else if (this.stock <= 5) {
      return { text: "Low Stock", css: "low" };
    }
    return { text: "In Stock", css: "in" };
  }

  // Arithmetic operators calculate the discount percentage
  getDiscount() {
    return this.oldPrice ? Math.round(((this.oldPrice - this.price) / this.oldPrice) * 100) : 0;
  }
}

class CartItem {
  constructor(id, name, price, quantity) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.quantity = quantity;
  }
}

const categories = [
  { name: "Perfumes", image: "images/perfume.jpg" },
  { name: "Makeup", image: "images/makeup.jpg" },
  { name: "Skincare", image: "images/skincare.jpg" },
  { name: "Haircare", image: "images/haircare.jpg" },
  { name: "Body Care", image: "images/bodycare.jpg" },
  { name: "Accessories", image: "images/accessories.jpg" }
];

const products = [
  new Product(1, "Rose Oud", "Maison Belle", "Perfumes", 75, 95, "An elegant floral fragrance with rose and warm oud.", "images/perfume.jpg", 10),
  new Product(2, "Velvet Jasmine", "Lumière", "Perfumes", 68, null, "A soft jasmine scent with notes of vanilla.", "images/perfume2.jpg", 4),
  new Product(3, "Satin Lipstick", "Rosalie", "Makeup", 24, 30, "A creamy lipstick in a classic rose shade.", "images/makeup.jpg", 25),
  new Product(4, "Glow Foundation", "Aurore", "Makeup", 38, null, "Lightweight foundation with a natural glow.", "images/makeup2.jpg", 12),
  new Product(5, "Silk Mascara", "Rosalie", "Makeup", 19, null, "Lengthening mascara that does not smudge.", "images/makeup3.jpg", 0),
  new Product(6, "Hydra Face Cream", "Pure Éclat", "Skincare", 45, 55, "Daily moisturiser with hyaluronic acid.", "images/skincare.jpg", 18),
  new Product(7, "Vitamin C Serum", "Pure Éclat", "Skincare", 52, null, "Brightening serum for a fresh, even look.", "images/skincare2.jpg", 3),
  new Product(8, "Argan Hair Oil", "Maison Belle", "Haircare", 29, null, "Nourishing oil for shiny, soft hair.", "images/haircare.jpg", 20),
  new Product(9, "Repair Shampoo", "Lumière", "Haircare", 22, 28, "Gentle shampoo for damaged hair.", "images/haircare2.jpg", 15),
  new Product(10, "Honey Body Butter", "Aurore", "Body Care", 27, null, "Rich body butter with honey and shea.", "images/bodycare.jpg", 9),
  new Product(11, "Silk Hair Scrunchies", "Rosalie", "Accessories", 12, null, "Set of three silk scrunchies.", "images/accessories.jpg", 30),
  new Product(12, "Rose Gold Brush Set", "Aurore", "Accessories", 42, 50, "Five soft makeup brushes in a travel case.", "images/accessories2.jpg", 6)
];

// ---------- 2. STATE (let = values that change) ----------
let cart = [];
let wishlist = [];            // stores product ids
let currentCategory = "All";
let searchTerm = "";
let sortOrder = "default";
let selectedProduct = null;   // null until a product is opened

// ---------- 3. HELPERS ----------
const $ = (id) => document.getElementById(id);

function formatPrice(number) {
  return "$" + number.toFixed(2);
}

// Draws a pastel placeholder when an image file is missing
function makePlaceholder(label) {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">' +
    '<rect width="400" height="400" fill="#F3E4E5"/>' +
    '<text x="200" y="210" font-family="Georgia,serif" font-size="26" fill="#6B2737" text-anchor="middle">' + label + '</text></svg>';
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

// Used inside img tags: swap in the placeholder if the image fails to load
const IMG_FALLBACK = "this.onerror=null;this.src=makePlaceholder(this.alt)";

function showToast(message) {
  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.textContent = message;
  $("toastArea").appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// ---------- 4. STORAGE (localStorage + try / catch / finally) ----------
function loadFromStorage(key, fallback) {
  let result = fallback;
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      result = JSON.parse(saved);
    }
  } catch (error) {
    showToast("Could not load saved " + key + ". Starting fresh.");
    localStorage.removeItem(key); // remove the broken data
  } finally {
    // finally runs whether or not an error happened
    console.log("Finished loading '" + key + "' from localStorage");
  }
  return result;
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    showToast("Could not save your data.");
  }
}

// ---------- 5. RENDERING (DOM) ----------
function renderCategories() {
  let html = "";
  for (const cat of categories) { // for...of loop
    html += '<button class="category-card" data-category="' + cat.name + '">' +
      '<img src="' + cat.image + '" alt="' + cat.name + '" onerror="' + IMG_FALLBACK + '">' +
      '<span>' + cat.name + '</span></button>';
  }
  $("categoryGrid").innerHTML = html;

  // Fill the category <select> using a classic for loop
  const select = $("categorySelect");
  select.innerHTML = '<option value="All">All Categories</option>';
  for (let i = 0; i < categories.length; i++) {
    select.innerHTML += '<option value="' + categories[i].name + '">' + categories[i].name + "</option>";
  }
}

// Search + filter + sort using filter() and sort()
function getVisibleProducts() {
  const result = products.filter((p) => {
    const matchesCategory = currentCategory === "All" || p.category === currentCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm) ||
                          p.brand.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch; // logical AND
  });

  if (sortOrder === "low") {
    result.sort((a, b) => a.price - b.price);
  } else if (sortOrder === "high") {
    result.sort((a, b) => b.price - a.price);
  }
  return result;
}

function renderProducts() {
  const visible = getVisibleProducts();

  // map() turns every product into a block of HTML
  $("productGrid").innerHTML = visible.map((p) => {
    const status = p.getStockStatus();
    const isLiked = wishlist.includes(p.id);
    const badge = p.getDiscount() > 0 ? '<span class="badge">-' + p.getDiscount() + '%</span>' : "";
    const oldPrice = p.oldPrice ? '<span class="old-price">' + formatPrice(p.oldPrice) + "</span>" : "";

    return '<article class="product-card">' + badge +
      '<button class="heart ' + (isLiked ? "active" : "") + '" data-action="wish" data-id="' + p.id + '" aria-label="Toggle wishlist">' +
      (isLiked ? "&#9829;" : "&#9825;") + "</button>" +
      '<img src="' + p.image + '" alt="' + p.name + '" onerror="' + IMG_FALLBACK + '">' +
      '<div class="product-info">' +
      "<h3>" + p.name + "</h3>" +
      '<span class="brand">' + p.brand + "</span>" +
      '<span class="category-tag">' + p.category + "</span>" +
      '<p class="price">' + formatPrice(p.price) + oldPrice + "</p>" +
      '<span class="stock ' + status.css + '">' + status.text + "</span>" +
      '<div class="card-buttons">' +
      '<button class="btn btn-dark" data-action="add" data-id="' + p.id + '"' + (p.stock === 0 ? " disabled" : "") + ">Add to Cart</button>" +
      '<button class="btn btn-outline" data-action="details" data-id="' + p.id + '">View Details</button>' +
      "</div></div></article>";
  }).join("");

  // Empty state: show a message when nothing matches
  $("noResults").hidden = visible.length > 0;
}

function renderCart() {
  const box = $("cartItems");
  let total = 0;
  let itemCount = 0;

  if (cart.length === 0) {
    box.innerHTML = '<p class="empty-state">Your cart is empty. Add something you love.</p>';
  } else {
    box.innerHTML = "";
    cart.forEach((item) => { // forEach loop
      total += item.price * item.quantity;
      itemCount += item.quantity;
      const product = products.find((p) => p.id === item.id);
      box.innerHTML += '<div class="list-item">' +
        '<img src="' + product.image + '" alt="' + item.name + '" onerror="' + IMG_FALLBACK + '">' +
        '<div class="grow"><strong>' + item.name + "</strong><br>" + formatPrice(item.price) +
        '<div class="qty">' +
        '<button data-cart="minus" data-id="' + item.id + '" aria-label="Decrease quantity">-</button>' +
        "<span>" + item.quantity + "</span>" +
        '<button data-cart="plus" data-id="' + item.id + '" aria-label="Increase quantity">+</button>' +
        "</div></div>" +
        '<button class="remove-btn" data-cart="remove" data-id="' + item.id + '">Remove</button></div>';
    });
  }

  $("cartTotal").textContent = formatPrice(total);
  $("cartCount").textContent = itemCount;
  $("clearCartBtn").disabled = cart.length === 0;
  saveToStorage("cart", cart);
}

function renderWishlist() {
  const box = $("wishlistItems");
  const liked = products.filter((p) => wishlist.includes(p.id));

  if (liked.length === 0) {
    box.innerHTML = '<p class="empty-state">Your wishlist is empty. Tap the heart on a product to save it.</p>';
  } else {
    box.innerHTML = liked.map((p) =>
      '<div class="list-item">' +
      '<img src="' + p.image + '" alt="' + p.name + '" onerror="' + IMG_FALLBACK + '">' +
      '<div class="grow"><strong>' + p.name + "</strong><br>" + formatPrice(p.price) + "</div>" +
      '<button class="remove-btn" data-wish-remove="' + p.id + '">Remove</button></div>'
    ).join("");
  }
  $("wishlistCount").textContent = wishlist.length;
}

// ---------- 6. CART ----------
function addToCart(id) {
  const product = products.find((p) => p.id === id);
  const existing = cart.find((item) => item.id === id);

  if (existing) {
    // Comparison operator checks the stock limit
    if (existing.quantity >= product.stock) {
      showToast("Only " + product.stock + " available in stock.");
      return;
    }
    existing.quantity++; // increment operator
  } else {
    cart.push(new CartItem(product.id, product.name, product.price, 1));
  }
  renderCart();
  showToast(product.name + " added to cart");
}

function changeQuantity(id, change) {
  const item = cart.find((i) => i.id === id);
  const product = products.find((p) => p.id === id);
  const newQuantity = item.quantity + change;

  if (newQuantity < 1) {
    removeFromCart(id);
  } else if (newQuantity > product.stock) {
    showToast("Only " + product.stock + " available in stock.");
  } else {
    item.quantity = newQuantity; // assignment operator
    renderCart();
  }
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  renderCart();
  showToast("Product removed");
}

function clearCart() {
  cart = [];
  renderCart();
  showToast("Cart cleared");
}

// ---------- 7. WISHLIST ----------
function toggleWishlist(id) {
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter((itemId) => itemId !== id);
    showToast("Removed from wishlist");
  } else {
    wishlist.push(id);
    showToast("Added to wishlist");
  }
  saveToStorage("wishlist", wishlist);
  renderWishlist();
  renderProducts(); // redraw so the heart icon changes
}

// ---------- 8. MODAL & PANELS ----------
function openDetails(id) {
  selectedProduct = products.find((p) => p.id === id);
  const p = selectedProduct;
  const status = p.getStockStatus();

  $("modalBody").innerHTML =
    '<img src="' + p.image + '" alt="' + p.name + '" onerror="' + IMG_FALLBACK + '">' +
    '<div class="modal-text"><h3>' + p.name + "</h3>" +
    '<span class="brand">' + p.brand + "</span>" +
    "<p>" + p.description + "</p>" +
    '<p class="price">' + formatPrice(p.price) + "</p>" +
    '<span class="stock ' + status.css + '">' + status.text + " (" + p.stock + " left)</span>" +
    '<button class="btn btn-dark" id="modalAddBtn"' + (p.stock === 0 ? " disabled" : "") + ">Add to Cart</button></div>";

  $("productModal").hidden = false;
  countProductView();
}

function closeDetails() {
  $("productModal").hidden = true;
  selectedProduct = null;
}

function openPanel(panelId) {
  $(panelId).classList.add("open");
  $("overlay").classList.add("show");
}

function closePanels() {
  $("cartPanel").classList.remove("open");
  $("wishlistPanel").classList.remove("open");
  $("overlay").classList.remove("show");
}

function scrollToSection(sectionId) {
  $(sectionId).scrollIntoView({ behavior: "smooth" });
  $("navLinks").classList.remove("open");
}

function selectCategory(name) {
  currentCategory = name;
  $("categorySelect").value = name;
  renderProducts();
}

// ---------- 9. CONTACT FORM VALIDATION ----------
function validateForm(event) {
  event.preventDefault();
  const name = $("fullName").value.trim();
  const email = $("email").value.trim();
  const subject = $("subject").value.trim();
  const message = $("message").value.trim();
  const errors = [];

  if (name.length < 3) errors.push("Enter your full name (at least 3 characters).");
  // String methods check the email format
  if (!email.includes("@") || email.startsWith("@") || email.endsWith(".") || email.endsWith("@")) {
    errors.push("Enter a valid email address.");
  }
  if (subject.length === 0) errors.push("Enter a subject.");
  if (message.length < 10) errors.push("Your message must be at least 10 characters.");

  const out = $("formMessage");
  if (errors.length > 0) {
    out.textContent = errors.join(" ");
    out.className = "form-message error";
  } else {
    out.textContent = "Thank you, " + name + ". We will reply soon.";
    out.className = "form-message success";
    $("contactForm").reset();
    showToast("Message sent successfully");
  }
}

// ---------- 10. COOKIES & SESSION STORAGE ----------
function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = name + "=" + value + "; expires=" + date.toUTCString() + "; path=/";
}

function getCookie(name) {
  const parts = document.cookie.split("; ");
  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key === name) return value;
  }
  return null;
}

function countProductView() {
  let views = Number(sessionStorage.getItem("viewedProducts")) || 0;
  views++;
  sessionStorage.setItem("viewedProducts", views);
  showViewedNote();
}

function showViewedNote() {
  const views = Number(sessionStorage.getItem("viewedProducts")) || 0;
  $("viewedNote").textContent = views > 0
    ? "Products viewed this session: " + views
    : "";
}

function showWelcomeOncePerSession() {
  if (sessionStorage.getItem("welcomed") === null) {
    showToast("Welcome to Maison de Beauté");
    sessionStorage.setItem("welcomed", "yes");
  }
}

// ---------- 11. CONCEPT DEMOS (open the browser console to see them) ----------
function runConceptDemos() {
  // var vs let: var ignores block scope, let does not
  if (true) {
    var demoVar = "I am visible outside the block";
    let demoLet = "I am only visible inside the block";
  }
  console.log(demoVar);              // works
  // console.log(demoLet);           // would cause a ReferenceError

  // Data types
  const productName = "Rose Oud";    // String
  const productPrice = 75;           // Number
  const isAvailable = true;          // Boolean
  let discount = undefined;          // Undefined
  let chosen = null;                 // Null
  const largeNumber = 12345678901234567890n; // BigInt
  const sample = { name: productName }; // Object
  const list = [1, 2, 3];            // Array (typeof says "object")
  console.log(typeof productName, typeof productPrice, typeof isAvailable,
    typeof discount, typeof chosen, typeof largeNumber, typeof sample, Array.isArray(list));

  // Nested object
  const nested = { id: 1, name: "Rose Oud", details: { brand: "Maison Belle", category: "Perfumes", stock: 10 } };
  console.log(nested.details.brand);

  // Array methods
  const demo = [1, 2];
  demo.push(3);                      // adds to the end
  const last = demo.pop();           // removes from the end
  console.log("pop removed:", last, "includes 2:", demo.includes(2));

  // Operators: ternary, logical, decrement
  let stock = 3;
  stock--;
  console.log(stock > 0 && stock <= 5 ? "Low Stock" : "Other");
}

// ---------- 12. EVENTS ----------
function setupEvents() {
  // Navigation links: addEventListener is the main method
  document.querySelectorAll("[data-target]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      scrollToSection(link.dataset.target);
    });
  });

  $("shopNowBtn").addEventListener("click", () => scrollToSection("shop"));
  $("exploreBtn").addEventListener("click", () => scrollToSection("categories"));
  $("menuBtn").addEventListener("click", () => $("navLinks").classList.toggle("open"));
  $("searchBtn").addEventListener("click", () => {
    scrollToSection("shop");
    $("searchInput").focus();
  });

  // onclick vs addEventListener:
  // onclick can hold only ONE handler (a second assignment replaces the first).
  // addEventListener can attach many handlers to the same element.
  $("acceptCookies").onclick = function () {
    setCookie("cookiesAccepted", "yes", 30);
    $("cookieNotice").hidden = true;
  };
  // onmouseover: a small hover effect on the logo
  $("logo").onmouseover = function () { $("logo").style.color = "#C5A46D"; };
  $("logo").onmouseout = function () { $("logo").style.color = ""; };

  // Search, filter, sort
  $("searchInput").addEventListener("input", (event) => {
    searchTerm = event.target.value.trim().toLowerCase();
    renderProducts();
  });
  $("categorySelect").addEventListener("change", (event) => selectCategory(event.target.value));
  $("sortSelect").addEventListener("change", (event) => {
    sortOrder = event.target.value;
    renderProducts();
  });
  $("showAllBtn").addEventListener("click", () => {
    searchTerm = "";
    sortOrder = "default";
    $("searchInput").value = "";
    $("sortSelect").value = "default";
    selectCategory("All");
  });

  // Category cards
  $("categoryGrid").addEventListener("click", (event) => {
    const card = event.target.closest("[data-category]");
    if (card) {
      selectCategory(card.dataset.category);
      scrollToSection("shop");
    }
  });

  // Product cards (one listener handles every button: event delegation)
  $("productGrid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const id = Number(button.dataset.id);
    if (button.dataset.action === "add") addToCart(id);
    if (button.dataset.action === "wish") toggleWishlist(id);
    if (button.dataset.action === "details") openDetails(id);
  });

  // Modal
  $("closeModal").addEventListener("click", closeDetails);
  $("productModal").addEventListener("click", (event) => {
    if (event.target === $("productModal")) closeDetails(); // click on dark background
  });
  $("modalBody").addEventListener("click", (event) => {
    if (event.target.id === "modalAddBtn") addToCart(selectedProduct.id);
  });

  // Cart and wishlist panels
  $("cartBtn").addEventListener("click", () => openPanel("cartPanel"));
  $("wishlistBtn").addEventListener("click", () => openPanel("wishlistPanel"));
  $("overlay").addEventListener("click", closePanels);
  document.querySelectorAll("[data-close]").forEach((btn) => btn.addEventListener("click", closePanels));
  $("clearCartBtn").addEventListener("click", clearCart);

  $("cartItems").addEventListener("click", (event) => {
    const button = event.target.closest("[data-cart]");
    if (!button) return;
    const id = Number(button.dataset.id);
    if (button.dataset.cart === "plus") changeQuantity(id, 1);
    if (button.dataset.cart === "minus") changeQuantity(id, -1);
    if (button.dataset.cart === "remove") removeFromCart(id);
  });

  $("wishlistItems").addEventListener("click", (event) => {
    const button = event.target.closest("[data-wish-remove]");
    if (button) toggleWishlist(Number(button.dataset.wishRemove));
  });

  // Escape key closes everything
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDetails();
      closePanels();
    }
  });

  $("contactForm").addEventListener("submit", validateForm);
}

// ---------- START ----------
// onload runs once the whole page has finished loading
window.onload = function () {
  cart = loadFromStorage("cart", []);
  wishlist = loadFromStorage("wishlist", []);

  renderCategories();
  renderProducts();
  renderCart();
  renderWishlist();
  setupEvents();
  showViewedNote();
  showWelcomeOncePerSession();
  runConceptDemos();

  // Show the cookie notice only if it was not accepted before
  if (getCookie("cookiesAccepted") !== "yes") {
    $("cookieNotice").hidden = false;
  }
};
