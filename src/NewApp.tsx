import "./style.scss";

import type { MenuProps } from "antd";
import { ConfigProvider, Menu, theme } from "antd";
import { useState } from "react";
import Map from "./Map";

type MenuItem = Required<MenuProps>["items"][number];

function NewApp() {
  const [currentMenu, setCurrentMenu] = useState<string>("map");

  const items: MenuItem[] = [
    {
      label: "Mapa",
      key: "map",
    },
    {
      key: "docs",
      label: "Documentação",
    },
  ];

  const onClickMenu: MenuProps["onClick"] = (e) => {
    setCurrentMenu(e.key);
  };

  const pages = {
    map: <Map />,
  };

  return (
    <div className="app-container">
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
        }}
      >
        <Menu
          onClick={onClickMenu}
          selectedKeys={[currentMenu]}
          mode="horizontal"
          items={items}
        />

        {currentMenu == "map" && pages.map}
      </ConfigProvider>
    </div>
  );
}

export default NewApp;
