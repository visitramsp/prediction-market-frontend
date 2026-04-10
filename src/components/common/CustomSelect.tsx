"use client";
import React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { InputAdornment } from "@mui/material";
import { SearchIcon } from "lucide-react";

export interface Option {
  label: string;
  value: string | number;
}

interface CustomAutocompleteProps {
  options: Option[];
  title?: string;
  error?: string;
  name?: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
  onBlur?: () => void;
  startIcons;
}

export default function CustomAutocomplete({
  options,
  title,
  error,
  name,
  value,
  onChange,
  onBlur,
  startIcons = "",
}: CustomAutocompleteProps) {
  const selectedOption = options.find((item) => item.value === value) || null;

  return (
    <div className="w-full">
      <Autocomplete
        disablePortal
        options={options}
        value={selectedOption}
        getOptionLabel={(option) => option.label}
        onChange={(_, newValue) => {
          onChange?.(newValue?.value ?? "");
        }}
        onBlur={onBlur}
        slotProps={{
          paper: {
            sx: {
              background: "#111827",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
            },
          },
        }}
        sx={{
          width: "100%",
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            background: "transparent",
            padding: "2px 8px", // 🔥 reduce outer height
            minHeight: "39px", // 🔥 control height
            color: "#fff",
            "& fieldset": {
              borderColor: "#46216d",
            },
            "&:hover fieldset": {
              borderColor: "#9333ea",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#d946ef",
              boxShadow: "0 0 0 1px #d946ef33",
            },
          },
          "& .MuiInputBase-input": {
            color: "#e5e7eb",
            padding: "8px 4px",
          },
          "& .MuiInputBase-input::placeholder": {
            color: "#9ca3af",
            opacity: 1,
          },
          "& .MuiSvgIcon-root": {
            color: "#9ca3af",
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            name={name}
            placeholder={title || ""}
            error={!!error}
            helperText={error}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <InputAdornment position="start">{startIcons}</InputAdornment>
                  {params.InputProps.startAdornment}
                </>
              ),
            }}
          />
        )}
      />
    </div>
  );
}
