let taskMap = {
  "Todo": [
    { "content": "Task 5", "uuid": "343e9e60-58f8-48a2-8f05-77ed3fd0c316" },
    { "content": "Task 2", "uuid": "f563077e-cf3a-4b70-a81e-a92becceafe2" }
  ],
  "In Progress": [
    { "content": "Task 1", "uuid": "a9ccf21d-7e95-46bd-92b1-4af7c0659a7f" }
  ],
  "Done": [
    { "content": "Task 3", "uuid": "61b2ec76-cd88-457f-94b8-31a43d3584d1" }
  ]
};

let kanban_cont = document.createElement("div");
kanban_cont.classList.add('kanban-cont');
document.body.appendChild(kanban_cont);

function generateHtml() {
  Object.keys(taskMap).forEach(heading => {
    let board = document.createElement('div');
    board.classList.add('kanban-board');
    kanban_cont.appendChild(board);

    let title = document.createElement('div');
    title.classList.add('board-title');
    title.innerText = heading;
    board.appendChild(title);

    let card_cont = document.createElement('div');
    card_cont.classList.add('card-container');
    board.appendChild(card_cont);

    taskMap[heading].forEach(task => {
      let card = document.createElement('div');
      card.classList.add('card');
      card.innerText = task.content;
      card.draggable = true;
      card.dataset.uuid = task.uuid; // Assigning UUID for further tracking
      card_cont.appendChild(card);
    });

    // Add task button
    let addTaskBtn = document.createElement('button');
    addTaskBtn.innerText = '+';
    addTaskBtn.classList.add('add-task-btn');
    title.appendChild(addTaskBtn);

    // Event listener for adding a new task
    addTaskBtn.addEventListener('click', () => {
      let taskContent = prompt('Enter task content');
      if (taskContent) {
        let newTaskUUID = Date.now().toString(); // Generating unique ID for task
        taskMap[heading].push({ content: taskContent, uuid: newTaskUUID });
        kanban_cont.innerHTML = ''; // Clear current content
        generateHtml(); // Regenerate the Kanban board
        addDragAndDropListeners(); // Reapply drag-and-drop listeners
      }
    });
  });
}

// Add new column logic
let col_btn = document.getElementById("add-col");
col_btn.addEventListener('click', () => {
  let heading = prompt('Enter column name');
  if (heading) {
    taskMap[heading] = [];

    kanban_cont.innerHTML = ''; // Clear content
    generateHtml(); // Re-generate the kanban board
    addDragAndDropListeners(); // Re-apply drag-and-drop listeners after re-rendering
  }
});

// Dragging feature
function addDragAndDropListeners() {
  const cards = document.querySelectorAll(".card");
  const containers = document.querySelectorAll(".card-container");

  let draggedCard = null;

  cards.forEach((card) => {
    card.addEventListener("dragstart", (e) => {
      draggedCard = card;
      setTimeout(() => {
        card.style.display = "none";
      }, 0);
    });

    card.addEventListener("dragend", () => {
      setTimeout(() => {
        draggedCard.style.display = "block";
        draggedCard = null;
      }, 0);
    });
  });

  containers.forEach((container) => {
    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      container.classList.add("drag-over");
    });

    container.addEventListener("dragleave", () => {
      container.classList.remove("drag-over");
    });

    container.addEventListener("drop", (e) => {
      e.preventDefault();
      container.classList.remove("drag-over");
      if (draggedCard) {
        container.appendChild(draggedCard);
      }
    });
  });
}

// Initial load
generateHtml();
addDragAndDropListeners();


