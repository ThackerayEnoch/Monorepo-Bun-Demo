export const HOME_SQL = {
  listTodos: "SELECT * FROM todos ORDER BY id DESC",
  findTodoById: "SELECT * FROM todos WHERE id = ?",
  createTodo: "INSERT INTO todos (title) VALUES (?)",
  setTodoDone: "UPDATE todos SET done = ? WHERE id = ?",
  removeTodo: "DELETE FROM todos WHERE id = ?",
} as const;
