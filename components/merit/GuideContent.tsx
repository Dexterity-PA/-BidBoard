import Link from "next/link";
import { inlineParts } from "@/lib/merit/blog";
import type { GuideSection } from "@/lib/merit/blog-types";

export function GuideInline({ text }: { text: string }) {
  return inlineParts(text).map((part, index) => part.href
    ? part.href.startsWith("/resources/")
      ? <a key={index} href={part.href} download className="m-guide-link">{part.text}</a>
      : part.href.startsWith("/")
      ? <Link key={index} href={part.href} className="m-guide-link">{part.text}</Link>
      : <a key={index} href={part.href} className="m-guide-link">{part.text}</a>
    : part.text);
}

export function GuideSectionContent({ section }: { section: GuideSection }) {
  return (
    <section id={section.id} className="m-guide-section" aria-labelledby={`${section.id}-title`}>
      <h2 id={`${section.id}-title`} className="m-guide-h2">{section.title}</h2>
      {section.paragraphs?.map((paragraph, index) => <p key={index} className="m-guide-p"><GuideInline text={paragraph} /></p>)}
      {section.list && <ul className="m-guide-list">{section.list.map((item) => <li key={item}><GuideInline text={item} /></li>)}</ul>}
      {section.table && <><p className="m-guide-table-hint" id={`${section.id}-table-help`}>On a smaller screen, scroll the table sideways to see every column.</p><div className="m-guide-table-wrap" tabIndex={0} role="region" aria-label={`${section.title}: comparison table`} aria-describedby={`${section.id}-table-help`}>
        <table className="m-guide-table">
          <caption className="sr-only">{section.title}</caption>
          <thead><tr>{section.table.headers.map((header) => <th key={header} scope="col">{header}</th>)}</tr></thead>
          <tbody>{section.table.rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => cellIndex === 0
            ? <th key={cellIndex} scope="row"><GuideInline text={cell} /></th>
            : <td key={cellIndex}><GuideInline text={cell} /></td>)}</tr>)}</tbody>
        </table>
      </div></>}
      {section.paragraphsAfter?.map((paragraph, index) => <p key={index} className="m-guide-p"><GuideInline text={paragraph} /></p>)}
    </section>
  );
}
