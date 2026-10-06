import Link from "next/link";
import type { ReactNode } from "react";
import { headingId, localHref, type Block } from "../lib/content";

const rich = (block: Block) =>
  block.html ? (
    <span
      dangerouslySetInnerHTML={{
        __html: block.html.replace(
          /href="(https:\/\/teramis\.us\/[^\"]+)"/g,
          (_, href) => 'href="' + localHref(href) + '"',
        ),
      }}
    />
  ) : (
    block.text
  );
export function ContentBlocks({
  parts,
  omit = [],
}: {
  parts: Block[];
  omit?: number[];
}) {
  const result: ReactNode[] = [];
  let list: { block: Block; index: number }[] = [];
  function flush() {
    if (list.length)
      result.push(
        <ul key={"list-" + list[0].index}>
          {list.map(({ block, index }) => (
            <li key={index}>{rich(block)}</li>
          ))}
        </ul>,
      );
    list = [];
  }
  parts.forEach((block, index) => {
    if (omit.includes(index) || block.tag === "h1") return;
    if (block.tag === "li") {
      list.push({ block, index });
      return;
    }
    flush();
    const id = headingId(block.text, index);
    if (block.tag === "h2")
      result.push(
        <h2 id={id} key={index}>
          {block.text}
        </h2>,
      );
    else if (block.tag === "h3")
      result.push(
        <h3 id={id} key={index}>
          {block.text}
        </h3>,
      );
    else if (block.tag === "faq")
      result.push(
        <details key={index} id={id} className="faq-item">
          <summary>{block.text}</summary>
          <p>{block.answer}</p>
        </details>,
      );
    else if (block.tag === "link" && block.href)
      result.push(
        <p key={index} className="page-action">
          <Link href={localHref(block.href)} className="text-link">
            {block.text.replace(/\s*[→|]\s*$/, "")}{" "}
            <span aria-hidden="true">↗</span>
          </Link>
        </p>,
      );
    else if (block.tag === "image" && block.src)
      result.push(
        <figure
          className={"article-figure" + (block.imageKind === "logo" ? " article-partner-logo" : "")}
          key={index}
        >
          {block.imageKind === "logo" ? <figcaption className="eyebrow">Partner spotlight</figcaption> : null}
          <img
            src={block.src}
            alt={block.text}
            width={block.width}
            height={block.height}
            loading="lazy"
            decoding="async"
          />
        </figure>,
      );
    else if (block.tag === "quote")
      result.push(<blockquote key={index}>{rich(block)}</blockquote>);
    else if (block.tag === "table" && block.rows?.length)
      result.push(
        <div
          key={index}
          className="article-table"
          tabIndex={0}
          role="region"
          aria-label="Article comparison table"
        >
          <table>
            {block.header ? (
              <thead>
                <tr>
                  {block.rows[0].map((cell, i) => (
                    <th scope="col" key={i}>
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
            ) : null}
            <tbody>
              {block.rows.slice(block.header ? 1 : 0).map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
    else
      result.push(
        <p
          key={index}
          className={
            /^[A-Z0-9 /&—–.,:()]+$/.test(block.text) && block.text.length < 100
              ? "prose-eyebrow"
              : undefined
          }
        >
          {rich(block)}
        </p>,
      );
  });
  flush();
  return <>{result}</>;
}
