export interface ThemeColors {
  background: string;
  color: string;
  shadow: string;
  linkColor: string;
  headingColor: string;
  borderColor: string;
}

export interface Theme {
  light: ThemeColors;
  dark: ThemeColors;
  rainbow: ThemeColors;
  starwars: ThemeColors;
}

export const themes: Theme = {
  light: {
    background: "white",
    color: "black",
    shadow: "rgba(0, 0, 0, 0.1)",
    linkColor: "#0366d6",
    headingColor: "#111",
    borderColor: "#e1e4e8",
  },
  dark: {
    background: "#222",
    color: "#eee",
    shadow: "rgba(0, 0, 0, 0.3)",
    linkColor: "#58a6ff",
    headingColor: "#fff",
    borderColor: "#30363d",
  },
  rainbow: {
    background: "lightblue", // pastel blue
    color: "black",
    shadow: "rgba(0, 0, 0, 0.1)",
    linkColor: "#0366d6",
    headingColor: "#111",
    borderColor: "#e1e4e8",
  },
  starwars: {
    background: "#000",
    color: "#ffe81f",
    shadow: "rgba(0,0,0,1)",
    linkColor: "#ffe81f",
    headingColor: "#ffe81f",
    borderColor: "#000",
  },
};
