import CustomInput from "@/components/common/CustomInput";
import ModalSignup from "@/components/Modal/Signup/page";
import { loginAPI } from "@/components/service/auth";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { TbLockFilled } from "react-icons/tb";
import * as Yup from "yup";
import CircularProgress from "@mui/material/CircularProgress";
import { useDispatch } from "react-redux";
import { login } from "@/components/store/slice/auth";
import { ArrowLeftIcon } from "lucide-react";
import { isValidEmail } from "@/utils/Content";
const LoginSchema = Yup.object().shape({
  userName: Yup.string()
    .required("Email or Phone is required")
    .min(4, "Must be at least 4 characters"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/,
      "Password must contain uppercase, lowercase, number & special character",
    ),
});

export default function AuthLogin({
  isOpen = false,
  isLogin = false,
  goBack,
  handleClose,
  mainHandleClose,
}: {
  isOpen: boolean;
  isLogin: boolean;
  goBack: () => void;
  handleClose: () => void;
  mainHandleClose: () => void;
}) {
  const [isLoader, setIsLoader] = useState(false);
  const [show, setShow] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const dispatch = useDispatch();
  const formik = useFormik({
    initialValues: {
      userName: "",
      password: "",
    },
    validationSchema: LoginSchema,
    onSubmit: async (values, action) => {
      const reqBody = {
        [isPhone ? "phone" : "email"]: values?.userName,
        password: values.password,
      };
      setIsLoader(true);
      try {
        const response = await loginAPI(reqBody);

        if (response?.success) {
          localStorage.setItem("token", response?.data?.token);
          dispatch(
            login({
              user: response?.data?.user,
              token: response?.data?.token,
            }),
          );
          toast.success(response?.message);
          action.resetForm();

          handleClose();
          mainHandleClose();
        } else {
          toast.error(response?.message);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Something went wrong");
        }
      } finally {
        setIsLoader(false);
      }
    },
  });

  useEffect(() => {
    const isEmail = isValidEmail(formik.values.userName);
    if (isEmail) {
      setIsPhone(false);
    } else {
      setIsPhone(true);
    }
  }, [formik.values.userName]);

  const handleCloseAll = () => {
    handleClose();
    mainHandleClose();
  };

  return (
    <ModalSignup isOpen={isOpen} onClose={handleCloseAll}>
      <div className=" flex flex-col pb-5 gap-6">
        {/* Icon */}
        <div
          onClick={goBack}
          className="mx-auto bg-white dark:bg-black/50  shadow-md rounded-2xl p-3 w-14 h-14 flex items-center justify-center"
        >
          <ArrowLeftIcon
            className="text-black dark:text-white cursor-pointer hover:text-[#8160ee]"
            size={28}
          />
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-center text-2xl  font-semibold text-gray-900 dark:text-white">
            Sign {isLogin ? "in" : "up"} with email or Phone
          </h1>
          <p className="text-center mx-auto  text-gray-500 dark:text-gray-300 w-2/3 text-sm -mt-3">
            Make a new doc to bring your words, data, and teams together.
          </p>
        </div>
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
          <CustomInput
            placeholder="Email Or Phone"
            name="userName"
            value={formik.values.userName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.userName ? formik.errors.userName : ""}
            startIcon={<MdEmail className="text-gray-400" size={20} />}
          />

          {/* Password */}
          <CustomInput
            type={show ? "text" : "password"}
            placeholder="Password"
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            autoComplete="new-password"
            onBlur={formik.handleBlur}
            error={formik.touched.password ? formik.errors.password : ""}
            startIcon={<TbLockFilled className="text-gray-400" size={20} />}
            endIcon={
              show ? (
                <FaRegEye
                  size={20}
                  className="text-gray-500 cursor-pointer"
                  onClick={() => setShow(false)}
                />
              ) : (
                <FaRegEyeSlash
                  size={20}
                  className="text-gray-500 cursor-pointer"
                  onClick={() => setShow(true)}
                />
              )
            }
          />
          <div className="text-end text-sm text-gray-500 cursor-pointer hover:text-[#8160ee]">
            Forgot password?
          </div>
          <button
            type="submit"
            className="w-full py-3 flex items-center justify-center rounded-xl text-lg font-semibold text-white shadow-lg 
    bg-gradient-to-r from-[#7c5cff] to-[#00d4ff] hover:opacity-90 transition-all duration-300"
          >
            {isLoader ? (
              <CircularProgress size={24} className="!text-white" />
            ) : (
              `Sign in`
            )}
          </button>
        </form>
      </div>
    </ModalSignup>
  );
}
