const plugin = {
  noteOption: {
    "open board": {
      check: async function (app, noteUUID) {
        return true;
      },

      run: async function (app, noteUUID) {
        const markdown = await app.getNoteContent({ uuid: noteUUID });
        let taskMap = await this.mapTasksToHeadings(app, markdown);
      }
    }
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
