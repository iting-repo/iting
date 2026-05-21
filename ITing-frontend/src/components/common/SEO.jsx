import { useEffect } from 'react';

/**
 * Minimal SEO helper – sets document.title and optional meta-description.
 * Props: title (string), description (string, optional), noIndex (boolean, optional).
 */
const SEO = ({ title, description, noIndex }) => {
  useEffect(() => {
    if (title) {
      document.title = `${title} | ITing`;
    }

    // meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (description) {
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = description;
    }

    // noindex
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (noIndex) {
      if (!metaRobots) {
        metaRobots = document.createElement('meta');
        metaRobots.name = 'robots';
        document.head.appendChild(metaRobots);
      }
      metaRobots.content = 'noindex, nofollow';
    } else if (metaRobots) {
      metaRobots.remove();
    }

    return () => {
      // cleanup robots tag on unmount
      const tag = document.querySelector('meta[name="robots"]');
      if (tag) tag.remove();
    };
  }, [title, description, noIndex]);

  return null;
};

export default SEO;
