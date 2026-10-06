import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

import type { Database } from "../database/client";
import { HOME_SQL } from "./sql";
import type { Todo, TodoRepo } from "./types";

type TodoRow = RowDataPacket & {
  id: number;
  title: string;
  done: number;
  created_at: string;
};

const toTodo = (row: TodoRow): Todo => ({
  id: row.id,
  title: row.title,
  done: row.done === 1,
  createdAt: row.created_at,
});

export function createTodoRepo(database: Database): TodoRepo {
  const findById = async (id: number): Promise<Todo | undefined> => {
    const [rows] = await database.execute<TodoRow[]>(HOME_SQL.findTodoById, [id]);
    const [row] = rows;
    return row ? toTodo(row) : undefined;
  };

  return {
    list: async () => {
      const [rows] = await database.execute<TodoRow[]>(HOME_SQL.listTodos);
      return rows.map(toTodo);
    },
    create: async (title) => {
      const [result] = await database.execute<ResultSetHeader>(HOME_SQL.createTodo, [title]);
      const todo = await findById(result.insertId);
      if (!todo) {
        throw new Error("insert failed");
      }
      return todo;
    },
    setDone: async (id, done) => {
      await database.execute(HOME_SQL.setTodoDone, [done ? 1 : 0, id]);
      return findById(id);
    },
    remove: async (id) => {
      const [result] = await database.execute<ResultSetHeader>(HOME_SQL.removeTodo, [id]);
      return result.affectedRows > 0;
    },
  };
}
