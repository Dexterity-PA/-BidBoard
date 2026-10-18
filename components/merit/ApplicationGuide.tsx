import { getApplicationGuide } from "@/lib/merit/application-guides";
import styles from "./ApplicationGuide.module.css";

/** Server-rendered and usable without JavaScript. Unsupported IDs render nothing. */
export default function ApplicationGuide({ listingId }: { listingId: string }) {
  const guide = getApplicationGuide(listingId);
  if (!guide) return null;

  const titleId = `application-guide-${listingId}`;
  const date = new Date(`${guide.checkedAt}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });

  return (
    <section className={styles.guide} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>Application guide</h2>
      <p className={styles.introduction}>{guide.introduction}</p>

      <h3 className={styles.subheading}>Requirements and selection</h3>
      <p className={styles.requirementNote}>Summarized from the official instructions linked below.</p>
      <ul className={styles.requirements}>
        {guide.requirements.map((requirement) => (
          <li key={requirement.text}>
            {requirement.text}{" "}
            {requirement.sourceIds.map((id, index) => {
              const source = guide.sources.find((item) => item.id === id);
              if (!source) return null;
              const number = guide.sources.indexOf(source) + 1;
              return (
                <span key={id}>
                  {index > 0 && " "}
                  <a className={styles.citation} href={source.url} target="_blank" rel="noopener noreferrer" aria-label={`Source: ${source.label} (opens in a new tab)`}>[{number}]</a>
                </span>
              );
            })}
          </li>
        ))}
      </ul>

      <h3 className={styles.subheading}>How to prepare</h3>
      <p className={styles.note}>Tips from Meritously, separate from the program&apos;s requirements.</p>
      <ol className={styles.tips}>
        {guide.tips.map((tip) => (
          <li className={styles.tip} key={tip.title}>
            <h4 className={styles.tipTitle}>{tip.title}</h4>
            <p className={styles.tipText}>{tip.text}</p>
          </li>
        ))}
      </ol>

      <details className={styles.sources}>
        <summary className={styles.sourceSummary}>Sources for this guide</summary>
        <ol className={styles.sourceList}>
          {guide.sources.map((source) => (
            <li key={source.id}>
              <a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}<span className={styles.srOnly}> (opens in a new tab)</span></a>
            </li>
          ))}
        </ol>
        <p className={styles.note}>Sources checked <time dateTime={guide.checkedAt}>{date}</time>.</p>
      </details>
    </section>
  );
}
