import { GetServerSideProps } from "next";
import { verifyToken } from "../../../helpers/verifyToken";
import { HomepageCard } from "../../../components/HomepageCard";
import { DashboardBase } from "../../../components/DashboardBase";
import { useSWR, fetcher } from "../../../helpers/fetcher";
import { ChevronRightIcon, ClipboardIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { App, AppWithAnalytics } from "../../../custom";
import { useEffect, useState } from "react";
import { Tab } from "../../../components/Tab";
import { Button } from "../../../components/Button";
import { InputField } from "../../../components/InputField";
import { mutate } from "swr";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);


const Dashboard = ({ app }: { app: App }) => {
    const { data, error, isLoading } = useSWR<AppWithAnalytics>(`/api/apps/${app.id}`, fetcher)

    return (
        <DashboardBase activeTab="apps">
            <div className="flex-grow flex flex-col items-center w-full mt-4 px-4 ">
                <div className="w-full flex flex-row items-center gap-2">
                    <Link className="text-2xl font-bold text-base-white/40" href="/apps">Apps</Link>
                    <span className="text-2xl font-bold text-base-white w-4 h-4 mx-1"><ChevronRightIcon /></span>
                    <Link className="text-2xl font-bold text-base-white/40" href={`/apps/settings/${app.id}`}>{data?.name}</Link>
                    <span className="text-2xl font-bold text-base-white w-4 h-4 mx-1"><ChevronRightIcon /></span>
                    <span className="text-2xl font-bold text-base-white">Analytics</span>
                </div>

                <div className="mt-4"></div>

                <div className="gap-2 flex flex-col w-full">

                    <div className="flex w-full gap-16">
                        <div className="rounded-lg flex flex-col justify-center py-2">
                            <h1 className="text-white font-bold text-3xl mr-1">{(data?.fullAnalytics.firstLaunches || 0) + (data?.limitedAnalytics.firstLaunches || 0)}</h1>
                            <h1 className="text-base-white/80">First launches</h1>
                        </div>
                        <div className="rounded-lg flex flex-col justify-center py-2">
                            <h1 className="text-white font-bold text-3xl mr-1">{(data?.fullAnalytics.launches || 0) + (data?.limitedAnalytics.launches || 0)}</h1>
                            <h1 className="text-base-white/80">App launches</h1>
                        </div>
                    </div>


                    <Bar
                        options={{
                            scales: {
                                x: {
                                    display: true,
                                    stacked: true,
                                    title: {
                                        font: {
                                            size: 12,
                                            family: "Inter",
                                        }
                                    }, ticks: {
                                        font: {
                                            size: 12,
                                            family: "Inter",
                                        }
                                    },
                                    grid: { display: false },
                                },
                                y: {
                                    grid: {
                                        color: 'rgba(255, 255, 255, 0.1)',
                                    }, border: {
                                        color: 'rgba(255, 255, 255, 0.1)',
                                    },
                                    title: {
                                        font: {
                                            size: 12,
                                            family: "Inter",
                                        }
                                    },
                                    ticks: {
                                        font: {
                                            size: 12,
                                            family: "Inter",
                                        }
                                    }
                                }
                            },
                            //text color
                            plugins: {
                                legend: {
                                    labels: {
                                        color: 'white',
                                        font: {
                                            size: 12,
                                            family: "Inter",
                                        }
                                    },
                                    title: {
                                        color: 'white',
                                    },
                                    position: 'bottom',
                                }
                            }
                        }}

                        data={{
                            //last 24 hours
                            labels: [...Array(24)].map((_, i) => `${i}PM`),
                            datasets: [
                                {
                                    label: 'First launches',
                                    data: [...Array(24)].map((_, i) => Math.floor(Math.random() * 100)),
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                },
                                {
                                    label: 'Launches',
                                    data: [...Array(24)].map((_, i) => Math.floor(Math.random() * 100)),
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',

                                }
                            ]


                        }} />


                </div>
            </div>

        </DashboardBase >
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

    return { props: { app: (app as App) } };
}