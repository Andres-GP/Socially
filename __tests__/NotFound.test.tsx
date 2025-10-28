import { render, screen } from "@testing-library/react";
import NotFound from "../src/app/profile/[username]/not-found";

jest.mock("lucide-react", () => ({
  HomeIcon: () => <div data-testid="home-icon" />,
  ArrowLeftIcon: () => <div data-testid="arrow-left-icon" />,
}));

describe("NotFound Component", () => {
  beforeEach(() => {
    render(<NotFound />);
  });

  test("renders 404 text and messages", () => {
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("User not found")).toBeInTheDocument();
    expect(
      screen.getByText("The user you're looking for doesn't exist.")
    ).toBeInTheDocument();
  });

  test("renders buttons with correct text", () => {
    expect(screen.getByText("Back to Home")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  test("buttons link to '/'", () => {
    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      expect(link).toHaveAttribute("href", "/");
    });
  });

  test("renders icons inside buttons", () => {
    expect(screen.getByTestId("home-icon")).toBeInTheDocument();
    expect(screen.getByTestId("arrow-left-icon")).toBeInTheDocument();
  });
});
