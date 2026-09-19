let products = JSON.parse(localStorage.getItem("autoPartsProducts")) || [
    {
        code: "BP-001",
        description: "Brake Pad",
        category: "Brake Parts",
        size: "Standard",
        unit: "Toyota Vios",
        price: 1850,
        startingStock: 25,
        stockIn: 0,
        stockOut: 0,
        lowStock: 5
    },
    {
        code: "OF-001",
        description: "Oil Filter",
        category: "Engine Parts",
        size: "Standard",
        unit: "Toyota / Honda",
        price: 450,
        startingStock: 18,
        stockIn: 0,
        stockOut: 0,
        lowStock: 5
    },
    {
        code: "SA-001",
        description: "Shock Absorber",
        category: "Suspension Parts",
        size: "Standard",
        unit: "Toyota Innova",
        price: 3200,
        startingStock: 8,
        stockIn: 0,
        stockOut: 0,
        lowStock: 3
    },
    {
        code: "BAT-001",
        description: "Car Battery",
        category: "Electrical Parts",
        size: "12V 45Ah",
        unit: "Toyota Vios",
        price: 5800,
        startingStock: 12,
        stockIn: 0,
        stockOut: 0,
        lowStock: 3
    },
    {
        code: "HLB-001",
        description: "Headlight Bulb",
        category: "Lighting Parts",
        size: "H4",
        unit: "Universal",
        price: 1200,
        startingStock: 4,
        stockIn: 0,
        stockOut: 0,
        lowStock: 3
    },
    {
        code: "RAD-001",
        description: "Radiator",
        category: "Cooling System",
        size: "16 x 28 inch",
        unit: "Toyota Vios",
        price: 7200,
        startingStock: 7,
        stockIn: 0,
        stockOut: 0,
        lowStock: 3
    },
    {
        code: "FP-001",
        description: "Fuel Pump",
        category: "Fuel System",
        size: "Standard",
        unit: "Honda Civic",
        price: 3500,
        startingStock: 9,
        stockIn: 0,
        stockOut: 0,
        lowStock: 3
    },
    {
        code: "TRE-001",
        description: "Tie Rod End",
        category: "Steering Parts",
        size: "Standard",
        unit: "Toyota Avanza",
        price: 980,
        startingStock: 15,
        stockIn: 0,
        stockOut: 0,
        lowStock: 5
    },
    {
        code: "CK-001",
        description: "Clutch Kit",
        category: "Transmission Parts",
        size: "215 mm",
        unit: "Toyota Innova",
        price: 8500,
        startingStock: 6,
        stockIn: 0,
        stockOut: 0,
        lowStock: 3
    },
    {
        code: "AF-001",
        description: "Air Filter",
        category: "Air & Intake Parts",
        size: "Standard",
        unit: "Toyota / Honda",
        price: 650,
        startingStock: 22,
        stockIn: 0,
        stockOut: 0,
        lowStock: 5
    }
];

let stockInRecords = JSON.parse(localStorage.getItem("stockInRecords")) || [];
let stockOutRecords = JSON.parse(localStorage.getItem("stockOutRecords")) || [];

document.addEventListener("DOMContentLoaded", () => {
    setDefaultDates();
    setupNavigation();
    setupInventorySearch();
    setupStockIn();
    setupStockOut();
    setupProductForm();
    setupMobileMenu();
    updateDate();
    populateCategories();
    populateProductSelects();
    renderAll();
});

function saveData() {
    localStorage.setItem("autoPartsProducts", JSON.stringify(products));
    localStorage.setItem("stockInRecords", JSON.stringify(stockInRecords));
    localStorage.setItem("stockOutRecords", JSON.stringify(stockOutRecords));
}

function setupNavigation() {
    document.querySelectorAll(".nav-item").forEach(button => {
        button.addEventListener("click", () => {
            showPage(button.dataset.page);
        });
    });
}

