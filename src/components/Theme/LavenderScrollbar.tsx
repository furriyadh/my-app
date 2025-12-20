"use client";

import React from 'react';

const LavenderScrollbar = () => {
  return (
    <style jsx global>{`
      ::-webkit-scrollbar {
        width: 10px;
      }
      ::-webkit-scrollbar-track {
        background: #000000; 
      }
      ::-webkit-scrollbar-thumb {
        background: #6366F1; 
        border-radius: 5px;
        border: 2px solid #000000;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #4F46E5; 
      }
    `}</style>
  );
};

export default LavenderScrollbar;
