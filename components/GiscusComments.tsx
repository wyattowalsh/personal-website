import Giscus from '@giscus/react';

const GiscusComments = () => {
  return (
    <Giscus
      repo="wyattowalsh/personal-website"
      repoId="MDEwOlJlcG9zaXRvcnkxNTgxOTI2MDk="
      category="General"
      categoryId="DIC_kwDOCW3T4c4CkPJr"
      mapping="pathname"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="1"
      inputPosition="top"
      theme="https://raw.githubusercontent.com/wyattowalsh/personal-website/refs/heads/master/public/giscus.css"
      lang="en"
      loading="lazy"
      crossorigin="anonymous"
    />
  );
};

export default GiscusComments;