function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    document.getElementById(pageId)?.classList.add("active");

    document.querySelectorAll(".nav-item").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === pageId
        );
    });

    const titles = {
        dashboard: ["Dashboard", "Overview of your auto parts inventory"],
        inventory: ["Master Stock Inventory", "View and manage all auto parts currently in stock"],
        "stock-in": ["Stock In", "Record newly delivered or restocked auto parts"],
        "stock-out": ["Stock Out / Sales", "Record sold or released auto parts"],
        sales: ["Daily Sales Summary", "Monitor daily sales transactions and revenue"]
    };

    document.getElementById("pageTitle").textContent = titles[pageId][0];
    document.getElementById("pageSubtitle").textContent = titles[pageId][1];

    document.querySelector(".sidebar")?.classList.remove("show");
}

function setupMobileMenu() {
    document.getElementById("mobileMenu")?.addEventListener("click", () => {
        document.querySelector(".sidebar")?.classList.toggle("show");
    });
}

function updateDate() {
    const date = new Date();

    document.getElementById("currentDate").textContent =
        date.toLocaleDateString("en-PH", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
}

function setDefaultDates() {
    const today = new Date().toISOString().split("T")[0];

    document.getElementById("stockInDate").value = today;
    document.getElementById("stockOutDate").value = today;
    document.getElementById("salesDate").value = today;
}

function getAvailableStock(product) {
    return product.startingStock + product.stockIn - product.stockOut;
}

function formatCurrency(value) {
    return Number(value).toLocaleString("en-PH", {
        style: "currency",
        currency: "PHP"
    });
}

function formatDate(date) {
    if (!date) return "";

    return new Date(date + "T00:00:00").toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function setupInventorySearch() {
    document.getElementById("inventorySearch").addEventListener("input", renderInventory);

    document.getElementById("categoryFilter").addEventListener("change", renderInventory);
}

function populateCategories() {
    const select = document.getElementById("categoryFilter");

    const categories = [...new Set(products.map(product => product.category))]
        .sort();

    select.innerHTML = `<option value="">All Categories</option>`;

    categories.forEach(category => {
        select.innerHTML += `
            <option value="${escapeHTML(category)}">
                ${escapeHTML(category)}
            </option>
        `;
    });
}

function renderInventory() {
    const tbody = document.getElementById("inventoryTable");
    const search = document.getElementById("inventorySearch").value.toLowerCase();
    const category = document.getElementById("categoryFilter").value;

    let filtered = products.filter(product => {
        const matchesSearch =
            product.code.toLowerCase().includes(search) ||
            product.description.toLowerCase().includes(search) ||
            product.unit.toLowerCase().includes(search);

        const matchesCategory =
            !category || product.category === category;

        return matchesSearch && matchesCategory;
    });

    tbody.innerHTML = "";

    if (!filtered.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11">
                    <div class="empty-state">No inventory items found.</div>
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach(product => {
        const available = getAvailableStock(product);

        tbody.innerHTML += `
            <tr>
                <td><strong>${escapeHTML(product.code)}</strong></td>
                <td>${escapeHTML(product.description)}</td>
                <td>${escapeHTML(product.size)}</td>
                <td>${escapeHTML(product.unit)}</td>
                <td>${formatCurrency(product.price)}</td>
                <td>${product.startingStock}</td>
                <td>${product.stockIn}</td>
                <td>${product.stockOut}</td>
                <td><strong>${available}</strong></td>
                <td>${getStockStatus(product)}</td>
                <td>
                    <button class="action-btn" onclick="viewProduct('${product.code}')">
                        View
                    </button>
                </td>
            </tr>
        `;
    });
}

function getStockStatus(product) {
    const stock = getAvailableStock(product);

    if (stock <= 0) {
        return `<span class="badge badge-danger">Out of Stock</span>`;
    }

    if (stock <= product.lowStock) {
        return `<span class="badge badge-warning">Low Stock</span>`;
    }

    return `<span class="badge badge-success">Available</span>`;
}

function populateProductSelects() {
    const stockInSelect = document.getElementById("stockInProduct");
    const stockOutSelect = document.getElementById("stockOutProduct");

    const options = products.map(product => `
        <option value="${escapeHTML(product.code)}">
            ${escapeHTML(product.code)} - ${escapeHTML(product.description)}
        </option>
    `).join("");

    stockInSelect.innerHTML = `<option value="">Select item</option>${options}`;
    stockOutSelect.innerHTML = `<option value="">Select item</option>${options}`;
}

function setupStockIn() {
    document.getElementById("stockInProduct").addEventListener("change", updateStockInPreview);
    document.getElementById("stockInQuantity").addEventListener("input", updateStockInPreview);

    document.getElementById("stockInForm").addEventListener("submit", event => {
        event.preventDefault();

        const code = document.getElementById("stockInProduct").value;
        const quantity = Number(document.getElementById("stockInQuantity").value);

        const product = products.find(item => item.code === code);

        if (!product || quantity <= 0) {
            showToast("Please enter valid stock information.");
            return;
        }

        const previousStock = getAvailableStock(product);

        product.stockIn += quantity;

        const newStock = getAvailableStock(product);

        stockInRecords.unshift({
            id: Date.now(),
            date: document.getElementById("stockInDate").value,
            code: product.code,
            description: product.description,
            previousStock,
            quantity,
            newStock,
            supplier: document.getElementById("stockInSupplier").value,
            reference: document.getElementById("stockInReference").value
        });

        saveData();

        event.target.reset();
        document.getElementById("stockInDate").value =
            new Date().toISOString().split("T")[0];

        updateStockInPreview();
        populateProductSelects();
        renderAll();

        showToast("Stock in successfully recorded.");
    });
}

function updateStockInPreview() {
    const code = document.getElementById("stockInProduct").value;
    const quantity = Number(document.getElementById("stockInQuantity").value) || 0;

    const product = products.find(item => item.code === code);

    if (!product) {
        document.getElementById("previousStock").textContent = "0";
        document.getElementById("stockInPreview").textContent = "0";
        document.getElementById("newStockPreview").textContent = "0";

        document.getElementById("selectedProduct").innerHTML = `
            <div class="empty-state">
                Select an item to view its details.
            </div>
        `;

        return;
    }

    const previous = getAvailableStock(product);

    document.getElementById("previousStock").textContent = previous;
    document.getElementById("stockInPreview").textContent = quantity;
    document.getElementById("newStockPreview").textContent = previous + quantity;

    document.getElementById("selectedProduct").innerHTML = productDetails(product);
}

function setupStockOut() {
    document.getElementById("stockOutProduct").addEventListener("change", updateStockOutPreview);
    document.getElementById("stockOutQuantity").addEventListener("input", updateStockOutPreview);

    document.getElementById("stockOutForm").addEventListener("submit", event => {
        event.preventDefault();

        const code = document.getElementById("stockOutProduct").value;
        const quantity = Number(document.getElementById("stockOutQuantity").value);

        const product = products.find(item => item.code === code);

        if (!product || quantity <= 0) {
            showToast("Please enter valid sales information.");
            return;
        }

        const available = getAvailableStock(product);

        if (quantity > available) {
            showToast(`Only ${available} item(s) available.`);
            return;
        }

        product.stockOut += quantity;

        const total = product.price * quantity;

        stockOutRecords.unshift({
            id: Date.now(),
            date: document.getElementById("stockOutDate").value,
            invoice: document.getElementById("invoiceNumber").value,
            code: product.code,
            description: product.description,
            quantity,
            price: product.price,
            total,
            customer: document.getElementById("customerName").value
        });

        saveData();

        event.target.reset();

        document.getElementById("stockOutDate").value =
            new Date().toISOString().split("T")[0];

        updateStockOutPreview();
        populateProductSelects();
        renderAll();

        showToast("Stock out successfully recorded.");
    });
}

function updateStockOutPreview() {
    const code = document.getElementById("stockOutProduct").value;
    const quantity = Number(document.getElementById("stockOutQuantity").value) || 0;

    const product = products.find(item => item.code === code);

    if (!product) {
        document.getElementById("saleUnitPrice").textContent = "₱0.00";
        document.getElementById("saleQuantity").textContent = "0";
        document.getElementById("saleTotal").textContent = "₱0.00";

        document.getElementById("stockOutProductInfo").innerHTML = `
            <div class="empty-state">
                Select an item to view current stock.
            </div>
        `;

        return;
    }

    const total = product.price * quantity;

    document.getElementById("saleUnitPrice").textContent =
        formatCurrency(product.price);

    document.getElementById("saleQuantity").textContent = quantity;

    document.getElementById("saleTotal").textContent =
        formatCurrency(total);

    document.getElementById("stockOutProductInfo").innerHTML = productDetails(product);
}

function productDetails(product) {
    const available = getAvailableStock(product);

    return `
        <div class="product-info-card">
            <h4>${escapeHTML(product.description)}</h4>

            <div class="detail-row">
                <span>Item Code</span>
                <strong>${escapeHTML(product.code)}</strong>
            </div>

            <div class="detail-row">
                <span>Category</span>
                <strong>${escapeHTML(product.category)}</strong>
            </div>

            <div class="detail-row">
                <span>Size</span>
                <strong>${escapeHTML(product.size)}</strong>
            </div>

            <div class="detail-row">
                <span>Truck / Unit</span>
                <strong>${escapeHTML(product.unit)}</strong>
            </div>

            <div class="detail-row">
                <span>Unit Price</span>
                <strong>${formatCurrency(product.price)}</strong>
            </div>

            <div class="detail-row">
                <span>Available Stock</span>
                <strong>${available}</strong>
            </div>
        </div>
    `;
}

function renderStockIn() {
    const tbody = document.getElementById("stockInTable");

    tbody.innerHTML = "";

    if (!stockInRecords.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8">
                    <div class="empty-state">No stock-in records yet.</div>
                </td>
            </tr>
        `;
        return;
    }

    stockInRecords.forEach(record => {
        tbody.innerHTML += `
            <tr>
                <td>${formatDate(record.date)}</td>
                <td><strong>${escapeHTML(record.code)}</strong></td>
                <td>${escapeHTML(record.description)}</td>
                <td>${record.previousStock}</td>
                <td><strong>+${record.quantity}</strong></td>
                <td><strong>${record.newStock}</strong></td>
                <td>${escapeHTML(record.supplier || "-")}</td>
                <td>${escapeHTML(record.reference || "-")}</td>
            </tr>
        `;
    });
}

function renderStockOut() {
    const tbody = document.getElementById("stockOutTable");

    tbody.innerHTML = "";

    if (!stockOutRecords.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8">
                    <div class="empty-state">No stock-out records yet.</div>
                </td>
            </tr>
        `;
        return;
    }

    stockOutRecords.forEach(record => {
        tbody.innerHTML += `
            <tr>
                <td>${formatDate(record.date)}</td>
                <td>${escapeHTML(record.invoice || "-")}</td>
                <td><strong>${escapeHTML(record.code)}</strong></td>
                <td>${escapeHTML(record.description)}</td>
                <td>${record.quantity}</td>
                <td>${formatCurrency(record.price)}</td>
                <td><strong>${formatCurrency(record.total)}</strong></td>
                <td>${escapeHTML(record.customer || "-")}</td>
            </tr>
        `;
    });
}

function renderSales() {
    const selectedDate = document.getElementById("salesDate").value;

    const records = stockOutRecords.filter(
        record => record.date === selectedDate
    );

    const totalSales = records.reduce(
        (sum, record) => sum + record.total,
        0
    );

    const totalItems = records.reduce(
        (sum, record) => sum + record.quantity,
        0
    );

    document.getElementById("summarySales").textContent =
        formatCurrency(totalSales);

    document.getElementById("summaryTransactions").textContent =
        records.length;

    document.getElementById("summaryItems").textContent =
        totalItems;

    const tbody = document.getElementById("salesTable");

    tbody.innerHTML = "";

    if (!records.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8">
                    <div class="empty-state">No sales for this date.</div>
                </td>
            </tr>
        `;
        return;
    }

    records.forEach(record => {
        tbody.innerHTML += `
            <tr>
                <td>${formatDate(record.date)}</td>
                <td>${escapeHTML(record.invoice || "-")}</td>
                <td><strong>${escapeHTML(record.code)}</strong></td>
                <td>${escapeHTML(record.description)}</td>
                <td>${record.quantity}</td>
                <td>${formatCurrency(record.price)}</td>
                <td><strong>${formatCurrency(record.total)}</strong></td>
                <td>${escapeHTML(record.customer || "-")}</td>
            </tr>
        `;
    });
}

document.getElementById("salesDate").addEventListener("change", renderSales);

function updateDashboard() {
    const totalItems = products.length;

    const totalStock = products.reduce(
        (sum, product) => sum + getAvailableStock(product),
        0
    );

    const today = new Date().toISOString().split("T")[0];

    const todayStockIn = stockInRecords
        .filter(record => record.date === today)
        .reduce((sum, record) => sum + record.quantity, 0);

    const todaySales = stockOutRecords
        .filter(record => record.date === today)
        .reduce((sum, record) => sum + record.total, 0);

    document.getElementById("totalItems").textContent = totalItems;
    document.getElementById("totalStock").textContent = totalStock;
    document.getElementById("todayStockIn").textContent = todayStockIn;
    document.getElementById("todaySales").textContent = formatCurrency(todaySales);

    renderLowStock();
    renderRecentActivity();
}

function renderLowStock() {
    const container = document.getElementById("lowStockList");

    const lowStockProducts = products.filter(product =>
        getAvailableStock(product) <= product.lowStock
    );

    container.innerHTML = "";

    if (!lowStockProducts.length) {
        container.innerHTML = `
            <div class="empty-state">
                All inventory levels are currently healthy.
            </div>
        `;
        return;
    }

    lowStockProducts.forEach(product => {
        container.innerHTML += `
            <div class="low-stock-item">
                <div class="item-info">
                    <strong>${escapeHTML(product.description)}</strong>
                    <span>${escapeHTML(product.code)}</span>
                </div>

                <span class="badge badge-danger">
                    ${getAvailableStock(product)} left
                </span>
            </div>
        `;
    });
}

function renderRecentActivity() {
    const container = document.getElementById("recentActivity");

    const activities = [
        ...stockInRecords.map(record => ({
            type: "in",
            date: record.date,
            text: `${record.description} +${record.quantity}`,
            sub: record.code
        })),
        ...stockOutRecords.map(record => ({
            type: "out",
            date: record.date,
            text: `${record.description} -${record.quantity}`,
            sub: record.code
        }))
    ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

    container.innerHTML = "";

    if (!activities.length) {
        container.innerHTML = `
            <div class="empty-state">
                No inventory activity yet.
            </div>
        `;
        return;
    }

    activities.forEach(activity => {
        container.innerHTML += `
            <div class="activity-item">
                <div class="item-info">
                    <strong>${escapeHTML(activity.text)}</strong>
                    <span>${escapeHTML(activity.sub)}</span>
                </div>

                <div>
                    <div class="activity-type ${activity.type}">
                        ${activity.type === "in" ? "STOCK IN" : "STOCK OUT"}
                    </div>

                    <span class="item-info">
                        ${formatDate(activity.date)}
                    </span>
                </div>
            </div>
        `;
    });
}

function setupProductForm() {
    document.getElementById("productForm").addEventListener("submit", event => {
        event.preventDefault();

        const code = document.getElementById("productCode").value.trim();

        if (products.some(product => product.code.toLowerCase() === code.toLowerCase())) {
            showToast("Item code already exists.");
            return;
        }

        products.push({
            code,
            description: document.getElementById("productDescription").value.trim(),
            category: document.getElementById("productCategory").value.trim(),
            size: document.getElementById("productSize").value.trim(),
            unit: document.getElementById("productUnit").value.trim(),
            price: Number(document.getElementById("productPrice").value),
            startingStock: Number(document.getElementById("productStartingStock").value),
            stockIn: 0,
            stockOut: 0,
            lowStock: Number(document.getElementById("productLowStock").value) || 5
        });

        saveData();

        event.target.reset();

        closeProductModal();

        populateCategories();
        populateProductSelects();
        renderAll();

        showToast("Inventory item added successfully.");
    });
}

function openProductModal() {
    document.getElementById("productModal").classList.add("show");
}

function closeProductModal() {
    document.getElementById("productModal").classList.remove("show");
}

function viewProduct(code) {
    const product = products.find(item => item.code === code);

    if (!product) return;

    document.getElementById("stockInProduct").value = code;
    updateStockInPreview();

    showPage("stock-in");
}

function renderAll() {
    updateDashboard();
    renderInventory();
    renderStockIn();
    renderStockOut();
    renderSales();
}

function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}