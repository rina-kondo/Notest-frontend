import styles from "./Logo.module.scss";

type LogoProps = {
  size?: "large" | "middle";
};

export default function Logo({ size = "middle" }: LogoProps) {
  return <div className={styles[size]}>Notest</div>;
}
