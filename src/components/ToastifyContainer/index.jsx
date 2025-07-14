import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ToastifyContainer() {
    return (
        <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            pauseOnHover
            draggable
            theme="light"
        />
    );
}

export default ToastifyContainer;
