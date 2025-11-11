import { useState, useEffect, useRef } from "react";
import { UserGroupIcon } from "@heroicons/react/solid";

import { getGroupMessages, sendGroupMessage } from "../../services/ChatService";
import { useChat } from "../../contexts/ChatContext";
import { useAuth } from "../../contexts/AuthContext";

import Message from "./Message";
import ChatForm from "./ChatForm";

export default function GroupChatRoom() {
	const { currentUser } = useAuth();
	const { socket, currentChat } = useChat();
	const [messages, setMessages] = useState([]);
	const [incomingMessage, setIncomingMessage] = useState(null);

	const scrollRef = useRef();

	useEffect(() => {
		const fetchData = async () => {
			const res = await getGroupMessages(currentChat._id);
			setMessages(res);
		};

		fetchData();
	}, [currentChat._id]);

	useEffect(() => {
		scrollRef.current?.scrollIntoView({
			behavior: "smooth",
		});
	}, [messages]);

	useEffect(() => {
		const handleGetGroupMessage = (data) => {
			if (data.groupChatRoomId === currentChat._id) {
				setIncomingMessage({
					sender: data.senderId,
					message: data.message,
					groupChatRoomId: data.groupChatRoomId,
				});
			}
		};

		socket?.on("getGroupMessage", handleGetGroupMessage);

		return () => {
			socket?.off("getGroupMessage", handleGetGroupMessage);
		};
	}, [socket, currentChat._id]);

	useEffect(() => {
		incomingMessage && setMessages((prev) => [...prev, incomingMessage]);
	}, [incomingMessage]);

	const handleFormSubmit = async (message) => {
		socket?.emit("sendGroupMessage", {
			senderId: currentUser._id,
			message: message,
			groupChatRoomId: currentChat._id,
		});

		const messageBody = {
			groupChatRoomId: currentChat._id,
			sender: currentUser._id,
			message: message,
		};
		const res = await sendGroupMessage(messageBody);
		setMessages((prev) => [...prev, res]);
	};

	return (
		<div className="lg:col-span-2 lg:block">
			<div className="w-full">
				{/* Group Header */}
				<div className="p-3 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
					<div className="flex items-center gap-3">
						<div className="relative">
							<img
								className="w-12 h-12 rounded-full"
								src={currentChat.avatar}
								alt={currentChat.name}
							/>
						</div>
						<div className="flex-1">
							<div className="flex items-center gap-2">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
									{currentChat.name}
								</h3>
								<UserGroupIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
							</div>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								{currentChat.members.length} member
								{currentChat.members.length !== 1 ? "s" : ""}
								{currentChat.description &&
									` • ${currentChat.description}`}
							</p>
						</div>
					</div>
				</div>

				{/* Messages */}
				<div className="relative w-full p-6 overflow-y-auto h-[30rem] bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
					<ul className="space-y-2">
						{messages.map((message, index) => (
							<div key={index} ref={scrollRef}>
								<Message
									message={message}
									self={currentUser._id}
									isGroupChat={true}
								/>
							</div>
						))}
					</ul>
				</div>

				{/* Message Input */}
				<ChatForm handleFormSubmit={handleFormSubmit} />
			</div>
		</div>
	);
}
