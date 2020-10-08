const checkUsername = (e) => {
  // console.log(e.target.value);
};

const randomTwoDigit = () => {
  return Math.floor(Math.random() * 255).toString(16);
};

const setRoomErrorVisibility = (factor, roomOption) => {
  const el = document.querySelector(".user-login-form__roomname-error");
  const inputEl = document.querySelector(".user-login-form__roomname");
  const buttonEl = document.querySelector(".user-login-form__submitButton");
  if (roomOption === "create") el.innerHTML = "already exists!";
  else el.innerHTML = "no room found";
  if (!factor) {
    el.style.visibility = "visible";
    inputEl.style.background = "var(--error-color)";
    inputEl.style.boxShadow = "0 2px 5px #0b0b4f40";
    buttonEl.removeAttribute("enabled");
    buttonEl.setAttribute("disabled", true);
  } else {
    el.style.visibility = "hidden";
    inputEl.style.background = "#edf6f9";
    buttonEl.removeAttribute("disabled");
    buttonEl.setAttribute("enabled", true);
  }
};

const checkRoom = (e) => {
  const roomname = document.querySelector(".user-login-form__roomname").value;
  const roomOption = document.querySelector(
    ".user-login-form__roomOption_select"
  ).value;
  const downArrow = document
    .querySelector(".down-arrow")
    .classList.add("down-arrow-clicked");
  console.log(roomname, roomOption);
  fetch("http://localhost:3000/api/isRoomValid", {
    method: "post",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      roomname: roomname,
      roomOption: roomOption,
    }),
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      setRoomErrorVisibility(data.isValid, roomOption);
    });
};

const userLoginSelect = document.querySelector(
  ".user-login-form__roomOption_select"
);
userLoginSelect.addEventListener("click", selectClicked);

function selectClicked(e) {
  const downArrow = document.querySelector(".down-arrow");
  if (downArrow.classList.contains("down-arrow-clicked"))
    downArrow.classList.remove("down-arrow-clicked");
  else downArrow.classList.add("down-arrow-clicked");
}

let color = "";

$(".user-color").click(function () {
  color = "#";
  for (let i = 0; i < 3; i++) {
    color += randomTwoDigit();
  }
  let colorHex = color.split("#")[1];
  $(".user-color-value").attr("value", colorHex);
  $(".user-color").css({
    "background-color": color,
  });
  $(".user-color-set").css({
    "background-color": color,
  });
});
