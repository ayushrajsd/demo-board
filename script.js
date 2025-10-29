/***********************
 * KANBAN BOARD – STEP 1
 * Base setup + Modal toggle
 * -------------------------
 * Focus: DOM selection, event listening, and toggle logic
 ***********************/

// -------------------- DOM ELEMENTS --------------------

const addBtn = document.querySelector(".add-btn");
const removeBtn = document.querySelector(".remove-btn");
const modalCont = document.querySelector(".modal-cont");
const textAreaCont = document.querySelector(".textArea-cont");
const mainCont = document.querySelector(".main-cont");

// -------------------- STATE FLAGS --------------------

let addTaskFlag = false; // Tracks whether modal is open or closed
let removeTaskFlag = false; // Tracks whether delete mode is active

let ticketsArr = [];

// Check if previous tickets exist in localStorage
if (localStorage.getItem("tickets")) {
  ticketsArr = JSON.parse(localStorage.getItem("tickets"));

  // Rebuild the UI from saved data
  for (let i = 0; i < ticketsArr.length; i++) {
    const { ticketColor, ticketID, ticketTask } = ticketsArr[i];
    createTicket(ticketColor, ticketID, ticketTask);
  }
}

function addNewTicket(ticketColor, ticketTask) {
  const id = shortid();
  ticketsArr.push({ ticketColor, ticketTask, ticketID: id });
  localStorage.setItem("tickets", JSON.stringify(ticketsArr));
  createTicket(ticketColor, id, ticketTask);
}

function getTicketIndex(id) {
  for (let i = 0; i < ticketsArr.length; i++) {
    if (ticketsArr[i].ticketID === id) {
      return i;
    }
  }
  return -1;
}

// -------------------- EVENT LISTENERS --------------------

// Toggle Modal Pop-up
addBtn.addEventListener("click", function () {
  addTaskFlag = !addTaskFlag;
  modalCont.style.display = addTaskFlag ? "flex" : "none";
});

/*
The addTaskFlag acts like a simple ON/OFF switch.
Every click on the (+) button flips the flag (true ↔ false).
When true → the modal appears (display: flex).
When false → the modal hides (display: none).
*/

// Toggle Delete Button Color
removeBtn.addEventListener("click", function () {
  removeTaskFlag = !removeTaskFlag;

  if (removeTaskFlag) {
    alert("Delete mode activated!");
    removeBtn.style.color = "red";
  } else {
    removeBtn.style.color = "white";
  }
});

/*
This toggle only changes the button color for now.
Actual deletion of tickets will be added in later steps.
*/

// -------------------- NEXT STEPS --------------------
/*
Next:
→ Generate tickets dynamically inside mainCont
→ Capture task text and priority color from the modal
→ Assign unique IDs to each ticket using the shortid library
*/

let lockClose = "fa-lock";
let lockOpen = "fa-lock-open";

function handleLock(ticket, id) {
  let ticketLockElem = ticket.querySelector(".ticket-lock");
  let ticketLockIcon = ticketLockElem.children[0];
  let ticketTaskArea = ticket.querySelector(".task-area");

  ticketLockIcon.addEventListener("click", function () {
    let index = getTicketIndex(id);
    if (ticketLockIcon.classList.contains(lockClose)) {
      ticketLockIcon.classList.remove(lockClose);
      ticketLockIcon.classList.add(lockOpen);
      ticketTaskArea.setAttribute("contenteditable", "true");
    } else {
      ticketLockIcon.classList.remove(lockOpen);
      ticketLockIcon.classList.add(lockClose);
      ticketTaskArea.setAttribute("contenteditable", "false");
    }
    // Update stored data
    ticketsArr[index].ticketTask = ticketTaskArea.innerText;
    localStorage.setItem("tickets", JSON.stringify(ticketsArr));
  });
}

