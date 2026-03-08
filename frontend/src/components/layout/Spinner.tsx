import styles from './Spinner.module.css';

interface Props {
  text?: string;
}

export default function Spinner({ text }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.spinner} />
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
}
