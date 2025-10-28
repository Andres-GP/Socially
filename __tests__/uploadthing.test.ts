jest.mock("uploadthing/next", () => {
  return {
    createUploadthing: jest.fn(() => {
      return jest.fn((config: any) => {
        return {
          middleware: jest.fn(),
          onUploadComplete: jest.fn(),
        };
      });
    }),
  };
});

jest.mock("@clerk/nextjs/server");

import { prisma, setupDatabase, teardownDatabase } from "../prismaTestHelper";

beforeAll(async () => {
  await setupDatabase();
});

afterAll(async () => {
  await teardownDatabase();
});

beforeEach(async () => {
  await prisma.notification.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.follows.deleteMany();
  await prisma.user.deleteMany();
});

test("create a user", async () => {
  const user = await prisma.user.create({
    data: {
      email: "user1@example.com",
      username: "user1",
      clerkId: "clerk1",
      name: "User One",
    },
  });

  expect(user.email).toBe("user1@example.com");
  expect(user.username).toBe("user1");
});

test("create a post and link it to a user", async () => {
  const user = await prisma.user.create({
    data: { email: "user2@example.com", username: "user2", clerkId: "clerk2" },
  });

  const post = await prisma.post.create({
    data: {
      content: "Hello world",
      authorId: user.id,
    },
  });

  const fetchedPost = await prisma.post.findUnique({
    where: { id: post.id },
    include: { author: true },
  });

  expect(fetchedPost?.author.id).toBe(user.id);
});

test("create a comment linked to post and user", async () => {
  const user = await prisma.user.create({
    data: { email: "user3@example.com", username: "user3", clerkId: "clerk3" },
  });
  const post = await prisma.post.create({
    data: { content: "Post comment", authorId: user.id },
  });

  const comment = await prisma.comment.create({
    data: {
      content: "This is a comment",
      authorId: user.id,
      postId: post.id,
    },
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
    data: { email: "user4@example.com", username: "user4", clerkId: "clerk4" },
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
    data: { email: "a@example.com", username: "userA", clerkId: "clerkA" },
  });
  const userB = await prisma.user.create({
    data: { email: "b@example.com", username: "userB", clerkId: "clerkB" },
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
      email: "like1@example.com",
      username: "like1",
      clerkId: "clerkLike1",
    },
  });
  const user2 = await prisma.user.create({
    data: {
      email: "like2@example.com",
      username: "like2",
      clerkId: "clerkLike2",
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
