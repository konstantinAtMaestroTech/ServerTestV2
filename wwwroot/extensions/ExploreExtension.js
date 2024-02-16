import { BaseExtension } from './BaseExtension.js';
import { ExplorePanel } from './ExplorePanel.js';

function reverseObject(originalObject) {
    return Object.keys(originalObject).reduce((reversedObject, key) => {
      reversedObject[originalObject[key]] = key;
      return reversedObject;
    }, {});
}

class ExploreExtension extends BaseExtension {

    constructor(viewer, options) {
        super(viewer, options);
        this._button = null;
        this._extensionIsActive = false;
        this._panel = null;
    }
    
    load() {
        super.load();
        return true;
    }

    unload() {
        super.unload();
        if (this._button) {
            this.removeToolbarButton(this._button);
            this._button = null;
        }
        if (this._panel) {
            this._panel.setVisible(false);
            this._panel.uninitialize();
            this._panel = null;
        }
        console.log('ExploreMode extension unloaded.');
        return true;
    }

    onToolbarCreated() {
        this._panel = new ExplorePanel(this, 'model-exploration-panel', 'Explore Mode', { x: 10, y: 10 });
        this._button = this.createToolbarButton('exploration-button', "https://img.icons8.com/ios/50/search--v1.png", 'Turn on/off Explore Mode');
        this._button.onClick = () => {
            this._panel.setVisible(!this._panel.isVisible());
            this._button.setState(this._panel.isVisible() ? Autodesk.Viewing.UI.Button.State.ACTIVE : Autodesk.Viewing.UI.Button.State.INACTIVE);
        };
    }

    async onModelLoaded(model) {
        super.onModelLoaded(model);
    }

    async getImageUrlForDbId(dbid) {

        let idDict = await new Promise(resolve => {
            this.viewer.model.getExternalIdMapping(data => resolve(data));
        });
        let reversedDict = reverseObject(idDict);
        let objectID = reversedDict[dbid];

        // Assuming images are in a folder named 'images' in the same directory as your HTML file
        // and the images are named after the dbid with a .png extension
        
        let imageUrl = `/labelsServer/${objectID}.png`;
    
        // Check if the image exists
        let response = await fetch(imageUrl);
        if (response.ok) {
            return imageUrl;
        } else {
            console.error(`Image not found for dbid ${dbid}`);
            return null;
        }
    }

    async onSelectionChanged(model, dbids) {
        if (this._panel.isVisible() === true) {

            super.onSelectionChanged(model, dbids);
            this._panel.handleElementsColorsGroups();
            this._panel.handleElementsColorsZones();
            this._panel.uploadLabels();
            this._panel.uploadDrawings();
            this._panel.uploadInstructions();
    
            // Open a new window for each selected dbid
    
            /* for (let dbid of dbids) {
                let imageUrl = await this.getImageUrlForDbId(dbid);
                let popup = window.open("", "_blank");
                popup.document.write(`<img src="${imageUrl}" alt="Image for dbid ${dbid}">`);
            } */
        }
    }

    onIsolationChanged(model, dbids) {
        super.onIsolationChanged(model, dbids);
        console.log('Isolation has changed', dbids);
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('ExploreExtension', ExploreExtension);