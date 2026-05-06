import CustomButton from "@/components/common/CustomButton";
import {
  imageUpload,
  postProfileUpdate,
} from "@/components/service/apiService/user";
import {
  UpdateProfilePRops,
  UploadedImage,
  userDetailProps,
} from "@/utils/typesInterface";
import { Backdrop, Box, Fade, Modal } from "@mui/material";
import { useFormik } from "formik";
import { useTheme } from "next-themes";
import NextImage from "next/image";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { MdClose } from "react-icons/md";
import * as Yup from "yup";
import Cropper from "react-easy-crop";
import { delay } from "@/utils/Content";

const userUpdateSchema = Yup.object().shape({
  userName: Yup.string()
    .required("Name is required")
    .min(4, "Must be at least 4 characters"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  image: Yup.string().required("Profile image is required"),
  description: Yup.string(),
});

type Area = { x: number; y: number; width: number; height: number };

export default function UpdateProfile({
  isOpen,
  handleClose,
  userDetails,
  fetchUserDetails,
}: UpdateProfilePRops) {
  const { theme } = useTheme();
  const [isLoader, setIsLoader] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<UploadedImage[] | null>(
    null,
  );

  // crop states
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [showCrop, setShowCrop] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const users = userDetails?.user as userDetailProps;

  const formik = useFormik({
    initialValues: {
      userName: users?.username || "",
      email: users?.email || "",
      image: uploadedImage?.[0]?.url || users?.image_url || "",
      description: users?.description || "",
    },
    validationSchema: userUpdateSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoader(true);
      try {
        const payload = {
          username: values.userName,
          imageUrl: values.image,
          description: values.description,
        };
        const [response] = await Promise.all([
          postProfileUpdate(payload),
          delay(1000),
        ]);

        if (response?.status) {
          toast.success(response.message);
          fetchUserDetails();
          setUploadedImage(null);
          handleClose();
        } else {
          toast.error(response?.message || "Update failed");
        }
      } catch (error: any) {
        toast.error(error?.message || "Something went wrong");
      } finally {
        setIsLoader(false);
      }
    },
  });

  // set formik image after upload
  useEffect(() => {
    if (uploadedImage?.[0]?.url) {
      formik.setFieldValue("image", uploadedImage[0].url);
    }
  }, [uploadedImage]);

  const chooseImages = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("images", file);

      const response = await imageUpload(formData);
      if (response?.success) {
        setUploadedImage(response?.data);
      } else {
        setUploadedImage(null);
        toast.error(response?.message || "Upload failed");
      }
    } catch (error: any) {
      setUploadedImage(null);
      toast.error(error?.message || "Upload failed");
    }
  };

  // file select → open crop
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCropImage(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setShowCrop(true);
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  };

  const removeImage = () => {
    setUploadedImage(null);
    formik.setFieldValue("image", "");
  };

  const onCropComplete = (_: any, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const getCroppedBlob = async (
    imageSrc: string,
    cropArea: Area,
  ): Promise<Blob> => {
    const img = document.createElement("img");
    img.src = imageSrc;
    img.crossOrigin = "anonymous";

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Image load failed"));
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context not found");

    canvas.width = Math.round(cropArea.width);
    canvas.height = Math.round(cropArea.height);

    ctx.drawImage(
      img,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
      0,
      0,
      cropArea.width,
      cropArea.height,
    );

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Crop failed"));
          resolve(blob);
        },
        "image/jpeg",
        0.95,
      );
    });
  };

  const handleCropSave = async () => {
    try {
      if (!cropImage || !croppedAreaPixels) {
        toast.error("Please crop the image");
        return;
      }

      const blob = await getCroppedBlob(cropImage, croppedAreaPixels);
      const croppedFile = new File([blob], "profile.jpg", {
        type: "image/jpeg",
      });

      setShowCrop(false);

      await chooseImages(croppedFile);
    } catch (e: any) {
      toast.error(e?.message || "Crop failed");
    }
  };

  const closeCropModal = () => {
    setShowCrop(false);
    setCropImage(null);
    setCroppedAreaPixels(null);
  };

  const handleCloseModal = () => {
    formik.resetForm();
    handleClose();
  };

  const changeUserName = (name: string) => {
    const noSpaceName = name.replace(/\s+/g, "");
    formik.setFieldValue("userName", noSpaceName);
  };

  return (
    <>
      {/* MAIN MODAL */}
      <Modal
        open={isOpen}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 300,

          sx: {
            backdropFilter: "blur(10px)",

            backgroundColor:
              theme === "dark"
                ? "rgba(15, 23, 42, 0.7)"
                : "rgba(255,255,255,0.7)",
          },
        }}
      >
        <Fade in={isOpen}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
            className="dark:bg-[#1D293D] w-full mr-4  max-w-[380px] lg:max-w-[520px] rounded-2xl p-6 lg:p-8 shadow-xl outline-none dark:border-gray-600 border border-gray-300"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center sm:mb-6">
              <h2 className="text-xl font-semibold dark:text-white text-center text-gray-900">
                Update Profile
              </h2>
              <button
                onClick={handleCloseModal}
                className="dark:text-gray-300 text-gray-600 text-xl cursor-pointer hover:text-[#c7ac77]"
              >
                <MdClose size={18} />
              </button>
            </div>

            <form
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-5"
            >
              {/* IMAGE PICKER */}
              <div>
                <div className="mt-2">
                  <div className="relative">
                    <label
                      className="relative flex items-center justify-center w-32 h-32 rounded-full border-2 border-dashed cursor-pointer border-gray-300 dark:border-gray-600 hover:border-blue-500 transition mx-auto"
                      // onClick={() => fileInputRef.current?.click()}
                    >
                      {formik.values.image ? (
                        <NextImage
                          src={formik.values.image}
                          alt="Preview"
                          fill
                          className="object-cover rounded-full"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <span className="text-2xl">📷</span>
                          <span className="text-sm">Click to upload</span>
                        </div>
                      )}

                      <input
                        // ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => {
                          handleFileChange(e);
                          formik.setFieldTouched("image", true);
                        }}
                      />
                    </label>

                    {formik.values.image && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage();
                        }}
                        className="absolute  left-[58%] top-2 z-50 w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 text-red-500 hover:bg-black cursor-pointer"
                      >
                        <MdClose size={14} />
                      </button>
                    )}
                  </div>
                  {formik.touched.image && formik.errors.image && (
                    <p className="text-red-500 text-xs mt-1 text-center">
                      {formik.errors.image}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium dark:text-gray-300 text-gray-800 ">
                  User Name
                </label>
                <input
                  type="text"
                  name="userName"
                  value={formik.values.userName}
                  onChange={(e) => changeUserName(e.target.value)}
                  onBlur={formik.handleBlur}
                  className="w-full mt-1 px-4 py-3 rounded-xl border 
                border-gray-300 dark:border-gray-600 bg-transparent  text-gray-700
                dark:text-white dark:border-gray-300 border-gray-300 focus:outline-none placeholder:text-gray-700  dark:placeholder:text-gray-600  focus:ring-1"
                  placeholder="Enter your name"
                />
                {formik.touched.userName && formik.errors.userName && (
                  <p className="text-red-500 text-xs">
                    {formik.errors.userName as string}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium dark:text-gray-300 text-gray-800">
                  Email
                </label>
                <input
                  type="email"
                  disabled
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="
              w-full mt-1 px-4 py-3 rounded-xl border
              border-gray-300 dark:border-gray-600
              bg-transparent text-gray-700/40 dark:text-white/40

              focus:outline-none
              focus:ring-2 focus:ring-blue-500

              placeholder:text-gray-700
              dark:placeholder:text-gray-600

             
              focus:placeholder:blur-0

              transition-all duration-200 
            "
                  placeholder="Enter your email"
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-red-500 text-xs">
                    {formik.errors.email as string}
                  </p>
                )}
              </div>
              <div className="w-full">
                <label className="text-sm font-medium dark:text-gray-300 text-gray-800">
                  Bio
                </label>
                <textarea
                  id="description"
                  value={formik.values.description}
                  onChange={(e) =>
                    formik.setFieldValue("description", e.target.value)
                  }
                  className="w-full mt-1 px-4 py-3 rounded-xl border 
                border-gray-300 dark:border-gray-600 bg-transparent  text-gray-700
                dark:text-white dark:border-gray-300 border-gray-300 focus:outline-none placeholder:!text-gray-700  dark:placeholder:!text-gray-600  focus:ring-1"
                  placeholder="Enter"
                />
              </div>

              <CustomButton
                type="submit"
                label="Update Profile"
                loading={isLoader}
              />
            </form>
          </Box>
        </Fade>
      </Modal>

      <Modal open={showCrop} onClose={closeCropModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: 320, sm: 420 },
            height: 520,
            bgcolor: "#0b1220",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: 24,
          }}
        >
          <div style={{ position: "relative", width: "100%", height: 360 }}>
            <Cropper
              image={cropImage || ""}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              minZoom={1}
              maxZoom={4}
            />
          </div>

          {/* ZOOM SLIDER */}
          <div className="px-4 pt-3">
            <label className="text-white/80 text-xs block mb-1">Zoom</label>
            <input
              type="range"
              min={1}
              max={4}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex justify-between gap-3 px-4 pb-4 pt-4">
            <button
              onClick={closeCropModal}
              className="w-1/2 px-4 py-2 rounded-xl bg-white/10 text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleCropSave}
              className="w-1/2 px-4 py-2 rounded-xl bg-blue-600 text-white"
            >
              Crop & Save
            </button>
            {/* <CustomButton
              type="submit"
              label="Crop & Save"
              onClick={handleCropSave}
              // loading={isLoader}
            /> */}
          </div>
        </Box>
      </Modal>
    </>
  );
}
