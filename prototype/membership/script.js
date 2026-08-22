const defaultValues = {
  type: "count",
  shopName: "学院咖啡实训基地",
  cardTitle: "实训卡 workshop pass",
  cardFaceName: "金会员卡",
  price: "100",
  originPrice: "199",
  count: "10",
  deductCount: "1",
  balance: "120",
  deductMode: "核销时输入消费金额",
  validDays: "180",
  serviceItems: ["任意饮品", "轻食套餐", "校园活动物料"].join("\n"),
  saleStatus: "上架中",
  saleStart: "2026-08-04T09:00",
  saleEnd: "2026-09-30T23:59",
  stock: "200",
  limitPerUser: "1",
  buyButtonText: "立即购买",
  shareTitle: "学院咖啡实训卡限时开放",
  shareDesc: "100 元解锁饮品、校园权益和抽奖福利",
  allowGift: true,
  allowRefund: false,
  verifyMethod: "管理员扫码核销",
  verifyLocation: "金鹏学院肇庆校区银信楼对面",
  revokeWindow: "核销后 5 分钟内可撤销",
  expireAction: "到期后不可使用，余额/次数保留记录",
  benefits: [
    "校园生活指南手册",
    "10杯饮品(任意饮品)",
    "送联通150G流量卡(内含100元话费)",
    "职业性格测评(MBTI、霍兰德AI加强版)",
    "建行金蜜蜂卡1元领饮品(满10减9)",
    "幸运抽奖(百分百中奖)",
  ].join("\n"),
  supportCopy: "我是有底线的 · 提供技术支持",
};

const fields = {
  shopName: document.querySelector("#shop-name"),
  cardTitle: document.querySelector("#card-title"),
  cardFaceName: document.querySelector("#card-face-name"),
  price: document.querySelector("#sale-price"),
  originPrice: document.querySelector("#origin-price"),
  count: document.querySelector("#card-count"),
  deductCount: document.querySelector("#deduct-count"),
  balance: document.querySelector("#card-balance"),
  deductMode: document.querySelector("#deduct-mode"),
  validDays: document.querySelector("#valid-days"),
  serviceItems: document.querySelector("#service-items"),
  saleStatus: document.querySelector("#sale-status"),
  saleStart: document.querySelector("#sale-start"),
  saleEnd: document.querySelector("#sale-end"),
  stock: document.querySelector("#stock"),
  limitPerUser: document.querySelector("#limit-per-user"),
  buyButtonText: document.querySelector("#buy-button-text"),
  shareTitle: document.querySelector("#share-title"),
  shareDesc: document.querySelector("#share-desc"),
  allowGift: document.querySelector("#allow-gift"),
  allowRefund: document.querySelector("#allow-refund"),
  verifyMethod: document.querySelector("#verify-method"),
  verifyLocation: document.querySelector("#verify-location"),
  revokeWindow: document.querySelector("#revoke-window"),
  expireAction: document.querySelector("#expire-action"),
  benefits: document.querySelector("#benefits"),
  supportCopy: document.querySelector("#support-copy"),
};

let cardType = defaultValues.type;

function setAppView(viewName) {
  document.querySelectorAll("[data-app-view]").forEach((button) => {
    button.classList.toggle("app-tab-active", button.dataset.appView === viewName);
  });

  document.querySelectorAll(".app-view").forEach((view) => {
    view.classList.toggle("app-view-active", view.id === `${viewName}-view`);
  });

  document.querySelector("#nav-title").textContent = viewName === "admin" ? "会员卡管理" : "套餐详情";
}

function setAdminPanel(panelName) {
  document.querySelectorAll("[data-admin-panel]").forEach((button) => {
    button.classList.toggle("admin-tab-active", button.dataset.adminPanel === panelName);
  });

  document.querySelectorAll(".admin-panel").forEach((panel) => {
    panel.classList.toggle("admin-panel-active", panel.id === `${panelName}-panel`);
  });
}

function setCardType(type) {
  cardType = type;
  document.querySelectorAll("[data-card-type]").forEach((button) => {
    button.classList.toggle("type-active", button.dataset.cardType === type);
  });

  document.querySelectorAll(".count-setting").forEach((row) => row.classList.toggle("hidden", type !== "count"));
  document.querySelectorAll(".balance-setting").forEach((row) => row.classList.toggle("hidden", type !== "balance"));
  document.querySelector("#card-type-status").textContent = type === "count" ? "次数卡" : "充值卡";
  updatePreview();
}

