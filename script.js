
const defaultProducts = [
    {
        id: 1,
        name: "Blush Lily Bouquet",
        price: 650,
        category: "bouquet",
        description: "A delicate handmade lily bouquet, perfect for thoughtful gifts.",
        image: "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=600"
    },
    {
        id: 2,
        name: "Sunny Sunflower Bouquet",
        price: 750,
        category: "bouquet",
        description: "A little sunshine made by hand.",
        image: "https://images.unsplash.com/photo-1494336934272-f0efcedfc8e2?w=600"
    },
    {
        id: 3,
        name: "Mini Rose Collection",
        price: 350,
        category: "flower",
        description: "Sweet little roses for special moments.",
        image: "https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=600"
    },
    {
        id: 4,
        name: "Little Love Gift",
        price: 250,
        category: "gift",
        description: "A small handmade surprise full of love.",
        image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600"
    },
    {
        id: 5,
        name: "Lavender Dream",
        price: 550,
        category: "bouquet",
        description: "A soft lavender-inspired handmade arrangement.",
        image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600"
    },
    {
        id: 6,
        name: "Flower Keychain",
        price: 150,
        category: "keychain",
        description: "A tiny handmade flower to carry everywhere.",
        image: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600"
    }
];

function loadData(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return value === null ? fallback : value;
    } catch {
        return fallback;
    }
}

let products = loadData("cloudyProducts", defaultProducts);
let cart = loadData("cloudyCart", []);
let wishlist = loadData("cloudyWishlist", []);
let orders = loadData("cloudyOrders", []);
let category = "all";
let discount = 0;

function saveData() {
    localStorage.setItem("cloudyProducts", JSON.stringify(products));
    localStorage.setItem("cloudyCart", JSON.stringify(cart));
    localStorage.setItem("cloudyWishlist", JSON.stringify(wishlist));
    localStorage.setItem("cloudyOrders", JSON.stringify(orders));
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

function renderProducts() {
    const grid = document.getElementById("product-grid");
    const search = document.getElementById("search").value.toLowerCase();
    const sort = document.getElementById("sort").value;

    let filtered = products.filter(product => {
        const matchesCategory = category === "all" || product.category === category;
        const matchesSearch = product.name.toLowerCase().includes(search);

        return matchesCategory && matchesSearch;
    });

    if (sort === "low") filtered.sort((a, b) => a.price - b.price);
    if (sort === "high") filtered.sort((a, b) => b.price - a.price);
    if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));

    if (filtered.length === 0) {
        grid.innerHTML = '<p class="empty-message">No products found ♡</p>';
        return;
    }

    grid.innerHTML = filtered.map(product => `
        <article class="product-card">
            <div class="product-image">
                <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}">
                <button class="wish-btn" onclick="toggleWishlist(${product.id})">
                    ${wishlist.includes(product.id) ? "♥" : "♡"}
                </button>
            </div>

            <div class="product-info">
                <div class="rating">★★★★★ <span>5.0</span></div>
                <h3>${escapeHTML(product.name)}</h3>
                <p>${escapeHTML(product.description)}</p>

                <div class="product-bottom">
                    <span class="price">৳${product.price}</span>
                    <button onclick="addToCart(${product.id})">Add +</button>
                </div>

                <button class="quick-view" onclick="quickView(${product.id})">
                    Quick View
                </button>
            </div>
        </article>
    `).join("");
}

function setCategory(value, button) {
    category = value;

    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    button.classList.add("active");
    renderProducts();
}

function addToCart(id) {
    const product = products.find(item => item.id === id);
    if (!product) return;

    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    saveData();
    updateCart();
    showToast("Added to your little cart ♡");
}

