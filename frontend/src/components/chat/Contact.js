import { useState, useEffect } from 'react';
import { getUser } from '../../services/ChatService';
import UserLayout from '../layouts/UserLayout';
import { useChat } from '../../contexts/ChatContext';

export default function Contact({ chatRoom }) {
  const { currentUser } = useChat();
  const [contact, setContact] = useState();

  useEffect(() => {
    const contactName = chatRoom.members?.find((memberName) => memberName !== currentUser.username);

    const fetchData = async () => {
      const user = await getUser(contactName);
      setContact(user);
    };

    fetchData();
  }, [chatRoom, currentUser]);

  return <UserLayout user={contact} />;
}
