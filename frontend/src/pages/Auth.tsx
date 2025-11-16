import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/apiFetch.ts";
export default function Auth() {
    const navigate = useNavigate();

    // Toggle between login / register
    const [isLogin, setIsLogin] = useState(true);

    // Form fields
    const [loginData, setLoginData] = useState({
        login: "",
        password: "",
    });

    const [registerData, setRegisterData] = useState({
        username: "",
        email: "",
        password: "",
    });

    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    };

    // Submit Login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await apiFetch("/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(loginData),
        });

        const data = await res.json();
        alert(JSON.stringify(data));

        if (res.ok) navigate("/dashboard");
    };

    // Submit Register
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await apiFetch("/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(registerData),
        });

        const data = await res.json();
        alert(JSON.stringify(data));

        if (res.ok) navigate("/dashboard");
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">
                {isLogin ? "Login - Multi-Drive App" : "Register - Multi-Drive App"}
            </h1>

            <div className="card">
                <div className="card-header">{isLogin ? "Login" : "Register"}</div>

                <div className="card-body">
                    {/* LOGIN FORM */}
                    {isLogin && (
                        <form onSubmit={handleLogin}>
                            <input
                                name="login"
                                value={loginData.login}
                                onChange={handleLoginChange}
                                placeholder="Username or Email"
                                className="form-control mb-2"
                                required
                            />
                            <input
                                name="password"
                                value={loginData.password}
                                onChange={handleLoginChange}
                                placeholder="Password"
                                type="password"
                                className="form-control mb-2"
                                required
                            />
                            <button className="btn btn-success">Login</button>
                        </form>
                    )}

                    {/* REGISTER FORM */}
                    {!isLogin && (
                        <form onSubmit={handleRegister}>
                            <input
                                name="username"
                                value={registerData.username}
                                onChange={handleRegisterChange}
                                placeholder="Username"
                                className="form-control mb-2"
                                required
                            />
                            <input
                                name="email"
                                value={registerData.email}
                                onChange={handleRegisterChange}
                                placeholder="Email"
                                type="email"
                                className="form-control mb-2"
                                required
                            />
                            <input
                                name="password"
                                value={registerData.password}
                                onChange={handleRegisterChange}
                                placeholder="Password"
                                type="password"
                                className="form-control mb-2"
                                required
                            />
                            <button className="btn btn-primary">Register</button>
                        </form>
                    )}

                    {/* SWITCH LINK */}
                    <p className="mt-3">
                        {isLogin ? (
                            <>
                                Don’t have an account?{" "}
                                <button
                                    className="btn btn-link p-0"
                                    onClick={() => setIsLogin(false)}
                                >
                                    Register here
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{" "}
                                <button
                                    className="btn btn-link p-0"
                                    onClick={() => setIsLogin(true)}
                                >
                                    Login here
                                </button>
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}
