import createAction from '../../middleware/actions';

async function getAllNodes({ getState , extra }) {
    let api = extra.api;
    try {
        let obj = await api.get(process.env.REACT_APP_API_BASE_PATH + "zones");
        return { zones : obj }
    }catch(ex){
        return { zones : [] }
    }
}

export default createAction(getAllNodes);