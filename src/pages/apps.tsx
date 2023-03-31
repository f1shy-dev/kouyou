import { GetServerSideProps } from "next";
import { verifyToken } from "../helpers/verifyToken";
import { useEffect, useState } from "react";
import { HomepageCard } from "../components/HomepageCard";
import { DashboardBase } from "../components/DashboardBase";
import { Button } from "../components/Button";
import { BeakerIcon, CogIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useSWR, fetcher } from "../helpers/fetcher";
type Stats = {
    users: number;
    apps: number;
};

const Dashboard = () => {
    const { data, error, isLoading } = useSWR('/api/apps', fetcher)
    const [createModalVisible, setCreateModalVisible] = useState(false);

    return (
        <DashboardBase activeTab="apps">
            <div className="flex-grow flex flex-col items-center w-full mt-4 px-4 ">
                <div className="w-full flex flex-row items-center">
                    <span className="text-2xl font-bold text-purple-50">Apps</span>
                    <div className="flex-grow"></div>
                    <Button text="Create new app" icon={<PlusIcon />}
                        onClick={() => {
                            //input name
                            //create app
                            setCreateModalVisible(true)

                        }}></Button>
                </div>

                <div className="mt-4"></div>

                <div className="w-full rounded-lg bg-slate-200/10 px-6 py-4 flex items-center gap-2">
                    <img src="https://media.discordapp.net/attachments/1081407873982156930/1084918656095490238/image0.jpg?width=623&height=623" alt="ControlConfig" className="w-10 h-10 rounded-lg" />
                    <span className="text-purple-50 font-semibold">ControlConfig</span>
                    <div className="flex-grow"></div>
                    <Button text="View analytics" icon={<BeakerIcon />} />
                    <Button text="Settings" icon={<CogIcon />} />
                </div>
            </div>
            {createModalVisible && 
            <div className="fixed top-0 left-0 w-screen h-screen bg-black/50 flex justify-center items-center">
                <div className="flex flex-col max-w-lg w-full bg-green-500">
                    <div className="flex flex-row w-full">
                        <span className="text-lg font-bold text-purple-50">Create new app</span>
                        <div className="flex-grow"></div>
                        {/* <Button */}
                        <div className="w-6 h-6 bg-black/50 rounded-lg text-white m-2"><XMarkIcon/></div>
                    </div>
                </div>
            </div>
            }
        </ DashboardBase>
    )
}
export default Dashboard;

export const getServerSideProps: GetServerSideProps = async (context) => {
    const authorised = verifyToken(context)

    if (!authorised) {
        return {
            redirect: {
                destination: "/login",
                permanent: false,
            },
        };
    }

    return { props: {} };
}