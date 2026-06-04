import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface ChartProps {
  donationsHistory: { date: string; amount: number }[];
  bookingsByCategory: { name: string; value: number }[];
}

const COLORS = ["#8a2e13", "#c25a22", "#bf8f2e", "#e6c878", "#1faa59", "#2a1810"];

export default function DashboardCharts({ donationsHistory, bookingsByCategory }: ChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[300px]">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#ecddc7] animate-pulse flex items-center justify-center text-sm text-gray-400">
          Loading donation trends...
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#ecddc7] animate-pulse flex items-center justify-center text-sm text-gray-400">
          Loading booking categories...
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Donations trend */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm">
        <h3 className="text-base font-bold text-[#8a2e13] mb-4">Donation Trends (Last 30 Days)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={donationsHistory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c25a22" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#c25a22" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ecddc7" vertical={false} />
              <XAxis dataKey="date" stroke="#2a1810" fontSize={10} tickLine={false} />
              <YAxis stroke="#2a1810" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                formatter={(value: any) => [formatCurrency(Number(value || 0)), "Donations"]}
                contentStyle={{ backgroundColor: "#fbf6ec", borderColor: "#ecddc7", borderRadius: "8px" }}
                labelStyle={{ fontWeight: "bold", color: "#8a2e13" }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#c25a22"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorDonations)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bookings split */}
      <div className="bg-white p-6 rounded-xl border border-[#ecddc7] shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-[#8a2e13] mb-4">Pooja / Abhishek Share</h3>
          <div className="h-[220px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bookingsByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {bookingsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} bookings`, "Volume"]}
                  contentStyle={{ backgroundColor: "#fbf6ec", borderColor: "#ecddc7", borderRadius: "8px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Custom Legend */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          {bookingsByCategory.map((item, index) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="truncate font-medium">
                {item.name}: <span className="font-bold">{item.value}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
