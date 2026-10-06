import { ApiClientError, loginRequestSchema } from "@monorepo-demo/api";
import { useState, useActionState } from "react";
import { useNavigate } from "react-router";
import { z } from "zod";

import { authApi } from "./apiClient";
import AuthLayout from "./components/authLayout";
import Divider from "./components/divider";
import FormInput from "./components/formInput";
import SocialButtons from "./components/socialButtons";

type LoginFormState = {
  username: string;
  password: string;
  usernameError: string;
  passwordError: string;
  formError: string;
  usernameErrorId: number;
  passwordErrorId: number;
  formErrorId: number;
};
const initialLoginFormState: LoginFormState = {
  username: "",
  password: "",
  usernameError: "",
  passwordError: "",
  formError: "",
  usernameErrorId: 0,
  passwordErrorId: 0,
  formErrorId: 0,
};
export default function LogIn(): React.ReactNode {
  const navigate = useNavigate();
  const handleAction = async (
    prevState: LoginFormState,
    formData: FormData,
  ): Promise<LoginFormState> => {
    const parsed = loginRequestSchema.safeParse({
      username: formData.get("username"),
      password: formData.get("password"),
    });
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      const raw = formData.get("username");
      const username = typeof raw === "string" ? raw : "";
      const usernameError = fieldErrors.username?.[0] ?? "";
      const passwordError = fieldErrors.password?.[0] ?? "";
      const now = Date.now();
      return {
        ...prevState,
        username,
        usernameError,
        passwordError,
        usernameErrorId: usernameError === "" ? 0 : now,
        passwordErrorId: passwordError === "" ? 0 : now,
      };
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
          ...prevState,
          username,
          password: "",
          formError: error.message,
          formErrorId: Date.now(),
        };
      }
      throw error;
    }
    return initialLoginFormState;
  };
  const [formState, submitAction, isPending] = useActionState(handleAction, initialLoginFormState);
  const [handledUsernameErrorId, setHandledUsernameErrorId] = useState<number>(0);
  const [handledPasswordErrorId, setHandledPasswordErrorId] = useState<number>(0);
  const [handledFormErrorId, setHandledFormErrorId] = useState<number>(0);

  const hasUsernameError =
    formState.usernameErrorId !== 0 && handledUsernameErrorId !== formState.usernameErrorId;
  const hasPasswordError =
    formState.passwordErrorId !== 0 && handledPasswordErrorId !== formState.passwordErrorId;
  const hasFormError = formState.formErrorId !== 0 && handledFormErrorId !== formState.formErrorId;

  const clearUsernameError = () => {
    if (hasUsernameError) {
      setHandledUsernameErrorId(formState.usernameErrorId);
    }
    if (hasFormError) {
      setHandledFormErrorId(formState.formErrorId);
    }
  };
  const clearPasswordError = () => {
    if (hasPasswordError) {
      setHandledPasswordErrorId(formState.passwordErrorId);
    }
    if (hasFormError) {
      setHandledFormErrorId(formState.formErrorId);
    }
  };
  return (
    <AuthLayout>
      {/* 1. 图标 + 标题 */}
      <div className="mb-8 flex flex-col items-center text-center">
        <img src="/qntx.svg" alt="QuantX" className="mb-5 h-16 w-16" />
        <h1 className="text-2xl font-bold text-black">欢迎回来</h1>
        <p className="mt-1.5 text-sm text-gray-500">请输入您的信息以登录</p>
      </div>

      {/* 2. 表单 */}
      <form action={submitAction} className="flex flex-col gap-4">
        <FormInput
          id="username"
          label="用户名"
          type="text"
          name="username"
          error={hasUsernameError}
          onChange={clearUsernameError}
          defaultValue={formState?.username || ""}
          errorMsg={formState.usernameError}
        />
        <div className="flex flex-col gap-2">
          <FormInput
            id="password"
            label="密码"
            name="password"
            type="password"
            error={hasPasswordError}
            errorMsg={formState.passwordError}
            onChange={clearPasswordError}
            defaultValue=""
          />
          {hasFormError && formState.formError && (
            <p role="alert" className="text-xs text-red-500">
              {formState.formError}
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
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-black py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending && (
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
            />
          )}
          {isPending ? "登录中..." : "登录"}
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
