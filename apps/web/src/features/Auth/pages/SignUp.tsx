import { ApiClientError, registerRequestSchema } from "@monorepo-demo/api";
import { useState, useActionState } from "react";
import { useNavigate } from "react-router";
import { z } from "zod";

import { authApi } from "../apiClient";
import AuthLayout from "../components/authLayout";
import Divider from "../components/divider";
import FormInput from "../components/formInput";
import SocialButtons from "../components/socialButtons";

type SignUpFormState = {
  user: string;
  password: string;
  confirmPassword: string;
  userError: string;
  passwordError: string;
  confirmPasswordError: string;
  formError: string;
  userErrorId: number;
  passwordErrorId: number;
  confirmPasswordErrorId: number;
  formErrorId: number;
};

const initialSignUpFormState: SignUpFormState = {
  user: "",
  password: "",
  confirmPassword: "",
  userError: "",
  passwordError: "",
  confirmPasswordError: "",
  formError: "",
  userErrorId: 0,
  passwordErrorId: 0,
  confirmPasswordErrorId: 0,
  formErrorId: 0,
};

export default function SignUp(): React.ReactNode {
  const navigate = useNavigate();
  const handleAction = async (
    prevState: SignUpFormState,
    formData: FormData,
  ): Promise<SignUpFormState> => {
    const parsed = registerRequestSchema.safeParse({
      user: formData.get("user"),
      password: formData.get("password"),
    });
    const rawConfirmPassword = formData.get("confirmPassword");
    const confirmPassword = typeof rawConfirmPassword === "string" ? rawConfirmPassword : "";

    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      const raw = formData.get("user");
      const user = typeof raw === "string" ? raw : "";
      const userError = fieldErrors.user?.[0] ?? "";
      const passwordError = fieldErrors.password?.[0] ?? "";
      const now = Date.now();

      return {
        ...prevState,
        user,
        password: "",
        confirmPassword: "",
        userError,
        passwordError,
        confirmPasswordError: "",
        userErrorId: userError === "" ? 0 : now,
        passwordErrorId: passwordError === "" ? 0 : now,
        confirmPasswordErrorId: 0,
        formError: "",
        formErrorId: 0,
      };
    }

    if (parsed.data.password !== confirmPassword) {
      return {
        ...prevState,
        user: parsed.data.user,
        password: "",
        confirmPassword: "",
        userError: "",
        passwordError: "",
        confirmPasswordError: "两次输入的密码不一致",
        userErrorId: 0,
        passwordErrorId: 0,
        confirmPasswordErrorId: Date.now(),
        formError: "",
        formErrorId: 0,
      };
    }

    try {
      await authApi.register(parsed.data);
      void navigate("/home");
    } catch (error) {
      if (error instanceof ApiClientError) {
        return {
          ...prevState,
          user: parsed.data.user,
          password: "",
          confirmPassword: "",
          userError: "",
          passwordError: "",
          confirmPasswordError: "",
          userErrorId: 0,
          passwordErrorId: 0,
          confirmPasswordErrorId: 0,
          formError: error.message,
          formErrorId: Date.now(),
        };
      }
      throw error;
    }

    return initialSignUpFormState;
  };

  const [formState, submitAction, isPending] = useActionState(handleAction, initialSignUpFormState);
  const [handledUserErrorId, setHandledUserErrorId] = useState(0);
  const [handledPasswordErrorId, setHandledPasswordErrorId] = useState(0);
  const [handledConfirmPasswordErrorId, setHandledConfirmPasswordErrorId] = useState(0);
  const [handledFormErrorId, setHandledFormErrorId] = useState(0);

  const hasUserError = formState.userErrorId !== 0 && handledUserErrorId !== formState.userErrorId;
  const hasPasswordError =
    formState.passwordErrorId !== 0 && handledPasswordErrorId !== formState.passwordErrorId;
  const hasConfirmPasswordError =
    formState.confirmPasswordErrorId !== 0 &&
    handledConfirmPasswordErrorId !== formState.confirmPasswordErrorId;
  const hasFormError = formState.formErrorId !== 0 && handledFormErrorId !== formState.formErrorId;

  const clearUserError = () => {
    if (hasUserError) {
      setHandledUserErrorId(formState.userErrorId);
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
  const clearConfirmPasswordError = () => {
    if (hasConfirmPasswordError) {
      setHandledConfirmPasswordErrorId(formState.confirmPasswordErrorId);
    }
    if (hasFormError) {
      setHandledFormErrorId(formState.formErrorId);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8 flex flex-col items-center text-center">
        <img src="/qntx.svg" alt="QuantX" className="mb-5 h-16 w-16" />
        <h1 className="text-2xl font-bold text-black">创建账户</h1>
        <p className="mt-1.5 text-sm text-gray-500">请输入您的信息以注册</p>
      </div>

      <form action={submitAction} className="flex flex-col gap-4">
        <FormInput
          id="user"
          label="用户名"
          type="text"
          name="user"
          error={hasUserError}
          onChange={clearUserError}
          defaultValue={formState.user}
          errorMsg={formState.userError}
        />
        <div className="flex flex-col gap-2">
          <FormInput
            id="password"
            label="密码"
            name="password"
            type="password"
            error={hasPasswordError}
            onChange={clearPasswordError}
            defaultValue=""
            errorMsg={formState.passwordError}
          />
          <FormInput
            id="confirmPassword"
            label="确认密码"
            name="confirmPassword"
            type="password"
            error={hasConfirmPasswordError}
            onChange={clearConfirmPasswordError}
            defaultValue=""
            errorMsg={formState.confirmPasswordError}
          />
          {hasFormError && formState.formError && (
            <p role="alert" className="text-xs text-red-500">
              {formState.formError}
            </p>
          )}
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
          {isPending ? "注册中..." : "注册"}
        </button>
      </form>

      <div className="my-6">
        <Divider text="or continue with" />
      </div>

      <SocialButtons />

      <p className="mt-8 text-center text-sm text-gray-500">
        已经有账户？{" "}
        <a href="/login" className="font-semibold text-black hover:underline">
          登录
        </a>
      </p>
    </AuthLayout>
  );
}
