// __tests__/profile.action.test.ts
import {
  getPrisma,
  setupDatabase,
  teardownDatabase,
  resetDatabase,
} from "../prismaTestHelper";
import * as userActions from "../src/actions/user.action";
import * as profileActions from "../src/actions/profile.action";

const prisma = getPrisma();

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
}));

beforeAll(async () => {
  await setupDatabase();
});

afterAll(async () => {
  await teardownDatabase();
});

beforeEach(async () => {
  jest.clearAllMocks();
  await resetDatabase(); // limpia todas las tablas antes de cada test
});

describe("Profile actions", () => {
  test("getProfileByUsername returns user profile", async () => {
    const user = await prisma.user.create({
      data: {
        email: `user1-${Date.now()}@example.com`,
        username: `user1-${Date.now()}`,
        clerkId: `clerk1-${Date.now()}`,
        name: "User One",
        bio: "Bio",
      },
    });

    const profile = await profileActions.getProfileByUsername(user.username);

    expect(profile?.id).toBe(user.id);
    expect(profile?.username).toBe(user.username);
    expect(profile?._count.posts).toBe(0);
  });

  test("getUserPosts returns all posts by user", async () => {
    const user = await prisma.user.create({
      data: {
        email: `user2-${Date.now()}@example.com`,
        username: `user2-${Date.now()}`,
        clerkId: `clerk2-${Date.now()}`,
      },
    });

    const post1 = await prisma.post.create({
      data: { content: "Post 1", authorId: user.id },
    });
    const post2 = await prisma.post.create({
      data: { content: "Post 2", authorId: user.id },
    });

    const posts = await profileActions.getUserPosts(user.id);

    expect(posts.length).toBe(2);
    expect(posts[0].author.id).toBe(user.id);
    expect(posts[1].author.id).toBe(user.id);
  });

  test("getUserLikedPosts returns posts liked by user", async () => {
    const user = await prisma.user.create({
      data: {
        email: `user3-${Date.now()}@example.com`,
        username: `user3-${Date.now()}`,
        clerkId: `clerk3-${Date.now()}`,
      },
    });
    const post = await prisma.post.create({
      data: { content: "Post to like", authorId: user.id },
    });

    await prisma.like.create({ data: { userId: user.id, postId: post.id } });

    const likedPosts = await profileActions.getUserLikedPosts(user.id);

    expect(likedPosts.length).toBe(1);
    expect(likedPosts[0].id).toBe(post.id);
  });

  test("updateProfile updates user info", async () => {
    const user = await prisma.user.create({
      data: {
        email: `user4-${Date.now()}@example.com`,
        username: `user4-${Date.now()}`,
        clerkId: `clerk4-${Date.now()}`,
      },
    });

    const formData = new FormData();
    formData.set("name", "Updated Name");
    formData.set("bio", "Updated Bio");
    formData.set("location", "Updated Location");
    formData.set("website", "https://example.com");

    const { auth } = require("@clerk/nextjs/server");
    auth.mockResolvedValue({ userId: user.clerkId });

    const result = await profileActions.updateProfile(formData);

    expect(result.success).toBe(true);
    expect(result?.user!.name).toBe("Updated Name");
    expect(result?.user!.bio).toBe("Updated Bio");
  });

  test("isFollowing returns true if current user follows another", async () => {
    const userA = await prisma.user.create({
      data: {
        email: `a-${Date.now()}@example.com`,
        username: `userA-${Date.now()}`,
        clerkId: `clerkA-${Date.now()}`,
      },
    });
    const userB = await prisma.user.create({
      data: {
        email: `b-${Date.now()}@example.com`,
        username: `userB-${Date.now()}`,
        clerkId: `clerkB-${Date.now()}`,
      },
    });

    await prisma.follows.create({
      data: { followerId: userA.id, followingId: userB.id },
    });

    jest.spyOn(userActions, "getDbUserId").mockResolvedValue(userA.id);

    const following = await profileActions.isFollowing(userB.id);

    expect(following).toBe(true);
  });

  test("isFollowing returns false if not following", async () => {
    const userA = await prisma.user.create({
      data: {
        email: `c-${Date.now()}@example.com`,
        username: `userC-${Date.now()}`,
        clerkId: `clerkC-${Date.now()}`,
      },
    });
    const userB = await prisma.user.create({
      data: {
        email: `d-${Date.now()}@example.com`,
        username: `userD-${Date.now()}`,
        clerkId: `clerkD-${Date.now()}`,
      },
    });

    jest.spyOn(userActions, "getDbUserId").mockResolvedValue(userA.id);

    const following = await profileActions.isFollowing(userB.id);

    expect(following).toBe(false);
  });
});
