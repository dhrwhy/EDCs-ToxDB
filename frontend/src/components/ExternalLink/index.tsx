import React from "react";

interface Props {
  href: string;
  children: React.ReactNode;
}

const ExternalLink: React.FC<Props> = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

export default ExternalLink;
