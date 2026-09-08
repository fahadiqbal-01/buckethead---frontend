import React from "react";

export default function Spaces({ spacetitle }) {
  const shortenText = (str, maxLength = 10) => {
    if (!str) return "";
    return str.length > maxLength ? str.substring(0, maxLength) : str;
  };

  return (
    <div className=" py-2 px-4 bg-mud/20 w-fit rounded-full flex flex-row justify-center items-center gap-1 select-none cursor-pointer ">
      {/* <img src="/icons/space.svg" className=" w-8 h-8 invert-100 " /> */}
      <h1 className=" text-[18px] text-mud font-jetbold ">
        {shortenText(spacetitle, 10)}
      </h1>
    </div>
  );
}
