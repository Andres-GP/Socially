import { prisma, setupDatabase, teardownDatabase } from "../prismaTestHelper";
import * as userActions from "../src/actions/user.action";
import * as profileActions from "../src/actions/profile.action";

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
  await prisma.follows.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
});

describe("Profile actions", () => {
  test("getProfileByUsername returns user profile", async () => {
    const user = await prisma.user.create({
      data: {
        email: "user1@example.com",
        username: "user1",
        clerkId: "clerk1",
        name: "User One",
        bio: "Bio",
      },
    });

    const profile = await profileActions.getProfileByUsername("user1");

    expect(profile?.id).toBe(user.id);
    expect(profile?.username).toBe("user1");
    expect(profile?._count.posts).toBe(0);
  });

  test("getUserPosts returns all posts by user", async () => {
    const user = await prisma.user.create({
      data: {
        email: "user2@example.com",
        username: "user2",
        clerkId: "clerk2",
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
        email: "user3@example.com",
        username: "user3",
        clerkId: "clerk3",
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
        email: "user4@example.com",
        username: "user4",
        clerkId: "clerk4",
      },
    });

    const formData = new FormData();
    formData.set("name", "Updated Name");
    formData.set("bio", "Updated Bio");
    formData.set("location", "Updated Location");
    formData.set("website", "https://example.com");

    const { auth } = require("@clerk/nextjs/server");
    auth.mockResolvedValue({ userId: "clerk4" });

    const result = await profileActions.updateProfile(formData);

    expect(result.success).toBe(true);
    expect(result?.user!.name).toBe("Updated Name");
    expect(result?.user!.bio).toBe("Updated Bio");
  });

  test("isFollowing returns true if current user follows another", async () => {
    const userA = await prisma.user.create({
      data: { email: "a@example.com", username: "userA", clerkId: "clerkA" },
    });
    const userB = await prisma.user.create({
      data: { email: "b@example.com", username: "userB", clerkId: "clerkB" },
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
      data: { email: "c@example.com", username: "userC", clerkId: "clerkC" },
    });
    const userB = await prisma.user.create({
      data: { email: "d@example.com", username: "userD", clerkId: "clerkD" },
    });

    jest.spyOn(userActions, "getDbUserId").mockResolvedValue(userA.id);

    const following = await profileActions.isFollowing(userB.id);

    expect(following).toBe(false);
  });
});
