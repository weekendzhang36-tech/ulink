const screens = {
  welcome: document.querySelector("#welcome-screen"),
  profile: document.querySelector("#profile-screen"),
  success: document.querySelector("#success-screen"),
};

const state = {
  phoneMode: "wechat",
  gender: "男",
  smsSent: false,
};

const nameInput = document.querySelector("#name-input");
const phoneInput = document.querySelector("#phone-input");
const codeInput = document.querySelector("#code-input");
const birthdayInput = document.querySelector("#birthday-input");
const errorMessage = document.querySelector("#error-message");
const wechatPhoneRow = document.querySelector("#wechat-phone-row");
const smsRows = document.querySelectorAll(".sms-only");

function setScreen(screenName) {
  Object.entries(screens).forEach(([name, screen]) => {
    screen.classList.toggle("screen-active", name === screenName);
  });
}

function setPhoneMode(mode) {
  state.phoneMode = mode;
  errorMessage.textContent = "";

  document.querySelectorAll("[data-phone-mode]").forEach((button) => {
    button.classList.toggle("segment-active", button.dataset.phoneMode === mode);
  });

  wechatPhoneRow.classList.toggle("hidden", mode !== "wechat");
  smsRows.forEach((row) => row.classList.toggle("hidden", mode !== "sms"));
}

function setGender(gender) {
  state.gender = gender;
  document.querySelectorAll("[data-gender]").forEach((button) => {
    button.classList.toggle("choice-active", button.dataset.gender === gender);
  });
}

function getDisplayPhone() {
  if (state.phoneMode === "wechat") {
    return document.querySelector("#wechat-phone-value").textContent;
  }

  const raw = phoneInput.value.trim();
  if (raw.length < 7) {
    return raw;
  }

  return `${raw.slice(0, 3)} •••• ${raw.slice(-4)}`;
}

function validateAndSubmit() {
  const name = nameInput.value.trim();
  const birthday = birthdayInput.value;

  if (!name) {
    errorMessage.textContent = "请先填写姓名。";
    nameInput.focus();
    return;
  }

  if (state.phoneMode === "sms") {
    const phone = phoneInput.value.trim();
    const code = codeInput.value.trim();

    if (!/^1\d{10}$/.test(phone)) {
      errorMessage.textContent = "请输入有效的 11 位手机号。";
      phoneInput.focus();
      return;
    }

    if (!state.smsSent) {
      errorMessage.textContent = "请先获取短信验证码。";
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      errorMessage.textContent = "请输入 6 位短信验证码。";
      codeInput.focus();
      return;
    }
  }

  if (!birthday) {
    errorMessage.textContent = "请选择生日。";
    birthdayInput.focus();
    return;
  }

  errorMessage.textContent = "";
  document.querySelector("#success-name").textContent = name;
  document.querySelector("#summary-phone").textContent = getDisplayPhone();
  document.querySelector("#summary-gender").textContent = state.gender;
  document.querySelector("#summary-birthday").textContent = birthday;
  setScreen("success");
}

function resetPrototype() {
  nameInput.value = "";
  phoneInput.value = "";
  codeInput.value = "";
  birthdayInput.value = "";
  state.smsSent = false;
  document.querySelector("#send-code-button").textContent = "获取";
  setGender("男");
  setPhoneMode("wechat");
  setScreen("welcome");
}

document.querySelector("#wechat-login-button").addEventListener("click", () => {
  setScreen("profile");
});

document.querySelectorAll("[data-phone-mode]").forEach((button) => {
  button.addEventListener("click", () => setPhoneMode(button.dataset.phoneMode));
});

document.querySelector("#change-phone-button").addEventListener("click", () => {
  setPhoneMode("sms");
  phoneInput.focus();
});

document.querySelectorAll("[data-gender]").forEach((button) => {
  button.addEventListener("click", () => setGender(button.dataset.gender));
});

document.querySelector("#send-code-button").addEventListener("click", (event) => {
  const phone = phoneInput.value.trim();

  if (!/^1\d{10}$/.test(phone)) {
    errorMessage.textContent = "先输入有效手机号，再获取验证码。";
    phoneInput.focus();
    return;
  }

  state.smsSent = true;
  errorMessage.textContent = "验证码已模拟发送，输入任意 6 位数字即可继续。";
  event.currentTarget.textContent = "已发送";
});

document.querySelector("#submit-button").addEventListener("click", validateAndSubmit);
document.querySelector("#restart-button").addEventListener("click", resetPrototype);

setPhoneMode("wechat");
