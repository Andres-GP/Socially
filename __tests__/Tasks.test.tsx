import { render, screen } from "@testing-library/react";
import TasksPage from "../src/app/tasks/page";

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue([{ id: 1, title: "Task 1" }]),
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

describe("TasksPage", () => {
  test("renders TasksPage text", async () => {
    const element = await TasksPage();

    render(element);

    expect(screen.getByText("TasksPage")).toBeInTheDocument();
  });
});
