"use client";

import { useRouter } from "next/navigation";
import { useState, ChangeEvent } from "react";
import { AxiosError, AxiosResponse } from "axios";
import { axiosApi } from "../../lib/axios";
import styles from "./TextForm.module.scss";
import Button from "@components/common/Button";

type LoginForm = {
  email: string;
  password: string;
};

type Validation = LoginForm & { loginFailed: string };

export function LoginForm() {
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const [Validation, setValidation] = useState<Validation>({
    email: "",
    password: "",
    loginFailed: "",
  });

  const updateLoginForm = (e: ChangeEvent<HTMLInputElement>) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const router = useRouter();

  const login = () => {
    axiosApi.get("/sanctum/csrf-cookie").then((res) => {
      axiosApi
        .post("/login", loginForm)
        .then((res: AxiosResponse) => {
          console.log(res.data);
          router.push("/");
        })
        .catch((err: AxiosError) => {
          console.log(err.response);
        });
    });
  };

  return (
    <>
      <label className={styles.label}>
        <input
          className={styles.input}
          placeholder="メールアドレス"
          type="email"
          name="email"
          value={loginForm.email}
          onChange={updateLoginForm}
        />
      </label>
      <label className={styles.label}>
        <input
          className={styles.input}
          placeholder="パスワード"
          name="password"
          type="password"
          value={loginForm.password}
          onChange={updateLoginForm}
        />
      </label>
      <Button text="サインイン" color="black" onClick={login} />
    </>
  );
}
