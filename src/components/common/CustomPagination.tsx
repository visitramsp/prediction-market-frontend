import React from "react";
import Stack from "@mui/material/Stack";
import Pagination from "@mui/material/Pagination";
import { useTheme } from "next-themes";

type Props = {
  page: number;
  count: number;
  onChange: (event: React.ChangeEvent<unknown>, value: number) => void;
};

export default function CompactPagination({ page, count, onChange }: Props) {
  const { theme } = useTheme();
  const idDark = theme === "dark";

  return (
    <Stack
      spacing={2}
      mt={1}
      alignItems="flex-end"
      sx={{
        overflowX: "auto", // 🔥 horizontal scroll if many pages
        width: "100%",
      }}
    >
      <Pagination
        page={page}
        count={count}
        onChange={onChange}
        variant="outlined"
        shape="rounded"
        sx={{
          "& ul": {
            flexWrap: "nowrap", // 🔥 prevent break
          },

          "& .MuiPaginationItem-root": {
            borderRadius: "10px",
            fontWeight: 700,
            color: idDark ? "#fff" : "#000",
            borderColor: idDark ? "#2e3b55" : "#d1d5db",
            backgroundColor: idDark ? "#233247" : "#fff",
          },

          "& .Mui-selected": {
            backgroundColor: "#8160EE",
            color: idDark ? "#fff" : "#fff",
          },

          "& .MuiPaginationItem-root:hover": {
            backgroundColor: idDark ? "#2a3a52" : "#f3f4f6",
          },
        }}
      />
    </Stack>
  );
}
