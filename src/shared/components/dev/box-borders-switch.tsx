import type React from "react";
import { useEffect, useState } from "react";
import { FaCube } from "react-icons/fa6";

import { config } from "../../../config/config";
import { Toggle } from "../ui/toggle";

export const BoxBordersSwitch: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const addRedBorders = () => {
      const allElements = document.querySelectorAll("*");
      allElements.forEach((element) => {
        if (element instanceof HTMLElement) {
          element.style.outline = "1px solid red";
        }
      });
    };
    if (show) addRedBorders();

    return () => {
      const allElements = document.querySelectorAll("*");
      allElements.forEach((element) => {
        if (element instanceof HTMLElement) {
          element.style.outline = "";
        }
      });
    };
  }, [show]);

  if (config.isProduction) return null;

  return (
    <Toggle
      pressed={show}
      onPressedChange={setShow}
      className="fixed left-1 bottom-8 z-10000"
      size={"sm"}
      variant={"outline"}
    >
      <FaCube />
    </Toggle>
  );
};
