const categre_btn = document.querySelector(".categre_btn");
const category_list = document.querySelector(".category_nav_list");

categre_btn.addEventListener("click", () => {
    category_list.classList.toggle("active");
});


// open & close menu (mobile)
const nav_links = document.querySelector(".nav_links");
const open_menu = document.querySelector(".open_menu");
const close_menu = document.querySelector(".close_menu");

open_menu.addEventListener("click", () => {
    nav_links.classList.add("active");
});
close_menu.addEventListener("click", () => {
    nav_links.classList.remove("active");
});
nav_links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
        nav_links.classList.remove("active");
    });
});


// open & close cart and favourite
const cart = document.querySelector(".cart");
const favourite = document.querySelector(".favourite");
const overlay = document.querySelector(".overlay");
const open_cart = document.querySelector(".open_cart");
const open_fav = document.querySelector(".open_fav");
const close_side_box = document.querySelectorAll(".close_side_box");

function open_side_box(box) {
    box.classList.add("active");
    overlay.classList.add("active");
}

function close_side_boxes() {
    cart.classList.remove("active");
    favourite.classList.remove("active");
    overlay.classList.remove("active");
}

open_cart.addEventListener("click", () => open_side_box(cart));
open_fav.addEventListener("click", () => open_side_box(favourite));
overlay.addEventListener("click", close_side_boxes);
close_side_box.forEach((btn) => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        close_side_boxes();
    });
});


// local storage
let cart_items = JSON.parse(localStorage.getItem("cart")) || [];
let fav_items = JSON.parse(localStorage.getItem("favourite")) || [];
let all_products = [];

function save_cart() {
    localStorage.setItem("cart", JSON.stringify(cart_items));
}
function save_fav() {
    localStorage.setItem("favourite", JSON.stringify(fav_items));
}


// product card
function product_card(product) {
    const in_cart = cart_items.some((item) => item.id == product.id);
    const in_fav = fav_items.some((item) => item.id == product.id);

    const old_price = product.old_price ? `<p class="old_price">$${product.old_price}</p>` : "";
    const sale_present = product.old_price
        ? `<span class="sale_present">-${Math.floor((product.old_price - product.price) / product.old_price * 100)}%</span>`
        : "";

    return `
        <div class="product swiper-slide">
            ${sale_present}
            <span class="btn_fav ${in_fav ? "active" : ""}" data-id="${product.id}">
                <i class="fa-${in_fav ? "solid" : "regular"} fa-heart"></i>
            </span>
            <div class="img_product">
                <img src="${product.img}" alt="${product.name}">
            </div>
            <div class="stars">
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
            </div>
            <p class="name_product">${product.name}</p>
            <div class="price">
                <p><span>$${product.price}</span></p>
                ${old_price}
            </div>
            <button class="btn btn_add_cart ${in_cart ? "active" : ""}" data-id="${product.id}">
                <i class="fa-solid fa-cart-shopping"></i> ${in_cart ? "item in cart" : "add to cart"}
            </button>
        </div>
    `;
}


// render products in sections
const swiper_items_sale = document.getElementById("swiper_items_sale");
const swiper_electronics = document.getElementById("swiper_electronics");
const swiper_mobiles = document.getElementById("swiper_mobiles");
const swiper_appliances = document.getElementById("swiper_appliances");

fetch("products.json")
    .then((response) => response.json())
    .then((data) => {
        all_products = data;

        if (swiper_items_sale) {
            data.forEach((product) => {
                if (product.old_price) {
                    swiper_items_sale.innerHTML += product_card(product);
                }
                if (product.category == "electronics") {
                    swiper_electronics.innerHTML += product_card(product);
                }
                if (product.category == "mobiles") {
                    swiper_mobiles.innerHTML += product_card(product);
                }
                if (product.category == "appliances") {
                    swiper_appliances.innerHTML += product_card(product);
                }
            });

            start_products_swiper();
            search_from_url();
        }
    })
    .catch(() => {
        console.log("can't load products.json, open the site with Live Server");
    });


// add to cart & favourite (one listener for all buttons)
document.addEventListener("click", (e) => {
    const btn_cart = e.target.closest(".btn_add_cart");
    const btn_fav = e.target.closest(".btn_fav");

    if (btn_cart) {
        add_to_cart(btn_cart.dataset.id);
    }
    if (btn_fav) {
        toggle_fav(btn_fav.dataset.id);
    }
});

function add_to_cart(id) {
    const product = all_products.find((item) => item.id == id);
    if (!product || cart_items.some((item) => item.id == id)) return;

    cart_items.push({
        id: product.id,
        name: product.name,
        img: product.img,
        price: product.price,
        quantity: 1,
    });
    save_cart();
    update_cart();

    document.querySelectorAll(`.btn_add_cart[data-id="${id}"]`).forEach((btn) => {
        btn.classList.add("active");
        btn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> item in cart`;
    });
}

function remove_from_cart(id) {
    cart_items = cart_items.filter((item) => item.id != id);
    save_cart();
    update_cart();

    document.querySelectorAll(`.btn_add_cart[data-id="${id}"]`).forEach((btn) => {
        btn.classList.remove("active");
        btn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> add to cart`;
    });
}

function change_quantity(id, value) {
    const item = cart_items.find((item) => item.id == id);
    if (!item) return;

    item.quantity += value;
    if (item.quantity < 1) {
        remove_from_cart(id);
        return;
    }
    save_cart();
    update_cart();
}

