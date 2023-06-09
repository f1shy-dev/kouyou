import Link from "next/link";
import React from "react";
import { useSWRConfig } from "swr";

export const DashboardBase: React.FC<{
    children: React.ReactNode;
    activeTab: string;
}> = ({ children, activeTab }) => {
    const { mutate } = useSWRConfig();
    return (
        <div className="h-screen w-screen flex bg-slate-800 justify-center">
            <div className="w-full h-full max-w-4xl flex flex-col items-center">
                <div className="w-full h-20 items-center flex p-4">
                    <span className="text-base-white text-lg font-semibold">kouyou</span>

                    <div className="flex-grow"></div>
                    <Link
                        className={`${activeTab == "dashboard" ? "bg-gray-600/20" : ""
                            } px-6 py-2 rounded-lg text-center ml-4`}
                        href="/dashboard"
                    >
                        <h1 className="text-base-white/90">Dashboard</h1>
                    </Link>
                    <Link
                        className={`${activeTab == "apps" ? "bg-gray-600/20" : ""
                            } px-6 py-2 rounded-lg text-center ml-4`}
                        href="/apps"
                    >
                        <h1 className="text-base-white/90">Apps</h1>
                    </Link>
                    <Link
                        className={`${activeTab == "account" ? "bg-gray-600/20" : ""
                            } px-6 py-2 rounded-lg text-center ml-4`}
                        href="/account"
                    >
                        <h1 className="text-base-white/90">Account</h1>
                    </Link>

                    <button
                        className="bg-purple-500 px-6 py-2 rounded-lg text-center ml-4"
                        onClick={async () => {
                            //clear cookie and redirect to login
                            document.cookie.split(";").forEach((c) => {
                                document.cookie = c
                                    .replace(/^ +/, "")
                                    .replace(
                                        /=.*/,
                                        "=;expires=" + new Date(0).toUTCString() + ";path=/"
                                    );
                            });
                            await fetch("/api/users/logout");
                            mutate(['/api/user', '/api/users']);
                            window.location.href = "/login";
                        }}
                    >
                        <h1 className="text-base-white/90">Logout</h1>
                    </button>
                </div>

                <div className="flex-grow flex flex-col items-center w-full mt-4 px-4">
                    {children}
                </div>
            </div>
        </div>
    )
};
