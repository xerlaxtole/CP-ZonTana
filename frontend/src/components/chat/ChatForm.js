import { useState, useEffect, useRef } from 'react';

import { PaperAirplaneIcon } from '@heroicons/react/solid';
import { EmojiHappyIcon, PhotographIcon } from '@heroicons/react/outline';
import Picker from 'emoji-picker-react';
import imageCompression from 'browser-image-compression';

export default function ChatForm(props) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef();
  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollIntoView();
  }, [showEmojiPicker]);

  const handleEmojiClick = (event, emojiObject) => {
    let newMessage = message + emojiObject.emoji;
    setMessage(newMessage);
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Validate file type (only .jpeg, .jpg, .png)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert('Only .jpeg, .jpg, and .png formats are allowed');
      e.target.value = null;
      return;
    }

    // Validate file size (max 5MB before compression)
    const maxSizeBeforeCompression = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeBeforeCompression) {
      alert('Image is too large. Maximum size is 5MB');
      e.target.value = null;
      return;
    }

    try {
      setIsCompressing(true);

      // Compression options
      const options = {
        maxSizeMB: 0.7, // 700KB max
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/jpeg',
      };

      // Compress the image
      const compressedFile = await imageCompression(file, options);

      // Convert compressed image to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;
        setSelectedImage(base64Image);

        // Auto-send immediately after compression
        props.handleFormSubmit(message || '', base64Image);
        setMessage('');
        setSelectedImage(null);
        setIsCompressing(false);
        e.target.value = null;
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Image compression failed:', error);
      alert('Failed to compress image. Please try a different image.');
      setIsCompressing(false);
      e.target.value = null;
    }
  };

  const handleImageButtonClick = (e) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (message.trim() || selectedImage) {
      props.handleFormSubmit(message, selectedImage);
      setMessage('');
      setSelectedImage(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e);
    }
  };

  return (
    <div ref={scrollRef} className=" bg-white dark:bg-gray-700 rounded-lg ">
      {showEmojiPicker && <Picker className="dark:bg-gray-900" onEmojiClick={handleEmojiClick} />}
      <form onSubmit={handleFormSubmit}>
        <div className="flex items-center justify-between w-auto max-w-3xl mx-auto p-3 bg-gradient-to-r from-pink-500 via-pink-200 to-pink-300 rounded-full shadow-lg hover:shadow-xl transition-shadow dark:bg-gradient-to-r dark:from-gray-800 dark:via-gray-900 dark:to-pink-900 dark:border-gray-700">
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowEmojiPicker(!showEmojiPicker);
            }}
          >
            <EmojiHappyIcon
              className="h-7 w-7 text-white dark:text-pink-400"
              aria-hidden="true"
            />
          </button>

          <button onClick={handleImageButtonClick} disabled={isCompressing}>
            <PhotographIcon
              className={`h-7 w-7  ${
                isCompressing ? 'text-gray-400' : 'text-white dark:text-pink-400'
              }`}
              aria-hidden="true"
            />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept=".jpeg,.jpg,.png"
            style={{ display: 'none' }}
          />

          <input
            type="text"
            placeholder={isCompressing ? 'Compressing image...' : 'Write a message'}
            className="block w-full py-2 pl-4 mx-3 outline-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ri dark:bg-gray-700 dark:border-gray-ng-pink-500 focus:border-pink-500600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-pink-500 dark:focus:border-pink-500"
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isCompressing}
          />
          <button type="submit">
            <PaperAirplaneIcon
              className="h-6 w-6 text-white dark:text-pink-400 rotate-[90deg]"
              aria-hidden="true"
            />
          </button>
        </div>
      </form>
    </div>
  );
}
