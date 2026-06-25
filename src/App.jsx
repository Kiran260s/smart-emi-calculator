import React, { useState } from 'react'
import {
  FaMoneyBillWave,
  FaPercentage,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FaMoon, FaSun, FaDownload } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const App = () => {

  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("")

  const [darkMode, setDarkMode] = useState(true)

  const [emi, setEmi] = useState(null)
  const [interest, setInterest] = useState(null)
  const [total, setTotal] = useState(null)

  const [schedule, setSchedule] = useState([]);

  const calculateEMI = () => {
    const principal = Number(amount)
    const annualRate = Number(rate)
    const tenure = Number(years)

    if (!principal || !annualRate || !tenure) {
      alert("Please fill all the fields.")
      return;
    }

    if (amount <= 0 || rate <= 0 || years <= 0) {
      alert("Please enter valid positive values.");
      return;
    }

    // Same as annualRate/100 * 12
    const monthlyrate = annualRate / 12 / 100
    const months = tenure * 12

    const emiValue =
      (principal * monthlyrate * Math.pow(1 + monthlyrate, months)) /
      (Math.pow(1 + monthlyrate, months) - 1)

    const totalPayment = emiValue * months
    const totalInterest = totalPayment - principal

    //Now that we got the emi, totalPayment and totalInterest.We update them
    setEmi(emiValue.toFixed(2))
    setTotal(totalPayment.toFixed(2))
    setInterest(totalInterest.toFixed(2))

    // schedule part
    let balance = principal;
    let scheduleData = [];

    for (let month = 1; month <= months; month++) {
      const interestPart = balance * monthlyrate;
      const principalPart = emiValue - interestPart;

      balance -= principalPart;

      scheduleData.push({
        month,
        emi: emiValue,
        principal: principalPart,
        interest: interestPart,
        balance: balance > 0 ? balance : 0,
      });
    }
    setSchedule(scheduleData);
  }

  const resetValues = () => {
    setAmount("")
    setRate("")
    setYears("")
    setEmi(null)
    setInterest(null)
    setTotal(null)
    setSchedule([]);
  }

  const chartData = [
    {
      name: "Principal",
      value: Number(amount),
    },
    {
      name: "Interest",
      value: Number(interest),
    },
  ];

  const COLORS = ["#3B82F6", "#F59E0B"];

  const resultCard = darkMode
    ? "bg-slate-700 text-white"
    : "bg-gray-100 text-gray-900";

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Loan Summary Report", 20, 20);

    doc.setFontSize(12);

    doc.text(`Loan Amount: ₹${Number(amount).toLocaleString("en-IN")}`, 20, 40);
    doc.text(`Interest Rate: ${rate}%`, 20, 50);
    doc.text(`Loan Tenure: ${years} years`, 20, 60);
    doc.text(`Monthly EMI: ₹${Number(emi).toLocaleString("en-IN")}`, 20, 70);
    doc.text(`Total Interest: ₹${Number(interest).toLocaleString("en-IN")}`, 20, 80);
    doc.text(`Total Payment: ₹${Number(total).toLocaleString("en-IN")}`, 20, 90);

    autoTable(doc, {
      startY: 105,
      head: [["Month", "EMI", "Principal", "Interest", "Balance"]],
      body: schedule.map((item) => [
        item.month,
        item.emi.toFixed(2),
        item.principal.toFixed(2),
        item.interest.toFixed(2),
        item.balance.toFixed(2),
      ]),
    });

    doc.save("loan-report.pdf");
  };

  return (
    <div className={` min-h-screen flex items-start justify-center pt-12 px-5 transition-colors duration-300 ${darkMode
      ? "bg-linear-to-br from-slate-950 via-blue-950 to-slate-900 text-white"
      : "bg-gray-100 text-black"
      }`}>

      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-10 right-10 bg-slate-700 hover:bg-slate-600 px-5 py-3 rounded-lg text-white z-50 transition-colors duration-300 shadow-lg"
      >
        {darkMode ? <FaSun /> : <FaMoon />}
      </button>

      <div className="w-full max-w-6xl bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-center mb-8 bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Smart EMI Calculator
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* LEFT SIDE */}
          <div className="lg:w-1/2 space-y-4">

            <div className="mb-4">
              <label className="flex items-center gap-2 mb-2">
                <FaMoneyBillWave />
                Loan Amount
              </label>

              <input
                type="text"
                value={
                  amount
                    ? Number(amount).toLocaleString("en-IN")
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value.replace(/,/g, "");
                  setAmount(value);
                }}
                className={`w-full p-4 rounded-xl border outline-none transition-colors duration-300 ${darkMode
                  ? "bg-slate-700 border-slate-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
                  }`}
              />
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 mb-2">
                <FaPercentage />
                Interest Rate (%)
              </label>

              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className={`w-full p-4 rounded-xl border outline-none transition-colors duration-300 ${darkMode
                  ? "bg-slate-700 border-slate-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
                  }`}
              />
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-2 mb-2">
                <FaCalendarAlt />
                Loan Tenure (Years)
              </label>

              <input
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className={`w-full p-4 rounded-xl border outline-none transition-colors duration-300 ${darkMode
                  ? "bg-slate-700 border-slate-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
                  }`}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={calculateEMI}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-300"
              >
                Calculate EMI
              </button>

              <button
                onClick={resetValues}
                className="flex-1 bg-red-500 py-3 rounded-xl hover:bg-red-600 hover:scale-105 transition-all duration-300"
              >
                Reset
              </button>
            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="lg:w-1/2">

            {emi ? (
              <div className="space-y-6">
                {/* Result Cards */}
                <div className="grid grid-cols-1 gap-4">
                  <div className={`${resultCard} p-5 rounded-2xl border ${darkMode ? "border-slate-600" : "border-gray-200"}`}>
                    <p className={`text-sm font-semibold ${darkMode ? "opacity-70" : "opacity-60"}`}>
                      Monthly EMI
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      ₹{emi}
                    </p>
                  </div>

                  <div className={`${resultCard} p-5 rounded-2xl border ${darkMode ? "border-slate-600" : "border-gray-200"}`}>
                    <p className={`text-sm font-semibold ${darkMode ? "opacity-70" : "opacity-60"}`}>
                      Total Interest
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      ₹{interest}
                    </p>
                  </div>

                  <div className={`${resultCard} p-5 rounded-2xl border ${darkMode ? "border-slate-600" : "border-gray-200"}`}>
                    <p className={`text-sm font-semibold ${darkMode ? "opacity-70" : "opacity-60"}`}>
                      Total Payment
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      ₹{total}
                    </p>
                  </div>
                </div>

                {/* Pie Chart */}
                <div className={`${resultCard} p-6 rounded-2xl border ${darkMode ? "border-slate-600" : "border-gray-200"}`}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ₹${value.toLocaleString("en-IN")}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1500}
                        isAnimationActive={true}
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => `₹${value.toLocaleString("en-IN")}`}
                        contentStyle={{
                          backgroundColor: darkMode ? "#1e293b" : "#f3f4f6",
                          border: "none",
                          borderRadius: "8px",
                          color: darkMode ? "#fff" : "#000",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {schedule.length > 0 && (
                  <div className="mt-8 overflow-x-auto">
                    <h2 className="text-xl font-semibold mb-4">
                      Repayment Schedule
                    </h2>

                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th>Month</th>
                          <th>EMI</th>
                          <th>Principal</th>
                          <th>Interest</th>
                          <th>Balance</th>
                        </tr>
                      </thead>

                      <tbody>
                        {schedule.slice(0, 12).map((item) => (
                          <tr key={item.month}>
                            <td>{item.month}</td>
                            <td>₹ {item.emi.toFixed(0)}</td>
                            <td>₹ {item.principal.toFixed(0)}</td>
                            <td>₹ {item.interest.toFixed(0)}</td>
                            <td>₹ {item.balance.toFixed(0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <button
                  onClick={downloadPDF}
                  className="w-full mt-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 transition"
                >
                  Download Full Report
                </button>

              </div>
            ) : (
              <div
                className={`h-full flex items-center justify-center rounded-2xl p-10 ${darkMode
                  ? "bg-slate-700/50"
                  : "bg-gray-100"
                  }`}
              >
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-3">
                    Loan Summary
                  </h2>

                  <p className="opacity-70">
                    Enter loan details and calculate EMI to view the breakdown.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>


        <footer className="mt-10 text-center border-t pt-5 border-slate-600">
          <p className="font-semibold">
            Developed by Kiran Reddy
          </p>

          <p className="text-sm opacity-70">
            React • Tailwind CSS • Recharts
          </p>

          <a
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-4 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition"
          >
            Built for Digital Heroes
          </a>
        </footer>
      </div>
    </div>
  )
}

export default App