"use client";

import Box from "@/assets/icons/box";
import Cloth from "@/assets/icons/cloth";
import Home from "@/assets/icons/home";
import My from "@/assets/icons/my";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type NavigationBarType = {
  title: string;
  path: string;
  icon: React.FC<{ outline: boolean }>;
};

const BottomNavigation = () => {
  const pathname = usePathname();

  const navigationBarList: NavigationBarType[] = [
    { title: "홈", path: "/", icon: Home },
    { title: "팀, 알뜰 세탁", path: "/team", icon: Box },
    { title: "내 세탁 현황", path: "/status", icon: Cloth },
    { title: "마이페이지", path: "/my", icon: My },
  ];

  return (
    <nav
      style={{
        boxShadow: "0px -2px 6px 0px #878A931A",
      }}
      className="w-full fixed bottom-0 pt-[10px] px-[24px] pb-[34px] rounded-tl-xl rounded-tr-xl"
    >
      <ul className="flex gap-[14px] justify-between">
        {navigationBarList.map((item) => {
          const isCurrentPage = pathname === item.path;

          return (
            <li
              key={item.title}
              className={`${isCurrentPage ? "text-primary-normal" : "text-interaction-inactive"}`}
            >
              <Link href={item.path}>
                <figure className="flex flex-col items-center gap-[4px] w-[75px] font-caption-1 font-semibold">
                  <item.icon outline={!isCurrentPage} />
                  <figcaption>{item.title}</figcaption>
                </figure>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNavigation;
