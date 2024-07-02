import kanban_html from './libs/kanbanHtml';

const plugin = {
  noteOption: {
    "Open": {
      check: async function (app, noteUUID) {
        return true;
      },
      run: async function (app, noteUUID) {
        const sections = await app.getNoteSections({ uuid: noteUUID });

        app.openSidebarEmbed(1, sections);
      }
    }
  },

  renderEmbed(app, ...args) {
    let container = document.createElement('div')
    container.innerHTML = kanban_html

    const sections = args[0]

    sections.forEach(section => {
      if (section.heading) {
        let card =
          `
          <div class="kanban-board">
              <div class="board-title">${section.heading.text}</div>
              <div class="card-container">
                <div class="card">Task 1</div>
                <div class="card">Task 2</div>
              </div>
          </div>
          `

        container.querySelector('#kanban-cont').innerHTML += card;
      }
    });

    return container.innerHTML;
  },
};
export default plugin;
