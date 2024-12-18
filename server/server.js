import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

// CORSの設定
app.use(cors({ origin: "*" }));

const todoList = [
  { id: "1", title: "JavaScriptを勉強する", completed: false },
  { id: "2", title: "TODOアプリを自作する", completed: false },
  { id: "3", title: "漫画を読み切る", completed: true },
  { id: "4", title: "ゲームをクリアする", completed: false },
];

let currentId = 1;

app.get("/", (c) => c.json(todoList, 200));//c.json(todoList, 200)は、todoListをJSON形式で返すという意味

app.post("/", async (c) => {//c.req.json()は、リクエストのボディをJSON形式で返すという意味
  const param = await c.req.json();

  if (!param.title) {
    throw new Error("Title must be provided");
  }

  const newTodo = {//新しいタスクを追加するためのオブジェクト
    id: String(currentId++),
    completed: !!param.completed,
    title: param.title,
  };

  todoList.push(newTodo);

  return c.json({ message: "Successfully created" }, 200);
});

app.put("/:id", async (c) => {//c.req.param("id")は、リクエストのパラメータを取得するという意味
  const param = await c.req.json();
  const id = c.req.param("id");

  if (!param.title && param.completed === undefined) {
    throw new HTTPException(400, { message: "Either title or completed must be provided" });
  }

  const todo = todoList.find((todo) => todo.id === id);
  if (!todo) {
    throw new HTTPException(400, { message: "Failed to update task title" });
  }

  if (param.title) {
    todo.title = param.title;
  }

  if (param.completed !== undefined) {
    todo.completed = param.completed;
  }

  return c.json({ message: "Task updated" }, 200);
});

app.delete("/:id", async (c) => {//c.req.param("id")は、リクエストのパラメータを取得するという意味
  const id = c.req.param("id");
  const todoIndex = todoList.findIndex((todo) => todo.id === id);
  if (todoIndex === -1) {
    throw new HttpException(400, { message: "Failed to delete task" });
  }
  todoList.splice(todoIndex, 1);

  return c.json({ message: "Task deleted" }, 200);
});

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse()
  }
});

serve({
  fetch: app.fetch,
  port: 8000,
});


