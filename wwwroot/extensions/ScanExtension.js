import { viewer } from '../main.js';

let html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", { fps: 10, qrbox: { width: 250, height: 250 } });

async function selectScannedElement(viewer, decodedText) {
    try {
        let idDict = await new Promise(resolve => {
            viewer.model.getExternalIdMapping(data => resolve(data));
        });
        let dynamicKey = decodedText;
        let objectID = idDict[dynamicKey];

        viewer.isolate(objectID);
        viewer.fitToView(objectID);
        console.log(`Element detected: ${objectID}`);

        // Select the scanned element
        let selectionName = Array();
        let selectionValue = Array();
        let selectionCategory = Array();

        // Select the scanned element
        viewer.select(objectID);
        viewer.getProperties(objectID, function (props) {
        // Show the native Autodesk property panel

            const propertyPanel = new Autodesk.Viewing.UI.PropertyPanel(viewer.container, 'PropertyPanel', 'Properties'); // This will show the property panel
            for (var i = 0; i < props.properties.length; i++) {
                propertyPanel.addProperty(props.properties[i].displayName, props.properties[i].displayValue, props.properties[i].displayCategory);
            }
            propertyPanel.setVisible(true);

            let button = document.createElement('button');
            let header = document.querySelector('#header');

            button.textContent = 'Associated File';
            button.onclick = function(e) {
            // Open the file associated with the QR code in a new tab
                let popup = window.open("", "_blank");
                let imageUrl = `/labelsServer/${decodedText}.png`
                popup.document.write(`<img src="${imageUrl}" alt="Image for imageUrl ${imageUrl}">`);
            };
            header.appendChild(button);
        });
    } catch (err) {
        alert('Could not select element. See the console for more details.');
        console.error(err);
    }
}

function onScanSuccess(decodedText, decodedResult) {
    // Handle the scanned code as you like, for example:
    console.log(`QR Code detected: ${decodedText}`);

    selectScannedElement(viewer, decodedText);
    
    html5QrcodeScanner.clear().then(() => {
        // Scanner stopped, close the modal
        $('#myModal').modal('hide');
    }).catch((error) => {
        // Failed to stop the scanner, handle error
        console.log(`QR Code stop error: ${error}`);
    });
}
    
function onScanFailure(error) {
    // You can choose to ignore failures, as they may be due to the QR code
    // not being in the frame, or other reasons like light conditions.
    console.log(`QR Code scan error: ${error}`);
}

class ScanExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this._onObjectTreeCreated = (ev) => this.onModelLoaded(ev.model);
    }

    load() {
        this.viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, this._onObjectTreeCreated)
        return true;
    }

    unload() {
        this.viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, this._onObjectTreeCreated)
        return true;
    }

    onModelLoaded(model) {}

    createToolbarButton(buttonId, buttonIconUrl, buttonTooltip) {
        let group = this.viewer.toolbar.getControl('dashboard-toolbar-group');
        if (!group) {
            group = new Autodesk.Viewing.UI.ControlGroup('dashboard-toolbar-group');
            this.viewer.toolbar.addControl(group);
        }
        const button = new Autodesk.Viewing.UI.Button(buttonId);
        button.setToolTip(buttonTooltip);
        group.addControl(button);
        const icon = button.container.querySelector('.adsk-button-icon');
        if (icon) {
            icon.style.backgroundImage = `url(${buttonIconUrl})`; 
            icon.style.backgroundSize = `24px`; 
            icon.style.backgroundRepeat = `no-repeat`; 
            icon.style.backgroundPosition = `center`; 
        }
        return button;
    }

    removeToolbarButton(button) {
        const group = this.viewer.toolbar.getControl('dashboard-toolbar-group');
        group.removeControl(button);
    }

    onToolbarCreated() {
        this._button = this.createToolbarButton('scan-button', "https://img.icons8.com/wired/64/qr-code.png", 'Turn on/off Scanning Mode');
        this._button.onClick = () => {
                $('#myModal').modal('show');
                html5QrcodeScanner.render(onScanSuccess, onScanFailure);
        };
    }

    
}

Autodesk.Viewing.theExtensionManager.registerExtension('ScanExtension', ScanExtension);