function getLines(value) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function updatePreview() {
  const shopName = fields.shopName.value.trim() || defaultValues.shopName;
  const title = fields.cardTitle.value.trim() || defaultValues.cardTitle;
  const cardFaceName = fields.cardFaceName.value.trim() || defaultValues.cardFaceName;
  const price = fields.price.value || defaultValues.price;
  const originPrice = fields.originPrice.value || defaultValues.originPrice;
  const validDays = fields.validDays.value || defaultValues.validDays;
  const buyButtonText = fields.buyButtonText.value.trim() || defaultValues.buyButtonText;
  const supportCopy = fields.supportCopy.value.trim() || defaultValues.supportCopy;
  const benefits = getLines(fields.benefits.value || defaultValues.benefits);
  const serviceItems = getLines(fields.serviceItems.value || defaultValues.serviceItems);

  document.querySelector("#preview-shop").textContent = shopName;
  document.querySelector("#preview-title").textContent = title;
  document.querySelector("#preview-price").textContent = price;
  document.querySelector("#preview-pay-price").textContent = price;
  document.querySelector("#preview-buy-text").textContent = buyButtonText;
  document.querySelector("#preview-origin").textContent = originPrice;
  document.querySelector("#preview-valid").textContent = `有效期 ${validDays} 天`;
  document.querySelector("#preview-support").textContent = supportCopy;
  document.querySelector("#preview-service-items").textContent = serviceItems.join("、");
  document.querySelector("#preview-verify-method").textContent = fields.verifyMethod.value;
  document.querySelector("#preview-verify-location").textContent = fields.verifyLocation.value.trim() || defaultValues.verifyLocation;

  const list = document.querySelector("#preview-benefits");
  list.innerHTML = "";
  benefits.forEach((benefit) => {
    const item = document.createElement("li");
    item.textContent = benefit;
    list.appendChild(item);
  });

  if (cardType === "balance") {
    document.querySelector("#preview-card-name").textContent = cardFaceName || "储值会员卡";
    document.querySelector("#preview-value").textContent = fields.balance.value || defaultValues.balance;
    document.querySelector("#preview-unit").textContent = "元";
  } else {
    document.querySelector("#preview-card-name").textContent = cardFaceName || "金会员卡";
    document.querySelector("#preview-value").textContent = fields.count.value || defaultValues.count;
    document.querySelector("#preview-unit").textContent = "次";
  }
}

function resetPrototype() {
  Object.entries(fields).forEach(([key, input]) => {
    if (input.type === "checkbox") {
      input.checked = Boolean(defaultValues[key]);
    } else {
      input.value = defaultValues[key];
    }
  });
  setCardType(defaultValues.type);
  setAdminPanel("card");
  updatePreview();
}

document.querySelectorAll("[data-app-view]").forEach((button) => {
  button.addEventListener("click", () => setAppView(button.dataset.appView));
});

document.querySelectorAll("[data-admin-panel]").forEach((button) => {
  button.addEventListener("click", () => setAdminPanel(button.dataset.adminPanel));
});

document.querySelectorAll("[data-card-type]").forEach((button) => {
  button.addEventListener("click", () => setCardType(button.dataset.cardType));
});

Object.values(fields).forEach((field) => {
  field.addEventListener("input", updatePreview);
  field.addEventListener("change", updatePreview);
});

document.querySelector("#add-admin-button").addEventListener("click", () => {
  const phone = document.querySelector("#admin-phone").value.trim();
  const role = document.querySelector("#admin-role").value;

  if (!phone) {
    return;
  }

  const item = document.createElement("article");
  const textWrap = document.createElement("div");
  const phoneText = document.createElement("strong");
  const roleText = document.createElement("span");
  const removeButton = document.createElement("button");
  phoneText.textContent = phone;
  roleText.textContent = role;
  removeButton.type = "button";
  removeButton.textContent = "移除";
  removeButton.addEventListener("click", () => item.remove());
  textWrap.append(phoneText, roleText);
  item.append(textWrap, removeButton);
  document.querySelector(".admin-list").prepend(item);
});

document.querySelectorAll(".admin-list button").forEach((button) => {
  button.addEventListener("click", () => button.closest("article").remove());
});

document.querySelector("#reset-button").addEventListener("click", resetPrototype);

document.querySelector("#publish-button").addEventListener("click", (event) => {
  event.currentTarget.textContent = "已保存";
  window.setTimeout(() => {
    event.currentTarget.textContent = "保存配置";
  }, 1400);
});

resetPrototype();
