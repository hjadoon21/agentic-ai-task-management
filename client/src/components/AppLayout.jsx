import { NavLink, Outlet } from "react-router";

// Displays the main layout of the application, including the header and navigation links
function AppLayout() {
    function getNavLinkClass({ isActive }) {
        return isActive
            ? "navigation-link navigation-link-active"
            : "navigation-link";
    }

    return (
        <div className="app-shell">
            <header className="site-header">
                <div className="site-header-content">
                    <div className="site-brand">
                        <p className="site-eyebrow">
                            ITEC 4020 Project
                        </p>

                        <h1>
                            Agentic AI Task Management
                        </h1>
                    </div>

                    <nav
                        className="main-navigation"
                        aria-label="Main navigation"
                    >
                        <NavLink
                            to="/tasks"
                            className={getNavLinkClass}
                        >
                            Tasks
                        </NavLink>

                        <NavLink
                            to="/comparison"
                            className={getNavLinkClass}
                        >
                            AI Comparison
                        </NavLink>

                        <NavLink
                            to="/evaluation"
                            className={getNavLinkClass}
                        >
                            Evaluation
                        </NavLink>
                    </nav>
                </div>
            </header>

            <Outlet />
        </div>
    );
}

export default AppLayout;