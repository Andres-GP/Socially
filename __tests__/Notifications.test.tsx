import { render, screen, waitFor } from "@testing-library/react";
import NotificationsPage from "../src/app/notifications/page";
import * as notificationActions from "../src/actions/notification.action";
import toast from "react-hot-toast";

jest.mock("../src/actions/notification.action");
jest.mock("react-hot-toast", () => ({
  error: jest.fn(),
}));

describe("NotificationsPage", () => {
  const mockNotifications = [
    {
      id: 1,
      type: "LIKE",
      read: false,
      createdAt: new Date().toISOString(),
      creator: { name: "Alice", username: "alice", image: "/alice.png" },
      post: { content: "Hello world", image: null },
      comment: null,
    },
    {
      id: 2,
      type: "FOLLOW",
      read: true,
      createdAt: new Date().toISOString(),
      creator: { name: "Bob", username: "bob", image: "/bob.png" },
      post: null,
      comment: null,
    },
    {
      id: 3,
      type: "COMMENT",
      read: false,
      createdAt: new Date().toISOString(),
      creator: { name: "Charlie", username: "charlie", image: "/charlie.png" },
      post: { content: "Nice post!", image: null },
      comment: { content: "Great job!" },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows loading skeleton initially", () => {
    (notificationActions.getNotifications as jest.Mock).mockReturnValue(
      new Promise(() => {})
    );

    render(<NotificationsPage />);
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  test("renders notifications correctly", async () => {
    (notificationActions.getNotifications as jest.Mock).mockResolvedValue(
      mockNotifications
    );
    (
      notificationActions.markNotificationsAsRead as jest.Mock
    ).mockResolvedValue({});

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText("Notifications")).toBeInTheDocument();
    });

    // Check unread count
    expect(screen.getByText("2 unread")).toBeInTheDocument();

    // Check LIKE notification
    expect(screen.getByText(/Alice/i)).toBeInTheDocument();
    expect(screen.getByText(/liked your post/i)).toBeInTheDocument();
    expect(screen.getByText("Hello world")).toBeInTheDocument();

    // Check FOLLOW notification
    expect(screen.getByText(/Bob/i)).toBeInTheDocument();
    expect(screen.getByText(/started following you/i)).toBeInTheDocument();

    // Check COMMENT notification
    expect(screen.getByText(/Charlie/i)).toBeInTheDocument();
    expect(screen.getByText(/commented on your post/i)).toBeInTheDocument();
    expect(screen.getByText("Nice post!")).toBeInTheDocument();
    expect(screen.getByText("Great job!")).toBeInTheDocument();

    // Ensure markNotificationsAsRead called with unread ids
    expect(notificationActions.markNotificationsAsRead).toHaveBeenCalledWith([
      1, 3,
    ]);
  });

  test("shows toast error if fetching notifications fails", async () => {
    (notificationActions.getNotifications as jest.Mock).mockRejectedValue(
      new Error("Failed")
    );

    render(<NotificationsPage />);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to fetch notifications");
    });
  });

  test("shows message when no notifications exist", async () => {
    (notificationActions.getNotifications as jest.Mock).mockResolvedValue([]);
    (
      notificationActions.markNotificationsAsRead as jest.Mock
    ).mockResolvedValue({});

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText("No notifications yet")).toBeInTheDocument();
    });
  });
});
