import CustomInput from "@/components/common/CustomInput";
import { registerAPI } from "@/components/service/auth";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaMapMarkedAlt, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { MdEmail, MdLocationCity } from "react-icons/md";
import { TbLockFilled, TbWorld } from "react-icons/tb";
import * as Yup from "yup";
import CircularProgress from "@mui/material/CircularProgress";
import { ArrowLeftIcon } from "lucide-react";
import CustomAutocomplete from "@/components/common/CustomSelect";
import MapPicker from "@/components/common/MapPicker";
import {
  getCities,
  getCountryList,
  getResponser,
  getStates,
} from "@/components/service/apiService/globalApi";
import { isValidEmail } from "@/utils/Content";
import { useRouter } from "next/navigation";

const RegisterSchema = Yup.object().shape({
  userName: Yup.string()
    .required("Email or Phone is required")
    .min(4, "Must be at least 4 characters"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/,
      "Password must contain uppercase, lowercase, number & special character",
    ),
  country: Yup.string().required("Country is required"),
  state: Yup.string().required("State is required"),
  city: Yup.string().required("City is required"),
  referral: Yup.string().optional(),
});

export default function Register({ ref }: { ref: string }) {
  const [isLoader, setIsLoader] = useState(false);
  const [show, setShow] = useState(false);
  const [latLng, setLatLng] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [isMapOpen, setIsMapOpen] = useState(false);

  const [countryData, setCountryData] = useState<any[]>([]);
  const [statesData, setStatesData] = useState<any[]>([]);
  const [citiesData, setCitiesData] = useState<any[]>([]);
  const router = useRouter();
  const formik = useFormik({
    initialValues: {
      userName: "",
      password: "",
      country: "",
      state: "",
      city: "",
      referral: "",
      latitude: "",
      longitude: "",
      address: "",
      checkRef: false,
    },
    validationSchema: RegisterSchema,
    onSubmit: async (values) => {
      const reqBody = {
        email: values.userName, // or phone based on your logic
        password: values.password,
        ref_id: values.referral,
        countryId: values.country,
        stateId: values.state,
        cityId: values.city,
        lat: values.latitude,
        lng: values.longitude,
      };

      setIsLoader(true);
      try {
        const response = await registerAPI(reqBody);
        if (response?.success) {
          toast.success(response.message);
          formik.resetForm();
        } else {
          toast.error(response?.errors?.[0]?.message || response?.message);
        }
      } catch (error: any) {
        toast.error(error.message || "Something went wrong");
      } finally {
        setIsLoader(false);
      }
    },
  });

  // Detect Email or Phone
  useEffect(() => {
    const isEmail = isValidEmail(formik.values.userName);
    // You can use this if needed
  }, [formik.values.userName]);

  // Fetch Countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await getCountryList();
        const formatted = res.data?.map((item: any) => ({
          label: item.name,
          value: item.id,
        }));
        setCountryData(formatted || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCountries();
  }, []);

  // Fetch States
  useEffect(() => {
    if (!formik.values.country) return;
    const fetchStates = async () => {
      try {
        const res = await getStates(Number(formik.values.country));
        const formatted = res.data?.map((item: any) => ({
          label: item.name,
          value: item.id,
        }));
        setStatesData(formatted || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStates();
  }, [formik.values.country]);

  // Fetch Cities
  useEffect(() => {
    if (!formik.values.state) return;
    const fetchCities = async () => {
      try {
        const res = await getCities(Number(formik.values.state));
        const formatted = res.data?.map((item: any) => ({
          label: item.name,
          value: item.id,
        }));
        setCitiesData(formatted || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCities();
  }, [formik.values.state]);

  // Auto Referral (Example)
  useEffect(() => {
    const fetchResponserData = async () => {
      try {
        const res = await getResponser({ sponsor_id: "USR_1775716915079" });
        if (res?.success) {
          formik.setFieldValue("referral", res.data?.id || "");
          formik.setFieldValue("checkRef", true);
        } else {
          formik.setFieldValue("checkRef", false);
        }
      } catch (err) {}
    };
    fetchResponserData();
  }, []);

  const handleLocationSelect = (data: {
    lat: number;
    lng: number;
    address: string;
  }) => {
    setLatLng({ lat: data.lat, lng: data.lng });

    formik.setFieldValue("latitude", data.lat);
    formik.setFieldValue("longitude", data.lng);
    formik.setFieldValue("address", data.address); // ← Auto set address
  };

  console.log(formik.values, "addressssss");

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Back Button */}
        <div className="flex justify-center mb-6">
          <div
            onClick={() => router.push("/")}
            className="bg-[#1A233D] p-3 rounded-2xl cursor-pointer hover:bg-[#212B45] transition-colors"
          >
            <ArrowLeftIcon className="text-white" size={28} />
          </div>
        </div>

        <div className="bg-[#121A2E] border border-[#1E2A4A] rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">
              Sign up with email or Phone
            </h1>
            <p className="text-slate-400 mt-2 text-[15px]">
              Join the elite. Unlock exclusive experiences.
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Map Location Button */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setIsMapOpen(true)}
                className="w-full py-4 px-5 bg-[#1A233D] hover:bg-[#1F2A4A] border border-[#2A3A5F] rounded-2xl flex items-center justify-center gap-3 text-white font-medium transition-all"
              >
                <FaMapMarkedAlt size={22} className="text-purple-400" />
                Select Your Location on Map
              </button>

              {latLng && (
                <div className="text-emerald-400 text-sm">
                  <span className="text-white ">Selected:</span>{" "}
                  {formik.values.address || ""}
                </div>
              )}
            </div>

            {/* Email/Phone */}
            <CustomInput
              placeholder="Email or Phone"
              name="userName"
              value={formik.values.userName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.userName ? formik.errors.userName : ""}
              startIcon={<MdEmail size={20} className="text-slate-400" />}
              // className="bg-[#1A233D] border border-[#2A3A5F] focus:border-purple-500 text-white placeholder:text-slate-500"
            />

            {/* Password */}
            <CustomInput
              type={show ? "text" : "password"}
              placeholder="Password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password ? formik.errors.password : ""}
              startIcon={<TbLockFilled size={20} className="text-slate-400" />}
              endIcon={
                show ? (
                  <FaRegEye
                    onClick={() => setShow(false)}
                    className="text-slate-400 cursor-pointer"
                  />
                ) : (
                  <FaRegEyeSlash
                    onClick={() => setShow(true)}
                    className="text-slate-400 cursor-pointer"
                  />
                )
              }
              // className="bg-[#1A233D] border border-[#2A3A5F] focus:border-purple-500 text-white placeholder:text-slate-500"
            />

            {/* Location Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomAutocomplete
                title="Country"
                name="country"
                options={countryData}
                value={formik.values.country}
                onChange={(v) => formik.setFieldValue("country", v)}
                error={formik.touched.country ? formik.errors.country : ""}
                startIcons={<TbWorld size={18} className="text-slate-400" />}
                // className="bg-[#1A233D] border border-[#2A3A5F] focus-within:border-purple-500"
              />

              <CustomAutocomplete
                title="State"
                name="state"
                options={statesData}
                value={formik.values.state}
                onChange={(v) => formik.setFieldValue("state", v)}
                error={formik.touched.state ? formik.errors.state : ""}
                startIcons={
                  <FaMapMarkedAlt size={18} className="text-slate-400" />
                }
                // className="bg-[#1A233D] border border-[#2A3A5F] focus-within:border-purple-500"
              />

              <div className="md:col-span-2">
                <CustomAutocomplete
                  title="City"
                  name="city"
                  options={citiesData}
                  value={formik.values.city}
                  onChange={(v) => formik.setFieldValue("city", v)}
                  error={formik.touched.city ? formik.errors.city : ""}
                  startIcons={
                    <MdLocationCity size={18} className="text-slate-400" />
                  }
                  // className="bg-[#1A233D] border border-[#2A3A5F] focus-within:border-purple-500"
                />
              </div>
            </div>

            {/* Referral Code */}
            <CustomInput
              placeholder="Referral Code (Optional)"
              name="referral"
              value={formik.values.referral}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              startIcon={<FiLogOut size={20} className="text-slate-400" />}
              // className="bg-[#1A233D] border border-[#2A3A5F] focus:border-purple-500 text-white placeholder:text-slate-500"
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoader}
              className="w-full py-4 rounded-2xl font-semibold text-lg bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 transition-all active:scale-95 shadow-lg shadow-purple-500/30 disabled:opacity-70"
            >
              {isLoader ? (
                <CircularProgress size={26} className="!text-white" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Map Picker Modal */}
      {isMapOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-lg p-4">
          <div className="bg-[#121A2E] border border-[#1E2A4A] rounded-3xl w-full max-w-3xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-2 border-b border-[#1E2A4A]">
              <h2 className="text-xl font-semibold text-white">
                Choose Location
              </h2>
              <button
                onClick={() => setIsMapOpen(false)}
                className="text-3xl text-slate-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <MapPicker onSelect={handleLocationSelect} height="400px" />
            </div>

            <div className="px-6 pt-2 pb-5 border-t border-[#1E2A4A] flex justify-end">
              <button
                onClick={() => setIsMapOpen(false)}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-2xl transition"
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
