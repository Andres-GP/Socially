import "@testing-library/jest-dom";
import React from "react";

jest.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children }: any) => React.createElement("div", null, children),
  AvatarImage: ({ src }: any) =>
    React.createElement("img", { src, alt: "avatar" }),
}));

jest.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: any) => React.createElement("div", null, children),
}));

jest.mock("lucide-react", () => ({
  HeartIcon: () => React.createElement("div", null, "HeartIcon"),
  MessageCircleIcon: () =>
    React.createElement("div", null, "MessageCircleIcon"),
  UserPlusIcon: () => React.createElement("div", null, "UserPlusIcon"),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    pathname: "/",
  }),
  usePathname: jest.fn().mockReturnValue("/"),
  useSearchParams: jest.fn().mockReturnValue(new URLSearchParams()),
}));

jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
  currentUser: jest.fn().mockResolvedValue({ id: "user_1" }),
}));

jest.mock("@clerk/backend", () => ({
  webcrypto: {},
  someOtherExport: jest.fn(),
}));
