export type Todo = {
  id: number;
  title: string;
  done: boolean;
  createdAt: string;
};

export type TodoRepo = {
  list: () => Promise<Todo[]>;
  create: (title: string) => Promise<Todo>;
  setDone: (id: number, done: boolean) => Promise<Todo | undefined>;
  remove: (id: number) => Promise<boolean>;
};
