import { loginRequestSchema, loginResponseSchema } from "@monorepo-demo/api";
import { useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { z } from "zod";

import { authApi } from "../apiClient";

export default function LoginScreen(): ReactNode {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async () => {
    setUsernameError("");
    setPasswordError("");
    setFormError("");

    const parsed = loginRequestSchema.safeParse({ username, password });
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      setUsernameError(fieldErrors.username?.[0] ?? "");
      setPasswordError(fieldErrors.password?.[0] ?? "");
      return;
    }

    setIsPending(true);
    try {
      const result = await authApi.login(parsed.data);
      if (result.status === "ok") {
        const parsedResult = loginResponseSchema.safeParse(result.data);
        if (!parsedResult.success) {
          setFormError("登录失败，请稍后重试");
          return;
        }
        const token = parsedResult.data.token;
        // TODO 存储Token
        console.log(token);
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "登录失败，请稍后重试");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerClassName="grow justify-center px-6 py-10"
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-sm self-center">
            <View className="mb-8 items-center">
              <View className="mb-5 h-16 w-16 items-center justify-center rounded-2xl bg-black">
                <Text className="text-3xl font-bold text-white">Q</Text>
              </View>
              <Text className="text-2xl font-bold text-black">欢迎回来</Text>
              <Text className="mt-1.5 text-sm text-gray-500">请输入您的信息以登录</Text>
            </View>

            <View className="gap-4">
              <LoginInput
                label="用户名"
                value={username}
                onChangeText={(value) => {
                  setUsername(value);
                  setUsernameError("");
                  setFormError("");
                }}
                error={usernameError}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isPending}
                returnKeyType="next"
              />

              <View>
                <LoginInput
                  label="密码"
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    setPasswordError("");
                    setFormError("");
                  }}
                  error={passwordError}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isPending}
                  returnKeyType="done"
                  onSubmitEditing={() => void handleSubmit()}
                  rightElement={
                    <Pressable
                      accessibilityLabel={isPasswordVisible ? "隐藏密码" : "显示密码"}
                      className="px-1 py-2"
                      disabled={isPending}
                      onPress={() => setIsPasswordVisible((visible) => !visible)}
                    >
                      <Text className="text-xs text-gray-500">
                        {isPasswordVisible ? "隐藏" : "显示"}
                      </Text>
                    </Pressable>
                  }
                />
                {formError ? <Text className="mt-2 text-xs text-red-500">{formError}</Text> : null}
                <Pressable className="mt-2 self-end" disabled={isPending}>
                  <Text className="text-xs text-gray-500">忘记密码？</Text>
                </Pressable>
              </View>

              <Pressable
                accessibilityRole="button"
                className="mt-1 h-11 items-center justify-center rounded-lg bg-black active:bg-gray-800 disabled:opacity-70"
                disabled={isPending}
                onPress={() => void handleSubmit()}
              >
                <Text className="text-sm font-medium text-white">
                  {isPending ? "登录中..." : "登录"}
                </Text>
              </Pressable>
            </View>

            <View className="my-6 flex-row items-center gap-3">
              <View className="h-px flex-1 bg-gray-200" />
              <Text className="text-xs text-gray-400">or continue with</Text>
              <View className="h-px flex-1 bg-gray-200" />
            </View>

            <View className="flex-row gap-3">
              <SocialButton label="Google" icon="G" />
              <SocialButton label="Apple" icon="●" />
              <SocialButton label="GitHub" icon="GH" />
            </View>

            <View className="mt-8 flex-row justify-center">
              <Text className="text-sm text-gray-500">还不是会员？ </Text>
              <Pressable>
                <Text className="text-sm font-semibold text-black">注册</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

type LoginInputProps = {
  label: string;
  value: string;
  error: string;
  rightElement?: ReactNode;
  onChangeText: (value: string) => void;
} & Omit<ComponentProps<typeof TextInput>, "value" | "onChangeText">;

function LoginInput({ label, error, rightElement, ...props }: LoginInputProps): ReactNode {
  return (
    <View>
      <View
        className={`min-h-14 flex-row items-center rounded-lg border bg-white px-3.5 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      >
        <View className="flex-1">
          <Text className={`text-xs ${error ? "text-red-500" : "text-gray-500"}`}>{label}</Text>
          <TextInput
            {...props}
            className={`mt-0.5 p-0 text-sm ${error ? "font-bold text-red-600" : "text-gray-900"}`}
            placeholder=""
          />
        </View>
        {rightElement}
      </View>
      {error ? <Text className="mt-1 text-xs text-red-500">{error}</Text> : null}
    </View>
  );
}

function SocialButton({ label, icon }: { label: string; icon: string }): ReactNode {
  return (
    <Pressable
      accessibilityLabel={`使用${label}登录`}
      className="h-11 flex-1 flex-row items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white active:bg-gray-50"
    >
      <Text className="font-bold text-gray-700">{icon}</Text>
      <Text className="text-sm font-medium text-gray-700">{label}</Text>
    </Pressable>
  );
}
