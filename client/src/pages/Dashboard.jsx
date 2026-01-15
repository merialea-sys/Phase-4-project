import React from "react";
import { useNavigate } from "react-router-dom";

function Dashboard({ user }) {
    const navigate = useNavigate();

    return(
        <div className="dashboard-page">
            <section className="hero-section">
                <div className="hero-content">
                    <img src="https://www.shutterstock.com/image-photo/stack-coins-calculator-house-lines-600nw-2672271823.jpg" alt="Hero Image"/>
                    <h1>Now's the time to plan your financial future,every choice could set them up for life</h1>
                    <button className="hero-button" onClick={() => navigate("/signup")}>LEARN MORE</button>
                </div>
            </section>
            <section className="features-section">
                <div className="feature-tile">Interactive Fund Librart</div>
                <div className="feature-tile">Personalized Investment Advice</div>
                <div className="feature-tile">Real-Time Market Data</div>
                <div className="feature-tile">Secure Transactions</div>
            </section>
            <section className="about-section">
                <h2>About Apex Bank</h2>
                <p>Apex Bank is a leading financial institution committed to providing exceptional banking services to individuals and businesses alike. With a focus on innovation, customer satisfaction, and community engagement, we strive to empower our clients to achieve their financial goals.</p>
            </section>
        </div>

        
    )


}

export default Dashboard;

