import type { Page } from "../lib/content";

export function PageView({ page }: { page: Page }) {
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) {
      blocks.push(
        <ul key={"ul-" + blocks.length}>
          {list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
      list = [];
    }
  };
  page.parts.forEach((part, i) => {
    if (part.tag === "li") {
      list.push(part.text);
      return;
    }
    flush();
    if (part.tag === "h1") blocks.push(<h1 key={i}>{part.text}</h1>);
    else if (part.tag === "h2") blocks.push(<h2 key={i}>{part.text}</h2>);
    else if (part.tag === "h3") blocks.push(<h3 key={i}>{part.text}</h3>);
    else blocks.push(<p key={i}>{part.text}</p>);
  });
  flush();
  return (
    <main id="main">
      {blocks}
      {page.form ? (
        <p>
          <a className="btn" href={page.source}>Open the live Teramis form</a>
        </p>
      ) : null}
      <p className="note">
        Source page: <a href={page.source}>{page.source}</a>. This preview does not add claims that are not on that page.
      </p>
    </main>
  );
}
