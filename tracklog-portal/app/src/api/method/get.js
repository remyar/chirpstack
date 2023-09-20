import 'isomorphic-fetch';
import STATUS from '../status';

export default function get(url, isServiceWorker = false) {

    let headers = {
        'Accept': 'application/text',
        'Content-Type': 'application/text'
    };

    return fetch(url, {
        headers: new Headers(headers),
        method: 'GET'
    }).then((res) => {
        if (isServiceWorker === true) {
            return Promise.resolve(true);
        } else if (res.status === STATUS.OK) {
            return res.json();
        } else {
            let error = { status: res.status || STATUS.EPIC_FAIL }; // par defaut, une erreur inconnue?
            return Promise.reject(error);
        }

    }).catch((err) => {

        let error = STATUS.mdw(err);
        return Promise.reject(error);

    });
}