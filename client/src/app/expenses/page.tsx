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
			await apiFetch("/expenses/add", { 
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
		<div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
			<div className="text-center">
				<h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
				<a href="/login" className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
					Go to Login
				</a>
			</div>
		</div>
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">📝 Expense Management</h1>
					<p className="text-gray-600">Record farm expenses and track spending</p>
				</div>

				{/* Message */}
				{message && (
					<div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 border border-green-200 text-green-800' : 'bg-red-100 border border-red-200 text-red-800'}`}>
						{message.text}
					</div>
				)}

				{/* Add Expense Form */}
				<div className="bg-white rounded-xl shadow-lg p-6 mb-8">
					<h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Expense</h2>
					<form onSubmit={addExpense} className="grid md:grid-cols-5 gap-4 items-end">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
							<input 
								type="date" 
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-gray-900"
								value={date} 
								onChange={(e) => setDate(e.target.value)}
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹) *</label>
							<input 
								type="number" 
								step="0.01" 
								min="0"
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-gray-900"
								value={amount} 
								onChange={(e) => setAmount(e.target.value)} 
								placeholder="0.00"
								required
							/>
						</div>
						<div className="md:col-span-2">
							<label className="block text-sm font-medium text-gray-700 mb-2">Note *</label>
							<input 
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-gray-900"
								value={note} 
								onChange={(e) => setNote(e.target.value)} 
								placeholder="e.g., Vet fee, Repair, Feed"
								required
							/>
						</div>
						<div>
							<button 
								disabled={loading || Number(amount) <= 0 || !note.trim()}
								className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loading ? (
									<span className="flex items-center justify-center">
										<svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
										Adding...
									</span>
								) : (
									"Add Expense"
								)}
							</button>
						</div>
					</form>
				</div>

				{/* Expenses History */}
				<div className="bg-white rounded-xl shadow-lg overflow-hidden">
					<div className="px-6 py-4 border-b border-gray-200">
						<h2 className="text-xl font-semibold text-gray-900">Expenses & Financial History</h2>
						<p className="text-sm text-gray-600 mt-1">Recent expenses and financial records ({history.length} entries)</p>
					</div>

					{history.length === 0 ? (
						<div className="text-center py-12">
							<div className="text-6xl mb-4">🧾</div>
							<h3 className="text-lg font-medium text-gray-900 mb-2">No expense records yet</h3>
							<p className="text-gray-500">Add your first expense to see it here</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit/Loss</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{history.map((r, index) => (
										<tr key={r._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{new Date(r.date).toLocaleDateString()}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
													₹{r.milkIncome?.toFixed(2) || 0}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
													₹{r.expense?.toFixed(2) || 0}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
													(r.profitLoss || 0) >= 0 
														? 'bg-green-100 text-green-800' 
														: 'bg-red-100 text-red-800'
												}` }>
													₹{r.profitLoss?.toFixed(2) || 0}
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


