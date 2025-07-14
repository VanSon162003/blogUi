import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import FallbackImage from "./components/FallbackImage/FallbackImage";
import "./App.css";
import ToastifyContainer from "./components/ToastifyContainer";
import { toast } from "react-toastify";

function App() {
    const [count, setCount] = useState(0);

    return (
        <>
            <ToastifyContainer />
            <button
                onClick={() => {
                    toast.success("Toast này đã hoạt động!");
                }}
            >
                Test Toast
            </button>
            <div>
                <a href="https://vitejs.dev" target="_blank">
                    <FallbackImage
                        src={viteLogo}
                        className="logo"
                        alt="Vite logo"
                    />
                </a>
                <a href="https://react.dev" target="_blank">
                    <FallbackImage
                        src={reactLogo}
                        className="logo react"
                        alt="React logo"
                    />
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <p>
                    Edit <code>src/App.jsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    );
}

export default App;
