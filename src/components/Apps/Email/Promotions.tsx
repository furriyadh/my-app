"use client";

import React, { useState, useEffect } from "react";

interface Message {
  id: number;
  sender: string;
  subject: string;
  preview: string;
  timestamp: string;
  starred: boolean;
  read: boolean;
  viewLink: string;
}

const Promotions: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(11);

  // Simulate fetching data from an API
  useEffect(() => {
    const fetchMessages = async () => {
      // Return empty array instead of mock data
      const mockData: Message[] = [];

      setMessages(mockData);
    };

    fetchMessages();
  }, []);

  // Handle bulk selection
  const handleBulkSelect = () => {
    if (selectedMessages.length === messages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(messages.map((msg) => msg.id));
    }
  };

  // Calculate pagination
  const indexOfLastMessage = currentPage * itemsPerPage;
  const indexOfFirstMessage = indexOfLastMessage - itemsPerPage;
  const currentMessages = messages.slice(indexOfFirstMessage, indexOfLastMessage);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(messages.length / itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="text-center py-8">
        <h2 className="text-lg font-semibold text-gray-500">لا توجد رسائل ترويجية</h2>
        <p className="text-gray-400">لم يتم العثور على رسائل في قسم العروض الترويجية</p>
        </div>
      </div>
  );
};

export default Promotions;