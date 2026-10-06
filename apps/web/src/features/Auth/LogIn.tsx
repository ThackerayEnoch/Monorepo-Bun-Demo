import { ApiClientError, loginRequestSchema } from "@monorepo-demo/api";
import { useState, useActionState } from "react";
import { useNavigate } from "react-router";

import { authApi } from "./apiClient";
import AuthLayout from "./components/authLayout";
import Divider from "./components/divider";
import FormInput from "./components/formInput";
import SocialButtons from "./components/socialButtons";

type LoginFormState = {
  username: string;
  password: string;
  error: string;
  errorId: number;
};
const initialLoginFormState: LoginFormState = {
  username: "",
  password: "",
  error: "",
  errorId: 0,
};
export default function LogIn(): React.ReactNode {
  const navigate = useNavigate();
  const handleAction = async (
    _prevState: LoginFormState,
    formData: FormData,
  ): Promise<LoginFormState> => {
    const parsed = loginRequestSchema.safeParse({
      username: formData.get("username"),
      password: formData.get("password"),
    });
    if (!parsed.success) {
      return { ...initialLoginFormState, error: parsed.error.message, errorId: Date.now() };
    }
    const { username } = parsed.data;
    const { password } = parsed.data;
    try {
      await authApi.login({
        username,
        password,
      });
      void navigate("/home");
    } catch (error) {
      if (error instanceof ApiClientError) {
        return {
          username,
          password: "",
          error: error.message,
          errorId: Date.now(),
        };
      }
      throw error;
    }
    return {
      username,
      password,
      error: "",
      errorId: 0,
    };
  };
  const [formState, submitAction, isPending] = useActionState(handleAction, initialLoginFormState);
  const [handledErrorId, setHandledErrorId] = useState<number>(0);
  const hasError = formState.errorId !== 0 && handledErrorId !== formState.errorId;
  const clearError = () => setHandledErrorId(formState.errorId);
  return (
    <AuthLayout>
      {/* 1. 图标 + 标题 */}
      <div className="mb-8 flex flex-col items-center text-center">
        <img src="/qntx.svg" alt="QuantX" className="mb-5 h-16 w-16" />
        <h1 className="text-2xl font-bold text-black">Welcome back</h1>
        <p className="mt-1.5 text-sm text-gray-500">Please enter your details to sign in</p>
      </div>

      {/* 2. 表单 */}
      <form action={submitAction} className="flex flex-col gap-4">
        <FormInput
          id="username"
          label="username"
          type="text"
          name="username"
          error={hasError}
          onChange={clearError}
          defaultValue={formState?.username || ""}
        />

        <div className="flex flex-col gap-2">
          <FormInput
            id="password"
            label="Password"
            name="password"
            type="password"
            error={hasError}
            onChange={clearError}
            defaultValue=""
          />
          {hasError && (
            <p role="alert" className="text-xs text-red-500">
              {formState.error}
            </p>
          )}
          {/* 右对齐的忘记密码 */}
          <a href="/forgot-password" className="self-end text-xs text-gray-500 hover:text-black">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-1 w-full rounded-lg bg-black py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          {isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {/* 3. 分割线 */}
      <div className="my-6">
        <Divider text="or continue with" />
      </div>

      {/* 4. 第三方登录 */}
      <SocialButtons />

      {/* 5. 注册提示 */}
      <p className="mt-8 text-center text-sm text-gray-500">
        Not a member?{" "}
        <a href="/signup" className="font-semibold text-black hover:underline">
          Sign up
        </a>
      </p>
    </AuthLayout>
  );
}
