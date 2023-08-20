import styles from "./Button.module.scss";

type ButtonProps = {
  text: string;
  color?: "black";
  onClick?: () => void;
};

export default function Button({ text, color, onClick }: ButtonProps) {
  const colorClass = color ? styles[color] : "";
  return (
    <button className={`${styles.button} ${colorClass}`} onClick={onClick}>
      {text}
    </button>
  );
}
