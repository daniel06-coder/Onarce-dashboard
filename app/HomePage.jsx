"use client";
import { ArrowRight, Bolt, ChartBellCurve, ChartGanttIcon, Dot, Eye, EyeClosed, LineSquiggle, ShoppingBag, ShoppingCart, SignalHigh, Store, Trophy, User } from "lucide-react";
import React, { useState } from "react";
import { BiCube } from "react-icons/bi";
import { BsLightning, BsLightningChargeFill } from "react-icons/bs";
import { FaBoltLightning, FaNairaSign } from "react-icons/fa6";
import {
  Area,
  AreaChart,
  BarChart,
  CartesianGrid,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const HomePage = () => {
  const [hide, sethide] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // temporary
  const data = [
    { month: "Mon", sales: 7000, revenue: 2400 },
    { month: "Tue", sales: 3000, revenue: 1398 },
    { month: "Wed", sales: 2000, revenue: 9800 },
    { month: "Thur", sales: 60780, revenue: 3908 },
    { month: "Fri", sales: 1890, revenue: 4800 },
    { month: "Sat", sales: 23090, revenue: 3800 },
    { month: "Sun", sales: 72090, revenue: 38000 },
  ];

  // temporary
  const recent = [
    {icon:<Store className="size-7" />, header:'New shop registerd', text:'Shop name', time: 3,  },
    {icon:<ShoppingCart className="size-7" />, header:'New order placed', text:'Order tracker', time: 5,  },
    {icon:<BiCube className="size-7 text-yellow-500" />, header:'Product Added', text:'Product Name', time: 12,  },
    {icon:<User className="size-7" />, header:'New customer registered', text:'Product Name', time: 12,  },
  ]

 React.useEffect(() => {
   const fetchStats = async () => {
     try {
       setLoading(true);
       setError("");

       const res = await fetch("/api/admin/stats", {
         cache: "no-store",
       });

       if (!res.ok) {
         throw new Error("Unable to load dashboard statistics");
       }

       const result = await res.json();

       setStats(result);
     } catch (error) {
       console.error(error);
       setError(error.message);
     } finally {
       setLoading(false);
     }
   };

   fetchStats();
 }, []);


  return (
    <main className="">
      <section className="px-2 md:px-15 ">
        <div className="pb-4">
          <h2 className="text-xl font-bold mb-1 ">Good Morning, Daniel! 👋</h2>
          <p className="text-xs text-slate-500 ">
            Here's whats's happening on Onarce today
          </p>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className=" flex flex-col justify-between  ">
          <div className="flex gap-4 flex-col justify-center">
            <div className="grid grid-cols-2 gap-2">
              <div className=" bg-blue-300/20 border border-purple-500/20   text-white h-[7rem] md:h-[12rem]  px-2 py-4 text-sm flex  items-center  gap-2 md:gap-5 md:px-6 md:py-5 rounded-xl  relative">
                <div className="flex justify-start items-start h-full mr-2 relative">
                  <div className="rounded-xl bg-blue-500/40 p-2 ">
                    <ShoppingBag className="text-blue-700 size-5" />
                  </div>
                </div>

                <div className=" flex flex-col gap-1 ">
                  <h2 className="text-gray-600 font-semibold "> Total Shops</h2>
                  <p className="text-[1.6rem] max-md:text-2xl max-md:font-bold font-extrabold  text-black">
                    {loading
                      ? "..."
                      : (stats?.totals?.shops?.toLocaleString() ?? "0")}
                  </p>
                  <span className="text-sm text-green-500 font-extrabold">
                    +18.5%
                  </span>

                  <div className="absolute right-0 bottom-0">
                    <LineSquiggle className="text-blue-700 size-8" />
                  </div>
                </div>
              </div>
              <div className=" bg-purple-300/20 border border-purple-500/20   text-white h-[7rem] md:h-[12rem]  px-2 py-4 text-sm flex  items-center  gap-2 md:gap-5 md:px-6 md:py-5 rounded-xl  relative">
                <div className="flex justify-start items-start h-full mr-2 relative">
                  <div className="rounded-xl bg-purple-500/40 p-2 ">
                    <BiCube className="text-purple-700 size-5" />
                  </div>
                </div>

                <div className=" flex flex-col gap-1 ">
                  <h2 className="text-gray-600 font-semibold ">
                    {" "}
                    Total Orders
                  </h2>
                  <p className="text-[1.6rem] max-md:text-2xl max-md:font-bold font-extrabold text-black">
                    {loading
                      ? "..."
                      : (stats?.totals?.orders?.toLocaleString() ?? "0")}
                  </p>
                  <span className="text-sm text-green-500 font-extrabold">
                    +12.5%
                  </span>

                  <div className="absolute right-0 bottom-0">
                    <LineSquiggle className="text-purple-700 size-8" />
                  </div>
                </div>
              </div>
              <div className=" bg-green-300/20 border border-green-500/20   text-white h-[7rem] md:h-[12rem]  px-2 py-4 text-sm flex  items-center  gap-2 md:gap-5 md:px-6 md:py-5 rounded-xl  relative">
                <div className="flex justify-start items-start h-full mr-2 relative">
                  <div className="rounded-xl bg-green-500/40 p-2 ">
                    <BiCube className="text-green-700 size-5" />
                  </div>
                </div>

                <div className=" flex flex-col gap-1 ">
                  <h2 className="text-gray-600 font-semibold ">
                    {" "}
                    Total Customers
                  </h2>
                  <p className="text-[1.6rem] max-md:text-2xl max-md:font-bold font-extrabold text-black">
                    {loading
                      ? "..."
                      : (stats?.totals?.customers?.toLocaleString() ?? "0")}
                  </p>
                  <span className="text-sm text-green-500 font-extrabold">
                    +12.5%
                  </span>

                  <div className="absolute right-0 bottom-0">
                    <LineSquiggle className="text-green-700 size-8" />
                  </div>
                </div>
              </div>
              <div className=" bg-orange-300/20 border border-orange-500/20    text-white h-[7rem] md:h-[12rem]  px-2 py-4 text-sm flex  items-center  gap-2 md:gap-5 md:px-6 md:py-5 rounded-xl  relative">
                <div className="flex justify-start items-start h-full mr-2 relative">
                  <div className="rounded-xl bg-orange-500/40 p-2 ">
                    <FaNairaSign className="text-orange-700 size-5" />
                  </div>
                </div>

                <div className=" flex flex-col gap-1 ">
                  <h2 className="text-gray-600 font-semibold ">
                    Total Products
                  </h2>
                  <p className="text-[1.6rem] max-md:text-2xl max-md:font-bold font-extrabold text-black">
                    {loading
                      ? "..."
                      : (stats?.totals?.products?.toLocaleString() ?? "0")}
                  </p>
                  <span className="text-sm text-green-500 font-extrabold">
                    +12.5%
                  </span>

                  <div className="absolute right-0 bottom-0">
                    <LineSquiggle className="text-orange-700 size-8" />
                  </div>
                </div>
              </div>
            </div>

            <div className=" px-2 py-4 w-full h-full rounded-xl shadow-md flex flex-col md:gap-5 md:px-6 md:py-5 relative bg-slate-100 overflow-hidden">
              <div className="flex justify-between items-center mb-2  ">
                <div className="flex items-center h-full   justify-center">
                  <SignalHigh className="text-blue-700 size-8" />
                  <h2 className="  font-bold  text-md mt-auto ">
                    Revenue Overview
                  </h2>
                </div>

                <div className="flex text-slate-700 bg-slate-200   rounded-full">
                  <button className=" text-sm bg-blue-700 w-full rounded-xl px-3 max-md:px-2  text-white ">
                    7d
                  </button>
                  <button className=" text-sm py-1  px-3 max-md:px-2">
                    1m
                  </button>
                  <button className=" text-sm  py-1 px-3 max-md:px-2">
                    3m
                  </button>
                  <button className=" text-sm  py-1 px-3 max-md:px-2">
                    1y
                  </button>
                </div>
              </div>

              <div className="w-full h-full mt-1 flex flex-col gap-4   rounded-lg">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl  font-bold">₦10,000,000</h2>
                  <div className="text-xs flex gap-3 text-slate-700">
                    {" "}
                    <span className="text-green-500 ">+20.1%</span> vs last
                    week{" "}
                  </div>
                </div>
                <div style={{}} className="h-[9rem] md:h-[20rem] w-full">
                  <ResponsiveContainer width={"100%"} height={"100%"}>
                    <AreaChart
                      data={data}
                      margin={{ top: 10, right: 10, left: -10, bottom: -10 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorSales"
                          x1={"0"}
                          y1={"0"}
                          x2={"0"}
                          y2={"0"}
                        >
                          <stop
                            offset={"5%"}
                            stopColor="#8884d8"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset={"95%"}
                            stopColor="#8884d8"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: "#d80000", fontSize: 12 }}
                      />
                      <YAxis tick={{ fill: "#fc0000", fontSize: 12 }} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="#4c44e2"
                        fillOpacity={1}
                        fill="url(#colorSales)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div
                className={` absolute px-1 inset-0   transform duration-400 flex  items-end justify-start ${hide ? "backdrop-blur-md bg-white/10   " : "backdrop-blur-none text-white/30"}`}
              >
                <button
                  className="z-10 p-2"
                  onClick={() => sethide((prev) => !prev)}
                >
                  {hide ? (
                    <EyeClosed className="size-8" />
                  ) : (
                    <Eye className="size-8" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activites */}
        <div className="bg-white shadow-md mt-3 px-2 py-3 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center justify-center gap-2 h-full">
              <BsLightningChargeFill className="size-6 text-blue-700" />
              <h2 className="font-semibold text-sm mt-auto">
                Recent Activities
              </h2>
            </div>

            <div className="flex items-center justify-center gap-2 h-full text-blue-700">
              <h4 className=" text-xs mt-auto ">View All</h4>

              <ArrowRight className="size-4 " />
            </div>
          </div>

          <div className="py-2 flex flex-col gap-3">
            {recent.map((item, index) => (
              <div key={index} className="">
                <div className="flex justify-between  ">
                  <div className="flex items-center justify-center h-full gap-2 ">
                    <span className="text-blue-700 bg-slate-200/50 p-2 rounded-full ">
                      {item.icon}
                    </span>
                    <div className="flex flex-col justify-center mt-auto  ">
                      <h2 className="text-sm font-bold ">{item.header}</h2>
                      <p className="text-xs font-light text-slate-500  ">
                        {item.text}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <p className="text-sm text-blue-700">{item.time}m ago</p>
                    <Dot className="size-6 text-blue-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white shadow-md mt-3 px-2 py-3 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center justify-center gap-2 h-full">
              <Trophy className="size-6 text-yellow-500" />
              <h2 className="font-semibold text-sm mt-auto">Top Products</h2>
            </div>

            <div className="flex items-center justify-center gap-2 h-full text-blue-700">
              <h4 className=" text-xs mt-auto ">See All</h4>

              <ArrowRight className="size-4 " />
            </div>
          </div>

          <div className="py-2 flex flex-col gap-3">
            {recent.map((item, index) => (
              <div key={index} className="">
                <div className="flex justify-between  ">
                  <div className="flex items-center justify-center h-full gap-2 ">
                    <span className="text-blue-700 bg-slate-200/50 p-2 rounded-full ">
                      {item.icon}
                    </span>
                    <div className="flex flex-col justify-center mt-auto  ">
                      <h2 className="text-sm font-bold ">{item.header}</h2>
                      <p className="text-xs font-light text-slate-500  ">
                        {item.text}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <p className="text-sm text-blue-700">{item.time}m ago</p>
                    <Dot className="size-6 text-blue-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
