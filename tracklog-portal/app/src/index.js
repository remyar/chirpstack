import React from 'react';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from "react-router-dom";
import localeData from './locales';
import CssBaseline from '@mui/material/CssBaseline';
import api from "./api";
import StoreProvider from './providers/StoreProvider';
import NavigationProvider from './providers/navigation';
import SnackBarGenerator from './providers/snackBar';
import App from './app';

async function startApp() {
    // Define user's language. Different browsers have the user locale defined
    // on different fields on the `navigator` object, so we make sure to account
    // for these different by checking all of them
    const language = (navigator.languages && navigator.languages[0]) ||
        navigator.language ||
        navigator.userLanguage;

    window.userLocale = language;
    let languageWithoutRegionCode = language.toLowerCase().split(/[_-]+/)[0];
    window.userLocaleWithoutRegionCode = languageWithoutRegionCode;
    localeData.setLocale(languageWithoutRegionCode);
    const messages = localeData[languageWithoutRegionCode] || localeData[language] || localeData.en;

    const root = createRoot(document.getElementById('root'));

    let _settings = {}

    root.render(
        <React.Fragment>
            <CssBaseline />
            <StoreProvider extra={{ api }} globalState={{
                settings: { installed: false, locale: "fr", ..._settings },
            }}>
                <MemoryRouter>
                    <NavigationProvider>
                    <IntlProvider locale={language} messages={messages}>
                            <SnackBarGenerator>
                                <App />
                            </SnackBarGenerator>
                        </IntlProvider>
                    </NavigationProvider>
                </MemoryRouter>
            </StoreProvider>
        </React.Fragment>
    );
}

startApp();