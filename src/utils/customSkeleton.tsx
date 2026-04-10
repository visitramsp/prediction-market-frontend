import {
  Box,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

export const PostSkeleton = ({ count = 3 }) => {
  return Array.from({ length: count }).map((_, index) => (
    <div
      key={index}
      className={`md:flex ${
        index > 0 && "pt-4 border-t border-gray-800"
      } border-gray-300 pb-2 items-start gap-4 w-full md:px-4 px-0 animate-pulse`}
    >
      <div>
        <div className="w-[70px] h-[70px] rounded-md bg-gray-300 dark:bg-gray-700 mt-1" />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-600 rounded" />
        </div>

        {/* Text lines */}
        <div className="mt-3 space-y-2">
          <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="h-4 w-[90%] bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="h-4 w-[70%] bg-gray-300 dark:bg-gray-700 rounded" />
        </div>

        {/* Image placeholder */}
        <div className="mt-4 w-[500px] max-w-full h-[280px] bg-gray-300 dark:bg-gray-700 rounded-md" />

        {/* Actions */}
        <div className="mt-4 flex gap-6">
          <div className="h-6 w-6 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="h-6 w-6 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="h-6 w-6 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="h-6 w-6 bg-gray-300 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  ));
};

export const CreatePostSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="flex items-start gap-4 w-full px-4 mt-4">
        {/* Avatar */}
        <div className="w-[60px] h-[60px] rounded-full bg-gray-300 dark:bg-gray-700 mt-1" />

        <div className="flex-1">
          <div className="h-24 w-full bg-gray-300 dark:bg-gray-700 rounded-md" />
        </div>
      </div>

      {/* Bottom: Image name + Actions */}
      <div className="flex flex-row pl-7 justify-between items-center mt-3">
        {/* Selected image name */}
        <div className="text-xs gap-4 items-center flex flex-row">
          <div className="h-3 w-32 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="h-5 w-5 bg-gray-300 dark:bg-gray-700 rounded" />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mr-7 items-center">
          {/* Image upload button */}
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-md" />

          {/* Post button */}
          <div className="h-9 w-16 bg-gray-300 dark:bg-gray-700 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export const CategorySkeleton = ({ count = 7 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <li key={index}>
          <div className="flex items-center font-semibold">
            <Skeleton
              variant="text"
              className=" !bg-gray-300 dark:!bg-gray-700 "
              width={120}
              height={45}
            />
          </div>
        </li>
      ))}
    </>
  );
};

export const UserProfileSkeleton = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <div className="flex justify-center w-full px-2">
      <div
        className="
          w-full rounded-2xl p-5
          bg-white/80 dark:bg-[#1D293D]
          backdrop-blur-xl
          border border-gray-200/60 dark:border-white/10
        "
      >
        {/* HEADER */}
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="absolute inset-0 rounded-xl  blur-md opacity-30" />
              <Skeleton
                variant="rounded"
                width={80}
                height={80}
                sx={{
                  bgcolor: isDark
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(0,0,0,0.08)",
                  borderRadius: "12px",
                }}
              />
            </div>

            {/* User Info */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Skeleton
                  width={120}
                  height={16}
                  sx={{
                    bgcolor: isDark
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(0,0,0,0.1)",
                  }}
                />
                <Skeleton
                  width={40}
                  height={14}
                  sx={{
                    bgcolor: isDark
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(0,0,0,0.1)",
                    borderRadius: "999px",
                  }}
                />
              </div>

              <Skeleton
                width={90}
                height={14}
                sx={{
                  bgcolor: isDark
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(0,0,0,0.08)",
                }}
              />

              <div className="flex gap-5 mt-1">
                <Skeleton width={80} height={14} />
                <Skeleton width={100} height={14} />
              </div>
            </div>
          </div>

          {/* Follow Button */}
          <Skeleton
            variant="rounded"
            width={96}
            height={36}
            sx={{
              bgcolor: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)",
              borderRadius: "999px",
            }}
          />
        </div>

        {/* BIO / CONTENT */}
        <div className="mt-4 space-y-2">
          <Skeleton height={20} width="100%" />
          <Skeleton height={20} width="92%" />
          <Skeleton height={20} width="75%" />
        </div>

        {/* FOOTER */}
        <div className="mt-4 flex justify-between items-center">
          <Skeleton width={40} height={16} />
          <Skeleton width={50} height={16} />
        </div>
      </div>
    </div>
  );
};

