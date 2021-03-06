import React, { Fragment, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import NProgress from "nprogress";
import Link from "next/link";
import Router from "next/router";
import clsx from "clsx";

import useMobileScreen from "../hooks/useMobileScreen";
import { logoutUser, loadUser } from "../redux/actions/user";
import styles from "../styles/components/layout.module.scss";

// Configure nprogress bar
NProgress.configure({ showSpinner: false });
Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

// Navbar links
const LINK_OPTIONS_GUEST = [
  { name: "Home", link: "/" },
  { name: "Login", link: "/login" },
  { name: "Register", link: "/register" },
];

const LINK_OPTIONS_AUTH = (role) => [
  {
    name: "Account",
    link: role === "user" ? "/user" : role === "admin" && "/admin",
  },
  { name: "Home", link: "/" },
];

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const { isMobile } = useMobileScreen();

  // Try to authenticated on page load
  useEffect(() => {
    (async () => {
      try {
        await dispatch(loadUser());
      } catch (error) {
        console.error(error);
      }
    })();
  }, [dispatch]);

  const [drawerShow, setDrawerShow] = useState(false);

  // Get uesr obj from state, for deciding if user logged in or not
  const user = useSelector(({ user: { user } }) => user);
  const LINK_OPTIONS = user ? LINK_OPTIONS_AUTH(user.role) : LINK_OPTIONS_GUEST;

  const updateResource = useSelector(
    ({ modal: { updateResource } }) => updateResource
  );

  return (
    <Fragment>
      {/* Backdrop when drawer is open */}
      {drawerShow && (
        <div
          className={styles["backdrop"]}
          onClick={() => setDrawerShow(false)}
        />
      )}

      {/* Navbar */}
      {!(updateResource && isMobile) && (
        <nav className={styles["navbar"]}>
          <div className={styles["navbar__inner"]}>
            <Link href="/">
              <a className={styles["navbar__brand"]}>
                <span>Tut</span>Share
              </a>
            </Link>
            <Link href="/link/create">
              <a className={styles["navbar__mainAction"]}>
                <span>Share resource!</span> <i className="fas fa-share"></i>
              </a>
            </Link>
            {/* Menu button for small screen drawer */}
            <button
              className={styles["navbar__menuBtn"]}
              onClick={() => setDrawerShow((prev) => !prev)}
            >
              <i className="fas fa-hamburger"></i>
            </button>
            <div
              className={clsx(styles["navbar__links"], {
                [styles["navbar__links-drawerShow"]]: drawerShow,
              })}
            >
              {/* Close button for small screen drawer */}
              <button
                className={styles["navbar__closeBtn"]}
                onClick={() => setDrawerShow((prev) => !prev)}
              >
                <i className="fas fa-times"></i>
              </button>

              {user && (
                <p className={styles["navbar__welcomeText"]}>
                  Hi, {user.name}!
                </p>
              )}

              {/* Navbar Links */}
              {LINK_OPTIONS.map(({ name, link }, idx) => (
                <Link href={link} key={`${name}-${idx}`}>
                  <a
                    className={styles["navbar__links__item"]}
                    onClick={() => setDrawerShow(false)}
                  >
                    <span>{name}</span>
                  </a>
                </Link>
              ))}

              {/* Logout Button */}
              {user && (
                <button
                  className={styles["navbar__links__item"]}
                  onClick={() => {
                    setDrawerShow(false);
                    dispatch(logoutUser());
                  }}
                >
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        </nav>
      )}
      <div className={styles["content"]}>{children}</div>
    </Fragment>
  );
};

export default Layout;
