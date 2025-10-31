import "@testing-library/jest-dom";
import React from "react";
import "whatwg-fetch";

global.React = React;

// Avatar
jest.mock("@/components/ui/avatar", () => {
  const React = require("react");
  return {
    Avatar: ({ children }: any) => React.createElement("div", null, children),
    AvatarImage: ({ src }: any) =>
      React.createElement("img", { src, alt: "avatar" }),
  };
});

// ScrollArea
jest.mock("@/components/ui/scroll-area", () => {
  const React = require("react");
  return {
    ScrollArea: ({ children }: any) =>
      React.createElement("div", null, children),
  };
});

// Lucide Icons
jest.mock("lucide-react", () => {
  const React = require("react");
  return {
    HeartIcon: () => React.createElement("div", null, "HeartIcon"),
    MessageCircleIcon: () =>
      React.createElement("div", null, "MessageCircleIcon"),
    UserPlusIcon: () => React.createElement("div", null, "UserPlusIcon"),
  };
});

// Next.js Navigation
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

// Clerk server
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
  currentUser: jest.fn().mockResolvedValue({ id: "user_1" }),
}));

// Clerk backend
jest.mock("@clerk/backend", () => ({
  webcrypto: {},
  someOtherExport: jest.fn(),
}));
