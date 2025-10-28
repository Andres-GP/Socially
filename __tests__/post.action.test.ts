import { prisma, setupDatabase, teardownDatabase } from "../prismaTestHelper";
import * as userActions from "../src/actions/user.action";
import * as postActions from "../src/actions/post.action";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

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
  await prisma.user.deleteMany();
});

describe("Post actions", () => {
  test("createPost creates a post", async () => {
    const user = await prisma.user.create({
      data: {
        email: "user1@example.com",
        username: "user1",
        clerkId: "clerk1",
      },
    });

    jest.spyOn(userActions, "getDbUserId").mockResolvedValue(user.id);

    const result = await postActions.createPost("Hello World", "image.png");

    expect(result?.success).toBe(true);
    expect(result?.post?.content).toBe("Hello World");
    expect(result?.post?.authorId).toBe(user.id);
  });

  test("toggleLike creates and deletes likes", async () => {
    const userA = await prisma.user.create({
      data: {
        email: "user2@example.com",
        username: "user2",
        clerkId: "clerk2",
      },
    });
    const userB = await prisma.user.create({
      data: {
        email: "userB@example.com",
        username: "userB",
        clerkId: "clerkB",
      },
    });

    const post = await prisma.post.create({
      data: { content: "Post A", authorId: userB.id },
    });

    jest.spyOn(userActions, "getDbUserId").mockResolvedValue(userA.id);

    let result = await postActions.toggleLike(post.id);
    expect(result?.success).toBe(true);

    result = await postActions.toggleLike(post.id);
    expect(result?.success).toBe(true);
  });

  test("createComment adds comment and notification", async () => {
    const userA = await prisma.user.create({
      data: {
        email: "user3@example.com",
        username: "user3",
        clerkId: "clerk3",
      },
    });
    const userB = await prisma.user.create({
      data: {
        email: "userB3@example.com",
        username: "userB3",
        clerkId: "clerkB3",
      },
    });

    const post = await prisma.post.create({
      data: { content: "Post B", authorId: userB.id },
    });

    jest.spyOn(userActions, "getDbUserId").mockResolvedValue(userA.id);

    const result = await postActions.createComment(post.id, "New comment");

    expect(result?.success).toBe(true);
    expect(result?.comment!.content).toBe("New comment");
  });

  test("deletePost deletes own post", async () => {
    const user = await prisma.user.create({
      data: {
        email: "user4@example.com",
        username: "user4",
        clerkId: "clerk4",
      },
    });

    const post = await prisma.post.create({
      data: { content: "To delete", authorId: user.id },
    });

    jest.spyOn(userActions, "getDbUserId").mockResolvedValue(user.id);

    const result = await postActions.deletePost(post.id);
    expect(result.success).toBe(true);

    const deleted = await prisma.post.findUnique({ where: { id: post.id } });
    expect(deleted).toBeNull();
  });
});
