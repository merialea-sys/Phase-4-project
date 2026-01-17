import React from "react";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";


function BranchesPage() {
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5555";

  
    useEffect(() => {
       const fetchBranches = () => {
    fetch (`${API_BASE_URL}/branches`, {credentials: "include"})
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 401 ? "Unauthorized" : "Error");
        return r.json();
      })
      .then ((data) => setBranches(data))
      .catch((error) =>{
        setError(error.message === "Unauthorized"
            ? "You must be logged in to view branches."
            : "An error occurred while fetching branches.");
      });
  };
    fetchBranches();
    }, [API_BASE_URL]);

    const formik = useFormik({
        initialValues: {
            branch_name: "",
            branch_code: "",
            address: "",
            phone_number: "",
        },
        validationSchema: Yup.object({
            branch_name: Yup.string().required("Branch name is required"),
            branch_code: Yup.string().required("Branch code is required"),
    }),
    onSubmit: (values, {resetForm}) => {
        fetch(`${API_BASE_URL}/branches`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
        })
        .then((r) => r.json())
        .then((newBranch) => {
            setBranches([...branches, newBranch]);
            resetForm();
        })
        .catch(() => setError("An error adding new branch."));
    },
    });


    if (error) return <div className="error">{error}</div>;

    return (
        <div className="branch-container">
            <header className="branch-header">
                <h1>Branches</h1>
            </header>

            <section className="branch-form-section">
                <form onSubmit={formik.handleSubmit} className="branch-form">
                    <input
                    name="branch_name"
                    placeholder="Branch Name"
                    {...formik.getFieldProps("branch_name")}
                    />
                    <input
                    name="branch_code"
                    type="number"
                    {...formik.getFieldProps("branch_code")}
                    />
                    <input
                    name="address"
                    placeholder="Branch address"
                    {...formik.getFieldProps("address")}
                    />
                    <input
                    name="phone_number"
                    type="number"
                    placeholder="Phone Number"
                    {...formik.getFieldProps("phone_number")}
                    />
                    <button type="submit">Add Branch</button>
                </form>
            </section>

            <div className="branch-list">
                {branches.map((branch) => (
                    <div key={branch.id} className="branch-card">
                        <h2>{branch.branch_name}</h2>
                        <p>Branch Code: {branch.branch_code}</p>
                        <p>Branch Address: {branch.address}</p>
                        <p>Contact: {branch.phone_number}</p>
                    </div>
                ))}
            </div>

        </div>
    );


};

export default BranchesPage;