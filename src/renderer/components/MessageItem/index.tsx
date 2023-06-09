import React, { useState } from 'react';
import './styles.scss';
interface Props {
  role: 'assistant' | 'user';
  children: React.ReactNode;
}

const MessageItem: React.FC<Props> = (props) => {
  const { role, children } = props;
  const roleClass = {
    user: 'user-avatar',
    assistant: 'gpt-avatar',
  };
  return (
    <div className="px-10 mx-16 rounded-lg flex hover:bg-gray cursor-pointer py-20 messageItem">
      <div
        className={` shrink-0 w-28 h-28 mr-16 rounded-full opacity-80 ${roleClass[role]}`}
      />
      <div
        className={`flex items-center overflow-x-hidden ${
          role === 'user' ? 'text-secondary' : 'text-primary'
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default MessageItem;
