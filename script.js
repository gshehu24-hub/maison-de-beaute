const $ = id => document.getElementById(id);
function makeProduct(id, name, brand, category, price, oldPrice, description, image, stock) {
  return { id, name, brand, category, price, oldPrice, description, image, stock };
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
  makeProduct(1, "Rose Oud", "Maison Belle", "Perfumes", 75, 95, "An elegant floral fragrance with rose and warm oud.", "images/perfume.jpg", 10),
  makeProduct(2, "Velvet Jasmine", "Lumière", "Perfumes", 68, null, "A soft jasmine scent with notes of vanilla.", "images/perfume2.jpg", 4),
  makeProduct(3, "Satin Lipstick", "Rosalie", "Makeup", 24, 30, "A creamy lipstick in a classic rose shade.", "images/makeup.jpg", 25),
  makeProduct(4, "Glow Foundation", "Aurore", "Makeup", 38, null, "Lightweight foundation with a natural glow.", "images/makeup2.jpg", 12),
  makeProduct(5, "Silk Mascara", "Rosalie", "Makeup", 19, null, "Lengthening mascara that does not smudge.", "images/makeup3.jpg", 0),
  makeProduct(6, "Hydra Face Cream", "Pure Éclat", "Skincare", 45, 55, "Daily moisturiser with hyaluronic acid.", "images/skincare.jpg", 18),
  makeProduct(7, "Vitamin C Serum", "Pure Éclat", "Skincare", 52, null, "Brightening serum for a fresh, even look.", "images/skincare2.jpg", 3),
  makeProduct(8, "Argan Hair Oil", "Maison Belle", "Haircare", 29, null, "Nourishing oil for shiny, soft hair.", "images/haircare.jpg", 20),
  makeProduct(9, "Repair Shampoo", "Lumière", "Haircare", 22, 28, "Gentle shampoo for damaged hair.", "images/haircare2.jpg", 15),
  makeProduct(10, "Honey Body Butter", "Aurore", "Body Care", 27, null, "Rich body butter with honey and shea.", "images/bodycare.jpg", 9),
  makeProduct(11, "Silk Hair Scrunchies", "Rosalie", "Accessories", 12, null, "Set of three silk scrunchies.", "images/accessories.jpg", 30),
  makeProduct(12, "Rose Gold Brush Set", "Aurore", "Accessories", 42, 50, "Five soft makeup brushes in a travel case.", "images/accessories2.jpg", 6)
];

let cart = readSaved("beautyCart");
let wishlist = readSaved("beautyWishlist");
let category = "All";
let search = "";
let sort = "default";
let activeProduct = null;

function readSaved(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch (error) { return []; }
}
function save() {
  localStorage.setItem("beautyCart", JSON.stringify(cart));
  localStorage.setItem("beautyWishlist", JSON.stringify(wishlist));
}
function money(price) { return "$" + price.toFixed(2); }
function productById(id) { return products.find(product => product.id === id); }
function goTo(id) { $(id).scrollIntoView({ behavior: "smooth" }); }

