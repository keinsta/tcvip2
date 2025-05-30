export default function ChatMessage({ msg }) {
  return (
    <div
      className={`my-2 flex ${
        msg.sender === "user" ? "justify-start" : "justify-end"
      }`}
    >
      <div
        className={`p-2 rounded-lg max-w-xs ${
          msg.sender === "user" ? "bg-gray-200" : "bg-blue-500 text-white"
        }`}
      >
        <p>{msg.message}</p>
        {msg.fileUrl && (
          <a
            href={`http://localhost:4000${msg.fileUrl}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm underline"
          >
            📎 File
          </a>
        )}
      </div>
    </div>
  );
}
