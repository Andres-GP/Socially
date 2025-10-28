// __tests__/Profile.test.tsx
import ProfilePageServer, {
  generateMetadata,
} from "../src/app/profile/[username]/page";
import * as profileActions from "../src/actions/profile.action";
import { notFound } from "next/navigation";

jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

jest.mock("../src/actions/profile.action");

describe("ProfilePageServer", () => {
  const mockUser = { id: "1", name: "Alice", username: "alice", bio: "Hello" };
  const mockPosts = [{ id: 1, content: "Post 1" }];
  const mockLikedPosts = [{ id: 2, content: "Liked Post" }];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("calls profile actions with correct arguments", async () => {
    (profileActions.getProfileByUsername as jest.Mock).mockResolvedValue(
      mockUser
    );
    (profileActions.getUserPosts as jest.Mock).mockResolvedValue(mockPosts);
    (profileActions.getUserLikedPosts as jest.Mock).mockResolvedValue(
      mockLikedPosts
    );
    (profileActions.isFollowing as jest.Mock).mockResolvedValue(true);

    // Ejecutamos la función, solo para que haga las llamadas
    await ProfilePageServer({ params: { username: "alice" } });

    expect(profileActions.getProfileByUsername).toHaveBeenCalledWith("alice");
    expect(profileActions.getUserPosts).toHaveBeenCalledWith("1");
    expect(profileActions.getUserLikedPosts).toHaveBeenCalledWith("1");
    expect(profileActions.isFollowing).toHaveBeenCalledWith("1");
  });
});

describe("generateMetadata", () => {
  const mockUser = { id: "1", name: "Alice", username: "alice", bio: "Hello" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns correct metadata", async () => {
    (profileActions.getProfileByUsername as jest.Mock).mockResolvedValue(
      mockUser
    );

    const meta = await generateMetadata({ params: { username: "alice" } });
    expect(meta).toEqual({
      title: "Alice",
      description: "Hello",
    });
  });

  test("returns description with username if bio is empty", async () => {
    (profileActions.getProfileByUsername as jest.Mock).mockResolvedValue({
      ...mockUser,
      bio: "",
    });

    const meta = await generateMetadata({ params: { username: "alice" } });
    expect(meta).toEqual({
      title: "Alice",
      description: "Check out alice's profile.",
    });
  });

  test("returns undefined if user not found", async () => {
    (profileActions.getProfileByUsername as jest.Mock).mockResolvedValue(null);

    const meta = await generateMetadata({ params: { username: "alice" } });
    expect(meta).toBeUndefined();
  });
});
