"use client";

import SocialLink from "./SocialLink";
import {
  faCodepen,
  faGithub,
  faKaggle,
  faLinkedin,
  faReddit,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faBook, faEnvelope } from "@fortawesome/free-solid-svg-icons";

export const links = [
  {
    name: "GitHub",
    url: "https://www.github.com/wyattowalsh",
    icon: faGithub,
    color: "#181717",
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/wyattowalsh",
    icon: faLinkedin,
    color: "#0A66C2",
  },
  {
    name: "X",
    url: "https://www.x.com/wyattowalsh",
    icon: faXTwitter,
    color: "#000000",
  },
  {
    name: "Reddit",
    url: "https://www.reddit.com/user/w4wdev",
    icon: faReddit,
    color: "#FF4500",
  },
  {
    name: "Blog",
    url: "/blog",
    icon: faBook,
  },
  {
    name: "Kaggle",
    url: "https://www.kaggle.com/wyattowalsh",
    icon: faKaggle,
    color: "#20BEFF",
  },
  {
    name: "CodePen",
    url: "https://codepen.io/wyattowalsh",
    icon: faCodepen,
    color: "#000000",
  },
  {
    name: "Email",
    url: "mailto:mail@w4wdev.com",
    icon: faEnvelope,
  },
].map((link) => ({
  ...link,
  color: link.color || "var(--primary-color)",
}));


export default function Links() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 pt-4">
      {links.map((link) => (
        <SocialLink key={link.name} link={link} />
      ))}
    </div>
  );
}
