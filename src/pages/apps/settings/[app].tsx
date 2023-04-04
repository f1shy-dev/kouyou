import { GetServerSideProps } from "next";
import { verifyToken } from "../../../helpers/verifyToken";
import { HomepageCard } from "../../../components/HomepageCard";
import { DashboardBase } from "../../../components/DashboardBase";
import { useSWR, fetcher } from "../../../helpers/fetcher";
import { BeakerIcon, ChevronRightIcon, ClipboardIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { App } from "../../../custom";
import { useEffect, useState } from "react";
import { Tab } from "../../../components/Tab";
import { Button } from "../../../components/Button";
import { InputField } from "../../../components/InputField";
import { mutate } from "swr";

const Dashboard = ({ app }: { app: App }) => {
    const [hasSetFormDataOnce, setHasSetFormDataOnce] = useState(false);
    const [activeTab, setActiveTab] = useState("general");
    const { data, error, isLoading } = useSWR<App>(`/api/apps/${app.id}`, fetcher, { fallbackData: app })
    const [formData, setFormData] = useState<App>();

    useEffect(() => {
        if (!hasSetFormDataOnce) {
            setFormData(data);
            setHasSetFormDataOnce(true);
        }
    }, [data]);

    return (
        <DashboardBase activeTab="apps">
            <div className="flex-grow flex flex-col items-center w-full mt-4 px-4 ">
                <div className="w-full flex flex-row items-center gap-2">
                    <Link className="text-2xl font-bold text-base-white/40" href="/apps">Apps</Link>
                    <span className="text-2xl font-bold text-base-white w-4 h-4 mx-1"><ChevronRightIcon /></span>
                    <span className="text-2xl font-bold text-base-white">{data?.name}</span>
                    <div className="flex-grow"></div>
                    <Link className="bg-purple-500 px-6 py-2 rounded-lg flex items-center justify-center text-base-white text-sm" href={`/apps/analytics/${app.id}`}>
                        <div className="mr-2 h-5 w-5"><BeakerIcon /></div>
                        <h1>View analytics</h1>
                    </Link>
                </div>

                <div className="mt-4"></div>

                <div className="gap-2 flex flex-col w-full">

                    <div className="text-sm font-medium text-center text-gray-500 border-b-2 border-gray-200 dark:text-gray-400 dark:border-gray-700 mb-2">
                        <ul className="flex flex-wrap -mb-[2px]">
                            <Tab activeTab={activeTab} setActiveTab={setActiveTab} tab={"general"} text={"General"} />
                            <Tab activeTab={activeTab} setActiveTab={setActiveTab} tab={"code"} text={"Implementation code"} />
                            <Tab activeTab={activeTab} setActiveTab={setActiveTab} tab={"dangerzone"} text={"Danger zone"} />
                        </ul>
                    </div>
                    {activeTab == "general" && formData &&
                        <div className="gap-4 flex flex-col">
                            <InputField type="text" label="Name" required setValue={(v) => { setFormData({ ...formData, name: v, }) }} value={formData.name} />
                            <InputField type="text" label="Description" setValue={(v) => { setFormData({ ...formData, description: v, }) }} value={formData.description} />
                            <InputField type="text" label="GitHub updates repo" placeholder="kouyou/your_app" setValue={(v) => { setFormData({ ...formData, githubUpdateRepo: v, }) }} value={formData.githubUpdateRepo} />
                            <InputField type="text" label="Icon URL" placeholder="https://cdn.kouyou.local/your-app-512px.png" setValue={(v) => { setFormData({ ...formData, iconURL: v, }) }} value={formData.iconURL} />
                            <Button text="Update app info" disabled={(formData.name == data?.name && formData.iconURL == data?.iconURL && formData.description == data?.description && formData.githubUpdateRepo == data?.githubUpdateRepo)} className="w-fit" onClick={async () => {
                                let nfData = { ...formData, fullAnalytics: null, limitedAnalytics: null };

                                const res = await fetch("/api/apps/" + app.id, {
                                    method: "PATCH",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(nfData),
                                });
                                const json = await res.json();
                                if (res.ok) {
                                    alert("App updated successfully")
                                    mutate(`/api/apps/${app.id}`)
                                } else {
                                    alert("Failed to update app" + json.message ? `- ${json.message}` : "")
                                }
                            }} />
                        </div>
                    }

                    {activeTab == "code" &&
                        <>
                            <span className="text-base-white text-sm font-semibold leading-snug">App ID</span>
                            <span className="text-gray-300 text-sm leading-snug">Use this ID in the Swift library to identify your app and to post analytics for your app.</span>
                            <div className="border text-sm rounded-lg w-full p-2.5 bg-gray-700 border-gray-600 text-white flex items-center">
                                {data?.id}
                                <div className="flex-grow"></div>
                                <button className="h-5 w-5 text-white" onClick={() => {
                                    navigator.clipboard.writeText(data?.id || "")
                                }}><DocumentDuplicateIcon /></button>
                            </div>
                        </>
                    }

                    {activeTab == "dangerzone" &&
                        <>
                            <span className="text-base-white text-sm font-semibold leading-snug">Reset app</span>
                            <span className="text-gray-300 text-sm leading-snug">Delete all analytics data collected for this app, but keep your settings and configuration (DRM, updates, and other settings will be kept).</span>
                            <Button text={"Reset app"} className="w-fit bg-red-500" onClick={async () => {
                                const delReq = await fetch(`/api/apps/${app.id}/analytics`, {
                                    method: "DELETE",
                                });
                                if (delReq.ok) {
                                    alert("App analytics deleted successfully")
                                    window.location.href = "/apps"
                                } else {
                                    const data = await delReq.json();
                                    alert("Failed to delete app analytics" + data.message ? `- ${data.message}` : "")
                                }
                            }} />

                            <span className="text-base-white text-sm font-semibold leading-snug mt-4">Delete app</span>
                            <span className="text-gray-300 text-sm leading-snug">Delete this app and all related data entirely.</span>
                            <Button text={"Delete app"} className="w-fit bg-red-500" onClick={async () => {
                                const delReq = await fetch(`/api/apps/${app.id}`, {
                                    method: "DELETE",
                                });
                                if (delReq.ok) {
                                    alert("App deleted successfully")
                                    window.location.href = "/apps"
                                } else {
                                    const data = await delReq.json();
                                    alert("Failed to delete app" + data.message ? `- ${data.message}` : "")
                                }
                            }} />
                        </>}

                </div>
            </div>

        </DashboardBase>
    )
}
export default Dashboard;

export const getServerSideProps: GetServerSideProps = async (context) => {
    const [authorised, user] = verifyToken(context)

    if (!authorised) return {
        redirect: {
            destination: "/login",
            permanent: false,
        },
    };

    const prisma = (context.req as CustomNextApiRequest).prisma;
    const app = await prisma.app.findFirst({
        where: {
            id: context.params?.app?.toString(),
            users: {
                some: {
                    id: user?.userId,
                },
            },
        }
    })

    if (!app) return {
        redirect: {
            destination: "/404",
            permanent: false,
        },
    };

    return {
        props: { app: { ...app, createdAt: app.createdAt.getTime() } as App }
    };
}