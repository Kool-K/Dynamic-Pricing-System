from flask import Flask, render_template, jsonify, request, session, redirect, url_for
import mysql.connector
import re
from datetime import datetime, timedelta
import json
from decimal import Decimal

app = Flask(__name__)
app.secret_key = 'your_secret_key'

def get_db_connection(username, password):
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user=username,
            password=password,
            database='admin_db'
        )
        return conn
    except mysql.connector.Error as err:
        print(f"Error connecting to database: {err}")
        return None

def is_password_valid(password):
    if not re.search(r"[A-Z]", password):
        return False, "Password must have at least one uppercase letter."
    if not re.search(r"[0-9]", password):
        return False, "Password must have at least one number."
    if not re.search(r"[^a-zA-Z0-9]", password):
        return False, "Password must have at least one special character."
    return True, None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password']

    is_valid, error_message = is_password_valid(password)
    if not is_valid:
        return jsonify({'success': False, 'error': error_message})

    conn = get_db_connection(username, password)
    if conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM admins WHERE username = %s AND password = %s", (username, password))
        user = cursor.fetchone()
        cursor.close()

        if user:
            session['username'] = username
            session['password'] = password
            return jsonify({'success': True})
        else:
            conn.close()
            return jsonify({'success': False, 'error': "Invalid username or password"})
    else:
        return jsonify({'success': False, 'error': "Database connection failed"})

@app.route('/dashboard')
def dashboard():
    if 'username' in session:
        return render_template('dashboard.html')
    else:
        return redirect(url_for('index'))

@app.route('/inventory')
def inventory():
    if 'username' in session:
        conn = get_db_connection(session['username'], session['password'])
        if conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM products")
            items = cursor.fetchall()
            cursor.close()

            today = datetime.now().date()
            five_days_from_now = today + timedelta(days=5)

            price_change_messages = []
            low_stock_messages = []

            for item in items:
                original_price = item['price']

                if item['expiry_date'] and not item['price_changed']:
                    if item['expiry_date'] <= five_days_from_now:
                        new_price = float(float(item['price']) * (1 - (request.args.get('discount', 5, type=int) / 100)))
                        if original_price != new_price:
                            change_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                            price_change_messages.append(f"Price reduced for stock clearance: {item['name']} (Product ID: {item['product_id']}) from {original_price:.2f} to {new_price:.2f} on {change_time}")
                            cursor = conn.cursor()
                            cursor.execute("UPDATE products SET price = %s, price_changed = TRUE WHERE product_id = %s", (new_price, item['product_id']))
                            conn.commit()
                            cursor.close()
                            item['price'] = new_price
                            item['price_changed'] = True
                            item['original_price'] = original_price
                        item['expiry_date'] = item['expiry_date'].strftime('%Y-%m-%d')

                if item['stock'] < 10 and not item['price_changed']:
                    new_price = float(float(item['price']) * (1 + (request.args.get('raise', 5, type=int) / 100)))
                    if original_price != new_price:
                        change_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                        price_change_messages.append(f"Price increased due to high demand: {item['name']} (Product ID: {item['product_id']}) from {original_price:.2f} to {new_price:.2f} on {change_time}")
                        cursor = conn.cursor()
                        cursor.execute("UPDATE products SET price = %s, price_changed = TRUE WHERE product_id = %s", (new_price, item['product_id']))
                        conn.commit()
                        cursor.close()
                        item['price'] = new_price
                        item['price_changed'] = True
                        item['original_price'] = original_price
                    low_stock_messages.append(f"Refill stock of {item['name']} (Product ID: {item['product_id']})")

                for key, value in item.items():
                    if isinstance(value, Decimal):
                        item[key] = float(value)
                item['price'] = "{:.2f}".format(item['price'])

            for item in items:
                if item['expiry_date']:
                    item['expiry_date'] = str(item['expiry_date'])

            items_json = json.dumps(items)
            expiring_items = [item['product_id'] for item in items if item['expiry_date'] and item['expiry_date'] == five_days_from_now.strftime('%Y-%m-%d')]
            expiring_items_json = json.dumps(expiring_items)

            return render_template("inventory.html",
                                   items_json=items_json,
                                   expiring_items_json=json.dumps(expiring_items),
                                   price_change_messages=json.dumps(price_change_messages),
                                   low_stock_messages=json.dumps(low_stock_messages))
        else:
            return jsonify({"error": "Database connection failed"}), 500
    else:
        return redirect(url_for('index'))

