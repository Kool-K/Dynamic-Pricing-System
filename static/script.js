// 🚀 Login Validation
function validateLogin() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    fetch("/login", {
        method: "POST",
        body: JSON.stringify({ username: username, password: password }),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = "/dashboard";
        } else {
            document.getElementById("error-message").textContent = data.error || "Invalid Credentials!";
        }
    })
    .catch(error => console.error("Login error:", error));
}

// 🚀 Load Inventory Data
function loadInventory() {
    fetch("/get-inventory")
        .then(response => response.json())
        .then(data => {
            let inventoryList = document.getElementById("inventory-list");
            inventoryList.innerHTML = ""; // Clear old data

            data.forEach(item => {
                let listItem = document.createElement("li");
                listItem.textContent = `${item[0]} - ${item[1]} available`;
                inventoryList.appendChild(listItem);
            });
        })
        .catch(error => console.error("Error fetching inventory:", error));
}

// 🚀 Add Item
function addItem() {
    let itemName = document.getElementById("item-name").value;
    let stock = document.getElementById("stock").value;

    fetch("/add-item", {
        method: "POST",
        body: JSON.stringify({ item_name: itemName, stock: stock }),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
        loadInventory(); 
    })
    .catch(error => console.error("Error adding item:", error));
}

// 🚀 Delete Item
function deleteItem() {
    let itemName = document.getElementById("item-name").value;

    fetch("/delete-item", {
        method: "POST",
        body: JSON.stringify({ item_name: itemName }),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
        loadInventory();
    })
    .catch(error => console.error("Error deleting item:", error));
}
