const api_path = "hsuanin";
const token = "tyl7WjUY5rdete24rPS7NcA3NtU2";
const url = "https://livejs-api.hexschool.io/api/livejs/v1/customer/hsuanin";

//取得商品資訊
let products;
async function getProduct() {
  return await axios.get(`${url}/products`).then(function (response) {
    products = response.data.products;
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
//篩選 input監聽元素輸入事件
const productSelect = document.querySelector(".productSelect");
async function filterProductList() {
  productSelect.addEventListener("input", async function () {
    await getProduct();
    let valueSelect = productSelect.value;
    console.log(valueSelect);
    if (valueSelect != "全部") {
      products = products.filter((product) => product.category == valueSelect);
    }
    renderProduct(products);
  });
}

//購物車
//取得購物車
let cartAllData;
function getCart() {
  axios
    .get(`${url}/carts`)
    .then(function (response) {
      //檢查取得購物車品項
      // console.log(response.data);
      cartAllData = response.data.carts;
      renderCartItem(cartAllData);
      if (cartAllData.length !== 0) {
        deleteCartsAll();
        delSingleCartData();
      }
    })
    .catch(function (err) {
      console.log(err);
    });
}

const shoppingCartTable = document.querySelector(".shoppingCart-table");
function renderCartItem(cartData) {
  // 總金額
  let total = 0;

  let shoppingCartList = "";
  shoppingCartList += `<tr>
      <th width="40%">品項</th>
      <th width="15%">單價</th>
      <th width="15%">數量</th>
      <th width="15%">金額</th>
      <th width="15%"></th>
  </tr>`;

  cartData.forEach((data) => {
    let itemTotal = data.product.price * data.quantity;
    total += itemTotal;

    shoppingCartList += `<tr data-id="${data.id}" class="cartProduct">
        <td>
            <div class="cardItem-title">
                <img src="${data.product.images}" alt="${data.product.title}" />
                <p>${data.product.title}</p>
            </div>
        </td>
        <td>NT$${data.product.price.toLocaleString()}</td>
        <td id="calc-quantity">
            <button class="calc-quantity minus-quantity">
                <i class="fa-solid fa-square-minus fa-2xl" style="color: #301e5f;" data-id="${
                  data.id
                }" data-num="${data.quantity - 1}"></i>
            </button>
            <span class="quantity-num">${data.quantity}</span>
            <button class="calc-quantity plus-quantity">
              <i class="fa-solid fa-square-plus fa-2xl" style="color: #301e5f;" data-id="${
                data.id
              }" data-num="${data.quantity + 1}"></i>
            </button>
        </td>
        <td class="item-total">NT$${itemTotal.toLocaleString()}</td>
        <td class="discardBtn">
            <a href="#" class="material-icons" data-id="${data.id}"> clear</a>
        </td>
    </tr>`;
  });
  shoppingCartList += `<tr>
      <td>
          <a href="#" class="discardAllBtn">刪除所有品項</a>
      </td>
      <td></td> 
      <td></td>
      <td>
          <p>總金額</p>
      </td>
      <td class="totalPrice">NT$${total.toLocaleString()}</td>
  </tr>`;
  if (cartData.length == 0) {
    shoppingCartTable.innerHTML = "您的購物車是空的，趕快逛逛本季新品吧";
  } else {
    shoppingCartTable.innerHTML = shoppingCartList;
    setupQuantityButtons();
    //冗長程式碼
    // const minusOneBtns = document.querySelectorAll(".minus-quantity");
    // minusOneBtns.forEach((button) => {
    //   button.addEventListener("click", minusOne);
    // });
    // const addOneBtns = document.querySelectorAll(".plus-quantity");
    // addOneBtns.forEach((button) => {
    //   button.addEventListener("click", addOne);
    // });
  }
}

// 加入購物車
function addBtnClick() {
  const addCardAllBtn = document.querySelectorAll(".addCardBtn");
  addCardAllBtn.forEach((btn) => {
    btn.addEventListener("click", addCartItem);
  });
}
function addCartItem(e) {
  e.preventDefault();
  let productId = e.target.getAttribute("data-id");
  let addCartData = {
    data: {
      productId: productId,
      quantity: 1,
    },
  };
  axios
    .post(`${url}/carts`, addCartData)
    .then(function (response) {
      // console.log(response.data);
      // 顯示加入成功 modal
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });
      Toast.fire({
        icon: "success",
        title: "你的購物車已增加新品項",
      });
      getCart();
    })
    .catch(function (error) {
      console.log(error.response.data);
    });
}

//編輯購物車
//取得加減按鈕
function setupQuantityButtons() {
  document.querySelectorAll(".calc-quantity").forEach((button) => {
    button.addEventListener("click", handleQuantityChange);
  });
}
//數量變化
function handleQuantityChange(e) {
  const target = e.target;
  if (!target.dataset.id) return;

  const cartItemId = target.dataset.id;
  let newQuantity = parseInt(target.dataset.num);

  if (newQuantity < 1) {
    Swal.fire({
      title: "數量至少為1 La~~~~",
      icon: "error",
    });
    return;
  }
  updateCartItem(cartItemId, newQuantity);
}
//編輯購物車api
function updateCartItem(id, quantity) {
  axios
    .patch(`${url}/carts`, { data: { id, quantity } })
    .then((res) => {
      // console.log(res.data);
      getCart();
    })
    .catch((error) => {
      console.error(error);
    });
}
//冗長程式碼
// let total;
// function minusOne(e) {
//   if (!e.target.dataset.id) {
//     return;
//   }
//   let minusId = e.target.dataset.id;
//   let total = parseInt(e.target.dataset.num);
//   let data = {
//     data: {
//       id: minusId,
//       quantity: total
//     }
//   };
//   if (total >= 1) {
//     axios
//     .patch(`${url}/carts`, data)
//     .then(function (res) {
//       console.log(res.data.carts);
//       getCart();
//     })
//     .catch(function (error) {
//       console.log(error);
//     });
//   } else {
//     alert("數量至少為1");
//   }
// }
// function addOne(e) {
//   if (!e.target.dataset.id) {
//     return;
//   }
//   let addId = e.target.dataset.id;
//   let total = parseInt(e.target.dataset.num);
//   let data = {
//   data: {
//     id: addId,
//     quantity: total
//   }
// };
//   axios
//     .patch(`${url}/carts`, data)
//     .then(function (res) {
//       console.log(res.data);
//       getCart();
//     })
//     .catch(function (error) {
//       console.log(error);
//     });
// }

//刪除所有品項 (因為會有未渲染完成的問題，因此要放在取得購物車資料後)
function deleteCartsAll() {
  const discardAllBtn = document.querySelector(".discardAllBtn");
  discardAllBtn.addEventListener("click", function (e) {
    e.preventDefault();
    Swal.fire({
      title: "您確定要刪除所有品項?",
      text: "刪除後無法回復!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6a33f8",
      cancelButtonColor: "#d33",
      confirmButtonText: "確定",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(`${url}/carts`);
          getCart();
          Swal.fire({
            title: "刪除全部購物車成功！",
            icon: "success",
          });
        }
        catch(error) {
            Swal.fire({
              title: "購物車已清空，請勿重複點擊！",
              icon: "error",
            });
            console.log(error.response.data);
        }
      }
    })
  });
}
//刪除單筆品項
function delSingleCartData() {
  const discardBtnAll = document.querySelectorAll(".discardBtn");
  discardBtnAll.forEach((discardBtn) => {
    discardBtn.addEventListener("click", function (e) {
      e.preventDefault();
      let deleteId = e.target.dataset.id;
      if (deleteId == null) {
        return;
      }
      Swal.fire({
        title: "您確定要刪除該品項?",
        text: "刪除後無法回復!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#6a33f8",
        cancelButtonColor: "#d33",
        confirmButtonText: "確定",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const res = await axios.delete(`${url}/carts/${deleteId}`);
            // console.log(response.data);
            getCart();
            Swal.fire({
              title: "刪除單筆購物車成功",
              icon: "success",
            });
          }catch(error) {
            Swal.fire({
              title: "購物車已清空，請勿重複點擊！",
              icon: "error",
            });
            console.log(error.response.data);
          };
        }
      })
    });
  });
}