@app.route('/search-products', methods=['GET'])
def search_products():
    if 'username' in session:
        query = request.args.get('q', '')
        conn = get_db_connection(session['username'], session['password'])
        if conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT product_id, name, description
                FROM products
                WHERE MATCH(description) AGAINST (%s IN NATURAL LANGUAGE MODE)
                ORDER BY MATCH(description) AGAINST (%s) DESC
                LIMIT 10
            """, (query, query))
            results = cursor.fetchall()
            cursor.close()
            conn.close()
            return jsonify(results)
        else:
            return jsonify({'error': 'Database connection failed'}), 500
    else:
        return redirect(url_for('index'))

@app.route('/add-item', methods=['POST'])
def add_item():
    if 'username' in session:
        data = request.get_json()
        conn = get_db_connection(session['username'], session['password'])
        if conn:
            cursor = conn.cursor()
            try:
                if 'product_id' in data and data['product_id']:
                    cursor.execute("""
                        UPDATE products
                        SET name = %s, category = %s, price = %s, stock = %s, expiry_date = %s, original_price = %s
                        WHERE product_id = %s
                    """, (data['name'], data['category'], data['price'], data['stock'], data['expiry_date'], data['price'], data['product_id']))
                    conn.commit()
                    cursor.close()
                    return jsonify({"message": "Item updated successfully"})
                else:
                    cursor.execute("SELECT * FROM products WHERE name = %s", (data['name'],))
                    existing_item = cursor.fetchone()
                    if existing_item:
                        cursor.close()
                        return jsonify({"error": "Item already exists. Please update the existing record."})
                    else:
                        cursor.execute("""
                            INSERT INTO products (name, category, price, stock, expiry_date, original_price)
                            VALUES (%s, %s, %s, %s, %s, %s)
                        """, (data['name'], data['category'], data['price'], data['stock'], data['expiry_date'], data['price']))
                        conn.commit()
                        cursor.close()
                        return jsonify({"message": "Item added successfully"})
            except mysql.connector.Error as err:
                cursor.close()
                return jsonify({"error": f"Database error: {err}"}), 500
            finally:
                conn.close()
        else:
            return jsonify({"error": "Database connection failed"}), 500
    else:
        return redirect(url_for('index'))

@app.route('/delete-item', methods=['POST'])
def delete_item():
    if 'username' in session:
        data = request.get_json()
        conn = get_db_connection(session['username'], session['password'])
        if conn:
            cursor = conn.cursor()
            try:
                cursor.execute("DELETE FROM products WHERE item_name = %s", (data['item_name'],))
                conn.commit()
                cursor.close()
                conn.close()
                return jsonify({"message": "Item deleted successfully"})
            except mysql.connector.Error as err:
                cursor.close()
                conn.close()
                return jsonify({"error": f"Database error: {err}"}), 500
        else:
            return jsonify({"error": "Database connection failed"}), 500
    else:
        return redirect(url_for('index'))

@app.route('/save-prices', methods=['POST'])
def save_prices():
    if 'username' in session:
        conn = get_db_connection(session['username'], session['password'])
        if conn:
            cursor = conn.cursor()
            try:
                cursor.execute("UPDATE products SET original_price = price, price_changed = FALSE")
                conn.commit()
                cursor.close()
                conn.close()
                return jsonify({"message": "Prices saved successfully."})
            except mysql.connector.Error as err:
                print(f"Error saving prices: {err}")
                return jsonify({"error": "Failed to save prices."}), 500
        else:
            return jsonify({"error": "Database connection failed"}), 500
    else:
        return redirect(url_for('index'))

@app.route('/logout')
def logout():
    session.pop('username', None)
    session.pop('password', None)
    return redirect(url_for('index'))

@app.route('/sales_report')
def sales_report():
    if 'username' in session:
        conn = get_db_connection(session['username'], session['password'])
        if conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT p.name, SUM(s.quantity_sold) as total_sold
                FROM sales_report s
                JOIN products p ON s.product_id = p.product_id
                GROUP BY p.product_id
                ORDER BY total_sold DESC
                LIMIT 3
            """)
            top_selling_items = cursor.fetchall()
            cursor.close()
            conn.close()
            return jsonify(top_selling_items)
        else:
            return jsonify({"error": "Database connection failed"}), 500
    else:
        return redirect(url_for('index'))

@app.route('/report')
def report():
    if 'username' in session:
        return render_template('report.html')
    else:
        return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)