function showCategories() {
  $("categoryGrid").innerHTML = categories.map(item =>
    `<button class="category-card" data-category="${item.name}"><img src="${item.image}" alt="${item.name}"><span>${item.name}</span></button>`
  ).join("");
  $("categorySelect").innerHTML = '<option value="All">All Categories</option>' +
    categories.map(item => `<option value="${item.name}">${item.name}</option>`).join("");
}
function showProducts() {
  let visible = products.filter(item =>
    (category === "All" || item.category === category) &&
    (item.name.toLowerCase().includes(search) || item.brand.toLowerCase().includes(search))
  );
  if (sort === "low") visible.sort((a, b) => a.price - b.price);
  if (sort === "high") visible.sort((a, b) => b.price - a.price);
  $("productGrid").innerHTML = visible.map(item => `
    <article class="product-card">
      <button class="heart ${wishlist.includes(item.id) ? "active" : ""}" data-action="wish" data-id="${item.id}">${wishlist.includes(item.id) ? "♥" : "♡"}</button>
      <img src="${item.image}" alt="${item.name}">
      <div class="product-info"><h3>${item.name}</h3><span class="brand">${item.brand}</span>
      <span class="category-tag">${item.category}</span><p class="price">${money(item.price)}</p>
      <span class="stock ${item.stock === 0 ? "out" : "in"}">${item.stock === 0 ? "Out of Stock" : "In Stock"}</span>
      <div class="card-buttons"><button class="btn btn-dark" data-action="add" data-id="${item.id}" ${item.stock === 0 ? "disabled" : ""}>Add to Cart</button>
      <button class="btn btn-outline" data-action="details" data-id="${item.id}">View Details</button></div></div>
    </article>`).join("");
  $("noResults").hidden = visible.length > 0;
}
function showCart() {
  $("cartItems").innerHTML = cart.length ? cart.map(item => {
    const product = productById(item.id);
    return `<div class="list-item"><img src="${product.image}" alt="${product.name}"><div class="grow"><strong>${product.name}</strong><br>${money(product.price)}
    <div class="qty"><button data-cart="minus" data-id="${item.id}">−</button><span>${item.quantity}</span><button data-cart="plus" data-id="${item.id}">+</button></div></div>
    <button class="remove-btn" data-cart="remove" data-id="${item.id}">Remove</button></div>`;
  }).join("") : '<p class="empty-state">Your cart is empty.</p>';
  let total = 0;
  let count = 0;
  cart.forEach(item => { total += productById(item.id).price * item.quantity; count += item.quantity; });
  $("cartTotal").textContent = money(total);
  $("cartCount").textContent = count;
  $("clearCartBtn").disabled = cart.length === 0;
  save();
}
function showWishlist() {
  const liked = products.filter(item => wishlist.includes(item.id));
  $("wishlistItems").innerHTML = liked.length ? liked.map(item =>
    `<div class="list-item"><img src="${item.image}" alt="${item.name}"><div class="grow"><strong>${item.name}</strong><br>${money(item.price)}</div><button class="remove-btn" data-wish-remove="${item.id}">Remove</button></div>`
  ).join("") : '<p class="empty-state">Your wishlist is empty.</p>';
  $("wishlistCount").textContent = wishlist.length;
  save();
}
function addToCart(id) {
  const product = productById(id);
  const item = cart.find(entry => entry.id === id);
  const quantity = item ? item.quantity : 0;
  if (!product || quantity >= product.stock) return;
  if (item) item.quantity++;
  else cart.push({ id, quantity: 1 });
  showCart();
}
function changeQuantity(id, amount) {
  const item = cart.find(entry => entry.id === id);
  if (!item) return;
  item.quantity += amount;
  if (item.quantity > productById(id).stock) item.quantity = productById(id).stock;
  if (item.quantity <= 0) cart = cart.filter(entry => entry.id !== id);
  showCart();
}
function toggleWishlist(id) {
  if (wishlist.includes(id)) wishlist = wishlist.filter(value => value !== id);
  else wishlist.push(id);
  showWishlist();
  showProducts();
}
function openDetails(id) {
  activeProduct = productById(id);
  const item = activeProduct;
  $("modalBody").innerHTML = `<img src="${item.image}" alt="${item.name}"><div class="modal-text"><h3>${item.name}</h3><span class="brand">${item.brand}</span>
  <p>${item.description}</p><p class="price">${money(item.price)}</p><span class="stock">${item.stock} available</span>
  <button class="btn btn-dark" id="modalAddBtn" ${item.stock === 0 ? "disabled" : ""}>Add to Cart</button></div>`;
  $("productModal").hidden = false;
}
function openPanel(id) { $(id).classList.add("open"); $("overlay").classList.add("show"); }
function closePanels() {
  $("cartPanel").classList.remove("open");
  $("wishlistPanel").classList.remove("open");
  $("overlay").classList.remove("show");
}
function selectCategory(value) {
  category = value;
  $("categorySelect").value = value;
  showProducts();
}
function validateForm(event) {
  event.preventDefault();
  const name = $("fullName").value.trim();
  const email = $("email").value.trim();
  const subject = $("subject").value.trim();
  const message = $("message").value.trim();
  const valid = name.length >= 2 && email.includes("@") && email.includes(".") && subject.length > 0 && message.length > 0;
  $("formMessage").textContent = valid ? "Thank you! Your message was received (demo only)." : "Please fill in all fields and enter a valid email.";
  if (valid) $("contactForm").reset();
}
function start() {
  showCategories(); showProducts(); showCart(); showWishlist();
  document.querySelectorAll("[data-target]").forEach(link => link.addEventListener("click", event => {
    event.preventDefault(); goTo(link.dataset.target); $("navLinks").classList.remove("open");
  }));
  $("shopNowBtn").addEventListener("click", () => goTo("shop"));
  $("exploreBtn").addEventListener("click", () => goTo("categories"));
  $("menuBtn").addEventListener("click", () => $("navLinks").classList.toggle("open"));
  $("searchBtn").addEventListener("click", () => { goTo("shop"); $("searchInput").focus(); });
  $("searchInput").addEventListener("input", event => { search = event.target.value.toLowerCase().trim(); showProducts(); });
  $("categorySelect").addEventListener("change", event => selectCategory(event.target.value));
  $("sortSelect").addEventListener("change", event => { sort = event.target.value; showProducts(); });
  $("showAllBtn").addEventListener("click", () => {
    search = ""; sort = "default"; $("searchInput").value = ""; $("sortSelect").value = "default"; selectCategory("All");
  });
  $("categoryGrid").addEventListener("click", event => {
    const button = event.target.closest("[data-category]");
    if (button) { selectCategory(button.dataset.category); goTo("shop"); }
  });
  $("productGrid").addEventListener("click", event => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const id = Number(button.dataset.id);
    if (button.dataset.action === "add") addToCart(id);
    if (button.dataset.action === "wish") toggleWishlist(id);
    if (button.dataset.action === "details") openDetails(id);
  });
  $("closeModal").addEventListener("click", () => $("productModal").hidden = true);
  $("productModal").addEventListener("click", event => { if (event.target.id === "productModal") $("productModal").hidden = true; });
  $("modalBody").addEventListener("click", event => { if (event.target.id === "modalAddBtn") addToCart(activeProduct.id); });
  $("cartBtn").addEventListener("click", () => openPanel("cartPanel"));
  $("wishlistBtn").addEventListener("click", () => openPanel("wishlistPanel"));
  $("overlay").addEventListener("click", closePanels);
  document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", closePanels));
  $("clearCartBtn").addEventListener("click", () => { cart = []; showCart(); });
  $("cartItems").addEventListener("click", event => {
    const button = event.target.closest("[data-cart]");
    if (!button) return;
    const id = Number(button.dataset.id);
    if (button.dataset.cart === "remove") { cart = cart.filter(item => item.id !== id); showCart(); }
    if (button.dataset.cart === "plus") changeQuantity(id, 1);
    if (button.dataset.cart === "minus") changeQuantity(id, -1);
  });
  $("wishlistItems").addEventListener("click", event => {
    const button = event.target.closest("[data-wish-remove]");
    if (button) toggleWishlist(Number(button.dataset.wishRemove));
  });
  $("contactForm").addEventListener("submit", validateForm);
  $("cookieNotice").hidden = localStorage.getItem("cookiesAccepted") === "yes";
  $("acceptCookies").addEventListener("click", () => {
    localStorage.setItem("cookiesAccepted", "yes"); $("cookieNotice").hidden = true;
  });
  $("viewedNote").textContent = "";
}
start();
