import React from "react";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";


function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState(null);

  const fetchAccounts = () => {
    fetch ("/accounts")
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 401 ? "Unauthorized" : "Error");
        return r.json();
      })
      .then ((data) => setAccounts(data))
      .catch((error) =>{
        setError(error.message === "Unauthorized"
            ? "You must be logged in to view accounts."
            : "An error occurred while fetching accounts.");
      });
  };

    useEffect(() => {
       fetchAccounts();
    }, []);

    const formik = useFormik({
        initialValues: {
            account_number: "",
            account_type: "",
            current_balance: "",
            status: "",
        },
        validationSchema: Yup.object({
            account_number: Yup.number().required("Account number is required"),
            account_type: Yup.string().required("Account type is required"),
    }),
    onSubmit: (values, {resetForm}) => {
        fetch("/accounts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
        })
        .then((r) => r.json())
        .then((newAccount) => {
            setAccounts([...accounts, newAccount]);
            resetForm();
        })
        .catch(() => setError("An error occurred while creating the account."));
    },
    });


    if (error) return <div className="error">{error}</div>;

    return (
        <div className="account-container">
            <header className="account-header">
                <h1>Accounts</h1>
            </header>

            <section className="account-form-section">
                <form onSubmit={formik.handleSubmit} className="account-form">
                    <input
                    name="account_number"
                    placeholder="Account Number"
                    {...formik.getFieldProps("account_number")}
                    />
                    <select
                    name="account_type"
                    {...formik.getFieldProps("account_type")}
                    >
                        <option value="savings" label="Savings" />
                        <option value="checking" label="Checking" />
                    </select>
                    <input
                    name="current_balance"
                    
                    placeholder="Current Balance"
                    {...formik.getFieldProps("current_balance")}
                    />
                    <button type="submit" disabled={formik.isSubmitting}>{formik.isSubmitting ? "Creating..." : "Create Account"}</button>
                </form>
            </section>

            <div className="account-list">
                {accounts.map((account) => (
                    <div key={account.id} className="account-card">
                        <h2>{account.name}</h2>
                        <p>Account Number: {account.account_number}</p>
                        <p>Type: {account.account_type}</p>
                        <p>Balance: ${account.current_balance.toFixed(2)}</p>
                        <p>Account Status: {account.status}</p>
                    </div>
                ))}
            </div>

        </div>
    );


};

export default AccountsPage;