"use client";
import { eachAxis, easeInOut, easeOut, motion } from "framer-motion";
import { Eye, EyeClosed } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Slide, ToastContainer, toast } from "react-toastify";

export default function SignUP() {
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUp, setSignUp] = useState(false);

  const [tooglePass, setTooglePass] = useState(false);
  const router = useRouter();
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://bucketheadbackend.vercel.app";

  // REGISTER
  async function register(name, email, password) {
    const response = await fetch(`${API_URL}/registration`, {
      method: "Post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || data.message || "Registration Failed");
    }
    const tokenVal = data.token || data.access_token;
    if (tokenVal) {
      localStorage.setItem("access_token", tokenVal);
      document.cookie = `access_token=${tokenVal}; path=/; max-age=604800; SameSite=Lax`;
    }
    return data;
  }

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setSignUp(true);
    if (!signUpEmail.includes("@") || !signUpEmail.endsWith(".com")) {
      toast.error("Invalid Email", {
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
      return;
    }

    try {
      await register(signUpName, signUpEmail, signUpPassword);
      setSignUpName("");
      setSignUpEmail("");
      setSignUpPassword("");
      toast.success("Registration Successful", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
        theme: "dark",
        transition: Slide,
      });
      setTimeout(() => {
        router.push("/welcome");
      }, 1000);
    } catch (error) {
      console.error("Registration Failed", error);
      toast.error("Registration Failed", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
        theme: "dark",
        transition: Slide,
      });
      setSignUp(false);
    }
    setTimeout(() => {
      setSignUp(false);
    }, 500);
  };

  const handleHidePass = () => {
    setTooglePass(true);
  };
  const handleShowPass = () => {
    setTooglePass(false);
  };

  const welcome = () => {
    setTimeout(() => {
      router.push("/");
    }, 400);
  };

  return (
    <section className="flex justify-center items-center min-h-screen select-none overflow-hidden relative">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: easeInOut }}
        className="w-fit bg-mud flex justify-center items-center gap-4 px-3 py-4 rounded-md overflow-hidden shadow-2xl z-50 relative"
      >
        <div className="flex justify-center items-center gap-4">
          <div className="flex flex-col justify-between items-center py-6 px-8 min-w-90">
            {/* SIGNUP */}
            <form
              onSubmit={handleSignUpSubmit}
              className="flex flex-col justify-center items-center gap-6 w-full"
            >
              <h1 className="text-[24px] text-white font-jetexbold ">
                Sign Up
              </h1>

              <div className="flex flex-col gap-4 w-full select-none items-center">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] text-orange font-jetreg">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="name"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    required
                    className="w-80 capitalize bg-white outline-2 outline-transparent py-2 px-3 text-[14px] text-mud font-jetreg rounded-sm placeholder:font-jetreg placeholder:select-none selection:bg-orange selection:text-black"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] text-orange font-jetreg">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    required
                    className="w-80 lowercase bg-white outline-2 outline-transparent py-2 px-3 text-[14px] text-mud font-jetreg rounded-sm placeholder:font-jetreg placeholder:select-none selection:bg-orange selection:text-black "
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] text-orange font-jetreg">
                    Password
                  </label>
                  <div className=" relative">
                    <input
                      type={tooglePass ? "text" : "password"}
                      placeholder="password"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      required
                      className="w-80 bg-white outline-2 outline-transparent py-2 px-3 text-[14px] text-mud font-jetreg rounded-sm placeholder:font-jetreg placeholder:select-none selection:bg-blue selection:text-black "
                    />
                    <Eye
                      size={18}
                      onClick={handleShowPass}
                      className={`  text-black absolute top-[50%] translate-y-[-50%] right-3 cursor-pointer ${tooglePass ? "block" : "hidden"} `}
                    />
                    <EyeClosed
                      size={18}
                      onClick={handleHidePass}
                      className={` text-black absolute top-[50%] translate-y-[-50%] right-3 cursor-pointer ${tooglePass ? "hidden" : "block"} `}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="text-[15px] text-black font-jetreg px-2 py-2 bg-white cursor-pointer rounded-sm w-80 hover:bg-orange duration-300 ease-out font-medium mt-4"
              >
                {signUp ? "Creating" : "Create Account"}
              </button>
            </form>
            {/* SIGNUP */}
            <div onClick={welcome} className="mt-6 text-center">
              <button
                type="button"
                className="text-[13px] text-white/70 font-jetreg hover:text-orange cursor-pointer transition-colors duration-200 underline underline-offset-4"
              >
                Already have an account? Sign In
              </button>
            </div>
          </div>

          <img
            src="/images/bg.jpg"
            alt="Sign Up background"
            className="w-120 object-cover rounded-sm"
          />
        </div>
        <img
          src="/gifs/bloub.gif"
          className=" w-20 absolute right-4 top-4 invert-100 "
        />
      </motion.div>
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
        className=" fixed left-0 top-0 h-fit w-fit "
      />
      <h1 className=" text-xl text-mud tracking-wider font-jetexbold absolute bottom-4 left-[50%] translate-x-[-50%] select-none cursor-pointer ">
        "BucketHead"
      </h1>
    </section>
  );
}
