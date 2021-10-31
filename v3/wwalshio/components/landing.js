import React from "react";
import Particles from "react-tsparticles";
import styles from "./landing";
import particle1 from "../particles/1.json"

export default function Landing() {
  const particlesInit = (main) => {
    console.log(main);

    // you can initialize the tsParticles instance (main) here, adding custom shapes or presets
  };

  const particlesLoaded = (container) => {
    console.log(container);
  };
  return (
    <Particles
    id="tsparticles"
    options={particle1}
    />
  );
}
