import Image from "next/image";
import React, { PropsWithChildren } from "react";

const Item = () => {};

type Props = {
  amount?: number;
  avatarList: string[];
  sort?: "asc" | "desc";
};

const Group = ({ avatarList, sort = "desc" }: Props) => {
  return (
    <ul className="relative flex">
      {avatarList.map((avatar, index, list) => (
        <li
          key={index}
          // TODO: tailwind z-index 안 먹음..
          style={{
            zIndex: sort === "desc" ? list.length - index : index + 1,
            marginLeft: index === 0 ? 0 : -8,
          }}
          className={`relative rounded-full overflow-hidden bg-gray-500 border-[1px]`}
        >
          <Image
            src={avatar}
            alt={avatar}
            blurDataURL="/image/empty_avatar.svg"
            width={32}
            height={32}
          />
        </li>
      ))}
    </ul>
  );
};

export const Avatar = {
  Item,
  Group,
};
