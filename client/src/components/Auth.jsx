import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {useFormik} from "formik";
import * as Yup from "yup";
import "./AuthPage.css";

function AuthPage({ onLogin}) {
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            username: "",
            email: "",
            password: "",
        },
        validationSchema: Yup.object({
            username: Yup.string().required("Username is required"),
            email: Yup.string().email("Invalid email address").required("Email is required"),
            password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
        }),
        onSubmit: (values) => {
            const endpoint = isLogin ? "/login" : "/signup";
            fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            })
            .then((r) => {
                if (r.ok) {
                    return r.json();
                } else {
                    throw new Error("Authentication failed");
                }
            })
            .then((user) => {
                if (onLogin) onLogin(user);
                navigate("/");
            })
            .catch((error) => setError(error.message));
        }
    });

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>

                <form onSubmit={formik.handleSubmit} className="auth-form">
                    <input
                    name="username"
                    placeholder="username"
                    {...formik.getFieldProps("username")}
                    />

                    {formik.touched.username && formik.errors.username && <span className="error">{formik.errors.username}</span>}
                    
                    {!isLogin && (
                        <>
                            <input
                            name="email"
                            type="email"
                            placeholder="email"
                            {...formik.getFieldProps("email")}
                            />

                            {formik.touched.email && formik.errors.email && <span className="error">{formik.errors.email}</span>}
                        </>
                    )}
                    <input
                    name="password"
                    type="password"
                    placeholder="password"
                    {...formik.getFieldProps("password")}
                    />

                    {formik.touched.password && formik.errors.password && <span className="error">{formik.errors.password}</span>}

                    <button type="submit" className="auth-button">
                        {isLogin ? "Login" : "Sign Up"}
                    </button>
                </form>
                  <button
                  className="toggle-button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                  }}>{isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}</button>
            </div>
        </div>
    )
}
export default AuthPage;