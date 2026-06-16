import http from "node:http";

const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
let nextId = 1;

const toDateString = (date) => date.toISOString().slice(0, 10);
const weekStart = (date = new Date()) => {
  const copy = new Date(date);
  const day = copy.getDay() || 7;
  copy.setDate(copy.getDate() - day + 1);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const start = weekStart();
const tasks = [];

for (let i = 0; i < 7; i += 1) {
  const date = new Date(start);
  date.setDate(start.getDate() + i);
  const day = toDateString(date);

  tasks.push({
    id: nextId++,
    date: day,
    category: "routine",
    title: "Утренняя рутина",
    done: false,
    status: "todo",
    shift: null,
    priority: "medium",
    time_start: "08:30",
    time_end: null,
    is_habit: true,
  });

  if ([0, 2, 4].includes(i)) {
    tasks.push({
      id: nextId++,
      date: day,
      category: "train",
      title: "Тренировка",
      done: false,
      status: "todo",
      shift: null,
      priority: "high",
      time_start: "19:00",
      time_end: null,
      is_habit: false,
    });
  }

  if (i < 5) {
    tasks.push({
      id: nextId++,
      date: day,
      category: "project",
      title: "Блок на проект",
      done: false,
      status: "todo",
      shift: null,
      priority: "medium",
      time_start: "21:00",
      time_end: null,
      is_habit: false,
    });
  }
}

const json = (res, status, body) => {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type",
  });
  res.end(JSON.stringify(body));
};

const readBody = async (req) =>
  new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => { data += chunk; });
    req.on("end", () => resolve(data ? JSON.parse(data) : {}));
  });

const buildPlan = () => ({
  week_start: toDateString(start),
  days: Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const day = toDateString(date);
    return {
      date: day,
      weekday: weekdays[i],
      tasks: tasks.filter((task) => task.date === day),
    };
  }),
});

const buildStats = () => {
  const plan = buildPlan();
  const total = tasks.length;
  const done = tasks.filter((task) => task.done).length;
  return {
    streak: 0,
    total,
    done,
    percent: total ? Math.round((done / total) * 100) : 0,
    by_day: plan.days.map((day) => {
      const dayDone = day.tasks.filter((task) => task.done).length;
      return {
        weekday: day.weekday,
        weekday_full: day.weekday,
        date: day.date,
        total: day.tasks.length,
        done: dayDone,
        percent: day.tasks.length ? Math.round((dayDone / day.tasks.length) * 100) : 0,
      };
    }),
  };
};

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return json(res, 204, {});

  const url = new URL(req.url ?? "/", "http://127.0.0.1:8000");
  if (req.method === "GET" && url.pathname === "/api/health") return json(res, 200, { status: "ok" });

  if (url.pathname === "/api/auth/login" || url.pathname === "/api/auth/register") {
    const body = await readBody(req);
    return json(res, 200, {
      access_token: "mock-token-123",
      token_type: "bearer",
      user_id: 1,
      email: body.email || "demo@routine.local",
      name: body.name || body.email?.split("@")[0] || "Demo",
    });
  }

  if (req.method === "POST" && url.pathname === "/api/auth/telegram") {
    const body = await readBody(req);
    const params = new URLSearchParams(body.init_data || "");
    const userParam = params.get("user");
    const user = userParam ? JSON.parse(userParam) : { id: 12345, first_name: "Demo User" };
    return json(res, 200, {
      access_token: "mock-token-telegram",
      token_type: "bearer",
      user_id: user.id,
      email: `tg_${user.id}@routine.local`,
      name: user.first_name || "Telegram User",
    });
  }
  if (req.method === "GET" && url.pathname === "/api/plan") return json(res, 200, buildPlan());
  if (req.method === "GET" && url.pathname === "/api/stats") return json(res, 200, buildStats());

  if (req.method === "GET" && url.pathname === "/api/tasks/suggestions") {
    const freq = {};
    for (const task of tasks) {
      const key = `${task.title}|${task.category}`;
      freq[key] = (freq[key] || 0) + 1;
    }
    const result = Object.entries(freq)
      .map(([key, count]) => {
        const [title, category] = key.split("|");
        return { title, category, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    return json(res, 200, result);
  }

  if (req.method === "POST" && url.pathname === "/api/tasks/toggle") {
    const body = await readBody(req);
    const task = tasks.find((item) => item.id === body.task_id);
    if (!task) return json(res, 404, { detail: "Task not found" });
    task.done = !task.done;
    task.status = task.done ? "done" : "todo";
    return json(res, 200, task);
  }

  if (req.method === "PATCH" && url.pathname === "/api/tasks") {
    const body = await readBody(req);
    const task = tasks.find((item) => item.id === body.task_id);
    if (!task) return json(res, 404, { detail: "Task not found" });
    Object.assign(task, body);
    delete task.task_id;
    if (body.status) task.done = body.status === "done";
    return json(res, 200, task);
  }

  if (req.method === "POST" && url.pathname === "/api/tasks") {
    const body = await readBody(req);
    const task = {
      id: nextId++,
      date: body.date,
      category: body.category ?? "routine",
      title: body.title,
      done: false,
      status: "todo",
      shift: body.shift ?? null,
      priority: body.priority ?? "medium",
      time_start: body.time_start ?? null,
      time_end: body.time_end ?? null,
      is_habit: Boolean(body.is_habit),
    };
    tasks.push(task);
    return json(res, 200, task);
  }

  if (req.method === "DELETE" && url.pathname === "/api/tasks") {
    const body = await readBody(req);
    const index = tasks.findIndex((item) => item.id === body.task_id);
    if (index === -1) return json(res, 404, { detail: "Task not found" });
    const [task] = tasks.splice(index, 1);
    return json(res, 200, task);
  }

  return json(res, 404, { detail: "Not found" });
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Mock API listening on http://127.0.0.1:8000");
});
