import { useState, useEffect, useRef } from "react";

import { getMessagesOfChatRoom, sendMessage } from "../../services/ChatService";
import { useChat } from "../../contexts/ChatContext";
import { useAuth } from "../../contexts/AuthContext";

import Message from "./Message";
import Contact from "./Contact";
import ChatForm from "./ChatForm";

export default function ChatRoom() {
	const { currentUser } = useAuth();
	const { socket, currentChat } = useChat();
	const [messages, setMessages] = useState([]);
	const [incomingMessage, setIncomingMessage] = useState(null);

	const scrollRef = useRef();

	useEffect(() => {
		const fetchData = async () => {
			const res = await getMessagesOfChatRoom(currentChat.id);
			setMessages(res);
		};

		fetchData();
	}, [currentChat.id]);

	useEffect(() => {
		scrollRef.current?.scrollIntoView({
			behavior: "smooth",
		});
	}, [messages]);

	useEffect(() => {
		const handleGetMessage = (data) => {
			if (data.chatRoomId === currentChat.id) {
				setIncomingMessage({
					sender: data.senderId,
					message: data.message,
				});
			}
		};

		socket?.on("getMessage", handleGetMessage);

		return () => {
			socket?.off("getMessage", handleGetMessage);
		};
	}, [socket, currentChat.id]);

	useEffect(() => {
		incomingMessage && setMessages((prev) => [...prev, incomingMessage]);
	}, [incomingMessage]);

	const handleFormSubmit = async (message) => {
		const receiverId = currentChat.members.find(
			(member) => member.id !== currentUser.id
		);

		socket?.emit("sendMessage", {
			senderId: currentUser.id,
			receiverId: receiverId.id,
			message: message,
			chatRoomId: currentChat.id,
		});

		const messageBody = {
			chatRoomId: currentChat.id,
			sender: currentUser.id,
			message: message,
		};
		const res = await sendMessage(messageBody);
		setMessages((prev) => [...prev, res]);
	};

	return (
		<div className="lg:col-span-2 lg:block">
			<div className="w-full">
				<div className="p-3 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
					<Contact chatRoom={currentChat} currentUser={currentUser} />
				</div>

				<div className="relative w-full p-6 overflow-y-auto h-[30rem] bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
					<ul className="space-y-2">
						{messages.map((message, index) => (
							<div key={index} ref={scrollRef}>
								<Message
									message={message}
									self={currentUser.id}
								/>
							</div>
						))}
					</ul>
				</div>

				<ChatForm handleFormSubmit={handleFormSubmit} />
			</div>
		</div>
	);
}
