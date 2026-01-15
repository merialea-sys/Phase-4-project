import { useEffect, useState } from "react";

function BranchesPage() {
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch ("/branches")
      .then((r) => setBranches(r.data))
      .catch((error) =>{
        if (error.response && error.response.status === 401) {
            setError("You must be logged in to view branches.");
        } else {
            setError("An error occurred while fetching branches.");
        }
      });
  }, []);

    if (error) return <div className="error">{error}</div>;

    return (
        <div className="branches-container">
            <header className="branches-header">
                <h1>Branches</h1>
            </header>

            <div className="branches-list">
                {branches.map((branch) => (
                    <div key={branch.id} className="branch-card">
                        <h2>{branch.branch_name}</h2>
                        <p>Branch Code: {branch.branch_code}</p>
                        <p>Address: {branch.address}</p>
                        <p>Contact: {branch.phone_number}</p>
                    </div>
                ))}
            </div>

        </div>
    );


};

export default BranchesPage;