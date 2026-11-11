'use client'

import { BarChart3,  Headset, Home, Settings } from "lucide-react"
import { createContext, useContext, useState } from "react"




export const tabs = [
    {name: "Overview", icon:Home},
    {name: "Analytics", icon:BarChart3},
    {name: "Settings", icon:Settings},
    {name: "Support", icon:Headset},
]

const DashboardTabContext = createContext(null);


export const DashboardTabProvider = ({children}) => {
    const [activePage, setActivePage] = useState(0);

    return(
        <DashboardTabContext.Provider value={{activePage, setActivePage}}>
            {children}
        </DashboardTabContext.Provider>
    )
}


export const useDashboardTab = () => {
    const ctx = useContext(DashboardTabContext);
    if(!ctx) throw new Error("useDashboardTab must be used inside DashboardTabProvider");
    return ctx; 
};