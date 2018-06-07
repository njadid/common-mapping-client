/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Modernizr from "modernizr";
import Earth from "mdi-material-ui/Earth";
import Eye from "mdi-material-ui/Eye";
import EyeOff from "mdi-material-ui/EyeOff";
import Tooltip from "material-ui/Tooltip";
import Button from "material-ui/Button";
import PlusIcon from "material-ui-icons/Add";
import RemoveIcon from "material-ui-icons/Remove";
import HomeIcon from "material-ui-icons/Home";
import Paper from "material-ui/Paper";
import { AppAction, MapAction } from "actions";
import * as appStrings from "_core/constants/appStrings";
import appConfig from "constants/appConfig";
import MiscUtil from "_core/utils/MiscUtil";
import { MapButton, MapButtonGroup } from "_core/components/Reusables";
import { MapToolsButton, BasemapPicker, MapLabelsButton } from "_core/components/Map";
import styles from "_core/components/Map/MapControlsContainer.scss";
import displayStyles from "_core/styles/display.scss";

export class MapControlsContainer extends Component {
    componentDidMount() {
        this.hideMapControlsTimeout = null;
        this.mouseMovementTimeThreshold = 2000;
        this.hideMapControlsEnabled = false;
        this._isInDistractionFreeMode = false;
    }
    componentWillUpdate(nextProps, nextState) {
        // If we're not going to be in distractionFreeMode we can stop everything
        if (!nextProps.distractionFreeMode) {
            this.stopListeningToMouseMovement();
            this._isInDistractionFreeMode = false;
        } else if (!this.props.distractionFreeMode && nextProps.distractionFreeMode) {
            // If we are transitioning to distractionFreeMode
            this._isInDistractionFreeMode = true;
        }
    }
    startListeningToMouseMovement() {
        this.hideMapControlsTimeout = setTimeout(() => {
            this.hideMapControls();
        }, this.mouseMovementTimeThreshold);
        window.onmousemove = () => {
            // Clear the timeout
            clearTimeout(this.hideMapControlsTimeout);
            this.hideMapControlsTimeout = null;
            this.hideMapControlsEnabled = false;
            this.startListeningToMouseMovement();
            this.props.hideMapControls(false);
        };
    }
    stopListeningToMouseMovement() {
        clearTimeout(this.hideMapControlsTimeout);
        this.hideMapControlsTimeout = null;
        this.hideMapControlsEnabled = false;
        window.onmousemove = null;
        this.props.hideMapControls(false);
    }
    hideMapControls() {
        if (!this.hideMapControlsEnabled) {
            this.hideMapControlsEnabled = true;
            this.hideMapControlsTimeout = null;
            this.props.hideMapControls(true);
        }
    }
    onMapControlsMouseEnter() {
        if (this.props.distractionFreeMode) {
            this.stopListeningToMouseMovement();
        }
    }
    onMapControlsMouseLeave() {
        if (this.props.distractionFreeMode) {
            this.startListeningToMouseMovement();
        }
    }
    setViewMode() {
        if (this.props.in3DMode) {
            this.props.mapActions.setMapViewMode(appStrings.MAP_VIEW_MODE_2D);
        } else {
            this.props.mapActions.setMapViewMode(appStrings.MAP_VIEW_MODE_3D);
        }
    }