function toggle_fav(id) {
    const product = all_products.find((item) => item.id == id);
    const in_fav = fav_items.some((item) => item.id == id);

    if (in_fav) {
        fav_items = fav_items.filter((item) => item.id != id);
    } else if (product) {
        fav_items.push({
            id: product.id,
            name: product.name,
            img: product.img,
            price: product.price,
        });
    }
    save_fav();
    update_fav();

    document.querySelectorAll(`.product .btn_fav[data-id="${id}"]`).forEach((btn) => {
        btn.classList.toggle("active", !in_fav);
        btn.innerHTML = `<i class="fa-${in_fav ? "regular" : "solid"} fa-heart"></i>`;
    });
}


// update cart
const items_in_cart = document.querySelector(".items_in_cart");
const count_item_header = document.querySelector(".count_item_header");
const count_item_cart = document.querySelector(".count_item_cart");
const price_cart_total = document.querySelector(".price_cart_total");

function update_cart() {
    let total_price = 0;
    let total_count = 0;
    items_in_cart.innerHTML = "";

    cart_items.forEach((item) => {
        total_price += item.price * item.quantity;
        total_count += item.quantity;

        items_in_cart.innerHTML += `
            <div class="item_cart">
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
                <button class="delete_item" data-id="${item.id}"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
    });

    if (cart_items.length == 0) {
        items_in_cart.innerHTML = `<p class="empty_msg">your cart is empty</p>`;
    }

    count_item_header.innerHTML = total_count;
    count_item_cart.innerHTML = `(${total_count} item in cart)`;
    price_cart_total.innerHTML = `$${total_price}`;
}

items_in_cart.addEventListener("click", (e) => {
    const btn_delete = e.target.closest(".delete_item");
    const btn_increase = e.target.closest(".increase_quantity");
    const btn_decrease = e.target.closest(".decrease_quantity");

    if (btn_delete) remove_from_cart(btn_delete.dataset.id);
    if (btn_increase) change_quantity(btn_increase.dataset.id, 1);
    if (btn_decrease) change_quantity(btn_decrease.dataset.id, -1);
});


// update favourite
const items_in_fav = document.querySelector(".items_in_fav");
const count_favourite = document.querySelector(".count_favourite");
const count_item_fav = document.querySelector(".count_item_fav");

function update_fav() {
    items_in_fav.innerHTML = "";

    fav_items.forEach((item) => {
        const in_cart = cart_items.some((cart_item) => cart_item.id == item.id);
        items_in_fav.innerHTML += `
            <div class="item_cart">
                <img src="${item.img}" alt="${item.name}">
                <div class="content">
                    <h4>${item.name}</h4>
                    <p class="price_cart">$${item.price}</p>
                    <button class="btn btn_add_cart ${in_cart ? "active" : ""}" data-id="${item.id}">
                        <i class="fa-solid fa-cart-shopping"></i> ${in_cart ? "item in cart" : "add to cart"}
                    </button>
                </div>
                <button class="delete_item btn_fav" data-id="${item.id}"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
    });

    if (fav_items.length == 0) {
        items_in_fav.innerHTML = `<p class="empty_msg">no favourite products yet</p>`;
    }

    count_favourite.innerHTML = fav_items.length;
    count_item_fav.innerHTML = `(${fav_items.length} item)`;
}

update_cart();
update_fav();


// search
const search_box = document.querySelector(".search_box");
const search_input = document.getElementById("search");
const category_select = document.getElementById("category");
const search_result = document.querySelector(".search_result");
const search_items = document.querySelector(".search_items");
const search_word = document.querySelector(".search_word");
const close_search = document.querySelector(".close_search");

search_box.addEventListener("submit", (e) => {
    e.preventDefault();
    const word = search_input.value.trim();
    const category = category_select.value;

    // search from another page => go to home page
    if (!search_result) {
        window.location.href = `index.html?search=${encodeURIComponent(word)}&category=${category}`;
        return;
    }
    search_products(word, category);
});

function search_products(word, category) {
    const results = all_products.filter((product) => {
        const same_name = product.name.toLowerCase().includes(word.toLowerCase());
        const same_category = category == "all" || product.category == category;
        return same_name && same_category;
    });

    search_word.innerHTML = `"${word}" (${results.length})`;
    search_items.innerHTML = "";

    results.forEach((product) => {
        search_items.innerHTML += product_card(product);
    });

    if (results.length == 0) {
        search_items.innerHTML = `<p class="empty_msg">no products found, try another word</p>`;
    }

    search_result.classList.add("active");
    search_result.scrollIntoView({ behavior: "smooth" });
}

function search_from_url() {
    const params = new URLSearchParams(window.location.search);
    const word = params.get("search");
    const category = params.get("category") || "all";

    if (word) {
        search_input.value = word;
        category_select.value = category;
        search_products(word, category);
    }
}

if (close_search) {
    close_search.addEventListener("click", () => {
        search_result.classList.remove("active");
        search_input.value = "";
    });
}


// footer year
const year = document.querySelector(".year");
if (year) {
    year.innerHTML = new Date().getFullYear();
}


// swiper
if (document.querySelector(".slide-swp")) {
      var swiper = new Swiper('.slide-swp',{
        pagination: {
          el: '.swiper-pagination',
          dynamicBullets:true,
          clickable:true,
        },
        autoplay:{
          delay:2500,
        },
        loop:true,
      });
}

function start_products_swiper() {
      var swiper_products = new Swiper('.slide-swp_product',{
        slidesPerView:5,
        spaceBetween:20,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        breakpoints:{
          0:{
            slidesPerView:1.4,
            spaceBetween:10,
          },
          600:{
            slidesPerView:2.5,
            spaceBetween:15,
          },
          900:{
            slidesPerView:3.5,
          },
          1200:{
            slidesPerView:5,
          },
        },
      });
}
