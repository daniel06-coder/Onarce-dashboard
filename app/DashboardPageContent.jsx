"use client";
import React, { useState } from "react";
import HomePage from "./HomePage";
import { useDashboardTab } from "@/context/DashboardTabContext";
import OnarceAnalytics from "./Analytics/OnarceAnalytics";

const Placeholder = ({ title }) => (
  <div className="px-2 py-10 text-center text-slate-500">
    {" "}
    {title} comming soon
  </div>
);

const tabPages = [
  <HomePage key={"overview"} />,
  <OnarceAnalytics key="analytics" title="Analytics" />,
  <Placeholder key="settings" title="Settings" />,
  <Placeholder key="support" title="Support" />,
];

const DashboardPageContent = () => {
  const { activePage } = useDashboardTab();

  return (
    <main>
      <div className="pb-24 md:pb-0">{tabPages[activePage]}</div>
    </main>
  );
};

export default DashboardPageContent;
