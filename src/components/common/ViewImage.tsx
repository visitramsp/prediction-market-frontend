import { isGifImage } from "@/utils/Content";
import Image from "next/image";
import React from "react";

export default function ViewImage({ imageUrl }) {
  if (!imageUrl) return null;

  const isGif = isGifImage(imageUrl);

  return (
    <div className="mt-2">
      {isGif ? (
        <img
          src={imageUrl}
          alt="post media"
          loading="lazy"
          className="max-w-40 h-auto rounded-lg"
        />
      ) : (
        // ✅ Normal image → optimized
        <Image
          src={imageUrl}
          alt="post media"
          width={300}
          height={300}
          className="max-w-52 h-auto rounded-lg object-contain"
        />
      )}
    </div>
  );
}

// "use client";

// import { isGifImage } from "@/utils/Content";
// import Image from "next/image";
// import React, { useState, useEffect } from "react";

// export default function ViewImage({ imageUrl }) {
//   const [isLoading, setIsLoading] = useState(false);
//   const [isValid, setIsValid] = useState(false);

//   // ✅ Check image exists before showing loader
//   useEffect(() => {
//     if (!imageUrl) return;

//     let img = new window.Image();
//     setIsLoading(true);

//     img.src = imageUrl;

//     img.onload = () => {
//       setIsValid(true);
//       setIsLoading(false);
//     };

//     img.onerror = () => {
//       setIsValid(false);
//       setIsLoading(false);
//     };

//     return () => {
//       img.onload = null;
//       img.onerror = null;
//     };
//   }, [imageUrl]);

//   if (!imageUrl || !isValid) return null;

//   const isGif = isGifImage(imageUrl);

//   return (
//     <div className="relative mt-2 w-fit">
//       {/* ✅ Loader only when loading */}
//       {isLoading && (
//         <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
//           <div className="w-6 h-6 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
//         </div>
//       )}

//       {isGif ? (
//         <img
//           src={imageUrl}
//           alt="post media"
//           loading="lazy"
//           className={`max-w-40 h-auto rounded-lg transition-opacity duration-300 ${
//             isLoading ? "opacity-0" : "opacity-100"
//           }`}
//         />
//       ) : (
//         <Image
//           src={imageUrl}
//           alt="post media"
//           width={300}
//           height={300}
//           priority={false} // ⚡ faster page performance
//           className={`max-w-52 h-auto rounded-lg object-contain transition-opacity duration-300 ${
//             isLoading ? "opacity-0" : "opacity-100"
//           }`}
//         />
//       )}
//     </div>
//   );
// }