function updateCart() {
    const container = document.getElementById("cart-items");

    let count = 0;
    let subtotal = 0;

    cart.forEach(item => {
        count += item.quantity;
        subtotal += item.price * item.quantity;
    });

    const delivery = subtotal === 0 || subtotal >= 2000 ? 0 : 80;
    const finalTotal = Math.max(0, subtotal + delivery - discount);

    document.getElementById("cart-count").textContent = count;
    document.getElementById("subtotal").textContent = subtotal;
    document.getElementById("delivery").textContent = delivery;
    document.getElementById("total").textContent = finalTotal;

    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-message">Your cart is waiting for something lovely! ♡</p>';
    } else {
        container.innerHTML = cart.map(item => `
            <div class="cart-row">
                <div>
                    <strong>${escapeHTML(item.name)}</strong>
                    <p>৳${item.price} each</p>

                    <div class="quantity-controls">
                        <button onclick="changeQuantity(${item.id},-1)">−</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQuantity(${item.id},1)">+</button>
                    </div>
                </div>

                <div>
                    <strong>৳${item.price * item.quantity}</strong>
                    <button class="remove-btn" onclick="removeItem(${item.id})">Remove</button>
                </div>
            </div>
        `).join("");
    }

    saveData();
}

function changeQuantity(id, change) {
    const item = cart.find(product => product.id === id);
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        cart = cart.filter(product => product.id !== id);
    }

    updateCart();
}

function removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
    showToast("Item removed");
}

function toggleCart() {
    closePanels();

    document.getElementById("cart-panel").classList.add("open");
    document.getElementById("overlay").classList.add("show");
}

function showWishlist() {
    closePanels();

    const container = document.getElementById("wishlist-items");

    const items = products.filter(product => wishlist.includes(product.id));

    if (items.length === 0) {
        container.innerHTML = '<p class="empty-message">No favorites yet ♡</p>';
    } else {
        container.innerHTML = items.map(item => `
            <div class="cart-row">
                <div>
                    <strong>${escapeHTML(item.name)}</strong>
                    <p>৳${item.price}</p>
                </div>
                <button class="remove-btn" onclick="toggleWishlist(${item.id})">Remove</button>
            </div>
        `).join("");
    }

    document.getElementById("wishlist-panel").classList.add("open");
    document.getElementById("overlay").classList.add("show");
}

function toggleWishlist(id) {
    if (wishlist.includes(id)) {
        wishlist = wishlist.filter(item => item !== id);
        showToast("Removed from wishlist");
    } else {
        wishlist.push(id);
        showToast("Saved to wishlist ♡");
    }

    document.getElementById("wish-count").textContent = wishlist.length;

    saveData();
    renderProducts();

    if (document.getElementById("wishlist-panel").classList.contains("open")) {
        showWishlist();
    }
}

function closePanels() {
    document.querySelectorAll(".side-panel").forEach(panel => {
        panel.classList.remove("open");
    });

    document.getElementById("overlay").classList.remove("show");
}

function applyCoupon() {
    const code = document.getElementById("coupon").value.trim().toUpperCase();
    const message = document.getElementById("coupon-message");

    if (code === "CLOUDY10") {
        discount = Math.round(
            cart.reduce((sum, item) => sum + item.price * item.quantity, 0) * 0.10
        );

        message.textContent = "10% discount applied! ♡";
        updateCart();
    } else {
        discount = 0;
        message.textContent = "Invalid coupon code.";
        updateCart();
    }
}

function addCustomBouquet() {
    const type = document.getElementById("flower-type").value;
    const color = document.getElementById("flower-color").value;
    const price = Number(document.getElementById("bouquet-size").value);
    const note = document.getElementById("gift-note").value.trim();

    const name = "Custom " + color + " " + type + " Bouquet";

    cart.push({
        id: Date.now(),
        name: name,
        price: price,
        quantity: 1,
        note: note
    });

    saveData();
    updateCart();
    showToast("Your custom bouquet has been added! ♡");
    toggleCart();
}

function quickView(id) {
    const product = products.find(item => item.id === id);
    if (!product) return;

    document.getElementById("modal-content").innerHTML = `
        <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}">
        <h2>${escapeHTML(product.name)}</h2>
        <p>${escapeHTML(product.description)}</p>
        <h3>৳${product.price}</h3>
        <button class="primary-btn full-btn" onclick="addToCart(${product.id});closeModal()">
            Add to Cart ♡
        </button>
    `;

    document.getElementById("product-modal").classList.add("show");
    document.getElementById("overlay").classList.add("show");
}

function showAdmin() {
    closePanels();
    updateAdmin();

    document.getElementById("admin-modal").classList.add("show");
    document.getElementById("overlay").classList.add("show");
}

