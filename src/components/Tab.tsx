import React from "react";

export const Tab: React.FC<{
    activeTab: string;
    setActiveTab: (tab: string) => void;
    tab: string;
    text: string;
}> = ({ activeTab, setActiveTab, tab, text }) =>
        <li className="mr-2">
            <button className={`inline-block px-4 py-2 rounded-t-lg hover:text-gray-300 ${activeTab == tab ? `text-purple-300 border-purple-300 border-b-2` : ""}`} onClick={() => { setActiveTab(tab) }}>{text}</button>
        </li>
