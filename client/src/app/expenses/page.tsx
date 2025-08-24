"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Row = { _id: string; date: string; milkIncome: number; expense: number; profitLoss: number };

export default function ExpensesPage() {
	const { token } = useAuth();
	const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
	const [amount, setAmount] = useState<string>("0");
	const [note, setNote] = useState<string>("");
	const [history, setHistory] = useState<Row[]>([]);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

	async function addExpense(e: React.FormEvent) {
		e.preventDefault();
		if (Number(amount) <= 0) {
			setMessage({ type: 'error', text: 'Please enter a valid amount' });
			return;
		}
		if (!note.trim()) {
			setMessage({ type: 'error', text: 'Please add a short note (e.g., Vet fee)' });
			return;
		}

		setLoading(true);
		setMessage(null);
		try {
			await apiFetch("/finance/expenses/add", { 
				method: "POST", 
				body: JSON.stringify({ date, amount: Number(amount), note: note.trim() }) 
			});
			setMessage({ type: 'success', text: 'Expense added successfully!' });
			setAmount("0");
			setNote("");
			await loadHistory();
		} catch (error) {
			console.error("Failed to add expense:", error);
			setMessage({ type: 'error', text: `Failed to add expense: ${error instanceof Error ? error.message : 'Unknown error'}` });
		} finally {
			setLoading(false);
		}
	}

	async function loadHistory() {
		try {
			const rows = await apiFetch<Row[]>(`/finance/history`);
			setHistory(rows);
		} catch (error) {
			console.error("Failed to load history:", error);
			setMessage({ type: 'error', text: 'Failed to load expenses history.' });
		}
	}

	useEffect(() => { if (token) loadHistory(); }, [token]);

	if (!token) return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-emerald-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
			<div className="text-center bg-white rounded-xl shadow-lg p-8 sm:p-12 max-w-md w-full border-l-4 border-blue-700">
				<div className="mb-6">
					<div className="text-6xl mb-4">🐄</div>
					<h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-2">Access Required</h2>
					<p className="text-gray-600">Please login to manage expenses</p>
				</div>
				<a 
					href="/login" 
					className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg inline-block w-full sm:w-auto"
				>
					Go to Login
				</a>
			</div>
		</div>
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-emerald-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
				{/* Header */}
				<div className="mb-6 sm:mb-8">
					<div className="flex items-center mb-4">
						<div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
							<span className="text-xl sm:text-2xl">📝</span>
						</div>
						<div>
							<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-700">
								Expense Management
							</h1>
							<p className="text-sm sm:text-base text-gray-600">
								Record farm expenses and track spending
							</p>
						</div>
					</div>
				</div>

				{/* Message Display */}
				{message && (
					<div className={`mb-4 sm:mb-6 p-4 sm:p-6 rounded-xl border-l-4 shadow-md ${
						message.type === 'success' 
							? 'bg-green-50 border-green-600 text-green-800' 
							: 'bg-red-50 border-red-600 text-red-800'
					}`}>
						<div className="flex items-start">
							<span className="text-xl mr-3">
								{message.type === 'success' ? '✅' : '❌'}
							</span>
							<p className="font-medium">{message.text}</p>
						</div>
					</div>
				)}

				{/* Add Expense Form */}
				<div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border-l-4 border-red-600 mb-6 sm:mb-8 group hover:-translate-y-1">
					<div className="text-center mb-6">
						<div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mb-3">
							<span className="text-xl">💸</span>
						</div>
						<h2 className="text-xl sm:text-2xl font-bold text-blue-700">Add New Expense</h2>
						<p className="text-gray-600 mt-2">Record your farm expenses for accurate financial tracking</p>
					</div>

					<form onSubmit={addExpense} className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-5 lg:gap-4 lg:items-end">
						<div>
							<label className="block text-sm font-bold text-blue-700 mb-2">
								📅 Date *
							</label>
							<input 
								type="date" 
								className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
								value={date} 
								onChange={(e) => setDate(e.target.value)}
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-bold text-blue-700 mb-2">
								💰 Amount (₹) *
							</label>
							<input 
								type="number" 
								step="0.01" 
								min="0"
								className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
								value={amount} 
								onChange={(e) => setAmount(e.target.value)} 
								placeholder="0.00"
								required
							/>
						</div>

						<div className="lg:col-span-2">
							<label className="block text-sm font-bold text-blue-700 mb-2">
								📝 Note/Description *
							</label>
							<input 
								className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
								value={note} 
								onChange={(e) => setNote(e.target.value)} 
								placeholder="e.g., Vet fee, Feed, Equipment repair"
								required
							/>
						</div>

						<div>
							<button 
								disabled={loading || Number(amount) <= 0 || !note.trim()}
								className="w-full bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-800 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
							>
								{loading ? (
									<span className="flex items-center justify-center">
										<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
										<span>💸 Adding...</span>
									</span>
								) : (
									"💸 Add Expense"
								)}
							</button>
						</div>
					</form>
				</div>

				{/* Expenses History */}
				<div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-emerald-600 overflow-hidden group hover:-translate-y-1">
					<div className="px-4 sm:px-6 py-4 sm:py-6 bg-gradient-to-r from-emerald-50 to-blue-50">
						<div className="flex items-center">
							<div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
								<span className="text-2xl">📊</span>
							</div>
							<div>
								<h2 className="text-xl sm:text-2xl font-bold text-blue-700">Expenses & Financial History</h2>
								<p className="text-sm text-gray-600 mt-1">
									Recent expenses and financial records ({history.length} entries)
								</p>
							</div>
						</div>
					</div>

					{history.length === 0 ? (
						<div className="text-center py-12 sm:py-16">
							<div className="text-6xl sm:text-8xl mb-6">🧾</div>
							<h3 className="text-xl font-bold text-blue-700 mb-3">No expense records yet</h3>
							<p className="text-gray-600 mb-6 max-w-md mx-auto">
								Add your first expense to start tracking your farm's financial health
							</p>
							<div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg">
								<span className="text-lg mr-2">💡</span>
								<span className="text-sm font-medium text-blue-700">Track expenses to monitor profitability</span>
							</div>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="bg-gradient-to-r from-blue-50 to-emerald-50">
										<th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
											📅 Date
										</th>
										<th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
											🥛 Income
										</th>
										<th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
											💸 Expenses
										</th>
										<th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
											📈 Profit/Loss
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{history.map((r, index) => (
										<tr key={r._id} className="hover:bg-gradient-to-r hover:from-blue-25 hover:to-emerald-25 transition-all duration-200">
											<td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
												{new Date(r.date).toLocaleDateString()}
											</td>
											<td className="px-4 sm:px-6 py-4 whitespace-nowrap">
												<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
													₹{r.milkIncome?.toFixed(2) || '0.00'}
												</span>
											</td>
											<td className="px-4 sm:px-6 py-4 whitespace-nowrap">
												<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800">
													₹{r.expense?.toFixed(2) || '0.00'}
												</span>
											</td>
											<td className="px-4 sm:px-6 py-4 whitespace-nowrap">
												<span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
													(r.profitLoss || 0) >= 0 
														? 'bg-green-100 text-green-800' 
														: 'bg-red-100 text-red-800'
												}`}>
													{(r.profitLoss || 0) >= 0 ? '📈' : '📉'} ₹{r.profitLoss?.toFixed(2) || '0.00'}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}