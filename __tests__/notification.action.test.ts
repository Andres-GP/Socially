import { prisma, setupDatabase, teardownDatabase } from "../prismaTestHelper";
import * as userActions from "../src/actions/user.action";
import {
  getNotifications,
  markNotificationsAsRead,
} from "../src/actions/notification.action";

beforeAll(async () => {
  await setupDatabase();
});

afterAll(async () => {
  await teardownDatabase();
});

beforeEach(async () => {
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
});

describe("Notifications", () => {
  test("getNotifications returns notifications with relations", async () => {
    const receiver = await prisma.user.create({
      data: {
        email: "receiver@example.com",
        username: "receiver",
        clerkId: "clerkR",
      },
    });
    const creator = await prisma.user.create({
      data: {
        email: "creator@example.com",
        username: "creator",
        clerkId: "clerkC",
      },
    });

    const post = await prisma.post.create({
      data: { content: "Post content", authorId: creator.id },
    });

    const comment = await prisma.comment.create({
      data: {
        content: "Comment content",
        authorId: creator.id,
        postId: post.id,
      },
    });

    const notification = await prisma.notification.create({
      data: {
        userId: receiver.id,
        creatorId: creator.id,
        type: "LIKE",
        postId: post.id,
        commentId: comment.id,
      },
    });

    jest.spyOn(userActions, "getDbUserId").mockResolvedValue(receiver.id);

    const notifications = await getNotifications();

    expect(notifications.length).toBe(1);
    expect(notifications[0].id).toBe(notification.id);
    expect(notifications[0].creator.id).toBe(creator.id);
    expect(notifications[0].post).not.toBeNull();
    expect(notifications[0].post!.id).toBe(post.id);

    expect(notifications[0].comment).not.toBeNull();
    expect(notifications[0].comment!.id).toBe(comment.id);
  });

  test("markNotificationsAsRead marks notifications as read", async () => {
    const receiver = await prisma.user.create({
      data: {
        email: "receiver2@example.com",
        username: "receiver2",
        clerkId: "clerkR2",
      },
    });
    const creator = await prisma.user.create({
      data: {
        email: "creator2@example.com",
        username: "creator2",
        clerkId: "clerkC2",
      },
    });

    const notification1 = await prisma.notification.create({
      data: { userId: receiver.id, creatorId: creator.id, type: "LIKE" },
    });
    const notification2 = await prisma.notification.create({
      data: { userId: receiver.id, creatorId: creator.id, type: "COMMENT" },
    });

    const result = await markNotificationsAsRead([
      notification1.id,
      notification2.id,
    ]);
    expect(result.success).toBe(true);

    const updatedNotifications = await prisma.notification.findMany({
      where: { userId: receiver.id },
    });

    expect(updatedNotifications.every((n) => n.read === true)).toBe(true);
  });
});
