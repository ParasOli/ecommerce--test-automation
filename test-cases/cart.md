# Shopping Cart

Site: https://ecommerce-playground.lambdatest.io (OpenCart demo store)
Cart page: `/index.php?route=checkout/cart`

The five most important cart checks: adding, changing quantity, removing, totals with several products, and moving on to checkout.

| ID         | Title                                                 | Priority |
| ---------- | ----------------------------------------------------- | -------- |
| TC-CART-01 | Adds a product to the cart from the product page      | Critical |
| TC-CART-02 | Updates the quantity and recalculates the total       | High     |
| TC-CART-03 | Removes a product and shows the empty cart            | High     |
| TC-CART-04 | Shows every product and the correct total for several | High     |
| TC-CART-05 | Goes to checkout from the cart                        | High     |

---

## TC-CART-01: adds a product to the cart from the product page

**Precondition:** the cart is empty (new session).

**Steps**

1. Open the iPhone product page (`/index.php?route=product/product&product_id=40`) at desktop width (992px or wider).
2. Click **Add to Cart**.
3. Open the cart page.

**Expected**

- After step 2, a success toast says the product was added to the shopping cart.
- The cart lists **iPhone** with quantity **1**.
- The row total equals the unit price.

---

## TC-CART-02: updates the quantity and recalculates the total

**Precondition:** iPhone is in the cart with quantity 1.

**Steps**

1. Open the cart page.
2. Change the iPhone quantity to **3**.
3. Click the **Update** button for that row.

**Expected**

- A success message says the shopping cart was modified.
- The quantity field shows **3**.
- The row total equals unit price × 3.

---

## TC-CART-03: removes a product and shows the empty cart

**Precondition:** iPhone is the only product in the cart.

**Steps**

1. Open the cart page.
2. Click the **Remove** button for the iPhone row.

**Expected**

- iPhone is no longer listed.
- The page shows "Your shopping cart is empty!".

---

## TC-CART-04: shows every product and the correct total for several products

**Precondition:** the cart is empty.

**Steps**

1. Add two different products to the cart (quantity 1 each).
2. Open the cart page.

**Expected**

- Both products are listed, each with quantity 1.
- The **Total** equals the sum of the two row totals (row prices include tax).
- **Sub-Total** plus the tax lines (Eco Tax, VAT) equals **Total**.

---

## TC-CART-05: goes to checkout from the cart

**Precondition:** iPhone is in the cart.

**Steps**

1. Open the cart page.
2. Click **Checkout**.

**Expected**

- The checkout page opens (`route=checkout/checkout`).
