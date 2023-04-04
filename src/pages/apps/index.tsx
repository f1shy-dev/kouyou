import { GetServerSideProps } from "next";
import { verifyToken } from "../../helpers/verifyToken";
import { useEffect, useState } from "react";
import { HomepageCard } from "../../components/HomepageCard";
import { DashboardBase } from "../../components/DashboardBase";
import { Button } from "../../components/Button";
import {
    BeakerIcon,
    CogIcon,
    CubeIcon,
    CubeTransparentIcon,
    PlusIcon,
    TrashIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { useSWR, fetcher } from "../../helpers/fetcher";
import { InputField } from "../../components/InputField";
import { SWRConfig, useSWRConfig } from "swr";
import Link from "next/link";
import { App } from "../../custom";

const Dashboard = ({ apps }: { apps: [App] }) => {
    const { data, error, isLoading } = useSWR<[App]>("/api/apps", fetcher, { refreshInterval: 1000, fallbackData: apps });
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [formData, setFormData] = useState<{
        name: string,
        description?: string,
        iconURL?: string,
        githubUpdateRepo?: string,
    }>({
        name: "",
    });
    const { mutate } = useSWRConfig();

    return (
        <DashboardBase activeTab="apps">
            <div className="flex-grow flex flex-col items-center w-full mt-4 px-4 ">
                <div className="w-full flex flex-row items-center gap-2">
                    <span className="text-2xl font-bold text-base-white">Apps</span>
                    <div className="flex-grow"></div>
                    <Button
                        text="Clear GH Cache"
                        icon={<TrashIcon />}
                        onClick={async () => {
                            const res = await fetch("/api/clear-gh-cache");
                            const json = await res.json();
                            alert(json.success ? "Cleared cache" : "Failed to clear cache");
                        }}
                        className="!bg-orange-500"
                    ></Button>
                    <Button
                        text="Create new app"
                        icon={<PlusIcon />}
                        onClick={() => {
                            //input name
                            //create app
                            setCreateModalVisible(true);
                        }}
                    ></Button>
                </div>

                <div className="mt-4"></div>

                <div className="gap-2 flex flex-col w-full">
                    {data?.map((app) => {
                        return (
                            <div className="w-full rounded-lg bg-material-card px-6 py-4 flex items-center gap-2" key={app.id}>
                                {app.iconURL ? <img
                                    src={app.iconURL}
                                    alt={app.name}
                                    className="w-10 h-10 rounded-lg"
                                /> : <div className="w-10 h-10 rounded-lg bg-gray-600/20 text-white p-2">
                                    <CubeIcon /></div>}
                                <div className="flex flex-col h-full justify-center">
                                    <span className="text-base-white font-semibold">{app.name}</span>
                                    {app.description && <span className="text-base-white/80 text-sm">{app.description}</span>}
                                </div>
                                <div className="flex-grow"></div>
                                <Link className="bg-purple-500 px-5 py-2 rounded-lg flex items-center justify-center text-base-white text-sm" href={`/apps/analytics/${app.id}`}>
                                    <div className="mr-2 h-5 w-5"><BeakerIcon /></div>
                                    <h1>View analytics</h1>
                                </Link>
                                <Link className="bg-purple-500 px-5 py-2 rounded-lg flex items-center justify-center text-base-white text-sm" href={`/apps/settings/${app.id}`}>
                                    <div className="mr-2 h-5 w-5"><CogIcon /></div>
                                    <h1>Settings</h1>
                                </Link>
                            </div>
                        );
                    })}

                </div>
            </div>
            {createModalVisible && (
                <div className="fixed top-0 left-0 w-screen h-screen bg-black/80 flex justify-center items-center">
                    <div className="flex flex-col max-w-lg w-full">
                        <div className="flex flex-row w-full items-center">
                            <span className="text-lg font-bold text-base-white">
                                Create new app
                            </span>
                            <div className="flex-grow"></div>
                            <button className="bg-material-card rounded-lg text-white p-2" onClick={() => {
                                setCreateModalVisible(false);
                            }}>
                                <div className="w-5 h-5">
                                    <XMarkIcon />
                                </div>
                            </button>
                        </div>

                        <div className="bg-material-card flex flex-col rounded-lg shadow mt-2 p-6 gap-4">
                            <InputField type="text" label="Name" id="app_name" required setValue={(v) => { setFormData({ ...formData, name: v, }) }} />
                            <InputField type="text" label="Description" id="app_desc" setValue={(v) => { setFormData({ ...formData, description: v, }) }} />
                            <InputField type="text" label="GitHub updates repo" id="app_update_repo" placeholder="kouyou/your_app" setValue={(v) => { setFormData({ ...formData, githubUpdateRepo: v, }) }} />
                            <InputField type="text" label="Icon URL" id="app_icon_url" placeholder="https://cdn.kouyou.local/your-app-512px.png" setValue={(v) => { setFormData({ ...formData, iconURL: v, }) }} />
                            <Button text="Create app" icon={<PlusIcon />} disabled={formData.name.length < 1} onClick={async () => {
                                //create app
                                const res = await fetch("/api/apps", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(formData),
                                });
                                const json = await res.json();
                                setCreateModalVisible(false);
                                mutate("/api/apps");
                            }} />
                        </div>
                    </div>
                </div>
            )}
        </DashboardBase>
    );
};
export default Dashboard;

export const getServerSideProps: GetServerSideProps = async (context) => {
    const [authorised, user] = verifyToken(context);

    if (!authorised) return {
        redirect: {
            destination: "/login",
            permanent: false,
        },
    };


    const prisma = (context.req as CustomNextApiRequest).prisma;
    const apps = await prisma.app.findMany({
        where: {
            users: {
                some: {
                    id: user?.userId
                },
            },
        }
    });

    return { props: { apps: apps.map(i => ({ ...i, createdAt: i.createdAt.getTime() } as App)) } };
};
