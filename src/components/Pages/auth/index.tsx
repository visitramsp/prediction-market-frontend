import ModalSignup from "@/components/Modal/Signup/page";
import React, { useState } from "react";
import { googleLoginAPI } from "@/components/service/auth";
import toast from "react-hot-toast";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "@/components/content";
import { useDispatch } from "react-redux";
import { login } from "@/components/store/slice/auth";
import AuthLogin from "./login";
import { useRouter } from "next/navigation";

export default function Authentication({
  isOpen = false,
  isLogin = false,
  handleClose,
}: {
  isOpen: boolean;
  isLogin: boolean;
  handleClose: () => void;
}) {
  const [registerOpen, setRegisterOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const handleRegister = () => {
    if (isLogin) {
      setRegisterOpen(true);
    } else {
      router.push("/register");
      handleClose();
    }
  };
  const handleRegisterClose = () => {
    setRegisterOpen(false);
  };
  const loginWithGoogle = async (token: string) => {
    try {
      const reqBody = {
        idToken: token,
      };
      const response = await googleLoginAPI(reqBody);

      if (response?.success) {
        localStorage.setItem("token", response?.data?.token);
        dispatch(
          login({ user: response?.data?.user, token: response?.data?.token }),
        );
        toast.success(response?.message);
        // window.location.reload();
        handleClose();
      } else {
        toast.error(response?.message || "Something went wrong?");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  console.log(isLogin, "isLogin");

  return (
    <>
      <ModalSignup isOpen={isOpen} onClose={handleClose}>
        <h2 className="text-xl  text-black dark:text-white font-bold mb-4">
          {isLogin ? " Login your account" : " Create your account"}
        </h2>

        <GoogleOAuthProvider
          clientId={GOOGLE_CLIENT_ID}
          onScriptLoadSuccess={() => {
            const google = (window as any).google;
            if (google?.accounts?.id) {
              google.accounts.id.disableAutoSelect();
            }
          }}
        >
          <div className="mt-6 flex justify-center w-full">
            <div className="google-btn-wrapper">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  const token = credentialResponse.credential || "";
                  await loginWithGoogle(token);
                }}
                onError={() => toast.error("Login Failed")}
                theme="filled_blue"
                size="large"
                shape="rectangular"
                auto_select={false}
                useOneTap={false}
                width="420"
              />
            </div>
          </div>
        </GoogleOAuthProvider>

        <div className="bg-black dark:bg-gray-50 dark:text-black hover:text-gray-800 hover:dark:bg-white hover:bg-black/85 w-full p-3 text-center text-white rounded-lg mt-3 mb-3 cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-apple w-5 h-5 inline-block mr-4"
            viewBox="0 0 16 16"
          >
            <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516s1.52.087 2.475-1.258.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422s1.675-2.789 1.698-2.854-.597-.79-1.254-1.157a3.7 3.7 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56s.625 1.924 1.273 2.796c.576.984 1.34 1.667 1.659 1.899s1.219.386 1.843.067c.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758q.52-1.185.473-1.282" />
            <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516s1.52.087 2.475-1.258.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422s1.675-2.789 1.698-2.854-.597-.79-1.254-1.157a3.7 3.7 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56s.625 1.924 1.273 2.796c.576.984 1.34 1.667 1.659 1.899s1.219.386 1.843.067c.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758q.52-1.185.473-1.282" />
          </svg>
          Continue with Apple
        </div>
        <div
          onClick={handleRegister}
          className="border border-gray-600/15 hover:bg-gray-200 hover:dark:bg-transparent w-full p-3 text-center text-gray-800 dark:text-gray-200 dark:border-gray-300 rounded-lg mb-3 cursor-pointer"
        >
          <span className="w-5 h-5 fill-current mr-4 inline-block">@</span>
          Continue with Email
        </div>
      </ModalSignup>

      <AuthLogin
        isLogin={isLogin}
        handleClose={handleRegisterClose}
        goBack={() => setRegisterOpen(false)}
        isOpen={registerOpen}
        mainHandleClose={handleClose}
      />
    </>
  );
}
