// Copyright (C) 2024 Alexandre Amat
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import ErrorBoundary from "components/ErrorBoundary";
import App from "./App";
import { store } from "./app/store";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

import "semantic-ui-css/semantic.min.css";

const container = document.getElementById("root")!;
const root = createRoot(container);

root.render(
  <GoogleReCaptchaProvider
    reCaptchaKey={process.env.REACT_APP_GOOGLE_SITE_KEY!}
    useEnterprise
  >
    <ErrorBoundary fallback={<p>Something went wrong</p>}>
      <Provider store={store}>
        <App />
      </Provider>
    </ErrorBoundary>
  </GoogleReCaptchaProvider>,
);
