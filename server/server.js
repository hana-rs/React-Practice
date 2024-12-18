import Database from 'better-sqlite3';
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { HTTPException } from 'hono/http-exception';
import { cors } from "hono/cors";

const app = new Hono();
const db = new Database('tasks.db');

// CORSの設定
app.use(cors({ origin: "*" }));



const createtasksTableQuery = db.prepare(`
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    checked INTEGER NOT NULL DEFAULT 0
);
    `);

createtasksTableQuery.run();

const gettasksQuery = db.prepare(`
  SELECT * FROM tasks;
  `);

app.get("/", (c) => {
  const todoList = gettasksQuery.all();
  return c.json(todoList, 200);//c.json(todoList, 200)は、todoListをJSON形式で返すという意味
});

const insertTaskQuery = db.prepare(`
  INSERT INTO tasks (title,checked) VALUES (?,?);
  `);

app.post("/", async (c) => {//c.req.json()は、リクエストのボディをJSON形式で返すという意味
  const param = await c.req.json();

  if (!param.title) {//titleがない場合はエラーを返す
    throw new HTTPException(400, { message: "Title is required" });
  }

  const newTodo = {
    checked: param.checked ? 1 : 0,
    title: param.title,
  };

 
  insertTaskQuery.run(newTodo.title, newTodo.checked);
  return c.json({ message: "Successfully created" }, 200);
});

serve({
  fetch: app.fetch,
  port: 8000,
});


