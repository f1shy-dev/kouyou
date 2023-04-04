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
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import { DropdownSelection } from "../../../components/DropdownSelection";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type ChartDateInterval = [Date, Date, number, (startDate: Date, endDate: Date, interval: number, position: number) => string];
const last24Hours: ChartDateInterval = [
    new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
    new Date(),
    60 * 60 * 1000,
    (start, end, interval, pos) => {
        const date = new Date(start.getTime() + interval * pos);
        return `${date.getHours() > 12 ? date.getHours() - 12 : date.getHours()}${date.getHours() > 12 ? "PM" : "AM"}`;
    },
];

function getNumberWithOrdinal(n: number) {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const Dashboard = ({ app }: { app: App }) => {
    const [timeRange, setTimeRange] = useState<ChartDateInterval>(last24Hours);
    const { data, error, isLoading } = useSWR<AppWithAnalytics>(`/api/apps/${app.id}?from=${timeRange[0].getTime()}&to=${timeRange[1].getTime()}&interval=${timeRange[2]}`, fetcher, {
        refreshInterval: 2000,
    });
    let mondayThisWeek = new Date();
    const day = mondayThisWeek.getDay() || 7;
    mondayThisWeek.setHours(0, 0, 0, 0);
    if (day !== 1) mondayThisWeek.setHours(-24 * (day - 1));


    return (
        <DashboardBase activeTab="apps">
            <div className="flex-grow flex flex-col items-center w-full mt-4 px-4 ">
                <div className="w-full flex flex-row items-center gap-2">
                    <Link className="text-2xl font-bold text-base-white/40" href="/apps">
                        Apps
                    </Link>
                    <span className="text-2xl font-bold text-base-white w-4 h-4 mx-1">
                        <ChevronRightIcon />
                    </span>
                    <Link className="text-2xl font-bold text-base-white/40" href={`/apps/settings/${app.id}`}>
                        {data?.name}
                    </Link>
                    <span className="text-2xl font-bold text-base-white w-4 h-4 mx-1">
                        <ChevronRightIcon />
                    </span>
                    <span className="text-2xl font-bold text-base-white">Analytics</span>
                </div>

                <div className="mt-4"></div>

                <div className="gap-2 flex flex-col w-full">
                    <div className="flex w-full gap-16 items-center">
                        <div className="rounded-lg flex flex-col justify-center py-2">
                            <h1 className="text-white font-bold text-3xl mr-1">{(data?.fullAnalytics.firstLaunches || 0) + (data?.limitedAnalytics.firstLaunches || 0)}</h1>
                            <h1 className="text-base-white/80">First launches</h1>
                        </div>
                        <div className="rounded-lg flex flex-col justify-center py-2">
                            <h1 className="text-white font-bold text-3xl mr-1">{(data?.fullAnalytics.launches || 0) + (data?.limitedAnalytics.launches || 0)}</h1>
                            <h1 className="text-base-white/80">App launches</h1>
                        </div>
                        <div className="flex-grow"></div>
                        <DropdownSelection
                            items={[
                                [
                                    {
                                        text: "Last hour",
                                        value: [
                                            new Date(new Date().getTime() - 60 * 60 * 1000),
                                            new Date(),
                                            3 * 60 * 1000,
                                            (start, end, interval, pos) => {
                                                const date = new Date(start.getTime() + interval * pos);
                                                return `${`${date.getHours()}`.padStart(2, "0")}:${`${date.getMinutes()}`.padStart(2, "0")}`;
                                            },
                                        ] as ChartDateInterval,
                                    },

                                    {
                                        text: "Today",
                                        value: [
                                            new Date(new Date().setHours(0, 0, 0, 0)),
                                            new Date(),
                                            60 * 60 * 1000,
                                            (start, end, interval, pos) => {
                                                const date = new Date(start.getTime() + interval * pos);
                                                let s = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
                                                return `${s == 0 ? 12 : s}${date.getHours() > 12 || s == 0 ? "PM" : "AM"}`;
                                            },
                                        ] as ChartDateInterval,
                                    },
                                    { text: "Last 24 hours", value: last24Hours },
                                    {
                                        text: "Yesterday",
                                        value: [
                                            new Date(new Date().setHours(0, 0, 0, 0) - 24 * 60 * 60 * 1000),
                                            new Date(new Date().setHours(0, 0, 0, 0)),
                                            60 * 60 * 1000,
                                            (start, end, interval, pos) => {
                                                const date = new Date(start.getTime() + interval * pos);
                                                let s = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
                                                return `${s == 0 ? 12 : s}${date.getHours() > 12 || s == 0 ? "PM" : "AM"}`;
                                            },
                                        ] as ChartDateInterval,
                                    },
                                ],
                                [
                                    {
                                        text: "This week",
                                        value: [
                                            mondayThisWeek,
                                            new Date(),
                                            24 * 60 * 60 * 1000, (d, e, f, pos) => {
                                                const date = new Date(d.getTime() + f * pos);
                                                return date.toString().split(" ")[0];
                                            }] as ChartDateInterval
                                    },
                                    {
                                        text: "Last 7 days", value: [new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), new Date(), 24 * 60 * 60 * 1000, (d, e, f, pos) => {
                                            const date = new Date(d.getTime() + f * pos);
                                            return date.toString().split(" ")[0];
                                        }] as ChartDateInterval
                                    },
                                    {
                                        text: "Last week",
                                        value: [
                                            new Date(new Date(new Date().setHours(0, 0, 0, 0)).setDate(new Date().getDate() - new Date().getDay() - 6)),
                                            new Date(new Date().setHours(24, 0, 0, 0) - (new Date().getDay() * 24 * 60 * 60 * 1000)),
                                            24 * 60 * 60 * 1000,
                                            (d, e, f, pos) => {
                                                const date = new Date(d.getTime() + (f * pos));
                                                return date.toString().split(" ")[0];
                                            }] as ChartDateInterval
                                    },
                                ],
                                [
                                    {
                                        text: "This month", value: [new Date(new Date(new Date().setDate(0)).setHours(24, 0, 0, 0)), new Date(), 24 * 60 * 60 * 1000, (d, e, f, pos) => {
                                            const date = new Date(d.getTime() + (f * (pos - 1)));
                                            return getNumberWithOrdinal(date.getDate());
                                        }] as ChartDateInterval
                                    },
                                    {
                                        text: "Last 30 days", value: [new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000), new Date(), 24 * 60 * 60 * 1000, (d, e, f, pos) => {
                                            const date = new Date(d.getTime() + (f * (pos - 1)));
                                            return getNumberWithOrdinal(date.getDate());
                                        }] as ChartDateInterval
                                    },
                                    {
                                        text: "Last 90 days", value: [new Date(new Date().getTime() - 90 * 24 * 60 * 60 * 1000), new Date(), 24 * 60 * 60 * 1000 * 3, (d, e, f, pos) => {
                                            const date = new Date(d.getTime() + (f * (pos - 1)));
                                            return getNumberWithOrdinal(date.getDate());
                                        }] as ChartDateInterval
                                    },
                                ],
                                [
                                    {
                                        text: "This year", value: [new Date(new Date().setHours(0, 0, 0, 0) - new Date().getMonth() * 30 * 24 * 60 * 60 * 1000), new Date(), 30 * 24 * 60 * 60 * 1000, (d, e, f, pos) => {
                                            const date = new Date(d.getTime() + (f * (pos - 1)));
                                            return date.toString().split(" ")[1];
                                        }] as ChartDateInterval
                                    },
                                    {
                                        text: "All time", value: [new Date(app.createdAt), new Date(), 365 * 24 * 60 * 60 * 1000, (d, e, f, pos) => {
                                            const date = new Date(d.getTime() + (f * (pos - 1)));
                                            return date.getFullYear().toString();
                                        }] as ChartDateInterval
                                    },
                                ],
                            ]}
                            defaultItem={{
                                text: "Last 24 hours",
                                value: last24Hours,
                            }}
                            onChange={(item) => {
                                setTimeRange(item.value);
                            }}
                        />
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
                                        },
                                    },
                                    ticks: {
                                        font: {
                                            size: 12,
                                            family: "Inter",
                                        },
                                    },
                                    grid: { display: false },
                                },
                                y: {
                                    grid: {
                                        color: "rgba(255, 255, 255, 0.1)",
                                    },
                                    border: {
                                        color: "rgba(255, 255, 255, 0.1)",
                                    },
                                    title: {
                                        font: {
                                            size: 12,
                                            family: "Inter",
                                        },
                                    },
                                    ticks: {
                                        font: {
                                            size: 12,
                                            family: "Inter",
                                        },
                                    },
                                },
                            },
                            plugins: {
                                legend: {
                                    labels: {
                                        color: "white",
                                        font: {
                                            size: 12,
                                            family: "Inter",
                                        },
                                    },
                                    title: {
                                        color: "white",
                                    },
                                    position: "bottom",
                                },
                            },
                        }}
                        data={{
                            labels: data?.limitedAnalytics.launchDates.map((_, i) => timeRange[3](timeRange[0], timeRange[1], timeRange[2], i + 1)),
                            datasets: [
                                {
                                    label: "First launches",
                                    data: data?.limitedAnalytics.firstLaunchDates.map((k, i) => k + data?.fullAnalytics.firstLaunchDates[i]),
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                },
                                {
                                    label: "Launches",
                                    data: data?.limitedAnalytics.launchDates.map((k, i) => k + data?.fullAnalytics.launchDates[i]),
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                },
                            ],
                        }}
                    />
                </div>
            </div>
        </DashboardBase>
    );
};

export default Dashboard;

export const getServerSideProps: GetServerSideProps = async (context) => {
    const [authorised, user] = verifyToken(context);

    if (!authorised)
        return {
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
        },
    });

    if (!app)
        return {
            redirect: {
                destination: "/404",
                permanent: false,
            },
        };

    const data = {
        props: { app: { ...app, createdAt: app.createdAt.getTime() } as App },
    };
    return data;
};
