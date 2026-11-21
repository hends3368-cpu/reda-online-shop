// shop page

const shop_items = document.getElementById("shop_items");
const filter_category = document.querySelectorAll('input[name="filter_category"]');
const filter_price = document.getElementById("filter_price");
const price_value = document.querySelector(".price_value");
const sort_products = document.getElementById("sort_products");
const count_shop = document.querySelector(".count_shop span");

const filter_side = document.querySelector(".filter_side");
const open_filter = document.querySelector(".open_filter");
const close_filter = document.querySelector(".close_filter");

function render_shop() {
    const category = document.querySelector('input[name="filter_category"]:checked').value;
    const max_price = Number(filter_price.value);
    const sort = sort_products.value;

    let products = all_products.filter((product) => {
        const same_category =
            category == "all" ||
            (category == "offers" && product.old_price) ||
            product.category == category;
        return same_category && product.price <= max_price;
    });

    if (sort == "low") {
        products.sort((a, b) => a.price - b.price);
    } else if (sort == "high") {
        products.sort((a, b) => b.price - a.price);
    } else if (sort == "name") {
        products.sort((a, b) => a.name.localeCompare(b.name));
    }

    shop_items.innerHTML = "";
    products.forEach((product) => {
        shop_items.innerHTML += product_card(product);
    });

    if (products.length == 0) {
        shop_items.innerHTML = `<p class="empty_msg">no products match this filter</p>`;
    }

    count_shop.innerHTML = products.length;
    price_value.innerHTML = `$${max_price}`;
}

// category from url (shop.html?category=appliances)
const url_category = new URLSearchParams(window.location.search).get("category");
if (url_category) {
    filter_category.forEach((input) => {
        if (input.value == url_category) input.checked = true;
    });
}

filter_category.forEach((input) => {
    input.addEventListener("change", () => {
        render_shop();
        filter_side.classList.remove("active");
    });
});
filter_price.addEventListener("input", render_shop);
sort_products.addEventListener("change", render_shop);

open_filter.addEventListener("click", () => {
    filter_side.classList.add("active");
});
close_filter.addEventListener("click", () => {
    filter_side.classList.remove("active");
});

// wait until products.json loaded in main.js
function wait_products() {
    if (all_products.length > 0) {
        render_shop();
    } else {
        setTimeout(wait_products, 100);
    }
}
wait_products();
