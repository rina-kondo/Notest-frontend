import type { NextPage, Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.scss";
import Logo from "@components/common/Logo";
import { LoginForm } from "./TextForm";

export const metadata: Metadata = {
  title: "サインイン | Notest",
};

const Page: NextPage = () => {
  return (
    <div className={styles.authForm}>
      <Logo size="large" />
      <LoginForm />
      <Link className={styles.link} href="/sign-up">
        アカウント登録はこちらから
      </Link>
    </div>
  );
};

export default Page;
