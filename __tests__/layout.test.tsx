import { render, screen } from "@testing-library/react";
import RootLayout from "../src/app/layout";

jest.mock("../src/app/globals.css", () => ({}));

jest.mock("next/font/local", () => ({
  __esModule: true,
  default: (options: any) => ({ variable: "mock-font-variable" }),
}));

jest.mock("@/components/Navbar", () => ({
  __esModule: true,
  default: () => <div data-testid="navbar">Navbar</div>,
}));

jest.mock("@/components/Sidebar", () => ({
  __esModule: true,
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

jest.mock("@/components/ThemeProvider", () => ({
  __esModule: true,
  ThemeProvider: ({ children }: any) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  Toaster: () => <div data-testid="toaster">Toaster</div>,
}));

jest.mock("@clerk/nextjs", () => ({
  __esModule: true,
  ClerkProvider: ({ children }: any) => (
    <div data-testid="clerk-provider">{children}</div>
  ),
}));

describe("RootLayout", () => {
  test("renders layout with Navbar, Sidebar, children and Toaster", () => {
    render(
      <RootLayout>
        <div data-testid="child">Child Content</div>
      </RootLayout>
    );

    expect(screen.getByTestId("clerk-provider")).toBeInTheDocument();
    expect(screen.getByTestId("theme-provider")).toBeInTheDocument();
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("toaster")).toBeInTheDocument();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
