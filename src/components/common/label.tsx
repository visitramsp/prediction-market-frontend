import React from "react";

interface LabelProps {
  text: string;
}

const Label: React.FC<LabelProps> = ({ text }) => {
  return (
    <div className="text-gray-900 text-[16px] font-semibold mb-1">{text}</div>
  );
};

export default Label;
