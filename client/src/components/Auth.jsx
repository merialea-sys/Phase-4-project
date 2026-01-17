import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {useFormik} from "formik";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import * as Yup from "yup";

function AuthPage({ onLogin}) {
    const location = useLocation();
    const [isLogin, setIsLogin] = useState(location.pathname === "/login");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5555";

    useEffect(() => {
    setIsLogin(location.pathname === "/login");
  }, [location.pathname]);

    const formik = useFormik({
        initialValues: {
            username: "",
            password: "",
            email: "",
            first_name: "",
            last_name: "",
        },
        validationSchema: Yup.object({
            username: Yup.string()
            .required("Username is required"),
            password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
            email: isLogin 
            ? Yup.string() 
            : Yup.string().email("Invalid email address").required("Email is required"),
            first_name: isLogin 
            ? Yup.string() 
            : Yup.string().required("Required"),
            last_name: isLogin 
            ? Yup.string() 
            : Yup.string().required("Required"),
        }),
        onSubmit: (values) => {
            setError(null);
            const endpoint = isLogin ? "/login" : "/signup";

            const payload = isLogin
                ?{ username: values.username, password: values.password } 
                : values;
            fetch(`${API_BASE_URL}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(payload),
            })
            .then((r) => {
                if (r.ok) return r.json();
                throw new Error(isLogin ? "Invalid credentials" : "User already exists");
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
                    {error && <p className="error-text">{error}</p>}

                    {!isLogin && (
                        <>
                            <input
                            name="first_name"
                            placeholder="First Name"
                            {...formik.getFieldProps("first_name")}
                            />

                            {formik.touched.first_name && formik.errors.first_name && <span className="error">{formik.errors.first_name}</span>}

                            <input
                            name="last_name"
                            placeholder="Last Name"
                            {...formik.getFieldProps("last_name")}
                            />

                            {formik.touched.last_name && formik.errors.last_name && <span className="error">{formik.errors.last_name}</span>}

                            <input
                            name="email"
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
                    setError(null)
                  }}>{isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}</button>
            </div>
        </div>
    )
}
export default AuthPage;