// __tests__/tasks.test.ts
import { GET, POST, DELETE } from "../src/app/api/tasks/route";

describe("Tasks API", () => {
  beforeEach(() => {
    // reset tasks array between tests
    jest.resetModules();
  });

  test("GET returns all tasks", async () => {
    const response = await GET();
    const data = await response.json();

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty("id");
    expect(data[0]).toHaveProperty("title");
    expect(data[0]).toHaveProperty("completed");
  });

  test("POST creates a new task", async () => {
    const request = new Request("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title: "New Task" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.title).toBe("New Task");
    expect(data.completed).toBe(false);
    expect(data).toHaveProperty("id");
  });

  test("POST returns 400 if title is missing", async () => {
    const request = new Request("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe("Title is required");
  });

  test("DELETE removes a task by ID", async () => {
    // first create a task to delete
    const postRequest = new Request("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title: "Task to delete" }),
    });
    const postResponse = await POST(postRequest);
    const newTask = await postResponse.json();

    const deleteRequest = new Request(
      `http://localhost/api/tasks?id=${newTask.id}`,
      {
        method: "DELETE",
      }
    );
    const deleteResponse = await DELETE(deleteRequest);
    const deleteData = await deleteResponse.json();

    expect(deleteData.message).toBe("Task deleted");

    // confirm task is gone
    const getResponse = await GET();
    const tasks = await getResponse.json();
    expect(tasks.find((t: any) => t.id === newTask.id)).toBeUndefined();
  });

  test("DELETE returns 400 if ID is missing", async () => {
    const request = new Request("http://localhost/api/tasks", {
      method: "DELETE",
    });
    const response = await DELETE(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe("Task ID is required");
  });

  test("DELETE returns 404 if task not found", async () => {
    const request = new Request("http://localhost/api/tasks?id=9999", {
      method: "DELETE",
    });
    const response = await DELETE(request);
    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data.error).toBe("Task not found");
  });
});
