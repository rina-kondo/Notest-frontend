import styles from './Header.module.scss';
import Link from 'next/link';

export default function HeaderLayout() {
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
            <Link className={styles.link} href="/sign-up">
              新規登録
            </Link>
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
