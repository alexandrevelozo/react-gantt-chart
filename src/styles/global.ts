import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  html, body, #root, #root div:only-child {
    height: 100%;
  }
`;

export default GlobalStyle;
