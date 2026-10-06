import type { InputHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";

type Props = {
  label: string;
  error?: boolean;
  errorMsg?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "placeholder">;

export default function FormInput({
  label,
  id,
  error = false,
  errorMsg,
  className = "",
  ...rest
}: Props): React.ReactNode {
  const { pending } = useFormStatus();

  return (
    <div className="relative">
      <input
        {...rest}
        id={id}
        placeholder=" "
        readOnly={pending || rest.readOnly}
        aria-invalid={error}
        className={`peer w-full rounded-lg border bg-white px-3.5 pt-5 pb-2 text-sm transition outline-none focus:ring-1 ${
          error
            ? "border-red-500 font-bold text-red-600 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 text-gray-900 focus:border-black focus:ring-black"
        } ${className}`}
      />
      <label
        htmlFor={id}
        className={`pointer-events-none absolute top-1.5 left-3.5 origin-left text-xs transition-all duration-150 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-xs ${error ? "text-red-500" : "text-gray-500 peer-focus:text-black"}`}
      >
        {label}
      </label>
      {error && errorMsg !== undefined && errorMsg !== "" && (
        <p role="alert" className="text-xs text-red-500">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
