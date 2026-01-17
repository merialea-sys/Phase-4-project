import React from "react";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";


function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5555";

  

    useEffect(() => {
       const fetchTransactions = () => {
    fetch (`${API_BASE_URL}/transactions`, {credentials: "include"})
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 401 ? "Unauthorized" : "Error");
        return r.json();
      })
      .then ((data) => setTransactions(data))
      .catch((error) =>{
        setError(error.message === "Unauthorized"
            ? "You must be logged in to make transactions."
            : "An error occurred while making transaction.");
      });
  };
    fetchTransactions();
    }, [API_BASE_URL]);

    const formik = useFormik({
        initialValues: {
            amount: "",
            transaction_type: "",
            transaction_date: "",
        },
        validationSchema: Yup.object({
            amount: Yup.string().required("amount is required"),
            transaction_type: Yup.string().required("Transaction type is required"),
    }),
    onSubmit: (values, {resetForm}) => {
        fetch(`${API_BASE_URL}/transactions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
        })
        .then((r) => r.json())
        .then((newTransaction) => {
            setTransactions([...transactions, newTransaction]);
            resetForm();
        })
        .catch(() => setError("An error occurred while making the account."));
    },
    });


    if (error) return <div className="error">{error}</div>;

    return (
        <div className="transaction-container">
            <header className="transaction-header">
                <h1>Transactions</h1>
            </header>

            <section className="transaction-form-section">
                <form onSubmit={formik.handleSubmit} className="transaction-form">
                    <input
                    name="amount"
                    type="number"
                    placeholder="Amount"
                    {...formik.getFieldProps("amount")}
                    />
                    <select
                    name="transaction_type"
                    {...formik.getFieldProps("transaction_type")}
                    >
                        <option value="Deposit" label="Deposit" />
                        <option value="withdrawal" label="Withdrawal" />
                        <option value="transfer" label="Transfer" />
                    </select>
                    <input
                    name="transaction_date"
                    placeholder="Transaction Date"
                    {...formik.getFieldProps("transaction_date")}
                    />
                    <button type="submit">Make Transaction</button>
                </form>
            </section>

            <div className="transaction-list">
                {transactions.map((transaction) => (
                    <div key={transaction.id} className="transaction-card">
                        <h2>{transaction.transaction_type}</h2>
                        <p>Amount: {transaction.amount}</p>
                        <p>Transaction Date: {transaction.transaction_date}</p>
                    </div>
                ))}
            </div>

        </div>
    );


};

export default TransactionsPage;