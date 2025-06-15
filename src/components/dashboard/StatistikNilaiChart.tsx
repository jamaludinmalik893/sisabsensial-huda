
import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

// Dummy/mock data nilai rata-rata per bulan
const data = [
  { month: "Jan", avg: 76 },
  { month: "Feb", avg: 78 },
  { month: "Mar", avg: 80 },
  { month: "Apr", avg: 82 },
  { month: "Mei", avg: 79 },
  { month: "Jun", avg: 81 }
];

const StatistikNilaiChart: React.FC = () => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <GraduationCap className="h-5 w-5 text-blue-600" />
        <span className="font-semibold text-gray-900">Grafik Perkembangan Nilai Rata-rata Siswa</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis domain={[60, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="avg" stroke="#2563eb" strokeWidth={2} activeDot={{ r: 7 }} />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export default StatistikNilaiChart;
