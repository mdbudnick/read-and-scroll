import type { ThemeColors } from "./theme";

export const controlStyles = (theme: ThemeColors) => `
  #read-and-scroll-controls {
    position: fixed;
    left: 40px;
    top: 50%;
    transform: translateY(-50%);
    min-width: 200px;
    background-color: ${theme.background};
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 4px 12px ${theme.shadow};
    display: flex;
    flex-direction: column;
    gap: 1rem;
    z-index: 1001;
    border: 1px solid ${theme.borderColor};
  }

  #read-and-scroll-controls .theme-toggle {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    padding-bottom: 1rem;
    border-bottom: 1px solid ${theme.borderColor};
  }

  #read-and-scroll-controls .theme-toggle button {
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 6px;
    color: ${theme.color};
    opacity: 0.5;
    transition: all 0.2s ease;
  }

  #read-and-scroll-controls .theme-toggle button.active {
    opacity: 1;
    background: ${theme.borderColor};
  }

  #read-and-scroll-controls .theme-toggle button:hover {
    opacity: 1;
  }

  #read-and-scroll-controls .font-sizes {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    align-items: center;
  }

  #read-and-scroll-controls .font-size-button {
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 6px;
    color: ${theme.color};
    opacity: 0.5;
    transition: all 0.2s ease;
    width: 100%;
    text-align: center;
  }

  #read-and-scroll-controls .font-size-button.active {
    opacity: 1;
    background: ${theme.borderColor};
  }

  #read-and-scroll-controls .font-size-button:hover {
    opacity: 1;
  }

  #read-and-scroll-controls .font-size-button.small {
    font-size: 14px;
  }

  #read-and-scroll-controls .font-size-button.medium {
    font-size: 18px;
  }

  #read-and-scroll-controls .font-size-button.large {
    font-size: 22px;
  }
`;