function handleColor(ticket, id) {
  let ticketColorBand = ticket.querySelector(".ticket-color");

  ticketColorBand.addEventListener("click", function () {
    // Step 1: Find current color
    let currentColor = ticketColorBand.style.backgroundColor;

    // Step 2: Find index of this color in our colors array
    let currentColorIdx = colors.findIndex(function (color) {
      return currentColor === color;
    });

    // Step 3: Move to next color index (cyclic)
    let newColorIdx = (currentColorIdx + 1) % colors.length;
    let newColor = colors[newColorIdx];

    // Step 4: Update class
    ticketColorBand.style.backgroundColor = newColor;

    let index = getTicketIndex(id);
    ticketsArr[index].ticketColor = newColor;
    localStorage.setItem("tickets", JSON.stringify(ticketsArr));
  });
}

function createTicket(ticketColor, ticketID, ticketTask) {
  let ticketCont = document.createElement("div");
  ticketCont.setAttribute("class", "ticket-cont");

  ticketCont.innerHTML = `
    <div class="ticket-color" style="background-color: ${ticketColor};"></div>
    <div class="ticket-id">${ticketID}</div>
    <div class="task-area">${ticketTask}</div>
    <div class="ticket-lock"><i class="fa-solid fa-lock"></i></div>
  `;

  mainCont.appendChild(ticketCont);

  handleRemoval(ticketCont, ticketID);
  handleLock(ticketCont, ticketID);
  handleColor(ticketCont, ticketID);
}

function handleRemoval(ticket, id) {
  ticket.addEventListener("click", function () {
    if (!removeTaskFlag) return;
    ticket.remove();
    let idx = getTicketIndex(id);

    // 3. Remove it from ticketsArr
    ticketsArr.splice(idx, 1);

    // 4. Save updated array to localStorage
    localStorage.setItem("tickets", JSON.stringify(ticketsArr));
  });
}

modalCont.addEventListener("keydown", function (e) {
  const key = e.key;

  if (key === "Shift") {
    const taskContent = textAreaCont.value.trim(); // Read the text from textarea

    if (taskContent === "") {
      alert("Please enter a task before creating a ticket.");
      return;
    }
    // createTicket(modalPriorityColor, ticketID, taskContent);
    addNewTicket(modalPriorityColor, taskContent);

    // Close the modal and reset textarea
    modalCont.style.display = "none";
    addTaskFlag = false;
    textAreaCont.value = "";
  }
});

const allPriorityColors = document.querySelectorAll(".priority-color");
const colors = ["lightpink", "lightgreen", "lightblue", "black"];

// By default, black will be active
let modalPriorityColor = colors[colors.length - 1]; // default = 'black'

// Loop over all color divs and attach click listeners
allPriorityColors.forEach(function (colorElem) {
  colorElem.addEventListener("click", function () {
    // Remove 'active' class from all colors
    allPriorityColors.forEach(function (priorityColorElem) {
      priorityColorElem.classList.remove("active");
    });

    // Add 'active' class to the clicked color
    colorElem.classList.add("active");

    // Store the selected color
    modalPriorityColor = colorElem.classList[0];
  });
});

let toolboxColors = document.getElementsByClassName("color");

for (let i = 0; i < toolboxColors.length; i++) {
  toolboxColors[i].addEventListener("click", function () {
    // Step 1: Identify selected color
    let selectedColor = toolboxColors[i].classList[0];

    // Step 2: Select all tickets
    let allTickets = document.getElementsByClassName("ticket-cont");

    // Step 3: Loop through each ticket
    for (let j = 0; j < allTickets.length; j++) {
      // Find ticket's color band
      let ticketColorBand = allTickets[j].querySelector(".ticket-color");
      let ticketColor = ticketColorBand.style.backgroundColor;

      // Step 4: Compare colors
      if (ticketColor === selectedColor) {
        allTickets[j].style.display = "block"; // show matching
      } else {
        allTickets[j].style.display = "none"; // hide others
      }
    }
  });

  // Step 5: Handle double-click to show all again
  toolboxColors[i].addEventListener("dblclick", function () {
    let allTickets = document.getElementsByClassName("ticket-cont");
    for (let k = 0; k < allTickets.length; k++) {
      allTickets[k].style.display = "block";
    }
  });
}
