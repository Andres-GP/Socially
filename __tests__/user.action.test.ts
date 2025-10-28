import { prisma, setupDatabase, teardownDatabase } from "../prismaTestHelper";
import * as userActions from "../src/actions/user.action";

jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
  currentUser: jest.fn(),
}));

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

const { auth, currentUser } = require("@clerk/nextjs/server");

beforeAll(async () => {
  await setupDatabase();
});

afterAll(async () => {
  await teardownDatabase();
});

beforeEach(async () => {
  await prisma.notification.deleteMany();
  await prisma.follows.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
});

describe("User actions", () => {
  test("syncUser creates new user if not exists", async () => {
    auth.mockResolvedValue({ userId: "clerk1" });
    currentUser.mockResolvedValue({
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      imageUrl: "img.png",
      emailAddresses: [{ emailAddress: "john@example.com" }],
    });

    const user = await userActions.syncUser();

    expect(user).toBeDefined();
    expect(user?.clerkId).toBe("clerk1");
    expect(user?.username).toBe("johndoe");
    expect(user?.email).toBe("john@example.com");
  });

  test("syncUser returns existing user if already in DB", async () => {
    const existing = await prisma.user.create({
      data: {
        clerkId: "clerk2",
        username: "existinguser",
        email: "exist@example.com",
        name: "Exist User",
      },
    });

    auth.mockResolvedValue({ userId: "clerk2" });
    currentUser.mockResolvedValue({});

    const user = await userActions.syncUser();
    expect(user?.id).toBe(existing.id);
  });

  test("getUserByClerkId returns user with counts", async () => {
    const user = await prisma.user.create({
      data: {
        clerkId: "clerk3",
        username: "user3",
        email: "user3@example.com",
      },
    });

    const result = await userActions.getUserByClerkId("clerk3");
    expect(result?.id).toBe(user.id);
    expect(result?._count).toBeDefined();
  });

  test("getDbUserId returns user's database ID", async () => {
    const user = await prisma.user.create({
      data: {
        clerkId: "clerk4",
        username: "user4",
        email: "user4@example.com",
      },
    });

    auth.mockResolvedValue({ userId: "clerk4" });

    const id = await userActions.getDbUserId();
    expect(id).toBe(user.id);
  });

  test("getRandomUsers returns 3 users excluding current and already followed", async () => {
    const current = await prisma.user.create({
      data: {
        clerkId: "current",
        username: "current",
        email: "current@example.com",
      },
    });
    const u1 = await prisma.user.create({
      data: { clerkId: "u1", username: "u1", email: "u1@example.com" },
    });
    const u2 = await prisma.user.create({
      data: { clerkId: "u2", username: "u2", email: "u2@example.com" },
    });
    const u3 = await prisma.user.create({
      data: { clerkId: "u3", username: "u3", email: "u3@example.com" },
    });
    const u4 = await prisma.user.create({
      data: { clerkId: "u4", username: "u4", email: "u4@example.com" },
    });

    await prisma.follows.create({
      data: { followerId: current.id, followingId: u4.id },
    });

    auth.mockResolvedValue({ userId: "current" });

    const users = await userActions.getRandomUsers();
    expect(users.length).toBeLessThanOrEqual(3);
    expect(users.find((u) => u.id === current.id)).toBeUndefined();
    expect(users.find((u) => u.id === u4.id)).toBeUndefined();
  });

  test("toggleFollow creates follow and notification", async () => {
    const follower = await prisma.user.create({
      data: {
        clerkId: "follower",
        username: "follower",
        email: "follower@example.com",
      },
    });
    const following = await prisma.user.create({
      data: {
        clerkId: "following",
        username: "following",
        email: "following@example.com",
      },
    });

    auth.mockResolvedValue({ userId: follower.clerkId });

    const result = await userActions.toggleFollow(following.id);
    expect(result?.success).toBe(true);

    const follow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: follower.id,
          followingId: following.id,
        },
      },
    });
    expect(follow).toBeDefined();

    const notification = await prisma.notification.findFirst({
      where: { userId: following.id, creatorId: follower.id, type: "FOLLOW" },
    });
    expect(notification).toBeDefined();
  });

  test("toggleFollow unfollows if already following", async () => {
    const follower = await prisma.user.create({
      data: { clerkId: "f1", username: "f1", email: "f1@example.com" },
    });
    const following = await prisma.user.create({
      data: { clerkId: "f2", username: "f2", email: "f2@example.com" },
    });

    await prisma.follows.create({
      data: { followerId: follower.id, followingId: following.id },
    });

    auth.mockResolvedValue({ userId: follower.clerkId });

    const result = await userActions.toggleFollow(following.id);
    expect(result?.success).toBe(true);

    const follow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: follower.id,
          followingId: following.id,
        },
      },
    });
    expect(follow).toBeNull();
  });

  test("toggleFollow returns error when trying to follow self", async () => {
    const user = await prisma.user.create({
      data: { clerkId: "self", username: "self", email: "self@example.com" },
    });

    auth.mockResolvedValue({ userId: user.clerkId });

    const result = await userActions.toggleFollow(user.id);
    expect(result?.success).toBe(false);
    expect(result?.error).toBe("Error toggling follow");
  });
});
