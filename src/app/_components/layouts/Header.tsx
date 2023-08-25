"use client";

import styles from "./Header.module.scss";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AxiosError, AxiosResponse } from "axios";
import { axiosApi } from "../../../lib/axios";

export default function HeaderLayout() {
  const router = useRouter();
  const logout = () => {
    axiosApi.get("/sanctum/csrf-cookie").then((res) => {
      axiosApi
        .post("api/logout")
        .then((response: AxiosResponse) => {
          router.push("/sign-in");
        })
        .catch((err: AxiosError) => {
          if (err.response?.status === 422) {
            const errors = (err.response?.data as any).errors;
          }
          if (err.response?.status === 500) {
            alert("システムエラーです");
          }
        });
    });
  };

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <ul>
          <li>
            <Link className={styles.link} href="/">
              ホーム
            </Link>
          </li>
          <li>
            <button className={styles.link} onClick={logout}>
              ログアウト
            </button>
          </li>
          <li>
            <Link className={styles.link} href="/sign-in">
              サインイン
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
