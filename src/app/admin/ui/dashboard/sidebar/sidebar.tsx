import Image from "next/image";
import MenuLink from "./menuLink/menuLink";
import styles from "./sidebar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTachometerAlt, // Equivalent to MdDashboard
    faUserCircle,    // Equivalent to MdSupervisedUserCircle
    faShoppingBag,   // Equivalent to MdShoppingBag
    faMoneyBillAlt,  // Equivalent to MdAttachMoney
    faBriefcase,     // Equivalent to MdWork
    faChartBar,      // Equivalent to MdAnalytics
    faUsers,         // Equivalent to MdPeople
    faCog,           // Equivalent to MdOutlineSettings
    faQuestionCircle,// Equivalent to MdHelpCenter
    faSignOutAlt,    // Equivalent to MdLogout
    faGlobe,
    faRoute,
    faNewspaper
  } from '@fortawesome/free-solid-svg-icons';
  
// import { auth, signOut } from "@/app/auth";
import { signOut } from "@/lib/auth";
import React, { useEffect } from "react";
import { readUser } from "@/app/admin/lib/data";
import { cookies } from 'next/headers'

const menuItems = [
  {
    title: "Pages",
    list: [
      {
        title: "Dashboard",
        path: "/admin",
        icon: <FontAwesomeIcon icon={faTachometerAlt} size="sm" />,
      },
      {
        title: "Users",
        path: "/admin/users",
        icon: <FontAwesomeIcon icon={faUserCircle} size="sm"  />,
      },
      {
        title: "Articles",
        path: "/admin/articles",
        icon: <FontAwesomeIcon icon={faNewspaper} size="sm" />, // Icon for Articles
      },
      {
        title: "Places",
        path: "/admin/places",
        icon: <FontAwesomeIcon icon={faGlobe} size="sm" />, // Icon for Places
      },
      {
        title: "Tours",
        path: "/admin/tours",
        icon: <FontAwesomeIcon icon={faRoute} size="sm"  />,
      },
      // {
      //   title: "Transactions",
      //   path: "/admin/transactions",
      //   icon: <FontAwesomeIcon icon={faMoneyBillAlt} size="sm"  />,
      // },
    ],
  },
  {
    title: "Analytics",
    list: [
      // {
      //   title: "Revenue",
      //   path: "/dashboard/revenue",
      //   icon: <FontAwesomeIcon icon={faBriefcase} size="sm"  />,
      // },
      {
        title: "Reports",
        path: "/admin/reports",
        icon: <FontAwesomeIcon icon={faChartBar} size="sm"  />,
      },
      // {
      //   title: "Teams",
      //   path: "/dashboard/teams",
      //   icon: <FontAwesomeIcon icon={faUsers} size="sm"  />,
      // },
    ],
  },
  {
    title: "User",
    list: [
      // {
      //   title: "Settings",
      //   path: "/dashboard/settings",
      //   icon: <FontAwesomeIcon icon={faCog} size="sm"  />,
      // },
      // {
      //   title: "Help",
      //   path: "/dashboard/help",
      //   icon: <FontAwesomeIcon icon={faQuestionCircle} size="sm"  />,
      // },
    ],
  },
];

const Sidebar = async () => {
  const cookieStore = cookies()
  const userID = cookieStore.get('userID')?.value || null
  const isAdmin = cookieStore.get('isAdmin')?.value || null
  const user = isAdmin ? await readUser(userID) : ""
  // console.log(user)
  return (
    <div className={styles.container}>
      <div className={styles.user}>
        <Image
          className={styles.userImage}
          src={"/avatar.jpg"}
          alt=""
          width="40"
          height="40"
        />
        <div className={styles.userDetail}>
          <span className={styles.username}>{user.username}</span>
          <span className={styles.userTitle}>Administrator</span>
        </div>
      </div>
      <ul className={styles.list}>
        {menuItems.map((cat) => (
          <li key={cat.title}>
            <span className={styles.cat}>{cat.title}</span>
            {cat.list.map((item) => (
              <MenuLink item={item} key={item.title} />
            ))}
          </li>
        ))}
      </ul>
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button className={styles.logout}>
        <FontAwesomeIcon icon={faSignOutAlt} size="sm"/>
          Logout
        </button>
      </form>
    </div>
  );
};

export default Sidebar;