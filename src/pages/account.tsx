import { GetServerSideProps } from "next";
import { verifyToken } from "../helpers/verifyToken";
import { useEffect, useState } from "react";
import { HomepageCard } from "../components/HomepageCard";
import { DashboardBase } from "../components/DashboardBase";
import { useSWR, fetcher } from "../helpers/fetcher";
import { Tab } from "../components/Tab";
import Link from "next/link";
import { InputField } from "../components/InputField";
import { Button } from "../components/Button";
import { User } from "@prisma/client";


const Dashboard = ({ user }: {
    user: {
        id: string
        email: string
        name: string | null
        isAdmin: boolean
        createdAt: number
    }
}) => {
    const [activeTab, setActiveTab] = useState("info");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

    return (
        <DashboardBase activeTab="account">
            <div className="flex-grow flex flex-col items-center w-full mt-4 px-4">
                <div className="w-full flex flex-row items-center gap-2">
                    <Link className="text-2xl font-bold text-base-white" href="/account">Account</Link>
                </div>

                <div className="mt-4"></div>


                <div className="gap-2 flex flex-col w-full">

                    <div className="text-sm font-medium text-center text-gray-500 border-b-2 border-gray-200 dark:text-gray-400 dark:border-gray-700 mb-2">
                        <ul className="flex flex-wrap -mb-[2px]">
                            <Tab activeTab={activeTab} setActiveTab={setActiveTab} tab={"info"} text={"Info"} />
                            <Tab activeTab={activeTab} setActiveTab={setActiveTab} tab={"changepass"} text={"Change password"} />
                        </ul>
                    </div>

                    {activeTab == "info" && (
                        <div className="flex flex-col">
                            <span className="text-base-white font-semibold text-sm">Email</span>
                            <div className="border text-sm rounded-lg mt-1 block w-full p-2.5 bg-gray-700 border-gray-600 text-white">
                                {user.email}
                            </div>

                            <span className="text-base-white font-semibold text-sm mt-4">User ID</span>
                            <div className="border text-sm rounded-lg mt-1 block w-full p-2.5 bg-gray-700 border-gray-600 text-white">
                                {user.id}
                            </div>
                        </div>
                    )}

                    {activeTab == "changepass" && (
                        <div className="flex flex-col gap-4">
                            <InputField type="password" label="Old Password" setValue={setOldPassword} value={oldPassword} />
                            <InputField type="password" label="New Password" setValue={setNewPassword} value={newPassword} />
                            <InputField type="password" label="Confirm new Password" setValue={setNewPasswordConfirm} value={newPasswordConfirm} />
                            <Button text="Change password" disabled={newPassword !== newPasswordConfirm} className="w-fit" onClick={async () => {

                                const sha256 = async (str: string) => {
                                    const hash = await crypto.subtle.digest(
                                        "SHA-256",
                                        new TextEncoder().encode(str)
                                    );
                                    return Array.from(new Uint8Array(hash))
                                        .map((b) => b.toString(16).padStart(2, "0"))
                                        .join("");
                                };
                                const res = await fetch("/api/users/change-password", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        email: user.email,
                                        password: await sha256(oldPassword),
                                        newPassword: await sha256(newPassword),
                                    }),
                                });
                                const json = await res.json();
                                if (res.ok) {
                                    alert("Changed password successfully")
                                    window.location.reload();
                                } else {
                                    alert("Failed to change password" + json.message ? `- ${json.message}` : "")
                                }
                            }} />
                        </div>
                    )}
                </div>
            </div>
        </DashboardBase>
    )
}
export default Dashboard;

export const getServerSideProps: GetServerSideProps = async (context) => {
    const [authorised, tokenUser] = verifyToken(context);

    if (!authorised) return {
        redirect: {
            destination: "/login",
            permanent: false,
        },
    };


    const prisma = (context.req as CustomNextApiRequest).prisma;
    try {
        let user = await prisma.user.findFirstOrThrow({
            where: {
                id: tokenUser?.userId,
            },
        });

        return {
            props: {
                user: {
                    ...user,
                    passwordHash: null,
                    createdAt: user.createdAt.getTime(),
                }
            }
        };
    }
    catch (e) {
        console.log(e);
        return {
            redirect: {
                destination: "/login",
                permanent: false,
            },
        };
    }


};
