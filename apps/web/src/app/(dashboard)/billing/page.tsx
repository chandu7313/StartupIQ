"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Check, Zap, Briefcase, Building } from "lucide-react";
import { toast } from "sonner";

export default function BillingPage() {
  const [profile, setProfile] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, invoiceRes] = await Promise.all([
        apiClient('/api/v1/users/me'),
        apiClient('/api/v1/payments/invoices')
      ]);
      setProfile(profileRes);
      setInvoices(invoiceRes || []);
    } catch (err) {
      console.error("Failed to load billing data", err);
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBuyCredits = async (packageId: string) => {
    setActionLoading(true);
    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        toast.error("Razorpay SDK failed to load. Are you online?");
        return;
      }

      const order = await apiClient('/api/v1/payments/buy-credits', { method: 'POST', data: { packageId } });

      if (!(window as any).Razorpay) {
        toast.error("Razorpay SDK not found.");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        order_id: order.id,
        name: "VentureForge",
        description: `Purchase ${packageId} Credit Pack`,
        handler: async function (response: any) {
          try {
            await apiClient('/api/v1/payments/verify-payment', {
              method: 'POST',
              data: {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                packageId,
              }
            });
            toast.success("Payment successful! Credits added to your account.");
            fetchData();
          } catch (err) {
            toast.error("Payment verification failed.");
          }
        },
        theme: { color: "#4f46e5" }
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        toast.error(response.error.description);
      });
      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error("Failed to initiate purchase");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-pulse flex items-center space-x-2 text-indigo-600"><Zap className="animate-spin" /><span>Loading billing data...</span></div></div>;

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Billing & Credits</h1>

      {/* Current Balance Overview */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 shadow-lg text-white">
        <h2 className="text-xl font-semibold mb-2 opacity-90">Current Balance</h2>
        <div className="flex items-center gap-4">
          <Zap size={48} className="text-yellow-300 drop-shadow-md" />
          <div>
            <p className="text-5xl font-black drop-shadow-sm">{profile?.credits?.toLocaleString() || 0}</p>
            <p className="text-sm opacity-80 mt-1 font-medium">Available Credits</p>
          </div>
        </div>
        <p className="mt-4 text-sm opacity-80">1 Report Generation = 100 Credits.</p>
      </div>

      {/* Pricing Table */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Top Up Credits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* STARTER */}
          <div className="border rounded-2xl p-6 bg-card flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4 text-indigo-500">
              <Zap size={24} />
              <h3 className="text-xl font-bold">Starter Pack</h3>
            </div>
            <p className="text-3xl font-black my-2">₹499</p>
            <p className="text-sm font-semibold text-indigo-600 mb-6 bg-indigo-50 inline-block px-3 py-1 rounded-full w-fit">500 Credits</p>
            
            <ul className="space-y-3 mb-8 flex-1 text-sm text-muted-foreground">
              <li className="flex gap-2 items-start"><Check size={16} className="text-green-500 mt-0.5 shrink-0" /> Good for 5 complete startup reports</li>
              <li className="flex gap-2 items-start"><Check size={16} className="text-green-500 mt-0.5 shrink-0" /> Never expires</li>
              <li className="flex gap-2 items-start"><Check size={16} className="text-green-500 mt-0.5 shrink-0" /> Full PDF exports included</li>
            </ul>
            
            <button 
              onClick={() => handleBuyCredits('STARTER')} 
              disabled={actionLoading}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors disabled:opacity-50"
            >
              Buy Starter Pack
            </button>
          </div>

          {/* PRO */}
          <div className="border-2 border-indigo-500 rounded-2xl p-6 bg-card flex flex-col relative shadow-lg transform md:-translate-y-2">
            <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider shadow-sm">
              MOST POPULAR
            </div>
            <div className="flex items-center gap-2 mb-4 text-indigo-600">
              <Briefcase size={24} />
              <h3 className="text-xl font-bold">Pro Pack</h3>
            </div>
            <p className="text-3xl font-black my-2">₹1,499</p>
            <p className="text-sm font-semibold text-indigo-600 mb-6 bg-indigo-50 inline-block px-3 py-1 rounded-full w-fit">2,000 Credits</p>
            
            <ul className="space-y-3 mb-8 flex-1 text-sm text-muted-foreground">
              <li className="flex gap-2 items-start"><Check size={16} className="text-indigo-500 mt-0.5 shrink-0" /> Good for 20 complete startup reports</li>
              <li className="flex gap-2 items-start"><Check size={16} className="text-indigo-500 mt-0.5 shrink-0" /> 25% discount per credit</li>
              <li className="flex gap-2 items-start"><Check size={16} className="text-indigo-500 mt-0.5 shrink-0" /> Priority processing queue</li>
            </ul>
            
            <button 
              onClick={() => handleBuyCredits('PRO')} 
              disabled={actionLoading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md transition-all disabled:opacity-50"
            >
              Buy Pro Pack
            </button>
          </div>

          {/* AGENCY */}
          <div className="border rounded-2xl p-6 bg-card flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4 text-purple-600">
              <Building size={24} />
              <h3 className="text-xl font-bold">Agency Pack</h3>
            </div>
            <p className="text-3xl font-black my-2">₹2,999</p>
            <p className="text-sm font-semibold text-purple-600 mb-6 bg-purple-50 inline-block px-3 py-1 rounded-full w-fit">5,000 Credits</p>
            
            <ul className="space-y-3 mb-8 flex-1 text-sm text-muted-foreground">
              <li className="flex gap-2 items-start"><Check size={16} className="text-green-500 mt-0.5 shrink-0" /> Good for 50 complete startup reports</li>
              <li className="flex gap-2 items-start"><Check size={16} className="text-green-500 mt-0.5 shrink-0" /> Best value (40% discount)</li>
              <li className="flex gap-2 items-start"><Check size={16} className="text-green-500 mt-0.5 shrink-0" /> Access to upcoming features</li>
            </ul>
            
            <button 
              onClick={() => handleBuyCredits('AGENCY')} 
              disabled={actionLoading}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors disabled:opacity-50"
            >
              Buy Agency Pack
            </button>
          </div>

        </div>
      </div>

      {/* Invoice History */}
      <div>
        <h2 className="text-xl font-bold mb-4">Payment History</h2>
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No payment history found.</td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">{new Date(inv.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium">₹{inv.amount}</td>
                    <td className="px-6 py-4">
                      <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide uppercase">{inv.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      {inv.downloadUrl && inv.downloadUrl !== '#' ? (
                        <a href={inv.downloadUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline">Download</a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
