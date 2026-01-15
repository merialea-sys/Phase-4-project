import { useEffect, useState } from "react";

function UsersPage() {
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch ("/accounts")
      .then((r) => setAccounts(r.data))
      .catch((error) =>{
        if (error.response && error.response.status === 401) {
            setError("You must be logged in to view accounts.");
        } else {
            setError("An error occurred while fetching accounts.");
        }
      });
  }, []);

    if (error) return <div className="error">{error}</div>;

    return (
        <div className="account-container">
            <header className="account-header">
                <h1>Accounts</h1>
            </header>

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

export default UsersPage;