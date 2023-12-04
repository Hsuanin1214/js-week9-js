const api_path = "hsuanin";
const token = "tyl7WjUY5rdete24rPS7NcA3NtU2";
const url = "https://livejs-api.hexschool.io/api/livejs/v1/customer/hsuanin";

//取得商品資訊
function getProduct() {
  axios.get(`${url}/products`).then(function (response) {
    console.log(response.data.products);
    let products = response.data.products;
    renderProduct(products);
  });
}
const productList = document.querySelector(".productWrap");
function renderProduct(products) {
  let str = "";
  products.forEach((product) => {
    str += `<li class="productCard">
        <h4 class="productType">新品</h4>
        <img src="${product.images}"
            alt="">
        <a href="#" class="addCardBtn" data-id="${product.id}">加入購物車</a>
        <h3>${product.title}</h3>
        <del class="originPrice">NT$${product.origin_price.toLocaleString()}</del>
        <p class="nowPrice">NT$${product.price.toLocaleString()}</p>
    </li>`;
  });
  productList.innerHTML = str;
  addBtnClick();
}

// 加入購物車
function addCartItem(e) {
  let productId = e.target.getAttribute("data-id");
  console.log(productId);
  let addCartData = {
    data: {
      productId: productId,
      quantity: 1,
    },
  };
  axios.post(`${url}/carts`, addCartData)
  .then(function (response) {
    console.log(response.data)
  })
  .catch(function (error) {
    console.log(error.response.data)
  })
  ;
}
function addBtnClick() {
  const addCardAllBtn = document.querySelectorAll(".addCardBtn");
  addCardAllBtn.forEach((btn) => {
    console.log(btn);
    btn.addEventListener("click", addCartItem);
  });
}

function init() {
  getProduct();
}
init();
