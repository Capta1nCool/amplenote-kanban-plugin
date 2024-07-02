let kanban_html =
`
<style>
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
        text-align: center;
        font-weight: bold;
    }

    /* Card Container inside Board */
    .kanban-board .card-container {
        padding: 10px;
        overflow-y: auto;
        flex-grow: 1;
    }

    /* Individual Cards */
    .kanban-board .card {
        background-color: #f9f9f9;
        border-radius: 5px;
        padding: 10px;
        margin-bottom: 10px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .kanban-board .card:last-child {
        margin-bottom: 0;
    }

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

<div class="kanban-cont" id="kanban-cont"></div>
`

export default { kanban_html }