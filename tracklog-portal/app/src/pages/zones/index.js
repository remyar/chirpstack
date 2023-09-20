import React, { useEffect, useState } from "react";
import { injectIntl } from 'react-intl';
import { withStoreProvider } from '../../providers/StoreProvider';
import { withNavigation } from '../../providers/navigation';
import Box from '@mui/material/Box';

import actions from "../../actions";

function ZonesPage(props) {

    const [zones, setZones] = useState([]);


    useEffect(async () => {
        const zones = await props.dispatch(actions.zones.getAllZones());
        setZones(zones.zones);
    }, []);

    return <Box>
        {zones.map((zone) => {

        })}
    </Box>;
}

export default withNavigation(withStoreProvider(injectIntl(ZonesPage)));