    render() {
        let containerClasses = MiscUtil.generateStringFromSet({
            [displayStyles.hiddenFadeOut]:
                this.props.mapControlsHidden && this.props.distractionFreeMode,
            [displayStyles.hiddenFadeIn]:
                !this.props.mapControlsHidden && this.props.distractionFreeMode,
            [this.props.className]: typeof this.props.className !== "undefined",
            [styles.mapControlsContainer]: true
        });
        return (
            <div
                className={containerClasses}
                onMouseLeave={() => this.onMapControlsMouseLeave()}
                onMouseEnter={() => this.onMapControlsMouseEnter()}
            >
                <Paper elevation={2} className={styles.buttonGroup}>
                    <Tooltip
                        title={this.props.in3DMode ? "Switch to 2D map" : "Switch to 3D map"}
                        placement="right"
                    >
                        <MapButton
                            disabled={!Modernizr.webgl && !this.props.in3DMode ? true : false}
                            onClick={() => this.setViewMode()}
                            aria-label={
                                this.props.in3DMode ? "Switch to 2D map" : "Switch to 3D map"
                            }
                            className={styles.singleButton}
                        >
                            <Earth />
                        </MapButton>
                    </Tooltip>
                </Paper>
                <Paper elevation={2} className={styles.buttonGroup}>
                    <Tooltip
                        title={
                            this.props.distractionFreeMode
                                ? "Disable distraction free mode"
                                : "Enable distraction free mode"
                        }
                        placement="right"
                    >
                        <MapButton
                            color={this.props.distractionFreeMode ? "primary" : "default"}
                            onClick={() => {
                                this.props.setDistractionFreeMode(!this.props.distractionFreeMode);
                            }}
                            aria-label="Home"
                            className={`${styles.firstButton} ${styles.lineButton}`}
                        >
                            {this.props.distractionFreeMode ? <Eye /> : <EyeOff />}
                        </MapButton>
                    </Tooltip>
                    <MapToolsButton
                        isOpen={this.props.mapControlsToolsOpen}
                        className={styles.lineButton}
                        setOpen={isOpen => this.props.setMapControlsToolsOpen(isOpen)}
                    />
                    <MapLabelsButton />
                </Paper>
                <Paper elevation={2} className={styles.buttonGroup}>
                    <Tooltip title="Home" placement="right">
                        <MapButton
                            onClick={() => {
                                this.props.mapActions.setMapView(
                                    { extent: appConfig.DEFAULT_BBOX_EXTENT },
                                    true
                                );
                            }}
                            aria-label="Home"
                            className={`${styles.firstButton} ${styles.lineButton}`}
                        >
                            <HomeIcon />
                        </MapButton>
                    </Tooltip>
                    <Tooltip title="Zoom In" placement="right">
                        <MapButton
                            onClick={this.props.mapActions.zoomIn}
                            aria-label="Zoom in"
                            className={styles.lineButton}
                        >
                            <PlusIcon />
                        </MapButton>
                    </Tooltip>
                    <Tooltip title="Zoom Out" placement="right">
                        <MapButton
                            onClick={this.props.mapActions.zoomOut}
                            aria-label="Zoom out"
                            className={styles.lastButton}
                        >
                            <RemoveIcon />
                        </MapButton>
                    </Tooltip>
                </Paper>
                <BasemapPicker />
            </div>
        );
    }
}

MapControlsContainer.propTypes = {
    in3DMode: PropTypes.bool.isRequired,
    distractionFreeMode: PropTypes.bool.isRequired,
    mapControlsHidden: PropTypes.bool.isRequired,
    mapControlsToolsOpen: PropTypes.bool.isRequired,
    setMapViewMode: PropTypes.func.isRequired,
    setMapView: PropTypes.func.isRequired,
    zoomIn: PropTypes.func.isRequired,
    zoomOut: PropTypes.func.isRequired,
    hideMapControls: PropTypes.func.isRequired,
    setDistractionFreeMode: PropTypes.func.isRequired,
    setMapControlsToolsOpen: PropTypes.func.isRequired,
    appActions: PropTypes.object.isRequired,
    className: PropTypes.string
};

function mapStateToProps(state) {
    return {
        in3DMode: state.map.getIn(["view", "in3DMode"]),
        distractionFreeMode: state.view.get("distractionFreeMode"),
        mapControlsToolsOpen: state.view.get("mapControlsToolsOpen"),
        mapControlsHidden: state.view.get("mapControlsHidden")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setMapViewMode: bindActionCreators(MapAction.setMapViewMode, dispatch),
        setMapView: bindActionCreators(MapAction.setMapView, dispatch),
        zoomIn: bindActionCreators(MapAction.zoomIn, dispatch),
        zoomOut: bindActionCreators(MapAction.zoomOut, dispatch),
        hideMapControls: bindActionCreators(AppAction.hideMapControls, dispatch),
        setDistractionFreeMode: bindActionCreators(AppAction.setDistractionFreeMode, dispatch),
        setMapControlsToolsOpen: bindActionCreators(AppAction.setMapControlsToolsOpen, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MapControlsContainer);
