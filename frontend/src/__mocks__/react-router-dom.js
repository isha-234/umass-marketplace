import React, { createContext, useContext, useMemo, useState } from "react";

const RouterContext = createContext({ pathname: "/", setPathname: () => {} });

export function MemoryRouter({ initialEntries = ["/"], children }) {
  const [pathname, setPathname] = useState(initialEntries[0] || "/");
  const value = useMemo(() => ({ pathname, setPathname }), [pathname]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function Routes({ children }) {
  const { pathname } = useContext(RouterContext);
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

export function Route() {
  return null;
}

export function Navigate({ to }) {
  const { setPathname } = useContext(RouterContext);
  useMemo(() => setPathname(to), [setPathname, to]);
  return null;
}

export function Link({ to, children, ...rest }) {
  return (
    <a href={to} {...rest}>
      {children}
    </a>
  );
}

export function useLocation() {
  const { pathname } = useContext(RouterContext);
  return { pathname };
}

export function useNavigate() {
  const { setPathname } = useContext(RouterContext);
  return (to) => setPathname(to);
}
