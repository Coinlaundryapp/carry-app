import { headers } from "next/headers";
import Link from "next/link";
import React from "react";
import Icons from "@/components/Icon/Icons";

type NavigationBarType = {
  title: string;
  path: string;
  icon: keyof typeof Icons;
};

const BottomNavigation = () => {
  const headerList = headers();
  const pathname = headerList.get("x-current-path");

  const navigationBarList: NavigationBarType[] = [
    { title: "홈", path: "/", icon: "Home" },
    { title: "팀, 알뜰 세탁", path: "/team", icon: "Cloth" },
    { title: "내 세탁 현황", path: "/status", icon: "Box" },
    { title: "마이페이지", path: "/my", icon: "My" },
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
          const Icon = Icons[item.icon];
          const isCurrentPage = pathname === item.path;

          return (
            <li
              key={item.title}
              className={`${isCurrentPage ? "text-primary-normal" : "text-interaction-inactive"}`}
            >
              <Link href={item.path}>
                <figure className="flex flex-col items-center gap-[4px] w-[75px] font-caption-1 font-semibold">
                  <Icon className="" outline={!isCurrentPage} />
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
