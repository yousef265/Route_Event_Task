import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import "bootstrap/dist/css/bootstrap.min.css";
import { getDataBase } from "./api";

Chart.register(CategoryScale);

function App() {
    const [customers, setCustomers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const chartContainerRef = useRef(null);
    const chartInstanceRef = useRef(null);

    useEffect(() => {
        const getData = async () => {
            try {
                const data = await getDataBase(); // assuming getDataBase fetches data correctly
                setCustomers(data.customers);
                setTransactions(data.transactions);
                setFilteredTransactions(data.transactions);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        getData();
    }, []);

    const handleFilterCustomerID = (customerId) => {
        const filtered = transactions.filter((transaction) => transaction.customer_id === parseInt(customerId));
        setFilteredTransactions(filtered);
    };

    const handleFilterAmount = (amount) => {
        const filtered = transactions.filter((transaction) => transaction.amount >= parseInt(amount));
        setFilteredTransactions(filtered);
    };

    const handleSelectCustomer = (customerId) => {
        const customer = customers.find((customer) => customer.id === parseInt(customerId));
        setSelectedCustomer(customer);
    };

    const chartData = () => {
        if (!selectedCustomer) return {};

        const customerTransactions = transactions.filter((transaction) => transaction.customer_id === selectedCustomer.id);
        const dates = [...new Set(customerTransactions.map((transaction) => transaction.date))];
        const amounts = dates.map((date) => customerTransactions.filter((transaction) => transaction.date === date).reduce((sum, transaction) => sum + transaction.amount, 0));

        return {
            labels: dates,
            datasets: [
                {
                    label: `Total amount per day for ${selectedCustomer.name}`,
                    data: amounts,
                    fill: false,
                    borderColor: "rgb(75, 192, 192)",
                    tension: 0.1,
                },
            ],
        };
    };

    useEffect(() => {
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        if (selectedCustomer && chartContainerRef.current) {
            chartInstanceRef.current = new Chart(chartContainerRef.current, {
                type: "line",
                data: chartData(),
                options: {
                    responsive: true,
                },
            });
        }
    }, [selectedCustomer]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="display-4 fw-bold mb-4 text-center text-primary">Route Event Task</h1>
            <div className="mb-4 p-4 bg-white shadow-sm rounded-3 d-flex">
                <div className="w-50 p-4">
                    <label className="form-label mb-2">Filter by customer:</label>
                    <select className="form-select w-100 p-2 mb-4" onChange={(e) => handleFilterCustomerID(e.target.value)}>
                        <option value="">All</option>
                        {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                                {customer.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="w-50 p-4">
                    <label className="form-label mb-2">Filter by amount:</label>
                    <input type="number" className="form-control w-100 p-2 mb-4" onChange={(e) => handleFilterAmount(e.target.value)} />
                </div>
            </div>
            <table className="table table-bordered table-hover table-striped bg-primary text-white">
                <thead>
                    <tr>
                        <th className="py-2 px-4">Customer</th>
                        <th className="py-2 px-4">Date</th>
                        <th className="py-2 px-4">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTransactions.map((transaction) => (
                        <tr key={transaction.id} className="table-light">
                            <td className="py-2 px-4">{customers.find((customer) => customer.id === transaction.customer_id)?.name}</td>
                            <td className="py-2 px-4">{transaction.date}</td>
                            <td className="py-2 px-4">{transaction.amount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-4 p-4 bg-white shadow-sm rounded-3">
                <label className="form-label mb-2">Select customer for chart:</label>
                <select className="form-select w-100 p-2" onChange={(e) => handleSelectCustomer(e.target.value)}>
                    <option value="">None</option>
                    {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                            {customer.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mt-4">
                <canvas ref={chartContainerRef} />
            </div>
        </div>
    );
}

export default App;