//訂單
// 送出訂單
let formvalue = {};

// 取得欄位值
function getValues(e) {
  const form = e.target.form;

  formvalue = {
    name: form.querySelector('[name="姓名"]') ? form.姓名.value : '',
    tel: form.querySelector('[name="電話"]') ? form.電話.value : '',
    email: form.querySelector('[name="Email"]') ? form.Email.value : '',
    address: form.querySelector('[name="寄送地址"]') ? form.寄送地址.value : '',
    payment: form.querySelector('[name="交易方式"]') ? form.交易方式.value : '',
  };
}

async function placeOrders() {
  try {
    const res = await axios.post(
      `${url}/orders`,
      {
        data: {
          user: formvalue,
        },
      }
    );
    //檢查是否有成功訂購
    // console.log('Order Response:', res.data);

    getCart();
    Swal.fire({
      title: "訂購成功!",
      icon: "success",
    });

    form.reset();
    orderInfoBtn.classList.add("disabled");
  } catch (error) {
    console.error("Error fetching products data:", error);
    Swal.fire({
      title: "訂購失敗",
      text: "無法處理您的訂單，請稍後重試。",
      icon: "error",
    });
  }
}

// 表單驗證
const pattern = /^09\d{8}$/;
const constraints = {
  姓名: {
    presence: {
      message: "為必填",
    },
  },
  電話: {
    presence: {
      message: "為必填",
    },
    format: {
      pattern: pattern,
      message: "格式不符",
    },
  },
  Email: {
    presence: {
      message: "為必填",
    },
    email: {
      message: "格式不符",
    },
  },
  寄送地址: {
    presence: {
      message: "為必填",
    },
  },
};
const form = document.querySelector(".orderInfo-form");
const inputs = document.querySelectorAll(
  "input[type=text], input[type=tel], input[type=email]"
);
const orderInfoBtn = document.querySelector(".orderInfo-btn");

function formValidate() {
  inputs.forEach((item) => {
    item.addEventListener("change", function () {
      item.nextElementSibling.textContent = "";
      let errors = validate(form, constraints);
      if (errors) {
        Object.keys(errors).forEach(function (keys) {
          const errorMsgElem = document.querySelector(`[data-message="${keys}"]`);
          if (errorMsgElem) {
            errorMsgElem.textContent = errors[keys];
          }
        });
        orderInfoBtn.classList.add("disabled");
      } else {
        orderInfoBtn.classList.remove("disabled");
      }
    });
  });

  orderInfoBtn.addEventListener("click", function (e) {
    e.preventDefault();

    if (cartAllData.length == 0) {
      Swal.fire({
        title: "您的購物車是空的，趕快逛逛本季新品吧",
        icon: "warning",
      });
      return;
    }

    getValues(e);
    placeOrders();
  });
}
formValidate();

async function init() {
  await getProduct();
  getCart();
  filterProductList();
}
init();
