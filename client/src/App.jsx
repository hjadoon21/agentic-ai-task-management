import {
    Navigate,
    Route,
    Routes,
} from "react-router";

import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import ComparisonPage from "./pages/ComparisonPage";
import EvaluationPage from "./pages/EvaluationPage";

import "./styles/dashboard.css";

// The main application component that sets up routing for the dashboard, comparison, and evaluation pages, using the AppLayout component for consistent layout and navigation
function App() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route
                    index
                    element={
                        <Navigate
                            to="/tasks"
                            replace
                        />
                    }
                />

                <Route
                    path="tasks"
                    element={<Dashboard />}
                />

                <Route
                    path="comparison"
                    element={<ComparisonPage />}
                />

                <Route
                    path="evaluation"
                    element={<EvaluationPage />}
                />

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/tasks"
                            replace
                        />
                    }
                />
            </Route>
        </Routes>
    );
}

export default App;