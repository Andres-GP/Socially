// __tests__/userPostCommentLike2.test.ts
import {
  getPrisma,
  setupDatabase,
  teardownDatabase,
  resetDatabase,
} from "../prismaTestHelper";

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

test("create a user", async () => {
  const user = await prisma.user.create({
    data: {
      email: `user1-${Date.now()}@example.com`,
      username: `user1-${Date.now()}`,
      clerkId: `clerk1-${Date.now()}`,
      name: "User One",
    },
  });

  expect(user.email).toMatch(/user1-\d+@example\.com/);
  expect(user.username).toMatch(/user1-\d+/);
});

test("create a post and link it to a user", async () => {
  const user = await prisma.user.create({
    data: {
      email: `user2-${Date.now()}@example.com`,
      username: `user2-${Date.now()}`,
      clerkId: `clerk2-${Date.now()}`,
    },
  });

  const post = await prisma.post.create({
    data: { content: "Hello world", authorId: user.id },
  });

  const fetchedPost = await prisma.post.findUnique({
    where: { id: post.id },
    include: { author: true },
  });

  expect(fetchedPost?.author.id).toBe(user.id);
});

test("create a comment linked to post and user", async () => {
  const user = await prisma.user.create({
    data: {
      email: `user3-${Date.now()}@example.com`,
      username: `user3-${Date.now()}`,
      clerkId: `clerk3-${Date.now()}`,
    },
  });

  const post = await prisma.post.create({
    data: { content: "Post comment", authorId: user.id },
  });

  const comment = await prisma.comment.create({
    data: { content: "This is a comment", authorId: user.id, postId: post.id },
  });

  const fetchedComment = await prisma.comment.findUnique({
    where: { id: comment.id },
    include: { author: true, post: true },
  });

  expect(fetchedComment?.author.id).toBe(user.id);
  expect(fetchedComment?.post.id).toBe(post.id);
});

test("create a like and prevent duplicates", async () => {
  const user = await prisma.user.create({
    data: {
      email: `user4-${Date.now()}@example.com`,
      username: `user4-${Date.now()}`,
      clerkId: `clerk4-${Date.now()}`,
    },
  });

  const post = await prisma.post.create({
    data: { content: "Post like", authorId: user.id },
  });

  await prisma.like.create({ data: { postId: post.id, userId: user.id } });

  await expect(
    prisma.like.create({ data: { postId: post.id, userId: user.id } })
  ).rejects.toThrow();
});

test("follows between users", async () => {
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

  const follow = await prisma.follows.create({
    data: { followerId: userA.id, followingId: userB.id },
  });

  expect(follow.followerId).toBe(userA.id);
  expect(follow.followingId).toBe(userB.id);
});

test("create a like notification", async () => {
  const user1 = await prisma.user.create({
    data: {
      email: `like1-${Date.now()}@example.com`,
      username: `like1-${Date.now()}`,
      clerkId: `clerkLike1-${Date.now()}`,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: `like2-${Date.now()}@example.com`,
      username: `like2-${Date.now()}`,
      clerkId: `clerkLike2-${Date.now()}`,
    },
  });

  const post = await prisma.post.create({
    data: { content: "Post for like", authorId: user1.id },
  });

  const notification = await prisma.notification.create({
    data: {
      userId: user1.id,
      creatorId: user2.id,
      type: "LIKE",
      postId: post.id,
    },
  });

  expect(notification.type).toBe("LIKE");
  expect(notification.userId).toBe(user1.id);
  expect(notification.creatorId).toBe(user2.id);
});
