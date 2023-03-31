import { GetServerSideProps } from "next";
import { verifyToken } from "../helpers/verifyToken";
import { useEffect, useState } from "react";
import { HomepageCard } from "../components/HomepageCard";
import { DashboardBase } from "../components/DashboardBase";
import { useSWR, fetcher } from "../helpers/fetcher";
type Stats = {
    users: number;
    apps: number;
};

const Dashboard = () => {
    const { data, error, isLoading } = useSWR<{ apps: string, users: string }>('/api', fetcher)

    return (
        <DashboardBase activeTab="dashboard">
            <div className="flex-grow flex flex-col items-center w-full mt-4 px-4">

                <div className="flex flex-col md:flex-row w-full gap-4">
                    {isLoading ? (
                        <>
                            {[...Array(3)].map((_, k) => <div className="bg-gray-600/20 w-full h-32 rounded-lg flex flex-col justify-center px-8" key={k}>
                                <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
                                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[180px] mb-2.5"></div>
                                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                                <span className="sr-only">Loading...</span>
                            </div>)}
                        </>
                    ) : (
                        <>
                            <HomepageCard
                                number={data?.apps?.toString()}
                                description="apps on this instance"
                            />
                            <HomepageCard
                                number={data?.users?.toString()}
                                description="users on this instance"
                            />
                            <HomepageCard
                                number="0"
                                description="new users today"
                            />
                        </>
                    )}
                </div>
            </div>
        </DashboardBase>
    )
}
export default Dashboard;

export const getServerSideProps: GetServerSideProps = async (context) => {
    const [authorised, user] = verifyToken(context)

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