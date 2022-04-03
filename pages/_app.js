import { AmplifyProvider } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
// default theme

export default function App(props) {
  return (
    <AmplifyProvider>
      <MyApp {...props} />
    </AmplifyProvider>
  );
}
