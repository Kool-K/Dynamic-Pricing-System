# Dynamic Pricing & Inventory Management System 📈

A full-stack web application built with **Flask** and **MySQL** to provide a sophisticated dynamic pricing and inventory management solution for small businesses.

This system is designed for businesses with fluctuating inventory and seasonal demand, such as local food vendors. It features a powerful hybrid pricing engine that combines real-time, condition-based adjustments with pre-scheduled, automated discounts.

![image](https://user-images.githubusercontent.com/...)  ---

## 🧐 About The Project

This project provides an end-to-end solution for inventory management, featuring a secure admin login, a dashboard for navigation, an interactive inventory management interface, and a reporting page.

The core of the system is its unique **hybrid dynamic pricing engine**:
* **Real-Time Logic (Flask Backend):** The application backend automatically adjusts prices based on immediate conditions every time the inventory is viewed. It applies discounts for items nearing their expiry date and increases prices for products with low stock, reflecting high demand.
* **Scheduled Automation (MySQL Events):** The database handles large-scale, pre-planned promotional events. Using MySQL Events, the system automatically applies discounts for holidays like Diwali, Christmas, and New Year's without any manual intervention.

This dual approach ensures both strategic, long-term promotions and reactive, short-term price optimization.

---

## ✨ Features

### Core Application
* **Secure Admin Authentication:** A complete login/logout system to protect the dashboard and data.
* **Central Dashboard:** Provides easy navigation to the inventory and reporting sections.
* **Full Product Management (CRUD):** Admins can add, view, update, and delete products through an intuitive UI.
* **Live Product Search:** The inventory page features a live search bar that uses the database's **Full-Text Search** capabilities to instantly find products based on their description.
* **Sales-Driven Reporting:** A dedicated reports page visualizes sales data, such as "Our Bestsellers this April!".

### Hybrid Dynamic Pricing Engine
* **Low Stock Price Increase:** Automatically raises the price of items when stock levels fall below a set threshold (e.g., less than 10 units), signaling high demand.
* **Expiry-Based Discounting:** Automatically discounts items that are within 5 days of their expiration date to encourage sales and reduce waste.
* **Scheduled Holiday Promotions:** Uses **MySQL Events** to run pre-scheduled discounts for holidays like Diwali and Christmas on specific product categories.
* **Price Change Locking:** Admins can "save" the current dynamically-adjusted prices, which sets them as the new base price and makes them eligible for future adjustments.
* **Event Logging:** Price changes and low stock alerts are logged and can be viewed on the inventory page.

### Advanced Database Backend
* **Automated Data Archival:** A **Trigger** automatically archives expired products into a separate table before they are deleted, maintaining a historical record.
* **Database-Level Password Policy:** A **Trigger** enforces a strong password policy (uppercase, number, special character) for all new admin accounts, adding a layer of security.
* **Optimized Views & Procedures:** Utilizes MySQL Views, Stored Procedures, and Functions for efficient data retrieval and reusable business logic.

---

## 🛠️ Tech Stack

* **Backend:** Python, **Flask**
* **Database:** MySQL with `mysql-connector-python`
    * **Advanced Features:** Events, Triggers, Stored Procedures, Full-Text Search
* **Frontend:** HTML, CSS, JavaScript

---

## 📁 Project Structure
```
Here is an overview of the project's file structure.

Dynamic-Pricing-System/
│
├── app.py                      # Main Flask application with all backend logic and routes.
├── README.md                   # This documentation file.
│
├── static/                     # Contains all static files (CSS and JavaScript).
│   ├── dashboard.css           # Styles for the dashboard.
│   ├── dashboard.js            # Scripting for the dashboard.
│   ├── inventory.css           # Styles for the inventory page.
│   ├── inventory.js            # Core logic for the interactive inventory page.
│   ├── report.css              # Styles for the report page.
│   ├── report.js               # Scripting for the report charts.
│   └── styles.css              # General and login page styles.
│
├── templates/                  # Contains all HTML files rendered by Flask.
│   ├── dashboard.html          # The main admin dashboard.
│   ├── index.html              # The login page.
│   ├── inventory.html          # The page for managing and viewing inventory.
│   └── report.html             # The page for displaying sales reports.
│
└── ... (Backend SQL Files)     # .txt files containing SQL scripts and database logs.
```

---

## 🚀 Getting Started

Follow these steps to get a local copy of the project up and running.

### Prerequisites

* Python 3.x & pip
* MySQL Server

### Installation & Setup

1.  **Clone the repo:**
    ```sh
    git clone [https://github.com/Kool-K/Dynamic-Pricing-System.git](https://github.com/Kool-K/Dynamic-Pricing-System.git)
    cd Dynamic-Pricing-System
    ```

2.  **Create and activate a virtual environment (Recommended):**
    ```sh
    # Windows
    python -m venv venv && .\venv\Scripts\activate
    # macOS/Linux
    python3 -m venv venv && source venv/bin/activate
    ```

3.  **Install Python packages:**
    > **Note:** Create a `requirements.txt` file by running `pip freeze > requirements.txt`. It should contain `Flask`, `mysql-connector-python`, and any other dependencies.
    ```sh
    pip install -r requirements.txt
    ```

4.  **Set up the MySQL Database:**
    * Start your MySQL server and create a database (e.g., `admin_db`).
    * Execute the SQL scripts from the `.txt` files to set up the complete schema, tables, views, triggers, and all stored logic.
    * Update your database connection credentials in `app.py`.

5.  **Enable the MySQL Event Scheduler:**
    This is **required** for the automated holiday discounts to work. Run this command in your MySQL client:
    ```sql
    SET GLOBAL event_scheduler = ON;
    ```
   
6.  **Run the Flask application:**
    ```sh
    python app.py
    ```
    Your application should now be running in debug mode at `http://127.0.0.1:5000`.

---
## 🔌 API Endpoints

The Flask backend provides several routes to power the application.

<details>
<summary>Click to view key API Endpoints</summary>

| Method | Endpoint               | Description                                                                                                   |
| :----- | :--------------------- | :------------------------------------------------------------------------------------------------------------ |
| `GET`  | `/`                    | Renders the main login page (`index.html`).                                                                   |
| `POST` | `/login`               | Handles user authentication. Expects a JSON payload with `username` and `password`.                             |
| `GET`  | `/dashboard`           | Renders the main dashboard after a successful login.                                                          |
| `GET`  | `/inventory`           | Renders the inventory page, fetches all products, and applies real-time pricing logic.                          |
| `GET`  | `/report`              | Renders the sales report page.                                                                                |
| `GET`  | `/search-products`     | Performs a full-text search on product descriptions based on a query parameter `q`.                           |
| `POST` | `/add-item`            | Adds a new item or updates an existing one. Expects item data in a JSON payload.                              |
| `POST` | `/delete-item`         | Deletes an item from the inventory.                                                                           |
| `POST` | `/save-prices`         | Resets the `price_changed` flag for all products, locking in the current prices as the new base.                |
| `GET`  | `/logout`              | Clears the user session and redirects to the login page.                                                      |

</details>
