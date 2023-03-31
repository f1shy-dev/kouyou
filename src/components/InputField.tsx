import React from "react";

interface InputFieldProps {
  placeholder?: string;
  id: string;
  label: string;
  type: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  placeholder,
  id,
  label,
  type,
}) => (
  <>
    <label
      htmlFor={id}
      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
    >
      {label}
    </label>
    <input
      type={type || "text"}
      id={id}
      className="border text-sm rounded-lg  block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-purple-500 focus:border-purple-500"
      placeholder={placeholder}
      required
    ></input>
  </>
);
