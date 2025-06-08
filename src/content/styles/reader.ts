import type { Theme, ThemeColors } from "./theme";

export interface ElementStyles {
  container: string;
  headings: {
    h1: string;
    h2: string;
    h3: string;
    h4: string;
  };
  text: {
    paragraph: string;
    link: string;
    blockquote: string;
    code: string;
    pre: string;
  };
  media: {
    image: string;
    video: string;
    iframe: string;
  };
  lists: {
    unordered: string;
    ordered: string;
    listItem: string;
  };
}

export interface StylePreferences {
  width: string;
  fontSize: string;
  theme: "light" | "dark";
  imageSize: "normal" | "large" | "small";
  fontWeight: "normal" | "bold";
}

export function generateElementStyles(
  prefs: StylePreferences,
  theme: ThemeColors
): ElementStyles {
  return {
    container: `
      --rs-width: ${prefs.width};
      --rs-font-size: ${prefs.fontSize};
      --rs-bg-color: ${theme.background};
      --rs-text-color: ${theme.color};
      --rs-shadow-color: ${theme.shadow};
      
      width: var(--rs-width) !important;
      margin: 0 auto !important;
      padding: 2rem !important;
      background-color: var(--rs-bg-color) !important;
      min-height: 100vh !important;
      box-shadow: 0 0 20px var(--rs-shadow-color) !important;
      position: relative !important;
      z-index: 1000 !important;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-size: var(--rs-font-size) !important;
      line-height: 1.6 !important;
      color: var(--rs-text-color) !important;
      font-weight: ${prefs.fontWeight} !important;
    `,
    headings: {
      h1: `
        font-size: 2.5em !important;
        margin: 1em 0 0.5em !important;
        color: ${theme.headingColor} !important;
        border-bottom: 1px solid ${theme.borderColor} !important;
        padding-bottom: 0.25em !important;
      `,
      h2: `
        font-size: 2em !important;
        margin: 1em 0 0.5em !important;
        color: ${theme.headingColor} !important;
      `,
      h3: `
        font-size: 1.5em !important;
        margin: 1em 0 0.5em !important;
        color: ${theme.headingColor} !important;
      `,
      h4: `
        font-size: 1.25em !important;
        margin: 1em 0 0.5em !important;
        color: ${theme.headingColor} !important;
      `,
    },
    text: {
      paragraph: `
        margin: 0 0 1.5em !important;
        line-height: 1.8 !important;
      `,
      link: `
        color: ${theme.linkColor} !important;
        text-decoration: none !important;
        border-bottom: 1px solid transparent !important;
        transition: border-color 0.2s ease !important;
        &:hover {
          border-bottom-color: ${theme.linkColor} !important;
        }
      `,
      blockquote: `
        margin: 1.5em 0 !important;
        padding: 0.5em 1em !important;
        border-left: 4px solid ${theme.borderColor} !important;
        font-style: italic !important;
        color: ${theme.color}dd !important;
      `,
      code: `
        font-family: 'SF Mono', Consolas, Monaco, 'Andale Mono', monospace !important;
        background: ${
          theme.background === "white" ? "#f6f8fa" : "#2d333b"
        } !important;
        padding: 0.2em 0.4em !important;
        border-radius: 3px !important;
        font-size: 0.9em !important;
      `,
      pre: `
        background: ${
          theme.background === "white" ? "#f6f8fa" : "#2d333b"
        } !important;
        padding: 1em !important;
        border-radius: 6px !important;
        overflow-x: auto !important;
        margin: 1.5em 0 !important;
      `,
    },
    media: {
      image: `
        max-width: ${
          prefs.imageSize === "large"
            ? "120%"
            : prefs.imageSize === "small"
            ? "80%"
            : "100%"
        } !important;
        height: auto !important;
        margin: 1.5em auto !important;
        display: block !important;
        border-radius: 6px !important;
        box-shadow: 0 4px 12px ${theme.shadow} !important;
      `,
      video: `
        max-width: 100% !important;
        margin: 1.5em auto !important;
        display: block !important;
      `,
      iframe: `
        max-width: 100% !important;
        margin: 1.5em auto !important;
        display: block !important;
        border: 1px solid ${theme.borderColor} !important;
        border-radius: 6px !important;
      `,
    },
    lists: {
      unordered: `
        margin: 1em 0 1.5em !important;
        padding-left: 2em !important;
      `,
      ordered: `
        margin: 1em 0 1.5em !important;
        padding-left: 2em !important;
      `,
      listItem: `
        margin: 0.5em 0 !important;
      `,
    },
  };
}

export function generateCSS(prefs: StylePreferences, themes: Theme): string {
  const theme = themes[prefs.theme];
  const styles = generateElementStyles(prefs, theme);

  return `
    #read-and-scroll-container {
      ${styles.container}
    }
    
    #read-and-scroll-container h1 {
      ${styles.headings.h1}
    }
    
    #read-and-scroll-container h2 {
      ${styles.headings.h2}
    }
    
    #read-and-scroll-container h3 {
      ${styles.headings.h3}
    }
    
    #read-and-scroll-container h4 {
      ${styles.headings.h4}
    }
    
    #read-and-scroll-container p {
      ${styles.text.paragraph}
    }
    
    #read-and-scroll-container a {
      ${styles.text.link}
    }
    
    #read-and-scroll-container blockquote {
      ${styles.text.blockquote}
    }
    
    #read-and-scroll-container code {
      ${styles.text.code}
    }
    
    #read-and-scroll-container pre {
      ${styles.text.pre}
    }
    
    #read-and-scroll-container img {
      ${styles.media.image}
    }
    
    #read-and-scroll-container video {
      ${styles.media.video}
    }
    
    #read-and-scroll-container iframe {
      ${styles.media.iframe}
    }
    
    #read-and-scroll-container ul {
      ${styles.lists.unordered}
    }
    
    #read-and-scroll-container ol {
      ${styles.lists.ordered}
    }
    
    #read-and-scroll-container li {
      ${styles.lists.listItem}
    }
  `;
}
