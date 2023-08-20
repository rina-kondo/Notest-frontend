import type { NextPage, Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.scss";
import Logo from "@components/common/Logo";
import { LoginForm } from "./TextForm";

export const metadata: Metadata = {
  title: "サインイン | Notest",
};

// type Validation = LoginForm & { loginFailed: string };

const Page: NextPage = () => {
  // const [validation, setValidation] = useState<Validation>({
  //   email: "",
  //   password: "",
  //   loginFailed: "",
  // });

  const handleInputChange = (name: string, value: string) => {
    // ここでnameとvalueを使用して何かを行う
    // 例えば、APIを呼び出してログインを試みるなど
  };

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
