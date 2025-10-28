import { render, screen } from "@testing-library/react";
import Home from "../src/app/page";

jest.mock("@/actions/post.action", () => ({
  getPosts: jest.fn(),
}));

jest.mock("@/actions/user.action", () => ({
  getDbUserId: jest.fn(),
}));

jest.mock("@clerk/nextjs/server", () => ({
  currentUser: jest.fn(),
}));

jest.mock("@/components/CreatePost", () => ({
  __esModule: true,
  default: () => <div data-testid="create-post">CreatePost</div>,
}));

jest.mock("@/components/PostCard", () => ({
  __esModule: true,
  default: ({ post, dbUserId }: any) => (
    <div data-testid="post-card">
      {post.id} - {dbUserId}
    </div>
  ),
}));

jest.mock("@/components/WhoToFollow", () => ({
  __esModule: true,
  default: () => <div data-testid="who-to-follow">WhoToFollow</div>,
}));

async function renderAsync(ui: any) {
  let container: HTMLElement | null = null;
  await (async () => {
    container = render(await ui()).container;
  })();
  return { container };
}

describe("Home Page", () => {
  const mockUser = { id: "1", username: "alice" };
  const mockPosts = [
    { id: "p1", content: "Post 1" },
    { id: "p2", content: "Post 2" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders CreatePost if user exists", async () => {
    const { currentUser } = await import("@clerk/nextjs/server");
    const { getPosts } = await import("@/actions/post.action");
    const { getDbUserId } = await import("@/actions/user.action");

    (currentUser as jest.Mock).mockResolvedValue(mockUser);
    (getPosts as jest.Mock).mockResolvedValue(mockPosts);
    (getDbUserId as jest.Mock).mockResolvedValue("dbUser1");

    await renderAsync(Home);

    expect(screen.getByTestId("create-post")).toBeInTheDocument();
  });

  test("renders PostCard for each post with dbUserId", async () => {
    const { currentUser } = await import("@clerk/nextjs/server");
    const { getPosts } = await import("@/actions/post.action");
    const { getDbUserId } = await import("@/actions/user.action");

    (currentUser as jest.Mock).mockResolvedValue(mockUser);
    (getPosts as jest.Mock).mockResolvedValue(mockPosts);
    (getDbUserId as jest.Mock).mockResolvedValue("dbUser1");

    await renderAsync(Home);

    const postCards = screen.getAllByTestId("post-card");
    expect(postCards).toHaveLength(mockPosts.length);
    expect(screen.getByText("p1 - dbUser1")).toBeInTheDocument();
    expect(screen.getByText("p2 - dbUser1")).toBeInTheDocument();
  });

  test("renders WhoToFollow component", async () => {
    const { currentUser } = await import("@clerk/nextjs/server");
    const { getPosts } = await import("@/actions/post.action");
    const { getDbUserId } = await import("@/actions/user.action");

    (currentUser as jest.Mock).mockResolvedValue(mockUser);
    (getPosts as jest.Mock).mockResolvedValue([]);
    (getDbUserId as jest.Mock).mockResolvedValue("dbUser1");

    await renderAsync(Home);

    expect(screen.getByTestId("who-to-follow")).toBeInTheDocument();
  });

  test("does not render CreatePost if user is null", async () => {
    const { currentUser } = await import("@clerk/nextjs/server");
    const { getPosts } = await import("@/actions/post.action");
    const { getDbUserId } = await import("@/actions/user.action");

    (currentUser as jest.Mock).mockResolvedValue(null);
    (getPosts as jest.Mock).mockResolvedValue(mockPosts);
    (getDbUserId as jest.Mock).mockResolvedValue("dbUser1");

    await renderAsync(Home);

    expect(screen.queryByTestId("create-post")).toBeNull();
  });
});
