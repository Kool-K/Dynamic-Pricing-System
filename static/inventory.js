function loadLog() {
    const logList = document.getElementById('log-list');
    const storedLog = localStorage.getItem('priceChangeLog');
    if (storedLog) {
        logList.innerHTML = storedLog;
    }
}

function saveLog(message) {
    const logList = document.getElementById('log-list');
    logList.innerHTML += `<li>${message}</li>`;
    localStorage.setItem('priceChangeLog', logList.innerHTML);
}

function populateInventoryTable(data) {
    let tableBody = document.getElementById("inventory-body");
    tableBody.innerHTML = "";
    let expiringItems = [];

    data.forEach(item => {
        let priceCell = `<td>${item.price}`;
        if (item.price_changed) {
            if (item.price > item.original_price) {
                priceCell += '<span class="price-increased">▲</span>';
            } else {
                priceCell += '<span class="price-decreased">▼</span>';
            }
        }
        priceCell += '</td>';

        let row = `<tr>
            <td>${item.product_id}</td>
            <td>${item.name}</td>
            <td>${item.category}</td>
            ${priceCell}
            <td>${item.stock}</td>
            <td>${item.expiry_date}</td>
            <td>
                <button onclick="editItem('${item.name}')">Edit</button>
            </td>
        </tr>`;
        tableBody.innerHTML += row;

        if (item.stock < 10) {
            saveLog(`Low stock: ${item.name} (Product ID: ${item.product_id})`);
        }

        if (item.expiry_date) {
            const expiryDate = new Date(item.expiry_date);
            const today = new Date();
            const timeDiff = expiryDate.getTime() - today.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            if (daysDiff <= 2 && daysDiff >= 0) {
                expiringItems.push(item.product_id);
            }
        }
    });

    if (expiringItems.length > 0) {
        alert(`Items ${expiringItems.join(', ')} are nearing expiry!`);
    }
}

function addItem() {
    const name = document.getElementById("name").value;
    const category = document.getElementById("category").value;
    const price = document.getElementById("price").value;
    const stock = document.getElementById("stock").value;
    const expiryDate = document.getElementById("expiry-date").value;

    if (!name || !category || !price || !stock || !expiryDate) {
        alert("Please fill in all fields.");
        return;
    }

    fetch("/add-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: name,
            category: category,
            price: price,
            stock: stock,
            expiry_date: expiryDate
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || data.error);
        if(!data.error){
            window.location.reload();
        }
    })
    .catch(error => {
        console.error("Error adding/updating item:", error);
        alert("Failed to add/update item. Please try again.");
    });
}

function editItem(name) {
    const item = inventoryData.find(item => item.name === name);
    if (item) {
        document.getElementById("product-id").value = item.product_id;
        document.getElementById("name").value = item.name;
        document.getElementById("category").value = item.category;
        document.getElementById("price").value = item.price;
        document.getElementById("stock").value = item.stock;
        document.getElementById("expiry-date").value = item.expiry_date;
        document.getElementById("add-item-button").style.display = 'none';
        document.getElementById("update-item-button").style.display = 'block';
        document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
    }
}

function updateItem() {
    const productId = document.getElementById("product-id").value;
    const name = document.getElementById("name").value;
    const category = document.getElementById("category").value;
    const price = document.getElementById("price").value;
    const stock = document.getElementById("stock").value;
    const expiryDate = document.getElementById("expiry-date").value;

    if (!name || !category || !price || !stock || !expiryDate) {
        alert("Please fill in all fields.");
        return;
    }

    fetch("/add-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            product_id: productId,
            name: name,
            category: category,
            price: price,
            stock: stock,
            expiry_date: expiryDate
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || data.error);
        if(!data.error){
            window.location.reload();
        }
    })
    .catch(error => {
        console.error("Error updating item:", error);
        alert("Failed to update item. Please try again.");
    });

    document.getElementById("add-item-button").style.display = 'block';
    document.getElementById("update-item-button").style.display = 'none';
}

function loadLog() {
    const logList = document.getElementById('log-list');
    const storedLog = localStorage.getItem('priceChangeLog');
    if (storedLog) {
        logList.innerHTML = storedLog;
    }
}

function saveLog(message) {
    const logList = document.getElementById('log-list');
    logList.innerHTML += `<li>${message}</li>`;
    localStorage.setItem('priceChangeLog', logList.innerHTML);
}

function getDiscountPercent() {
    return parseFloat(document.getElementById('discount-percent').value) / 100;
}

function getRaisePercent() {
    return parseFloat(document.getElementById('raise-percent').value) / 100;
}

function savePrices() {
    fetch('/save-prices', {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        window.location.reload();
    })
    .catch(error => {
        console.error('Error saving prices:', error);
        alert('Failed to save prices. Please try again.');
    });
}