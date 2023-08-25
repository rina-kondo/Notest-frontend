"use client";

import { useRouter } from "next/navigation";
import { useState, ChangeEvent } from "react";
import { AxiosError, AxiosResponse } from "axios";
import { axiosApi } from "../../../lib/axios";
import { useUserState } from "../../../atoms/userAtom";
import styles from "./TextForm.module.scss";
import Button from "@components/common/Button";

type LoginForm = {
  email: string;
  password: string;
};

type Validation = {
  email?: string;
  password?: string;
  loginFail?: string;
};

export function LoginForm() {
  const router = useRouter();
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const [validation, setValidation] = useState<Validation>({});
  const { setUser } = useUserState();

  const updateLoginForm = (e: ChangeEvent<HTMLInputElement>) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const login = () => {
    setValidation({});

    axiosApi.get("/sanctum/csrf-cookie").then((res) => {
      axiosApi
        .post("/login", loginForm)
        .then((response: AxiosResponse) => {
          setUser(response.data.data);
          router.push("/");
        })
        .catch((err: AxiosError) => {
          if (err.response?.status === 422) {
            const errors = (err.response?.data as any).errors;
            const validationMessages: { [index: string]: string } =
              {} as Validation;
            Object.keys(errors).map((key: string) => {
              validationMessages[key] = errors[key][0];
            });
            setValidation(validationMessages);
          }
          if (err.response?.status === 500) {
            alert("システムエラーです");
          }
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
      <div className={styles.flash}>
        {validation.email && (
          <p className={styles.flashText}>{validation.email}</p>
        )}
      </div>
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
      <div className={styles.flash}>
        {validation.password && (
          <p className={styles.flashText}>{validation.password}</p>
        )}
      </div>
      <Button text="サインイン" color="black" onClick={login} />
      <div className={styles.flash}>
        {validation.loginFail && (
          <p className={styles.flashText}>{validation.loginFail}</p>
        )}
      </div>
    </>
  );
}