function updateAdmin() {
    document.getElementById("admin-products").textContent = products.length;
    document.getElementById("admin-orders").textContent = orders.length;

    const sales = orders.reduce((sum, order) => sum + order.total, 0);

    document.getElementById("admin-sales").textContent = "৳" + sales;

    document.getElementById("admin-product-list").innerHTML = products.map(product => `
        <div class="admin-row">
            <span>${escapeHTML(product.name)} — ৳${product.price}</span>
            <button class="remove-btn" onclick="deleteProduct(${product.id})">Delete</button>
        </div>
    `).join("");

    document.getElementById("admin-order-list").innerHTML =
        orders.length === 0
        ? '<p class="empty-message">No orders yet.</p>'
        : orders.map(order => `
            <div class="admin-row">
                <span>#${order.id}<br>${escapeHTML(order.customer)}<br>৳${order.total}</span>
                <span>${escapeHTML(order.status)}</span>
            </div>
        `).join("");
}

function addProduct() {
    const name = document.getElementById("new-name").value.trim();
    const price = Number(document.getElementById("new-price").value);
    const category = document.getElementById("new-category").value;
    const image = document.getElementById("new-image").value.trim();

    if (!name || !Number.isFinite(price) || price <= 0 || !image) {
        showToast("Please enter valid product details.");
        return;
    }

    products.push({
        id: Date.now(),
        name: name,
        price: price,
        category: category,
        description: "A lovely handmade creation from Cloudy Crafts.",
        image: image
    });

    saveData();
    renderProducts();
    updateAdmin();

    document.getElementById("new-name").value = "";
    document.getElementById("new-price").value = "";
    document.getElementById("new-image").value = "";

    showToast("New product added ♡");
}

function deleteProduct(id) {
    products = products.filter(product => product.id !== id);
    wishlist = wishlist.filter(item => item !== id);
    cart = cart.filter(item => item.id !== id);

    saveData();
    renderProducts();
    updateCart();
    updateAdmin();

    showToast("Product deleted");
}

function checkout() {
    if (cart.length === 0) {
        showToast("Your cart is empty!");
        return;
    }

    closePanels();
    document.getElementById("checkout-modal").classList.add("show");
    document.getElementById("overlay").classList.add("show");
}

document.getElementById("checkout-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("customer-name").value.trim();
    const phone = document.getElementById("customer-phone").value.trim();
    const address = document.getElementById("customer-address").value.trim();
    const payment = document.getElementById("payment-method").value;

    if (!name || !phone || !address) return;

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const delivery = subtotal >= 2000 ? 0 : 80;
    const total = Math.max(0, subtotal + delivery - discount);

    const order = {
        id: Date.now(),
        customer: name,
        phone: phone,
        address: address,
        payment: payment,
        items: [...cart],
        total: total,
        status: "Pending"
    };

    orders.push(order);
    saveData();

    let message = "Hello Cloudy Crafts! I would like to place an order.\n\n";
    message += "Name: " + name + "\n";
    message += "Phone: " + phone + "\n";
    message += "Address: " + address + "\n";
    message += "Payment: " + payment + "\n\n";

    order.items.forEach(item => {
        message += item.name + " x " + item.quantity + " = ৳" +
            item.price * item.quantity + "\n";

        if (item.note) message += "Gift note: " + item.note + "\n";
    });

    message += "\nTotal: ৳" + total;

    updateAdmin();

    cart = [];
    discount = 0;
    saveData();
    updateCart();
    closeModal();

    this.reset();

    const whatsappNumber = "8801XXXXXXXXX";

    window.open(
        "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message),
        "_blank"
    );

    showToast("Order prepared! Please send it through WhatsApp.");
});

function toggleTheme() {
    document.body.classList.toggle("dark");

    localStorage.setItem(
        "cloudyTheme",
        document.body.classList.contains("dark") ? "dark" : "light"
    );
}

function closeModal() {
    document.querySelectorAll(".modal").forEach(modal => {
        modal.classList.remove("show");
    });

    document.getElementById("overlay").classList.remove("show");
}

if (localStorage.getItem("cloudyTheme") === "dark") {
    document.body.classList.add("dark");
}

document.getElementById("wish-count").textContent = wishlist.length;

renderProducts();
updateCart();