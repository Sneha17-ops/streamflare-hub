"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function ActivityChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="cyanGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="day" stroke="#475569" tickLine={false} />
        <YAxis stroke="#475569" tickLine={false} />
        <Tooltip
          contentStyle={{
            background: "rgba(7, 10, 19, 0.85)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "12px",
            color: "#fff"
          }}
        />
        <Area type="monotone" dataKey="watch" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#purpleGlow)" />
        <Area type="monotone" dataKey="play" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#cyanGlow)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
