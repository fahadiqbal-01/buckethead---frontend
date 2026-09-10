"use client";
import { easeOut, motion, AnimatePresence, easeInOut } from "framer-motion";
import { Eye, EyeClosed } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Bounce, Flip, Slide, ToastContainer, toast } from "react-toastify";

export default function Welcome() {
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signIn, setSignIn] = useState(false);

  const [tooglePassSec, setTooglePassSec] = useState(false);

  // router
  let router = useRouter();

  // Prefetch dashboard route in background so navigation is instant
  useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

  // LOGIN
  async function Validate(email, password) {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || data.message || "Login Failed");
    }
    const tokenVal = data.token || data.access_token;
    if (tokenVal) {
      localStorage.setItem("access_token", tokenVal);
      document.cookie = `access_token=${tokenVal}; path=/; max-age=604800; SameSite=Lax`;
    }
    return data;
  }

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setSignIn(true);

    try {
      await Validate(signInEmail, signInPassword);
      if (typeof window !== "undefined") {
        localStorage.removeItem("buckethead_posts_cache");
      }
      setSignInEmail("");
      setSignInPassword("");
      router.push("/dashboard");
    } catch (error) {
      console.error("Login Failed", error);
      toast.error("Email or Password incorrect", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
        theme: "dark",
        transition: Slide,
      });
      setSignIn(false);
    }
  };

  const handleHidePassSec = () => {
    setTooglePassSec(true);
  };
  const handleShowPassSec = () => {
    setTooglePassSec(false);
  };

  const welcomesignup = () => {
    setTimeout(() => {
      router.push("/welcome/signup");
    }, 400);
  };

  return (
    <section className="flex justify-center items-center min-h-screen select-none overflow-hidden relative">
      <div className="w-fit bg-mud flex justify-center items-center gap-4 px-3 py-4 rounded-md overflow-hidden shadow-2xl z-50 relative">
        <div className="flex justify-center items-center gap-4">
          <div className="flex flex-col justify-between items-center py-6 px-8 min-w-90">
            {/* SIGNIN */}
            <form
              onSubmit={handleSignInSubmit}
              className="flex flex-col justify-center items-center gap-6 w-full"
            >
              <h1 className="text-[24px] text-white font-jetexbold">Sign In</h1>

              <div className="flex flex-col gap-4 w-full select-none items-center">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] text-yellow font-jetreg">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    required
                    className="w-80 lowercase bg-white outline-2 outline-transparent py-2 px-3 text-[14px] text-mud font-jetreg rounded-sm placeholder:font-jetreg placeholder:select-none selection:bg-yellow selection:text-black duration-300 ease-linear "
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] text-yellow font-jetreg">
                    Password
                  </label>
                  <div className=" relative">
                    <input
                      type={tooglePassSec ? "text" : "password"}
                      placeholder="password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      required
                      className="w-80 bg-white outline-2 outline-transparent py-2 px-3 text-[14px] text-mud font-jetreg rounded-sm placeholder:font-jetreg placeholder:select-none selection:bg-yellow selection:text-black "
                    />
                    <Eye
                      size={18}
                      onClick={handleShowPassSec}
                      className={` text-black absolute top-[50%] translate-y-[-50%] right-3 cursor-pointer ${tooglePassSec ? "block" : "hidden"} `}
                    />
                    <EyeClosed
                      size={18}
                      onClick={handleHidePassSec}
                      className={` text-black absolute top-[50%] translate-y-[-50%] right-3 cursor-pointer ${tooglePassSec ? "hidden" : "block"} `}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={signIn}
                className="text-[15px] text-black font-jetreg px-2 py-2 bg-white cursor-pointer rounded-sm w-80 hover:bg-yellow duration-300 ease-out font-medium mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {signIn ? "Logging In..." : "LogIn"}
              </button>
            </form>
            {/* SIGNIN */}
            <div onClick={welcomesignup} className="mt-6 text-center">
              <button
                type="button"
                className="text-[13px] text-white/70 font-jetreg hover:text-yellow cursor-pointer transition-colors duration-200 underline underline-offset-4"
              >
                Create a new account.
              </button>
            </div>
          </div>

          <img
            src="/images/bgsec.jpg"
            alt="Sign In background"
            className="w-120 object-cover rounded-sm"
          />
        </div>

        <img
          src="/gifs/bloub.gif"
          className=" w-20 absolute right-4 top-4 invert-100 "
        />
      </div>
      <ToastContainer
        position="bottom-right"
        limit={2}
        autoClose={1500}
        hideProgressBar
        closeButton={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Slide}
      />
      <img
        src="/images/yooo.svg"
        className=" absolute left-0 top-0 h-fit w-fit "
      />
      <h1 className=" text-xl text-mud tracking-wider font-jetexbold absolute bottom-4 left-[50%] translate-x-[-50%] select-none cursor-pointer ">
        "BucketHead"
      </h1>
    </section>
  );
}
