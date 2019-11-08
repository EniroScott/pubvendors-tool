import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'material-ui-snackbar-provider';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import MaterialTable from 'material-table';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import fs from 'fs';
import electron from 'electron';
import TextField from '@material-ui/core/TextField';

const elerem = electron.remote;
const { dialog } = elerem;

const useStyles = makeStyles(theme => ({
    result: {
        height: '100%',
        overflow: 'scroll'
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120
    },
    selectEmpty: {
        marginTop: theme.spacing(2)
    },
    pubvendorsUrl: {
        width: 300
    },
    orText: {
        display: 'inline',
        lineHeight: '4 !important',
        marginLeft: '10px !important',
        marginRight: '10px !important'
    }
}));

const App = () => {
    const publisherVendorsVersion = 1;
    const classes = useStyles();
    const snackbar = useSnackbar();

    const [orig, setOrig] = React.useState({});
    const [version, setVersion] = React.useState();

    useEffect(() => {
        fetch('https://vendorlist.consensu.org/vendorlist.json')
            .then(res => res.json())
            .then(res => {
                setOrig(res);
                return null;
            })
            .catch((e) => snackbar.showMessage(e.toString()));
    }, []);

    const createPubvendors = (data) => {
        const selected = [];
        data.forEach((v) => selected.push(v.id));

        const vendors = orig.vendors.filter(v => selected.indexOf(v.id) !== -1);

        const downloads = elerem.app.getPath('downloads');
        const dest = dialog.showSaveDialog({
            defaultPath: `${downloads}/pubvendors.json`
        });
        const pubvendors = {
            publisherVendorsVersion,
            version,
            globalVendorListVersion: orig.vendorListVersion,
            updatedAt: new Date().toISOString(),
            vendors
        };
        try {
            fs.writeFileSync(dest, JSON.stringify(pubvendors, null, 2), 'utf-8');
        } catch (e) {
            snackbar.showMessage('Failed to save the file! Do you have permissions to save in that directory?');
        }
    };

    const setCurrentPubvendors = event => {
        setVersion(event.target.value);
    };

    const getCurrentPubvendors = event => {
        const url = event.target.value;
        if (url.endsWith('.json')) {
            fetch(event.target.value)
                .then(res => res.json())
                .then(res => {
                    try {
                        const oldVersion = res.version;
                        setVersion(oldVersion + 1);
                    } catch (e) {
                        snackbar.showMessage('Couldn\'t get version from file');
                    }
                    return null;
                })
                .catch((e) => snackbar.showMessage(e.toString()));
        } else {
            snackbar.showMessage('URL must end in .json');
        }
    };

    if (!orig.vendors) {
        return (
            <Container>
                <Grid
                    className={classes.root}
                    container
                    spacing={2}
                    direction="column"
                    alignItems="center"
                    justify="center"
                    style={{ minHeight: '100vh' }}
                >
                    <Grid item xs={6}>
                        <CircularProgress/>
                    </Grid>
                </Grid>
            </Container>
        );
    }

    return (
        <Container>
            <Box marginTop={2}>
                <Typography>
                    If you have an existing pubvendors.json, enter the URL (and we just add 1 to the old version) or
                    enter the new version number manually. Select your vendors from the table then click the download
                    button at the top right of the table.
                </Typography>
            </Box>
            <Box marginTop={2}>
                <TextField className={classes.pubvendorsUrl}
                           id="pubvendorsUrl"
                           label="pubvendors.json url"
                           type="url"
                           onChange={getCurrentPubvendors}
                           InputLabelProps={{
                               shrink: true,
                           }}
                />
                <Typography className={classes.orText}>
                    OR
                </Typography>
                <TextField
                    id="version"
                    label="New version"
                    type="number"
                    onChange={setCurrentPubvendors}
                    value={version}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </Box>
            <Box marginTop={2}>
                {orig.vendors.length > 0 && (
                    <MaterialTable
                        title="Vendors"
                        columns={[
                            { title: 'id', field: 'id' },
                            { title: 'name', field: 'name' },
                            {
                                title: 'purposeIds', field: 'purposeIds',
                                render: rowData => rowData.purposeIds.join(',')
                            },
                            {
                                title: 'legIntPurposeIds', field: 'legIntPurposeIds',
                                render: rowData => rowData.legIntPurposeIds.join(',')
                            },
                            {
                                title: 'featureIds', field: 'featureIds',
                                render: rowData => rowData.featureIds.join(',')
                            },
                            { title: 'policyUrl', field: 'policyUrl' }
                        ]}
                        data={orig.vendors}
                        options={{
                            selection: true,
                            search: true,
                            pageSize: 12,
                            pageSizeOptions: [12, 24, 36],
                            searchFieldAlignment: 'left'
                        }}
                        actions={[
                            {
                                tooltip: 'Download pubvendors.json',
                                icon: 'cloud_download',
                                onClick: (evt, data) => {
                                    createPubvendors(data);
                                }
                            }
                        ]}
                    />
                )}
            </Box>
        </Container>
    );
};

export default App;
