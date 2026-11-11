'use client'

import { tabs, useDashboardTab } from "@/context/DashboardTabContext";
import { Home } from "lucide-react";
import React from "react";
import {
  BsFacebook,
  BsInstagram,
  BsTwitterX,
  BsWhatsapp,
} from "react-icons/bs";

const Footer = () => {

    const { activePage, setActivePage } = useDashboardTab();


  return (
    <main>
      <section className="md:hidden z-10  px-5 mt-4 fixed w-full bg-white bottom-0">
        <div className="flex items-center justify-between py-2 ">
         {tabs.map(({name, icon: Icon}, i) => {
          const active = i === activePage;
          return (
            <button
              key={name}
              onClick={() => setActivePage(i)}
              aria-current={active ? "page" : undefined}
              className={`text-xs flex flex-col items-center justify-between px-3 py-1  transition-colors ${
                active ? " border-b border-blue-700 text-blue-700" : "text-slate-800"
              }`}
            >
              <Icon className="size-6" />
              <p className="text-xs"> {name}</p>
            </button>
          );
         })}
        </div>
      </section>


      
      <section className="max-md:hidden h-15 p-2 border-t border-slate-300 mt-4">
        <div className="flex justify-between items-center ">
          <h1 className="text-blue-700">Onarce 2026</h1>

          <div className="flex flex-col  items-center justify-center">
            <p>Built with React</p>
            <div className="flex gap-2">
              <BsInstagram />
              <BsTwitterX />
              <BsFacebook />
              <BsWhatsapp />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Footer;
