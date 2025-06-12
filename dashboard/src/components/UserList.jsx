import useChatSupportStore from "../store/useChatSupportStore";
export default function UserList({ users, selectedUser, onSelect }) {
  const { unseen } = useChatStore();

  return (
    <div className="w-1/3 border-r bg-white">
      <h2 className="text-lg font-semibold p-3 border-b">Users</h2>
      {users.map((userId) => (
        <div
          key={userId}
          onClick={() => onSelect(userId)}
          className={`p-3 cursor-pointer flex justify-between items-center ${
            selectedUser === userId ? "bg-blue-100" : "hover:bg-gray-100"
          }`}
        >
          <span>{userId}</span>
          {unseen[userId] > 0 && (
            <span className="w-2 h-2 bg-red-500 rounded-full" />
          )}
        </div>
      ))}
    </div>
  );
}