export function CommentListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Box>
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            gap: 2,
            py: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Skeleton
            variant="circular"
            width={40}
            height={40}
            animation="wave"
          />

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Skeleton width={80} height={14} />
              <Skeleton width={50} height={12} />
            </Box>
            <Skeleton variant="text" height={14} sx={{ mt: 1, width: "90%" }} />
            <Skeleton variant="text" height={14} sx={{ width: "75%" }} />
            <Box sx={{ display: "flex", gap: 3, mt: 1 }}>
              <Skeleton width={30} height={12} />
              <Skeleton width={40} height={12} />
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export const NotificationSkeleton = () => {
  return (
    <Box px={2} py={1.5} borderBottom="1px solid" borderColor="divider">
      <Box display="flex" alignItems="flex-start" gap={1.5}>
        {/* Indicator dot */}
        <Skeleton
          variant="circular"
          className="dark:!bg-gray-400"
          width={8}
          height={8}
          sx={{ mt: "6px" }}
        />

        {/* Content */}
        <Box flex={1}>
          {/* Title */}
          <Skeleton
            className="dark:!bg-gray-400"
            variant="text"
            width="25%"
            height={18}
          />

          {/* Message */}
          <Skeleton
            className="dark:!bg-gray-400"
            variant="text"
            width="80%"
            height={14}
          />

          {/* Time */}
          <Skeleton
            className="dark:!bg-gray-400"
            variant="text"
            width="30%"
            height={12}
            sx={{ mt: 0.5 }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export const SearchResultsSkeleton = () => {
  const theme = useTheme();

  const isDark = theme.palette.mode === "dark";

  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";

  return (
    <>
      <Box sx={{ mb: 5 }}>
        <Stack spacing={1.5}>
          {Array.from({ length: 8 }).map((_, i) => (
            <ListItem
              key={i}
              sx={{
                py: 1.2,
                px: 2.5,
                borderRadius: 3,
                bgcolor: cardBg,
                backdropFilter: "blur(6px)",
              }}
              className="border border-gray-200 dark:border-gray-700 "
            >
              <ListItemAvatar>
                <Skeleton
                  variant="circular"
                  width={40}
                  height={40}
                  animation="wave"
                  className="!bg-gray-200 dark:!bg-gray-700"
                />
              </ListItemAvatar>

              <ListItemText
                primary={
                  <Skeleton
                    variant="text"
                    width="65%"
                    height={22}
                    animation="wave"
                    className="!bg-gray-200 dark:!bg-gray-700"
                  />
                }
                secondary={
                  <Skeleton
                    variant="text"
                    width="45%"
                    height={16}
                    animation="wave"
                    className="!bg-gray-200 dark:!bg-gray-700"
                  />
                }
              />
            </ListItem>
          ))}
        </Stack>
      </Box>
    </>
  );
};

export const PostLoaderSkeleton = () => {
  return (
    <div className="divide-y divide-gray-200 border-t dark:border-gray-700 border-gray-200 dark:divide-gray-700">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="w-full px-4 py-5 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700"></div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-24 rounded bg-gray-300 dark:bg-gray-700"></div>
                <div className="h-3 w-10 rounded bg-gray-200 dark:bg-gray-600"></div>
              </div>
              <div className="h-8 w-full rounded bg-gray-300 dark:bg-gray-700 mb-4"></div>
              <div className="flex items-center gap-6">
                <div className="h-4 w-6 rounded bg-gray-200 dark:bg-gray-600"></div>
                <div className="h-4 w-6 rounded bg-gray-200 dark:bg-gray-600"></div>
                <div className="h-4 w-6 rounded bg-gray-200 dark:bg-gray-600"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
