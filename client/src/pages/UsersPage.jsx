import React from "react";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";


function UsersPage() {
  const [userData, setUserData] = useState([]);
  const [message, setMessage] = useState({ type: "", text: ""});

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5555";

 useEffect(() => {
        fetch(`${API_BASE_URL}/check_session`)
            .then((r) => {
                if (r.ok) return r.json();
                throw new Error("Failed to load profile");
            })
            .then((data) => setUserData(data))
            .catch((err) => setMessage({ type: "error", text: err.message }));
    }, [API_BASE_URL]);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            username:userData?.username || "",
            email:userData?.email || "",
            _password_hash: userData?._password_hash || "",
            first_name:userData?.first_name || "",
            last_name:userData?.last_name || "",
            date_of_birth:userData?.date_of_birth || "",
            is_admin: "False"

        },
        validationSchema: Yup.object({
            username: Yup.string().min(6, "Too short").required("Username is required"),
            email: Yup.string().email("invalid email").required("Email is required"),
            _password_hash:Yup.string().required("Password is required"),
            first_name:Yup.string().required("First Name is required"),
            last_name: Yup.string().required("Last Name is required")
    }),
    onSubmit: (values) => {
        fetch(`${API_BASE_URL}/users/{userData.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
        })
         .then((r) => {
                    if (r.ok) {
                        setMessage({ type: "success", text: "Profile updated successfully!" });
                        return r.json();
                    }
                    throw new Error("Update failed");
                })
                .then((updatedUser) => setUserData(updatedUser))
                .catch((err) => setMessage({ type: "error", text: err.message }));
    },
    });


    if (!userData) return <div className="loading">Loading Secure Profile...</div>;

    return (
        <div className="profile-container">
            <header className="profile-header">
                <div className="avatar-large">
                    {userData?.username ? userData.username[0].toUpperCase() : "?"}

                </div>
                <h1>{userData.username}'s Profile</h1>
                <span className="role-badge">
                    {userData.is_admin ? "Admin" : "Standard Client"}
                </span>
            </header>

          <form onSubmit={formik.handleSubmit} className="profile-form">
                    <div className="form-row">
                        <div className="input-group">
                            <label>Username</label>
                            <input name="username" {...formik.getFieldProps("username")} />
                        </div>
                        <div className="input-group">
                            <label>Email Address</label>
                            <input name="email" {...formik.getFieldProps("email")} />
                            {formik.touched.email && formik.errors.email && <span className="err">{formik.errors.email}</span>}
                            {message.text && <div className="alert">{message.text}</div>}

                        </div>
                    </div>

                    <div className="input-group">
                        <label> Password</label>
                        <input name="password" {...formik.getFieldProps("_password_hash")} />
                    </div>

                    <div className="input-group">
                        <label> First Name</label>
                        <input name="first_name" {...formik.getFieldProps("first_name")} />
                    </div>

                     <div className="input-group">
                        <label> Last Name</label>
                        <input name="last_name" {...formik.getFieldProps("last_name")} />
                    </div>

                     <div className="input-group">
                        <label> Date of Birth</label>
                        <input name="date_of_birth" {...formik.getFieldProps("date_of_birth")} />
                    </div>

                    <button type="submit" className="save-btn" disabled={!formik.dirty}>
                         Save Changes
                    </button>
                </form>

        </div>
    );


};

export default UsersPage;