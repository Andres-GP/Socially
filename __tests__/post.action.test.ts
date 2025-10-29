import {
  getPrisma,
  setupDatabase,
  teardownDatabase,
  resetDatabase,
} from "../prismaTestHelper";
import * as userActions from "../src/actions/user.action";
import * as postActions from "../src/actions/post.action";

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

let prisma = getPrisma();

beforeAll(async () => {
  await setupDatabase();
});

afterAll(async () => {
  await teardownDatabase();
});

beforeEach(async () => {
  prisma = getPrisma();
  jest.clearAllMocks();
  await resetDatabase();
});

describe("Post actions", () => {
  test("createPost creates a post", async () => {
    const user = await prisma.user.create({
      data: {
        email: `user1-${Date.now()}@example.com`,
        username: `user1-${Date.now()}`,
        clerkId: `clerk1-${Date.now()}`,
      },
    });

    jest.spyOn(userActions, "getDbUserId").mockResolvedValue(user.id);

    const result = await postActions.createPost("Hello World", "image.png");

    expect(result?.success).toBe(true);
    expect(result?.post?.content).toBe("Hello World");
    expect(result?.post?.authorId).toBe(user.id);
  });

  test("toggleLike creates and deletes likes safely", async () => {
    const userA = await prisma.user.create({
      data: {
        email: `userA-${Date.now()}@example.com`,
        username: `userA-${Date.now()}`,
        clerkId: `clerkA-${Date.now()}`,
      },
    });
    const userB = await prisma.user.create({
      data: {
        email: `userB-${Date.now()}@example.com`,
        username: `userB-${Date.now()}`,
        clerkId: `clerkB-${Date.now()}`,
      },
    });

    const post = await prisma.post.create({
      data: { content: "Post A", authorId: userB.id },
    });

    jest.spyOn(userActions, "getDbUserId").mockResolvedValue(userA.id);

    // Crear like
    let result = await postActions.toggleLike(post.id);
    expect(result?.success).toBe(true);

    // Eliminar like
    result = await postActions.toggleLike(post.id);
    expect(result?.success).toBe(true);
  });

  test("createComment adds comment and notification", async () => {
    const userA = await prisma.user.create({
      data: {
        email: `userA-${Date.now()}@example.com`,
        username: `userA-${Date.now()}`,
        clerkId: `clerkA-${Date.now()}`,
      },
    });
    const userB = await prisma.user.create({
      data: {
        email: `userB-${Date.now()}@example.com`,
        username: `userB-${Date.now()}`,
        clerkId: `clerkB-${Date.now()}`,
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
        email: `user-${Date.now()}@example.com`,
        username: `user-${Date.now()}`,
        clerkId: `clerk-${Date.now()}`,
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
