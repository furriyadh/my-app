"use client";

import React from "react";

interface AvatarData {
    src: string;
    alt: string;
}

interface AvatarGroupProps {
    avatarData: AvatarData[];
    limit?: number;
    className?: string;
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({ avatarData, limit = 4, className = "" }) => {
    const visibleAvatars = avatarData.slice(0, limit);
    const remainingCount = avatarData.length - limit;

    return (
        <div className={`flex items-center -space-x-4 ${className}`}>
            {visibleAvatars.map((avatar, index) => (
                <div
                    key={index}
                    className="relative z-10 inline-block h-10 w-10 rounded-full ring-2 ring-[#0A0A0A] overflow-hidden bg-gray-800"
                >
                    <img
                        src={avatar.src}
                        alt={avatar.alt}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                            // Fallback to initials or placeholder if image fails
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${avatar.alt}&background=random`;
                        }}
                    />
                </div>
            ))}

            {remainingCount > 0 && (
                <div className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 ring-2 ring-[#0A0A0A]">
                    <span className="text-xs font-medium text-white">+{remainingCount}</span>
                </div>
            )}
        </div>
    );
};

export default AvatarGroup;
