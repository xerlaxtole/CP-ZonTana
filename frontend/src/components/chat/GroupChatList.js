import { useState, useEffect } from "react";
import { UserGroupIcon, PlusIcon } from "@heroicons/react/solid";
import { joinGroupChatRoom } from "../../services/ChatService";
import { useChat } from "../../contexts/ChatContext";
import { useAuth } from "../../contexts/AuthContext";

function classNames(...classes) {
	return classes.filter(Boolean).join(" ");
}

export default function GroupChatList({ changeChat, onCreateGroupClick }) {
	const { currentUser } = useAuth();
	const { allGroups, myGroups, refreshGroups } = useChat();
	const [selectedChat, setSelectedChat] = useState();
	const [availableGroups, setAvailableGroups] = useState([]);

	useEffect(() => {
		// Filter out groups the user is already a member of
		const myGroupIds = myGroups.map((group) => group.id);
		const available = allGroups.filter(
			(group) => !myGroupIds.includes(group.id)
		);
		setAvailableGroups(available);
	}, [allGroups, myGroups]);

	const changeCurrentChat = (index, chat) => {
		setSelectedChat(index);
		changeChat(chat);
	};

	const handleJoinGroup = async (group) => {
		try {
			await joinGroupChatRoom(group.id, currentUser.id);
			// Refresh groups to update the lists
			await refreshGroups();
			// Automatically switch to the newly joined group
			changeChat(group);
		} catch (error) {
			console.error("Failed to join group:", error);
		}
	};

	return (
		<>
			<div className="overflow-auto h-[30rem]">
				{/* My Groups Section */}
				<div className="flex items-center justify-between my-2 ml-2 mr-2">
					<h2 className="text-gray-900 dark:text-white font-semibold">
						My Groups
					</h2>
					<button
						onClick={onCreateGroupClick}
						className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
						title="Create new group"
					>
						<PlusIcon className="w-4 h-4" />
						Create
					</button>
				</div>
				<ul>
					{myGroups.length === 0 ? (
						<li className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
							You haven't joined any groups yet
						</li>
					) : (
						myGroups.map((group, index) => (
							<li
								key={group.id}
								className={classNames(
									index === selectedChat
										? "bg-gray-100 dark:bg-gray-700"
										: "transition duration-150 ease-in-out cursor-pointer bg-white border-b border-gray-200 hover:bg-gray-100 dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-700",
									"flex items-center px-3 py-2 text-sm"
								)}
								onClick={() => changeCurrentChat(index, group)}
							>
								<div className="flex items-center gap-3 w-full">
									<div className="relative">
										<img
											className="w-10 h-10 rounded-full"
											src={group.avatar}
											alt={group.name}
										/>
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<p className="text-sm font-medium text-gray-900 dark:text-white truncate">
												{group.name}
											</p>
											<UserGroupIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
										</div>
										<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
											{group.members.length} member
											{group.members.length !== 1
												? "s"
												: ""}
										</p>
									</div>
								</div>
							</li>
						))
					)}
				</ul>

				{/* Available Groups Section */}
				<h2 className="my-2 mb-2 ml-2 text-gray-900 dark:text-white font-semibold">
					Available Groups
				</h2>
				<ul>
					{availableGroups.length === 0 ? (
						<li className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
							No available groups to join
						</li>
					) : (
						availableGroups.map((group) => (
							<li
								key={group.id}
								className="flex items-center justify-between px-3 py-2 text-sm bg-white border-b border-gray-200 hover:bg-gray-100 dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-700"
							>
								<div className="flex items-center gap-3 flex-1 min-w-0">
									<div className="relative">
										<img
											className="w-10 h-10 rounded-full"
											src={group.avatar}
											alt={group.name}
										/>
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<p className="text-sm font-medium text-gray-900 dark:text-white truncate">
												{group.name}
											</p>
											<UserGroupIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
										</div>
										<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
											{group.members.length} member
											{group.members.length !== 1
												? "s"
												: ""}
										</p>
									</div>
								</div>
								<button
									onClick={() => handleJoinGroup(group)}
									className="ml-2 px-3 py-1 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex-shrink-0"
								>
									Join
								</button>
							</li>
						))
					)}
				</ul>
			</div>
		</>
	);
}
