// checkout page

const items_checkout = document.querySelector(".ordersummary .items");
const subtotal_checkout = document.querySelector(".subtotal_checkout");
const shipping_checkout = document.querySelector(".shipping_checkout");
const total_checkout = document.querySelector(".total_checkout");

const shipping_price = 20;

function update_checkout() {
    let subtotal = 0;
    items_checkout.innerHTML = "";

    cart_items.forEach((item) => {
        subtotal += item.price * item.quantity;

        items_checkout.innerHTML += `
            <div class="item_cart">
                <div class="image_name">
                    <img src="${item.img}" alt="${item.name}">
                    <div class="content">
                        <h4>${item.name}</h4>
                        <p class="price_cart">$${item.price * item.quantity}</p>
                        <div class="quantity_control">
                            <button class="decrease_quantity" data-id="${item.id}">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="increase_quantity" data-id="${item.id}">+</button>
                        </div>
                    </div>
                </div>
                <button class="delete_item" data-id="${item.id}"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
    });

    if (cart_items.length == 0) {
        items_checkout.innerHTML = `<p class="empty_msg">your cart is empty, <a href="index.html">go shopping</a></p>`;
    }

    const shipping = cart_items.length > 0 ? shipping_price : 0;
    subtotal_checkout.innerHTML = `$${subtotal}`;
    shipping_checkout.innerHTML = `$${shipping}`;
    total_checkout.innerHTML = `$${subtotal + shipping}`;

    // hidden inputs for google sheet
    document.getElementById("items").value = cart_items
        .map((item) => `${item.name} (x${item.quantity})`)
        .join(" | ");
    document.getElementById("count_items").value = cart_items.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById("total_price").value = subtotal + shipping;
}

items_checkout.addEventListener("click", (e) => {
    const btn_delete = e.target.closest(".delete_item");
    const btn_increase = e.target.closest(".increase_quantity");
    const btn_decrease = e.target.closest(".decrease_quantity");

    if (btn_delete) remove_from_cart(btn_delete.dataset.id);
    if (btn_increase) change_quantity(btn_increase.dataset.id, 1);
    if (btn_decrease) change_quantity(btn_decrease.dataset.id, -1);

    update_checkout();
});

// keep checkout updated when cart changes from the side cart or favourite
document.addEventListener("click", (e) => {
    if (e.target.closest(".side_box")) {
        update_checkout();
    }
});

update_checkout();


// send order to google sheet (Code gs.txt)
// put your google apps script web app url here
const scriptURL = "";

const form = document.forms["submit-to-google-sheet"];
const form_msg = document.querySelector(".form_msg");
const btn_order = document.querySelector(".btn_order");
const order_done = document.querySelector(".order_done");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (cart_items.length == 0) {
        form_msg.innerHTML = "your cart is empty, add some products first";
        return;
    }

    btn_order.disabled = true;
    btn_order.innerHTML = `sending... <i class="fa-solid fa-spinner fa-spin"></i>`;

    const send_order = scriptURL
        ? fetch(scriptURL, { method: "POST", body: new FormData(form) })
        : Promise.resolve();

    send_order
        .then(() => {
            order_done.classList.add("active");
            form.reset();
            cart_items = [];
            save_cart();
            update_cart();
            update_checkout();
        })
        .catch(() => {
            form_msg.innerHTML = "something went wrong, please try again";
        })
        .finally(() => {
            btn_order.disabled = false;
            btn_order.innerHTML = `place order <i class="fa-solid fa-check"></i>`;
        });
});
