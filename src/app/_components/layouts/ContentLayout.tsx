// import React from 'react';
import FooterLayout from './Footer';
import HeaderLayout from './Header';
import styles from './Content.module.scss';

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className={styles.main}>
      <HeaderLayout />
      <div className={styles.contents}>{children}</div>
      <FooterLayout />
    </main>
  );
}
