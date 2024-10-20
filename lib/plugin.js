const plugin = {
  noteOption: {
    "open board": {
      check: async function (app, noteUUID) {
        return true;
      },

      run: async function (app, noteUUID) {
        this.noteUUID = noteUUID;
        const markdown = await app.getNoteContent({ uuid: noteUUID });
        let taskMap = await this.mapTasksToHeadings(app, markdown);

        app.openSidebarEmbed(1, JSON.stringify(taskMap));
      }
    }
  },

  renderEmbed(app, ...args) {
    return `<style>
  /* Basic Reset */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f9;
    padding: 20px;
  }

  /* Kanban Container */
  .kanban-cont {
    display: flex;
    gap: 20px;
    overflow-x: auto;
  }

  /* Individual Kanban Board */
  .kanban-board {
    background-color: #ffffff;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    flex-basis: calc((100% - 2 * 20px) / 3);
    flex-shrink: 0;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  /* Board Title */
.board-title {
    background-color: #8f63ff;
    color: white;
    padding: 10px;
    border-radius: 10px 10px 0 0;
    font-size: 1.2em;
    text-align: left;
    font-weight: bold;
    display: flex;
    justify-content: space-between;  /* Align title and button on opposite ends */
    align-items: center;  /* Vertically center both elements */
  }

  .add-task-btn {
    background-color: transparent;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 1em;
    border-radius: 5px;
  }

  .add-task-btn:hover {
    background-color: rgba(0, 0, 0, 0.2);  /* Darker blue on hover */
  }
    
  .task-checkbox {
    margin: 0.3rem
  }

  .delete-col-btn {
    background-color: transparent;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 1em;
    border-radius: 5px;
  }

  .delete-col-btn:hover {
    background-color: #f95a5a;  /* Darker blue on hover */
  }    
  
  /* Card Container inside Board */
  .kanban-board .card-container {
    padding: 10px;
    overflow-y: auto;
    flex-grow: 1;
    min-height: 100px;
    border: 2px dashed transparent;
  }

  /* Individual Cards */
  .kanban-board .card {
    background-color: #f9f9f9;
    border-radius: 5px;
    padding: 10px;
    margin-bottom: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    cursor: grab;
  }

  .kanban-board .card:last-child {
    margin-bottom: 0;
  }

  .card-checkbox {
    margin-right: 0.5rem;
  }

  /* Highlight when dragging over */
  .kanban-board .card-container.drag-over {
    border: 2px dashed #8f63ff;
  }

  #add-col {
    padding: 10px;
    border: none;
    box-shadow: 10px, 10px;
  }
 
  .auto {cursor: auto;}

  @media (max-width: 768px) {
    .kanban-cont {
        flex-direction: column;
        align-items: center;
    }

    .kanban-board {
        width: 90%;
    }
  }
</style>
<button id="add-col" style="cursor: pointer;">Add Column</button>
<script>
  let taskMap = ${args[0]}

  let kanban_cont = document.createElement("div");
  kanban_cont.classList.add('kanban-cont');
  document.body.appendChild(kanban_cont);

  function generateHtml() {
    Object.keys(taskMap).forEach(heading => {
      if(heading == 'Completed tasks<!-- {"omit":true} -->') return
      let board = document.createElement('div');
      board.classList.add('kanban-board');
      kanban_cont.appendChild(board);

      let title = document.createElement('div');
      title.classList.add('board-title');
      let titleContent = document.createElement('span');
      titleContent.innerText = heading;
      titleContent.classList.add('auto')
      titleContent.contentEditable = true;
      title.appendChild(titleContent)
      board.appendChild(title);

      titleContent.addEventListener('blur', () => {
        const newTitle = titleContent.innerText.trim();

        if (newTitle !== heading && newTitle !== '') {
          let taskMapEntries = Object.entries(taskMap);

          // Find the index of the old heading
          let index = taskMapEntries.findIndex(entry => entry[0] === heading);

          if (index !== -1) {
            taskMapEntries[index][0] = newTitle;
            taskMap = Object.fromEntries(taskMapEntries);

            kanban_cont.innerHTML = '';
            generateHtml();
            addDragAndDropListeners();

            window.callAmplenotePlugin("update_note", taskMap);
          }
        }
     });

      let card_cont = document.createElement('div');
      card_cont.classList.add('card-container');
      board.appendChild(card_cont);

      taskMap[heading].forEach(task => {
        let card = document.createElement('div');
        card.classList.add('card');

        // Task checkbox
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('task-checkbox');
        checkbox.checked = task.completedAt || false; // Mark as checked if already done
        card.appendChild(checkbox);

        // Task content
        let taskContent = document.createElement('span');
        taskContent.innerText = task.content;
        taskContent.contentEditable = true;
        taskContent.classList.add('auto')
        card.appendChild(taskContent);

        // Event listener for content modification
        taskContent.addEventListener('input', () => {
          const newContent = taskContent.innerText.trim();
          if (newContent !== task.content) {
            // Update taskMap with the new content
            taskMap[heading].forEach(t => {
              if (t.uuid === task.uuid) {
                t.content = newContent;
              }
            });
            window.callAmplenotePlugin("update_note", taskMap);
          }
        });

        card.draggable = true;
        card.dataset.uuid = task.uuid; // Assigning UUID for further tracking
        card_cont.appendChild(card);

        // Event listener for marking the task as done
        checkbox.addEventListener('change', (e) => {
          window.callAmplenotePlugin('update_task', task.uuid, e.target.checked)
          if(e.target.checked) {
            task.completedAt = Math.floor(Date.now() / 1000);
          } else {
            task.completedAt = null;
          }
          taskContent.style.textDecoration = task.completedAt ? 'line-through' : 'none';
          window.callAmplenotePlugin("update_note", taskMap); // Update taskMap in the note
        });

        // Initial style for completed tasks
        if (task.isDone) {
          taskContent.style.textDecoration = 'line-through';
        }
      });
      // Add task button
      let addTaskBtn = document.createElement('button');
      addTaskBtn.innerText = '+';
      addTaskBtn.classList.add('add-task-btn');
      title.appendChild(addTaskBtn);

      // Delete column button
      let deleteColBtn = document.createElement('button');
      deleteColBtn.innerText = 'Delete';
      deleteColBtn.classList.add('delete-col-btn');
      title.appendChild(deleteColBtn);

      // Event listener for adding a new task
      addTaskBtn.addEventListener('click', () => {
        window.callAmplenotePlugin("prompt", "Enter task content").then(taskContent => {
          if (taskContent) {
            window.callAmplenotePlugin("add_task", taskContent).then(taskUUID => {
              taskMap[heading].push({ content: taskContent, uuid: taskUUID });
              kanban_cont.innerHTML = ''; // Clear current content
              generateHtml(); // Regenerate the Kanban board
              addDragAndDropListeners(); // Reapply drag-and-drop listeners
              window.callAmplenotePlugin("update_note", taskMap);
            })
          }
        })
      });

      // Event listener for deleting the column
      deleteColBtn.addEventListener('click', () => {
        delete taskMap[heading]; // Remove the column from taskMap
        kanban_cont.innerHTML = ''; // Clear current content
        generateHtml(); // Regenerate the Kanban board without the deleted column
        addDragAndDropListeners(); // Reapply drag-and-drop listeners
        window.callAmplenotePlugin("update_note", taskMap); // Update taskMap in the note
      });
    });
  }

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
  let col_btn = document.getElementById("add-col");
  col_btn.addEventListener('click', () => {
    window.callAmplenotePlugin("prompt", "Enter board heading").then(heading => {
      if (heading) {
        taskMap[heading] = [];

        kanban_cont.innerHTML = ''; // Clear content
        generateHtml(); // Re-generate the kanban board
        addDragAndDropListeners(); // Re-apply drag-and-drop listeners after re-rendering
        window.callAmplenotePlugin("update_note", taskMap);
      }
    })
  });


  generateHtml();
  addDragAndDropListeners();
</script>
`;
  },

  async onEmbedCall(app, ...args) {
    let action = args[0]
    console.log(args)
    if (action === "prompt") {
      let result = await app.prompt(args[1]);
      return result.replace(/\n/g, ''); // Remove all line breaks
    }
    else if (action == "update_note") {
      let taskMap = args[1]
      let markdown = this.generateMarkdown(taskMap)
      await app.replaceNoteContent({ uuid: this.noteUUID }, markdown);
    }
    else if (action == "add_task") {
      const taskUUID = await app.insertTask({ uuid: this.noteUUID }, { text: args[1] });
      return taskUUID
    }
    else if (action == "update_task") {
      if (args[2]) {
        await app.updateTask(args[1], { completedAt: Math.floor(Date.now() / 1000) });
      } else {
        await app.updateTask(args[1], { completedAt: null });
      }
    }
  },

  generateMarkdown(taskMap) {
    let markdown = '';

    Object.keys(taskMap).forEach(heading => {
      markdown += `# ${heading}\n\n`;

      taskMap[heading].forEach(task => {
        markdown += `- [ ] ${task.content}<!-- {"uuid":"${task.uuid}"} -->\n`;
      });

      markdown += '\n'; // Add a line break between sections
    });

    return markdown.trim();
  },

  async mapTasksToHeadings(app, markdown) {
    const headingRegex = /^(#+) (.+)$/gm;
    const taskRegex = /- \[ \] (.+?)<!-- {"uuid":"(.+?)"} -->/g;
    const mapping = {};
    let currentHeading = '';

    const lines = markdown.split('\n');

    for (const line of lines) {
      const headingMatch = headingRegex.exec(line);
      if (headingMatch) {
        // Store current heading
        currentHeading = headingMatch[2].trim();
        mapping[currentHeading] = [];
      } else {
        // Match tasks under the current heading
        const taskMatch = taskRegex.exec(line);
        if (taskMatch && currentHeading) {
          const taskContent = taskMatch[1].trim();
          const taskUUID = taskMatch[2].trim();

          // Fetch task information
          const taskInfo = await app.getTask(taskUUID);
          if (taskInfo) {
            mapping[currentHeading].push(taskInfo);
          }
        }
      }
    }
    return mapping;
  }
}
