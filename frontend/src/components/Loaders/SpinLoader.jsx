import React, { useEffect } from "react";
import { helix } from "ldrs";

const Loader = () => {
  useEffect(() => {
    helix.register();
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-50">
      <l-helix size="60" speed="2.5" color="yellow"></l-helix>
    </div>
  );
};

export default Loader;
