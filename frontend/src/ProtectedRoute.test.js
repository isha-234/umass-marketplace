import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "./AuthContext";

jest.mock("react-router-dom", () => {
  const React = require("react");
  const RouterContext = React.createContext({ pathname: "/", setPathname: () => {} });

  function MemoryRouter({ initialEntries = ["/"], children }) {
    const [pathname, setPathname] = React.useState(initialEntries[0] || "/");
    const value = React.useMemo(() => ({ pathname, setPathname }), [pathname]);
    return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
  }

  function Routes({ children }) {
    const { pathname } = React.useContext(RouterContext);
    let element = null;
    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child) || element) return;
      const path = child.props.path || "/";
      if (path === pathname || (path === "/" && pathname === "/")) {
        element = child.props.element || child.props.children || null;
      }
    });
    return element;
  }

  function Route() {
    return null;
  }

  function Navigate({ to }) {
    const { setPathname } = React.useContext(RouterContext);
    React.useMemo(() => setPathname(to), [setPathname, to]);
    return null;
  }

  function Link({ to, children, ...rest }) {
    return (
      <a href={to} {...rest}>
        {children}
      </a>
    );
  }

  function useLocation() {
    const { pathname } = React.useContext(RouterContext);
    return { pathname };
  }

  function useNavigate() {
    const { setPathname } = React.useContext(RouterContext);
    return (to) => setPathname(to);
  }

  return { MemoryRouter, Routes, Route, Navigate, Link, useLocation, useNavigate };
});

jest.mock("./AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("shows loading indicator while session is checked", () => {
    useAuth.mockReturnValue({
      user: null,
      loading: true,
      isVerified: false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Private Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText(/Checking your session/i)).toBeInTheDocument();
  });

  test("redirects unauthenticated users to auth screen", () => {
    useAuth.mockReturnValue({
      user: null,
      loading: false,
      isVerified: false,
    });

    render(
      <MemoryRouter initialEntries={["/home"]}>
        <Routes>
          <Route path="/auth" element={<div>Auth Page</div>} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <div>Private Area</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Auth Page/i)).toBeInTheDocument();
    expect(screen.queryByText(/Private Area/i)).not.toBeInTheDocument();
  });

  test("renders children when user is verified", () => {
    useAuth.mockReturnValue({
      user: { email: "student@umass.edu" },
      loading: false,
      isVerified: true,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Private Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText(/Private Content/i)).toBeInTheDocument();
  });
});
