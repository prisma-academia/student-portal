import React from "react";
import configs from "../configs.js";

function Logo() {
  const { logoUrl, logoAlt } = configs.branding;
  return (
    <img
      height={50}
      width="auto"
      src={logoUrl}
      alt={logoAlt}
    />
  );
}

export default Logo;
