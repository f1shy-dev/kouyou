import { GetServerSideProps } from "next";
import { useState } from "react";
import { verifyToken } from "../helpers/verifyToken";

const Login = () => {
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    return (
        <div className="h-screen w-screen flex bg-slate-800 justify-center">
            <div className="w-full h-full max-w-4xl flex flex-col items-center">
                <div className="w-full h-20 items-center flex p-4">
                    <span className="text-purple-50 text-lg font-semibold">kouyou</span>
                </div>

                <div className="flex-grow flex flex-col items-center w-full max-w-xs mt-12 md:mt-24 px-4">
                    <h1 className="text-purple-50 text-2xl font-bold mb-8">Login</h1>

                    <div className="mb-6 w-full">
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email address</label>
                        <input type="email" id="email" className="border  text-sm rounded-lg  block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-purple-500 focus:border-purple-500" placeholder="admin@kouyou.local" required>
                        </input>
                    </div>

                    <div className="mb-6 w-full">
                        <label htmlFor="confirm_password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                        <input type="password" id="confirm_password" className="border  text-sm rounded-lg  block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-purple-500 focus:border-purple-500" placeholder="•••••••••" required>
                        </input>
                    </div>

                    <button type="button" className="w-full focus:outline-none text-white bg-purple-500 hover:bg-purple-600 transition-all ease-in-out duration-100 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2"
                        onClick={async () => {
                            const email = (document.querySelector("#email") as HTMLInputElement).value;
                            const password = (document.querySelector("#confirm_password") as HTMLInputElement).value;
                            const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
                            const passwordSha256 = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
                            //state update
                            setIsLoggingIn(true);
                            //fetch /api/login with email and passwordHash, if successful set cookie and redirect to /dashboard
                            const authRequest = await fetch("/api/users/login", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    email: email,
                                    //sha256 hash of password
                                    password: passwordSha256
                                }),
                            });
                            const authResponse = await authRequest.json();
                            if (authRequest.status === 200) {
                                // localStorage.setItem("token", authResponse.token);
                                // document.cookie = 
                                window.location.href = "/dashboard";
                            } else {
                                alert(authResponse.message);
                                setIsLoggingIn(false);
                            }
                        }}>
                        {isLoggingIn ? "Logging in..." : "Login"}
                    </button>

                </div>
            </div>
        </div>
    );
};

export default Login;


export const getServerSideProps: GetServerSideProps = async (context) => {
    const authorised = verifyToken(context)

    if (authorised) {
        return {
            redirect: {
                destination: "/dashboard",
                permanent: false,
            },
        };
    }

    return {
        props: {},
    };
}