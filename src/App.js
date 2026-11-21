import React from "react";
import Layout from "./hocs/Layout";
import { BrowserRouter } from "react-router-dom";
import Routes from "./hocs/Routes";
import { Provider } from "react-redux";
import { store } from "./store/store";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { SearchProvider } from "./containers/SearchContext";
import SmoothScroll from "./components/SmoothScroll";

function App() {
  return (
    <Provider store={store}>
      <SearchProvider>
        <BrowserRouter>
          <SmoothScroll>
            <Layout>
              <Routes />
            </Layout>
          </SmoothScroll>
        </BrowserRouter>
      </SearchProvider>
    </Provider>
  );
}

export default App;