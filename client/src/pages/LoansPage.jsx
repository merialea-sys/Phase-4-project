import React from "react";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";


function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5555";

 
    useEffect(() => {
       const fetchLoans = () => {
    fetch (`${API_BASE_URL}/loans`, {credentials: "include"})
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 401 ? "Unauthorized" : "Error");
        return r.json();
      })
      .then ((data) => setLoans(data))
      .catch((error) =>{
        setError(error.message === "Unauthorized"
            ? "You must be logged in to view loans."
            : "An error occurred while fetching loans.");
      });
  };
    fetchLoans();
    }, [API_BASE_URL]);

    const formik = useFormik({
        initialValues: {
            loan_type: "",
            loan_amount: "0",
            start_date: "",
            end_date: "",
            loan_status: "Active"
        },
        validationSchema: Yup.object({
            loan_type: Yup.string().required("Loan type is required")
    }),
    onSubmit: (values, {resetForm}) => {
        fetch(`${API_BASE_URL}/loans`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
        })
        .then((r) => r.json())
        .then((newLoan) => {
            setLoans([...loans, newLoan]);
            resetForm();
        })
        .catch(() => setError("An error adding new loan."));
    },
    });


    if (error) return <div className="error">{error}</div>;

    return (
        <div className="loan-container">
            <header className="loan-header">
                <h1>Loans</h1>
            </header>

            <section className="loan-form-section">
                <form onSubmit={formik.handleSubmit} className="loan-form">
                    <input
                    name="loan_type"
                    placeholder="Loan Type"
                    {...formik.getFieldProps("loan_type")}
                    />
                    <input
                    name="loan_amount"
                    type="number"
                    {...formik.getFieldProps("loan_amount")}
                    />
                    <input
                    name="start_date"
                    placeholder="starting date"
                    {...formik.getFieldProps("start_date")}
                    />
                    <input
                    name="end_date"
                    placeholder="End Date"
                    {...formik.getFieldProps("end_date")}
                    />
                    <select
                    name="loan_status"
                    {...formik.getFieldProps("loan_status")}
                    >
                        <option value="active" label="Active" />
                        <option value="paid off" label="Paid Off" />
                    </select>
                    <button type="submit">Take Loan</button>
                </form>
            </section>

            <div className="loan-list">
                {loans.map((loan) => (
                    <div key={loan.id} className="loan-card">
                        <h2>{loan.loan_type}</h2>
                        <p>Loan Amount: {loan.loan_amount}</p>
                        <p>Start Date: {loan.start_date}</p>
                        <p>End Date: {loan.end_date}</p>
                        <p>Loan Status: {loan.loan_status}</p>
                    </div>
                ))}
            </div>

        </div>
    );


};

export default LoansPage;