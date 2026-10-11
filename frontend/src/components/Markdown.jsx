import ReactMarkdown from "react-markdown";

export default function Markdown({ children }) {
  return (
    <div className="md">
      <ReactMarkdown>{children || ""}</ReactMarkdown>
    </div>
  );
}
