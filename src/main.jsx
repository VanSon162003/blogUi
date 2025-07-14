import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes, ScrollToTop, ErrorBoundary } from "./components";
import "./styles/index.scss";
import ToastifyContainer from "./components/ToastifyContainer";

ReactDOM.createRoot(document.getElementById("root")).render(
    <ErrorBoundary>
        <BrowserRouter>
            <ScrollToTop>
                <>
                    <ToastifyContainer />
                    <AppRoutes />
                </>
            </ScrollToTop>
        </BrowserRouter>
    </ErrorBoundary>
);
