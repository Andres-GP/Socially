// __tests__/user.action.test.ts
import {
  getPrisma,
  setupDatabase,
  teardownDatabase,
  resetDatabase,
} from "../prismaTestHelper";
import * as userActions from "../src/actions/user.action";

jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
  currentUser: jest.fn(),
}));

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

const { auth, currentUser } = require("@clerk/nextjs/server");

const prisma = getPrisma();

beforeAll(async () => {
  await setupDatabase();
});

afterAll(async () => {
  await teardownDatabase();
});

beforeEach(async () => {
  jest.clearAllMocks();
  await resetDatabase();
});

describe("User actions", () => {
  test("syncUser creates new user if not exists", async () => {
    auth.mockResolvedValue({ userId: `clerk1-${Date.now()}` });
    currentUser.mockResolvedValue({
      firstName: "John",
      lastName: "Doe",
      username: `user1-${Date.now()}`,
      imageUrl: "img.png",
      emailAddresses: [{ emailAddress: `john${Date.now()}@example.com` }],
    });

    const user = await userActions.syncUser();

    expect(user).toBeDefined();
    expect(user?.clerkId).toMatch(/clerk1-\d+/);
    expect(user?.username).toMatch(/user1-\d+/);
    expect(user?.email).toMatch(/john\d+@example\.com/);
  });

  test("syncUser returns existing user if already in DB", async () => {
    const existing = await prisma.user.create({
      data: {
        clerkId: `clerk2-${Date.now()}`,
        username: `existinguser-${Date.now()}`,
        email: `exist${Date.now()}@example.com`,
        name: "Exist User",
      },
    });

    auth.mockResolvedValue({ userId: existing.clerkId });
    currentUser.mockResolvedValue({});

    const user = await userActions.syncUser();
    expect(user?.id).toBe(existing.id);
  });

  test("getUserByClerkId returns user with counts", async () => {
    const user = await prisma.user.create({
      data: {
        clerkId: `clerk3-${Date.now()}`,
        username: `user3-${Date.now()}`,
        email: `user3-${Date.now()}@example.com`,
      },
    });

    const result = await userActions.getUserByClerkId(user.clerkId);
    expect(result?.id).toBe(user.id);
    expect(result?._count).toBeDefined();
  });

  test("getDbUserId returns user's database ID", async () => {
    const user = await prisma.user.create({
      data: {
        clerkId: `clerk4-${Date.now()}`,
        username: `user4-${Date.now()}`,
        email: `user4-${Date.now()}@example.com`,
      },
    });

    auth.mockResolvedValue({ userId: user.clerkId });

    const id = await userActions.getDbUserId();
    expect(id).toBe(user.id);
  });

  test("getRandomUsers returns 3 users excluding current and already followed", async () => {
    const current = await prisma.user.create({
      data: {
        clerkId: `current-${Date.now()}`,
        username: `current-${Date.now()}`,
        email: `current${Date.now()}@example.com`,
      },
    });
    const u1 = await prisma.user.create({
      data: {
        clerkId: `u1-${Date.now()}`,
        username: `u1-${Date.now()}`,
        email: `u1${Date.now()}@example.com`,
      },
    });
    const u2 = await prisma.user.create({
      data: {
        clerkId: `u2-${Date.now()}`,
        username: `u2-${Date.now()}`,
        email: `u2${Date.now()}@example.com`,
      },
    });
    const u3 = await prisma.user.create({
      data: {
        clerkId: `u3-${Date.now()}`,
        username: `u3-${Date.now()}`,
        email: `u3${Date.now()}@example.com`,
      },
    });
    const u4 = await prisma.user.create({
      data: {
        clerkId: `u4-${Date.now()}`,
        username: `u4-${Date.now()}`,
        email: `u4${Date.now()}@example.com`,
      },
    });

    await prisma.follows.create({
      data: { followerId: current.id, followingId: u4.id },
    });

    auth.mockResolvedValue({ userId: current.clerkId });

    const users = await userActions.getRandomUsers();
    expect(users.length).toBeLessThanOrEqual(3);
    expect(users.find((u) => u.id === current.id)).toBeUndefined();
    expect(users.find((u) => u.id === u4.id)).toBeUndefined();
  });

  test("toggleFollow creates follow and notification", async () => {
    const follower = await prisma.user.create({
      data: {
        clerkId: `follower-${Date.now()}`,
        username: `follower-${Date.now()}`,
        email: `follower${Date.now()}@example.com`,
      },
    });
    const following = await prisma.user.create({
      data: {
        clerkId: `following-${Date.now()}`,
        username: `following-${Date.now()}`,
        email: `following${Date.now()}@example.com`,
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
      data: {
        clerkId: `f1-${Date.now()}`,
        username: `f1-${Date.now()}`,
        email: `f1${Date.now()}@example.com`,
      },
    });
    const following = await prisma.user.create({
      data: {
        clerkId: `f2-${Date.now()}`,
        username: `f2-${Date.now()}`,
        email: `f2${Date.now()}@example.com`,
      },
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
      data: {
        clerkId: `self-${Date.now()}`,
        username: `self-${Date.now()}`,
        email: `self${Date.now()}@example.com`,
      },
    });

    auth.mockResolvedValue({ userId: user.clerkId });

    const result = await userActions.toggleFollow(user.id);
    expect(result?.success).toBe(false);
    expect(result?.error).toBe("Error toggling follow");
  });
});
